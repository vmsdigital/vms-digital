import { NextRequest, NextResponse } from "next/server";

const BIZDATA_BASE = "https://bizdata-web.vercel.app/api";

const NICHO_TO_CATEGORY: Record<string, string> = {
  provedor: "electronics",
  advocacia: "lawyer",
  academia: "gym",
  clinica: "doctor",
  dentista: "dentist",
  restaurante: "restaurant",
  padaria: "bakery",
  bar: "bar",
  salao: "hairdresser",
  beleza: "beauty",
  loja: "clothing",
  imobiliaria: "real_estate",
  autopecas: "car_repair",
  concessionaria: "car_dealer",
  petshop: "pet_shop",
  construcao: "furniture",
  farmacia: "pharmacy",
  supermercado: "supermarket",
  hotel: "hotel",
  hostel: "hostel",
  banco: "bank",
  seguro: "insurance",
  escola: "school",
  universidade: "university",
  coworking: "coworking",
  cafe: "cafe",
  livraria: "bookstore",
  floricultura: "florist",
  cinema: "cinema",
  teatro: "theatre",
  museu: "museum",
  galeria: "gallery",
  posto: "gas_station",
  estacionamento: "parking",
  contabilidade: "accountant",
  hospital: "hospital",
  hoteis: "guest_house",
  outro: "restaurant",
};

interface BizDataBusiness {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  lat?: number;
  lon?: number;
  opening_hours?: string;
  osm_id?: number;
}

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location: { lat: number; lng: number } };
}

async function fetchBizData(segmento: string, cidade: string, raioKm: number) {
  const category = NICHO_TO_CATEGORY[segmento] || "business";

  const url = `${BIZDATA_BASE}/businesses?location=${encodeURIComponent(cidade)}&category=${encodeURIComponent(category)}&limit=50`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const data = await res.json();

    const businesses: BizDataBusiness[] = Array.isArray(data)
      ? data
      : data.businesses || [];

    if (!businesses.length) return [];

    return businesses.map((b: BizDataBusiness, i: number) => ({
      google_place_id: `osm_${b.osm_id || i}_${Date.now()}`,
      nome: b.name || "Sem nome",
      endereco: b.address || null,
      telefone: b.phone || null,
      avaliacao: null,
      total_avaliacoes: null,
      tem_site: !!(b.website && b.website.trim()),
      site_url: (b.website && b.website.trim()) || null,
      fonte: "openstreetmap" as const,
    }));
  } catch {
    return [];
  }
}

async function fetchGooglePlaces(segmento: string, cidade: string, raioKm: number) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  const query = `${segmento} em ${cidade}`;

  try {
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&radius=${raioKm * 1000}&key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    if (!searchData.results?.length) return [];

    const places = searchData.results.slice(0, 20);

    const detailed = await Promise.all(
      places.map(async (place: { place_id: string; name: string; formatted_address?: string; rating?: number; user_ratings_total?: number; geometry?: { location: { lat: number; lng: number } } }) => {
        try {
          const detailRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total&key=${apiKey}`,
            { signal: AbortSignal.timeout(8000) }
          );

          if (!detailRes.ok) {
            return {
              google_place_id: place.place_id,
              nome: place.name,
              endereco: place.formatted_address || null,
              telefone: null,
              avaliacao: place.rating || null,
              total_avaliacoes: place.user_ratings_total || null,
              tem_site: false,
              site_url: null,
              fonte: "google" as const,
            };
          }

          const detail = await detailRes.json();
          const r = detail.result || {};

          return {
            google_place_id: place.place_id,
            nome: r.name || place.name,
            endereco: r.formatted_address || place.formatted_address || null,
            telefone: r.formatted_phone_number || null,
            avaliacao: r.rating || place.rating || null,
            total_avaliacoes: r.user_ratings_total || place.user_ratings_total || null,
            tem_site: !!r.website,
            site_url: r.website || null,
            fonte: "google" as const,
          };
        } catch {
          return {
            google_place_id: place.place_id,
            nome: place.name,
            endereco: place.formatted_address || null,
            telefone: null,
            avaliacao: place.rating || null,
            total_avaliacoes: place.user_ratings_total || null,
            tem_site: false,
            site_url: null,
            fonte: "google" as const,
          };
        }
      })
    );

    return detailed;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const segmento = searchParams.get("segmento") || "";
  const cidade = searchParams.get("cidade") || "";
  const raioKm = parseInt(searchParams.get("raio_km") || "10", 10);

  if (!segmento || !cidade) {
    return NextResponse.json(
      { error: "segmento e cidade são obrigatórios" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const useGoogle = !!apiKey;

  let resultados: Array<{
    google_place_id: string;
    nome: string;
    endereco: string | null;
    telefone: string | null;
    avaliacao: number | null;
    total_avaliacoes: number | null;
    tem_site: boolean;
    site_url: string | null;
    fonte: "google" | "openstreetmap";
  }>;

  if (useGoogle) {
    resultados = await fetchGooglePlaces(segmento, cidade, raioKm);

    if (resultados.length < 5) {
      const osmResults = await fetchBizData(segmento, cidade, raioKm);
      const existingIds = new Set(resultados.map((r) => r.nome.toLowerCase()));
      const novos = osmResults.filter((r) => !existingIds.has(r.nome.toLowerCase()));
      resultados = [...resultados, ...novos];
    }
  } else {
    resultados = await fetchBizData(segmento, cidade, raioKm);
  }

  const ordenados = resultados.sort((a, b) => {
    if (!a.tem_site && b.tem_site) return -1;
    if (a.tem_site && !b.tem_site) return 1;
    return 0;
  });

  return NextResponse.json({
    resultados: ordenados,
    total: ordenados.length,
    fonte: useGoogle ? "google + openstreetmap" : "openstreetmap",
    sem_site: ordenados.filter((r) => !r.tem_site).length,
    com_site: ordenados.filter((r) => r.tem_site).length,
  });
}
