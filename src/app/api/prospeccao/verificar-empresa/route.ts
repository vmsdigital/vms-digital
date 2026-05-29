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
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.websiteUri,places.nationalPhoneNumber",
        "Referer": "https://startzy.com.br",
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 1,
        languageCode: "pt-BR",
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const place = data.places?.[0];

    if (!place) return null;

    return {
      encontrado: true,
      nome: place.displayName?.text || nome,
      endereco: place.formattedAddress || null,
      telefone: place.nationalPhoneNumber || null,
      website: place.websiteUri || null,
      avaliacao: place.rating || null,
      total_avaliacoes: place.userRatingCount || null,
      lat: place.location?.latitude || null,
      lon: place.location?.longitude || null,
      google_url: place.id ? `https://maps.google.com/?cid=${place.id}` : null,
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
