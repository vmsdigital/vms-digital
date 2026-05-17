import { NextRequest, NextResponse } from "next/server";

async function searchBizData(nome: string, cidade: string) {
  try {
    const params = new URLSearchParams({
      location: cidade,
      category: "business",
      limit: "5",
    });

    const res = await fetch(`https://bizdata-web.vercel.app/api/businesses?${params}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const businesses: Array<{ name: string; address?: string; phone?: string; website?: string; lat?: number; lon?: number }> =
      Array.isArray(data) ? data : data.businesses || [];

    const nomeLower = nome.toLowerCase();
    const match = businesses.find(
      (b) => b.name?.toLowerCase().includes(nomeLower) || nomeLower.includes(b.name?.toLowerCase())
    );

    if (match) {
      return {
        encontrado: true,
        nome: match.name,
        endereco: match.address || null,
        telefone: match.phone || null,
        website: match.website || null,
        lat: match.lat || null,
        lon: match.lon || null,
        fonte: "openstreetmap",
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function searchGooglePlaces(nome: string, cidade: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const query = `${nome} ${cidade}`;
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const place = data.results?.[0];

    if (!place) return null;

    let telefone = null;
    let website = null;

    if (place.place_id) {
      try {
        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,rating,user_ratings_total,url&key=${apiKey}`,
          { signal: AbortSignal.timeout(5000) }
        );

        if (detailRes.ok) {
          const detail = await detailRes.json();
          telefone = detail.result?.formatted_phone_number || null;
          website = detail.result?.website || null;
        }
      } catch {}
    }

    return {
      encontrado: true,
      nome: place.name,
      endereco: place.formatted_address || null,
      telefone,
      website,
      avaliacao: place.rating || null,
      total_avaliacoes: place.user_ratings_total || null,
      lat: place.geometry?.location?.lat || null,
      lon: place.geometry?.location?.lng || null,
      google_url: place.place_id ? `https://maps.google.com/?cid=${place.place_id}` : null,
      fonte: "google",
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nome = searchParams.get("nome") || "";
  const cidade = searchParams.get("cidade") || "";

  if (!nome) {
    return NextResponse.json(
      { error: "nome é obrigatório" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  let resultado;

  if (apiKey) {
    resultado = await searchGooglePlaces(nome, cidade);
    if (!resultado) {
      resultado = await searchBizData(nome, cidade);
    }
  } else {
    resultado = await searchBizData(nome, cidade);
  }

  if (!resultado) {
    return NextResponse.json({
      encontrado: false,
      nome,
      fonte: apiKey ? "google + openstreetmap" : "openstreetmap",
    });
  }

  return NextResponse.json(resultado);
}
