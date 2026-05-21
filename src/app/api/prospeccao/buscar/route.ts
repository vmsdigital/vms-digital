import { NextRequest, NextResponse } from "next/server";

const NICHO_TO_OSM: Record<string, string> = {
  provedor: "office|telecommunication",
  advocacia: "office|lawyer",
  academia: "leisure|fitness_centre",
  clinica: "amenity|clinic",
  dentista: "amenity|dentist",
  restaurante: "amenity|restaurant",
  padaria: "shop|bakery",
  bar: "amenity|bar",
  salao: "shop|hairdresser",
  beleza: "shop|beauty",
  loja: "shop|clothes",
  imobiliaria: "office|estate_agent",
  autopecas: "shop|car_parts",
  concessionaria: "shop|car",
  petshop: "shop|pet",
  construcao: "shop|doityourself",
  farmacia: "amenity|pharmacy",
  supermercado: "shop|supermarket",
  hotel: "tourism|hotel",
  hostel: "tourism|hostel",
  banco: "amenity|bank",
  seguro: "office|insurance",
  escola: "amenity|school",
  universidade: "amenity|university",
  coworking: "office|coworking",
  cafe: "amenity|cafe",
  livraria: "shop|books",
  floricultura: "shop|florist",
  cinema: "amenity|cinema",
  teatro: "amenity|theatre",
  museu: "tourism|museum",
  galeria: "tourism|gallery",
  posto: "amenity|fuel",
  estacionamento: "amenity|parking",
  contabilidade: "office|accountant",
  hospital: "amenity|hospitals",
  outro: "amenity|restaurant",
};

async function geocodeCity(cidade: string): Promise<{ lat: number; lon: number; display_name: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidade)}&format=json&limit=1&countrycodes=br`;
    const res = await fetch(url, {
      headers: { "User-Agent": "VMS-Digital-Platform/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch {
    return null;
  }
}

async function fetchOverpass(lat: number, lon: number, raioKm: number, segmento: string) {
  const osmTag = NICHO_TO_OSM[segmento] || "amenity|restaurant";
  const [osmKey, osmValue] = osmTag.split("|");
  const radius = raioKm * 1000;

  const query = `
    [out:json][timeout:25];
    (
      node["${osmKey}"="${osmValue}"](around:${radius},${lat},${lon});
      way["${osmKey}"="${osmValue}"](around:${radius},${lat},${lon});
      relation["${osmKey}"="${osmValue}"](around:${radius},${lat},${lon});
    );
    out center body;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.elements?.length) return [];

    return data.elements
      .map((el: { id: number; tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }) => {
        const tags = el.tags || {};
        const elLat = el.lat || el.center?.lat;
        const elLon = el.lon || el.center?.lon;
        const website = tags.website || tags["contact:website"] || "";
        const phone = tags.phone || tags["contact:phone"] || "";
        const instagram = tags["contact:instagram"] || "";
        const facebook = tags["contact:facebook"] || "";
        const redesSociais = [instagram, facebook].filter(Boolean);

        return {
          google_place_id: `osm_${el.id}`,
          nome: tags.name || "Sem nome",
          endereco: tags["addr:street"]
            ? `${tags["addr:street"]}${tags["addr:housenumber"] ? `, ${tags["addr:housenumber"]}` : ""}${tags["addr:city"] ? ` - ${tags["addr:city"]}` : ""}`
            : null,
          telefone: phone || null,
          avaliacao: null,
          total_avaliacoes: null,
          tem_site: !!(website && website.trim()),
          site_url: (website && website.trim()) || null,
          redes_sociais: redesSociais.length > 0 ? redesSociais : null,
          lat: elLat || null,
          lon: elLon || null,
        };
      })
      .filter((r: { nome: string }) => r.nome !== "Sem nome");
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const segmento = searchParams.get("segmento") || "";
  const cidade = searchParams.get("cidade") || "";
  const raioKm = parseInt(searchParams.get("raio_km") || "10", 10);
  const pagina = parseInt(searchParams.get("pagina") || "1", 10);
  const porPagina = 10;
  const jaVistos = searchParams.get("ja_vistos") || "";

  if (!segmento || !cidade) {
    return NextResponse.json(
      { error: "segmento e cidade são obrigatórios" },
      { status: 400 }
    );
  }

  const geo = await geocodeCity(cidade);
  if (!geo) {
    return NextResponse.json(
      { error: "Cidade não encontrada. Tente outro nome." },
      { status: 404 }
    );
  }

  let resultados = await fetchOverpass(geo.lat, geo.lon, raioKm, segmento);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (apiKey && resultados.length < 20) {
    try {
      const query = `${segmento} em ${cidade}`;
      const searchRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&radius=${raioKm * 1000}&key=${apiKey}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.results?.length) {
          const existingIds = new Set(resultados.map((r: { google_place_id: string }) => r.google_place_id));
          const googleResults = searchData.results.slice(0, 40).map((place: { place_id: string; name: string; formatted_address?: string; rating?: number; user_ratings_total?: number; geometry?: { location: { lat: number; lng: number } }; website?: string }) => ({
            google_place_id: place.place_id,
            nome: place.name,
            endereco: place.formatted_address || null,
            telefone: null,
            avaliacao: place.rating || null,
            total_avaliacoes: place.user_ratings_total || null,
            tem_site: !!(place.website && place.website.trim()),
            site_url: (place.website && place.website.trim()) || null,
            redes_sociais: null,
            lat: place.geometry?.location?.lat || null,
            lon: place.geometry?.location?.lng || null,
          })).filter((r: { google_place_id: string }) => !existingIds.has(r.google_place_id));
          resultados = [...resultados, ...googleResults];
        }
      }
    } catch {}
  }

  const vistosSet = new Set(jaVistos ? jaVistos.split(",") : []);
  resultados = resultados.filter((r: { google_place_id: string }) => !vistosSet.has(r.google_place_id));

  const ordenados = resultados.sort((a: { tem_site: boolean; total_avaliacoes: number | null; redes_sociais: string[] | null }, b: { tem_site: boolean; total_avaliacoes: number | null; redes_sociais: string[] | null }) => {
    if (!a.tem_site && b.tem_site) return -1;
    if (a.tem_site && !b.tem_site) return 1;
    const aTemRede = a.redes_sociais && a.redes_sociais.length > 0;
    const bTemRede = b.redes_sociais && b.redes_sociais.length > 0;
    if (aTemRede && !bTemRede) return -1;
    if (!aTemRede && bTemRede) return 1;
    const aAval = a.total_avaliacoes || 0;
    const bAval = b.total_avaliacoes || 0;
    return bAval - aAval;
  });

  const total = ordenados.length;
  const inicio = (pagina - 1) * porPagina;
  const paginados = ordenados.slice(inicio, inicio + porPagina);

  return NextResponse.json({
    resultados: paginados,
    total,
    pagina,
    total_paginas: Math.ceil(total / porPagina),
    sem_site: ordenados.filter((r: { tem_site: boolean }) => !r.tem_site).length,
    com_site: ordenados.filter((r: { tem_site: boolean }) => r.tem_site).length,
    cidade_geo: { lat: geo.lat, lon: geo.lon, display_name: geo.display_name },
  });
}
