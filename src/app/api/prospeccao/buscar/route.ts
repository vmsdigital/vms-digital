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
  mecanico: "shop|car_repair",
  lavanderia: "shop|laundry",
  optica: "shop|optician",
  joalheria: "shop|jewelry",
  eletronicos: "shop|electronics",
  moveis: "shop|furniture",
  materiais: "shop|hardware",
  pizzaria: "amenity|fast_food",
  lanchonete: "amenity|fast_food",
  barbearia: "shop|barber",
  estetica: "shop|beauty",
  veterinario: "amenity|veterinary",
  fisioterapia: "amenity|clinic",
  psicologo: "office|therapist",
  arquitetura: "office|architect",
  engenharia: "office|engineer",
  consultoria: "office|consulting",
  marketing: "office|advertising_agency",
  fotografia: "shop|photo",
  musica: "shop|music",
  outro: "amenity|restaurant",
};

async function geocodeCity(cidade: string): Promise<{ lat: number; lon: number; display_name: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidade)}&format=json&limit=1&countrycodes=br`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Startzy-Platform/1.0" },
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

async function verifyWebsite(nome: string, cidade: string): Promise<{ tem_site: boolean; site_url: string | null }> {
  const domains = [
    nome.toLowerCase().replace(/[^a-z0-9]/g, ""),
    nome.toLowerCase().replace(/[^a-z0-9]/g, "") + cidade.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4),
  ];

  const tlds = [".com.br", ".com", ".net.br"];

  for (const domain of domains) {
    if (domain.length < 3) continue;
    for (const tld of tlds) {
      const url = `https://${domain}${tld}`;
      try {
        const res = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(4000),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          redirect: "follow",
        });
        if (res.ok) {
          return { tem_site: true, site_url: url };
        }
      } catch {
        continue;
      }
    }
  }

  const socialPatterns = [
    `https://www.instagram.com/${nome.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    `https://www.facebook.com/${nome.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
  ];

  for (const socialUrl of socialPatterns) {
    try {
      const res = await fetch(socialUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(4000),
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        redirect: "follow",
      });
      if (res.ok && !res.url.includes("login")) {
        return { tem_site: true, site_url: socialUrl };
      }
    } catch {
      continue;
    }
  }

  return { tem_site: false, site_url: null };
}

async function searchGooglePlaces(segmento: string, cidade: string, geo: { lat: number; lon: number }, raioKm: number) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    const query = `${segmento} em ${cidade}`;
    const searchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.websiteUri,places.nationalPhoneNumber",
          "Referer": "https://startzy.com.br",
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: 20,
          languageCode: "pt-BR",
          locationBias: {
            circle: {
              center: { latitude: geo.lat, longitude: geo.lon },
              radius: raioKm * 1000,
            },
          },
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.places?.length) {
        return searchData.places.slice(0, 40).map((place: { id: string; displayName?: { text: string }; formattedAddress?: string; rating?: number; userRatingCount?: number; location?: { latitude: number; longitude: number }; websiteUri?: string; nationalPhoneNumber?: string }) => ({
          google_place_id: place.id,
          nome: place.displayName?.text || "",
          endereco: place.formattedAddress || null,
          telefone: place.nationalPhoneNumber || null,
          avaliacao: place.rating || null,
          total_avaliacoes: place.userRatingCount || null,
          tem_site: !!place.websiteUri,
          site_url: place.websiteUri || null,
          redes_sociais: null,
          lat: place.location?.latitude || null,
          lon: place.location?.longitude || null,
        }));
      }
    } else {
      const errText = await searchRes.text();
      console.error("Google Places API (New) error:", searchRes.status, errText);
    }
  } catch (err) {
    console.error("Erro Google Places:", err);
  }
  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const segmento = searchParams.get("segmento") || "";
  const cidade = searchParams.get("cidade") || "";
  const raioKm = parseInt(searchParams.get("raio_km") || "10", 10);
  const pagina = parseInt(searchParams.get("pagina") || "1", 10);
  const porPagina = parseInt(searchParams.get("quantidade") || "10", 10);
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

  let resultados: Array<{ google_place_id: string; nome: string; endereco: string | null; telefone: string | null; avaliacao: number | null; total_avaliacoes: number | null; tem_site: boolean; site_url: string | null; redes_sociais: string[] | null; lat: number | null; lon: number | null }> = [];

  const googleResults = await searchGooglePlaces(segmento, cidade, geo, raioKm);
  if (googleResults.length > 0) {
    resultados = googleResults;
  }

  if (resultados.length < 10) {
    const osmResults = await fetchOverpass(geo.lat, geo.lon, raioKm, segmento);
    const existingIds = new Set(resultados.map((r: { google_place_id: string }) => r.google_place_id));
    const existingNames = new Set(resultados.map((r: { nome: string }) => r.nome.toLowerCase()));
    const newOsm = osmResults.filter((r: { google_place_id: string; nome: string }) => !existingIds.has(r.google_place_id) && !existingNames.has(r.nome.toLowerCase()));
    resultados = [...resultados, ...newOsm];
  }

  const semSite = resultados.filter((r: { tem_site: boolean }) => !r.tem_site).slice(0, 5);
  if (semSite.length > 0) {
    const verifyPromises = semSite.map(async (r) => {
      const result = await verifyWebsite(r.nome, cidade);
      if (result.tem_site) {
        r.tem_site = true;
        r.site_url = result.site_url;
      }
    });
    await Promise.all(verifyPromises);
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
