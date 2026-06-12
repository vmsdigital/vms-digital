import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const NICHO_TO_GOOGLE: Record<string, string> = {
  provedor: "provedor de internet",
  advocacia: "advogado",
  academia: "academia",
  clinica: "clinica medica",
  dentista: "dentista",
  restaurante: "restaurante",
  padaria: "padaria",
  bar: "bar",
  salao: "salao de beleza",
  beleza: "salao de beleza",
  loja: "loja de roupas",
  imobiliaria: "imobiliaria",
  autopecas: "auto pecas",
  concessionaria: "concessionaria",
  petshop: "pet shop",
  construcao: "material de construcao",
  farmacia: "farmacia",
  supermercado: "supermercado",
  hotel: "hotel",
  banco: "banco",
  seguro: "seguradora",
  escola: "escola",
  coworking: "coworking",
  cafe: "cafeteria",
  barbearia: "barbearia",
  estetica: "clinica de estetica",
  contabilidade: "contador",
  mecanico: "mecanica",
  pizzaria: "pizzaria",
  fisioterapia: "fisioterapeuta",
  psicologo: "psicologo",
  veterinario: "veterinario",
  arquitetura: "arquiteto",
  consultoria: "consultoria",
  marketing: "agencia de marketing",
  fotografia: "fotografo",
  optica: "optica",
  eletronicos: "eletronicos",
  moveis: "moveis",
  outro: "empresa",
};

const NICHO_CORES: Record<string, { primaria: string; secundaria: string; tema: string }> = {
  provedor: { primaria: "#00CFFF", secundaria: "#0057B7", tema: "escuro" },
  advocacia: { primaria: "#1B4332", secundaria: "#2D6A4F", tema: "escuro" },
  academia: { primaria: "#FF6B35", secundaria: "#1B1B2F", tema: "escuro" },
  clinica: { primaria: "#4ECDC4", secundaria: "#2C3E50", tema: "claro" },
  dentista: { primaria: "#4ECDC4", secundaria: "#2C3E50", tema: "claro" },
  restaurante: { primaria: "#E74C3C", secundaria: "#2C1810", tema: "escuro" },
  padaria: { primaria: "#F39C12", secundaria: "#2C1810", tema: "escuro" },
  bar: { primaria: "#8E44AD", secundaria: "#1A0A2E", tema: "escuro" },
  salao: { primaria: "#E91E9C", secundaria: "#1A0A2E", tema: "escuro" },
  beleza: { primaria: "#E91E9C", secundaria: "#1A0A2E", tema: "escuro" },
  loja: { primaria: "#667eea", secundaria: "#764ba2", tema: "escuro" },
  imobiliaria: { primaria: "#2ECC71", secundaria: "#1A3C34", tema: "escuro" },
  autopecas: { primaria: "#E74C3C", secundaria: "#1B1B2F", tema: "escuro" },
  concessionaria: { primaria: "#E74C3C", secundaria: "#1B1B2F", tema: "escuro" },
  petshop: { primaria: "#F39C12", secundaria: "#1A3C34", tema: "claro" },
  construcao: { primaria: "#F39C12", secundaria: "#2C3E50", tema: "escuro" },
  farmacia: { primaria: "#2ECC71", secundaria: "#1A3C34", tema: "claro" },
  supermercado: { primaria: "#2ECC71", secundaria: "#1A3C34", tema: "claro" },
  hotel: { primaria: "#667eea", secundaria: "#764ba2", tema: "escuro" },
  banco: { primaria: "#1B4332", secundaria: "#2D6A4F", tema: "escuro" },
  seguro: { primaria: "#1B4332", secundaria: "#2D6A4F", tema: "escuro" },
  escola: { primaria: "#667eea", secundaria: "#764ba2", tema: "claro" },
  coworking: { primaria: "#00CFFF", secundaria: "#0057B7", tema: "escuro" },
  cafe: { primaria: "#8E44AD", secundaria: "#2C1810", tema: "escuro" },
  barbearia: { primaria: "#E74C3C", secundaria: "#1B1B2F", tema: "escuro" },
  estetica: { primaria: "#E91E9C", secundaria: "#1A0A2E", tema: "escuro" },
  contabilidade: { primaria: "#1B4332", secundaria: "#2D6A4F", tema: "escuro" },
  mecanico: { primaria: "#E74C3C", secundaria: "#1B1B2F", tema: "escuro" },
  pizzaria: { primaria: "#E74C3C", secundaria: "#2C1810", tema: "escuro" },
  fisioterapia: { primaria: "#4ECDC4", secundaria: "#2C3E50", tema: "claro" },
  psicologo: { primaria: "#667eea", secundaria: "#764ba2", tema: "claro" },
  veterinario: { primaria: "#2ECC71", secundaria: "#1A3C34", tema: "claro" },
  arquitetura: { primaria: "#1B1B2F", secundaria: "#667eea", tema: "escuro" },
  consultoria: { primaria: "#667eea", secundaria: "#764ba2", tema: "escuro" },
  marketing: { primaria: "#00CFFF", secundaria: "#0057B7", tema: "escuro" },
  fotografia: { primaria: "#8E44AD", secundaria: "#1A0A2E", tema: "escuro" },
  optica: { primaria: "#4ECDC4", secundaria: "#2C3E50", tema: "claro" },
  eletronicos: { primaria: "#00CFFF", secundaria: "#0057B7", tema: "escuro" },
  moveis: { primaria: "#F39C12", secundaria: "#2C3E50", tema: "escuro" },
  outro: { primaria: "#667eea", secundaria: "#764ba2", tema: "escuro" },
};

const SYSTEM_PROMPT = `Web designer sênior. Crie landing pages de alta conversão.

CÓDIGO: HTML completo autônomo. Tailwind CDN (<script src="https://cdn.tailwindcss.com"></script>). 2 Google Fonts (Sora/Space Grotesk/Outfit para títulos, Inter para corpo). Mobile-first. Fade-in scroll com IntersectionObserver. SEM imagens externas — SVGs inline ou divs com gradientes. Meta tags SEO. Rodapé: "Criado por Startzy".

DESIGN: Semântica HTML (header/nav/main/section/footer). py-16 md:py-24 entre seções. Títulos text-4xl/5xl/6xl font-black, corpo text-base. Container max-w-6xl mx-auto px-4. Cards rounded-2xl, hover scale-[1.02] shadow-lg. CTAs bg-primaria text-white rounded-xl py-4 px-8 font-bold text-lg. SEM emojis. Gradientes sutis. SVGs inline sofisticados. Glassmorphism em cards escuros. Grid/dot patterns sutis. Barra gradiente topo (h-1 from-primaria to-secundaria).

8 SEÇÕES: 1) Nav fixed backdrop-blur + CTA 2) Hero text-5xl/7xl font-black + 2 CTAs + SVG abstrato 3) Pain points → 3 diferenciais 4) Serviços grid 3 cards SVG 5) Números impacto text-5xl 6) 3 depoimentos 7) FAQ 5-6 accordion 8) CTA final gradiente + footer + WhatsApp flutuante

Copy ESPECÍFICA do nicho, não genérica. Linguagem natural e persuasiva. Detalhes visuais únicos.

Retorne APENAS HTML completo, sem markdown.`;

async function geocodeCity(cidade: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidade)}&format=json&limit=1&countrycodes=br`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Startzy-Platform/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

async function prospectarGoogle(segmento: string, cidade: string, raioKm: number) {
  if (!GOOGLE_PLACES_API_KEY) return null;

  const query = NICHO_TO_GOOGLE[segmento] || "empresa";
  const location = await geocodeCity(cidade);
  if (!location) return null;

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.websiteUri,places.nationalPhoneNumber",
        "Referer": "https://startzy.com.br",
      },
      body: JSON.stringify({
        textQuery: `${query} em ${cidade}`,
        maxResultCount: 20,
        languageCode: "pt-BR",
        locationBias: {
          circle: {
            center: { latitude: location.lat, longitude: location.lon },
            radius: raioKm * 1000,
          },
        },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.places?.length) return null;

    return data.places.map((place: { id: string; displayName?: { text: string }; formattedAddress?: string; rating?: number; userRatingCount?: number; location?: { latitude: number; longitude: number }; websiteUri?: string; nationalPhoneNumber?: string }) => ({
      google_place_id: place.id,
      nome: place.displayName?.text || "",
      endereco: place.formattedAddress || null,
      telefone: place.nationalPhoneNumber || null,
      tem_site: !!place.websiteUri,
      site_url: place.websiteUri || null,
      avaliacao: place.rating || null,
      lat: place.location?.latitude || null,
      lon: place.location?.longitude || null,
    }));
  } catch {
    return null;
  }
}

async function prospectarOSM(segmento: string, cidade: string, raioKm: number) {
  const geo = await geocodeCity(cidade);
  if (!geo) return [];

  const osmTag = NICHO_TO_GOOGLE[segmento] ? "dynamic" : "amenity|restaurant";
  const radius = raioKm * 1000;

  const osmKey = "amenity";
  const osmValue = segmento === "restaurante" ? "restaurant" : segmento === "dentista" ? "dentist" : segmento === "farmacia" ? "pharmacy" : "restaurant";

  const query = `
    [out:json][timeout:25];
    (
      node["${osmKey}"="${osmValue}"](around:${radius},${geo.lat},${geo.lon});
      way["${osmKey}"="${osmValue}"](around:${radius},${geo.lat},${geo.lon});
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
        const website = tags.website || tags["contact:website"] || "";
        const phone = tags.phone || tags["contact:phone"] || "";
        return {
          google_place_id: `osm_${el.id}`,
          nome: tags.name || "",
          endereco: tags["addr:street"] ? `${tags["addr:street"]}${tags["addr:housenumber"] ? `, ${tags["addr:housenumber"]}` : ""}` : null,
          telefone: phone || null,
          tem_site: !!(website && website.trim()),
          site_url: (website && website.trim()) || null,
          avaliacao: null,
          lat: el.lat || el.center?.lat || null,
          lon: el.lon || el.center?.lon || null,
        };
      })
      .filter((r: { nome: string }) => r.nome !== "");
  } catch {
    return [];
  }
}

async function prospectar(segmento: string, cidade: string, raioKm: number) {
  const googleResults = await prospectarGoogle(segmento, cidade, raioKm);
  if (googleResults && googleResults.length >= 5) {
    return googleResults;
  }
  const osmResults = await prospectarOSM(segmento, cidade, raioKm);
  if (googleResults && googleResults.length > 0) {
    const googleIds = new Set(googleResults.map((r: { google_place_id: string }) => r.google_place_id));
    const merged = [...googleResults, ...osmResults.filter((r: { google_place_id: string }) => !googleIds.has(r.google_place_id))];
    return merged;
  }
  return osmResults;
}

function passouTresHoras(): boolean {
  const agora = new Date();
  return agora.getHours() >= 3;
}

async function gerarSiteGemini(
  empresa: { nome: string; endereco: string | null; telefone: string | null },
  nicho: string,
  corPrimaria: string,
  corSecundaria: string,
  tema: string
): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada");

  const userMessage = buildUserMessage(empresa, nicho, corPrimaria, corSecundaria, tema);
  const prompt = `${SYSTEM_PROMPT}\n\n${userMessage}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${err}`);
  }

  const result = await res.json();
  let html = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  html = cleanHtmlOutput(html);
  return html;
}

async function gerarSiteGroq(
  empresa: { nome: string; endereco: string | null; telefone: string | null },
  nicho: string,
  corPrimaria: string,
  corSecundaria: string,
  tema: string
): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY não configurada");

  const userMessage = buildUserMessage(empresa, nicho, corPrimaria, corSecundaria, tema);
  const prompt = `${SYSTEM_PROMPT}\n\n${userMessage}`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} - ${err}`);
  }

  const result = await res.json();
  let html = result.choices?.[0]?.message?.content || "";
  html = cleanHtmlOutput(html);
  return html;
}

async function gerarSiteClaude(
  empresa: { nome: string; endereco: string | null; telefone: string | null },
  nicho: string,
  corPrimaria: string,
  corSecundaria: string,
  tema: string
): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY não configurada");

  const userMessage = buildUserMessage(empresa, nicho, corPrimaria, corSecundaria, tema);

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} - ${err}`);
  }

  const result = await res.json();
  let html = result.content?.[0]?.text || "";
  html = cleanHtmlOutput(html);
  return html;
}

function buildUserMessage(
  empresa: { nome: string; endereco: string | null; telefone: string | null },
  nicho: string,
  corPrimaria: string,
  corSecundaria: string,
  tema: string
): string {
  const temaBg = tema === "escuro" ? "#0a0a0a" : "#ffffff";
  const temaText = tema === "escuro" ? "#f5f5f5" : "#1a1a1a";
  const temaCard = tema === "escuro" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const temaBorder = tema === "escuro" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const whatsappLink = empresa.telefone ? `https://wa.me/55${empresa.telefone.replace(/\D/g, "")}` : "";

  return `Crie um site PROFISSIONAL e MODERNO para a empresa "${empresa.nome}".

DADOS DA EMPRESA:
- Nome: ${empresa.nome}
- Descrição: Empresa de ${nicho} com excelência em atendimento
- Objetivo: Divulgar serviços e captar clientes
- Nicho: ${nicho}
- Idioma: português brasileiro
- Endereço: ${empresa.endereco || "Não informado"}
- WhatsApp: ${empresa.telefone || "Não informado"}

CORES E TEMA:
- Cor primária: ${corPrimaria}
- Cor secundária: ${corSecundaria}
- Tema: ${tema}
- Fundo: ${temaBg}
- Texto: ${temaText}
- Card: ${temaCard}
- Borda: ${temaBorder}

Configure Tailwind: <script>tailwind.config={theme:{extend:{colors:{primaria:'${corPrimaria}',secundaria:'${corSecundaria}'}}}}</script>

${whatsappLink ? `WHATSAPP: Use ${whatsappLink} em todos os CTAs de WhatsApp` : ""}

A copy e os pain points devem ser ESPECÍFICOS para o nicho "${nicho}".`;
}

async function gerarSite(
  empresa: { nome: string; endereco: string | null; telefone: string | null },
  nicho: string,
  corPrimaria: string,
  corSecundaria: string,
  tema: string
): Promise<string> {
  try {
    return await gerarSiteClaude(empresa, nicho, corPrimaria, corSecundaria, tema);
  } catch {
    try {
      return await gerarSiteGemini(empresa, nicho, corPrimaria, corSecundaria, tema);
    } catch {
      return await gerarSiteGroq(empresa, nicho, corPrimaria, corSecundaria, tema);
    }
  }
}

function cleanHtmlOutput(html: string): string {
  html = html.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
  if (!html.startsWith("<!DOCTYPE") && !html.startsWith("<html")) {
    const docIdx = html.indexOf("<!DOCTYPE");
    const htmlIdx = html.indexOf("<html");
    const startIdx = docIdx >= 0 ? docIdx : htmlIdx >= 0 ? htmlIdx : 0;
    html = html.substring(startIdx);
  }
  return html;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { segmento, cidade, raio_km, quantidade, filtro, avaliacao_minima, agendar_amanha } = body;

    if (!segmento || !cidade) {
      return NextResponse.json({ error: "segmento e cidade são obrigatórios" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const cores = NICHO_CORES[segmento] || NICHO_CORES.outro;
    const avaliacaoMin = avaliacao_minima || 0;

    if (agendar_amanha) {
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      amanha.setHours(0, 5, 0, 0);

      const { data: tarefa } = await supabase
        .from("agente_tarefas")
        .insert({
          criador_id: user.id,
          segmento,
          cidade,
          raio_km: raio_km || 25,
          quantidade: quantidade || 10,
          filtro: filtro || "sem_site",
          tema_padrao: cores.tema,
          cor_primaria: cores.primaria,
          cor_secundaria: cores.secundaria,
          avaliacao_minima: avaliacaoMin,
          agendado_para: amanha.toISOString(),
          status: "agendado",
          log: [`Agendado para ${amanha.toLocaleDateString("pt-BR")} à meia-noite`],
        })
        .select()
        .single();

      return NextResponse.json({
        tarefa_id: tarefa?.id,
        status: "agendado",
        agendado_para: amanha.toISOString(),
        message: `Agente agendado para ${amanha.toLocaleDateString("pt-BR")}. Você receberá uma notificação quando terminar.`,
      });
    }

    const { data: tarefa } = await supabase
      .from("agente_tarefas")
      .insert({
        criador_id: user.id,
        segmento,
        cidade,
        raio_km: raio_km || 25,
        quantidade: quantidade || 10,
        filtro: filtro || "sem_site",
        tema_padrao: cores.tema,
        cor_primaria: cores.primaria,
        cor_secundaria: cores.secundaria,
        avaliacao_minima: avaliacaoMin,
        status: "prospectando",
        log: ["Iniciando prospecção...", `Cores automáticas: ${cores.primaria} / ${cores.secundaria} (${cores.tema})`],
        iniciado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (!tarefa) {
      return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 });
    }

    const resultados = await prospectar(segmento, cidade, raio_km || 25);

    let filtrados = resultados;
    if (filtro === "sem_site") {
      filtrados = filtrados.filter((r: { tem_site: boolean }) => !r.tem_site);
    }
    if (avaliacaoMin > 0) {
      filtrados = filtrados.filter((r: { avaliacao: number | null }) => r.avaliacao !== null && r.avaliacao >= avaliacaoMin);
    }

    const selecionados = filtrados.slice(0, quantidade || 10);

    await supabase
      .from("agente_tarefas")
      .update({
        resultados: selecionados,
        total_prospectados: resultados.length,
        status: "gerando",
        log: [
          `Prospecção: ${resultados.length} empresas encontradas`,
          `Filtro "${filtro}": ${filtrados.length} selecionadas`,
          `Avaliação mínima: ${avaliacaoMin > 0 ? `${avaliacaoMin}+` : "qualquer"}`,
          `Gerando ${selecionados.length} sites com Claude + Prompt Caching...`,
        ],
      })
      .eq("id", tarefa.id);

    const sitesCriados: { site_id: string; nome: string; slug: string }[] = [];
    const sitesErro: { nome: string; erro: string }[] = [];

    for (let i = 0; i < selecionados.length; i++) {
      const empresa = selecionados[i];

      if (passouTresHoras()) {
        sitesErro.push({ nome: empresa.nome, erro: "Horário limite atingido (3h)" });
        for (let j = i + 1; j < selecionados.length; j++) {
          sitesErro.push({ nome: selecionados[j].nome, erro: "Cancelado — limite 3h" });
        }
        break;
      }

      try {
        const html = await gerarSite(empresa, segmento, cores.primaria, cores.secundaria, cores.tema);

        if (!html || html.length < 100) {
          sitesErro.push({ nome: empresa.nome, erro: "HTML gerado muito curto" });
          continue;
        }

        const slug = empresa.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const { data: siteData, error: siteError } = await supabase
          .from("sites")
          .insert({
            criador_id: user.id,
            nome_site: empresa.nome,
            nicho: segmento,
            slug: `${slug}.startzy.com.br`,
            publicado: true,
            dados_json: {
              descricao: `Empresa de ${segmento}`,
              objetivo: "Divulgar serviços",
              idioma: "pt-BR",
              cor_primaria: cores.primaria,
              cor_secundaria: cores.secundaria,
              tema: cores.tema,
              endereco: empresa.endereco || "",
              whatsapp: empresa.telefone || "",
              html_gerado: html,
              origem: "agente_ia",
            },
          })
          .select()
          .single();

        if (siteError || !siteData) {
          sitesErro.push({ nome: empresa.nome, erro: siteError?.message || "Erro ao salvar" });
          continue;
        }

        await supabase.from("propostas").insert({
          criador_id: user.id,
          site_id: siteData.id,
          nome_prospect: empresa.nome,
          whatsapp: empresa.telefone || null,
          status: "gerado",
        });

        sitesCriados.push({ site_id: siteData.id, nome: empresa.nome, slug: siteData.slug });

        await supabase
          .from("agente_tarefas")
          .update({
            total_sites_criados: sitesCriados.length,
            total_erros: sitesErro.length,
            log: [
              `Prospecção: ${resultados.length} encontradas`,
              `Sites: ${sitesCriados.length}/${selecionados.length} concluídos`,
              ...sitesErro.slice(-3).map((e) => `Erro: ${e.nome} - ${e.erro}`),
            ],
          })
          .eq("id", tarefa.id);

        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        sitesErro.push({ nome: empresa.nome, erro: err instanceof Error ? err.message : "Erro desconhecido" });
      }
    }

    const atingiuLimite = passouTresHoras();
    let statusFinal: string;
    if (atingiuLimite && sitesCriados.length < selecionados.length) {
      statusFinal = sitesCriados.length > 0 ? "parcial" : "erro";
    } else {
      statusFinal = sitesCriados.length === selecionados.length ? "concluido" : sitesCriados.length > 0 ? "parcial" : "erro";
    }

    await supabase
      .from("agente_tarefas")
      .update({
        status: statusFinal,
        sites_criados: sitesCriados,
        sites_erro: sitesErro,
        total_sites_criados: sitesCriados.length,
        total_erros: sitesErro.length,
        concluido_em: new Date().toISOString(),
        log: [
          `Prospecção: ${resultados.length} encontradas`,
          `Filtro: ${filtrados.length} selecionadas`,
          `Sites criados: ${sitesCriados.length}/${selecionados.length}`,
          ...sitesErro.map((e) => `Erro: ${e.nome} - ${e.erro}`),
          atingiuLimite ? "⏰ Parado pelo limite de 3h" : "",
          statusFinal === "concluido" ? "✅ Tarefa concluída com sucesso!" : `⚠️ Concluído com ${sitesErro.length} erros`,
        ].filter(Boolean),
      })
      .eq("id", tarefa.id);

    await supabase.from("notificacoes").insert({
      usuario_id: user.id,
      tipo: "sistema",
      titulo: "Agente IA concluído!",
      mensagem: `${sitesCriados.length} sites criados para ${segmento} em ${cidade}.${atingiuLimite ? " Parado pelo limite de 3h." : ""}${sitesErro.length > 0 ? ` ${sitesErro.length} erros.` : ""}`,
      lida: false,
    });

    return NextResponse.json({
      tarefa_id: tarefa.id,
      total_prospectados: resultados.length,
      total_selecionados: selecionados.length,
      sites_criados: sitesCriados,
      sites_erro: sitesErro,
      status: statusFinal,
      horario_limite_atingido: atingiuLimite,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tarefaId = searchParams.get("id");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (tarefaId) {
    const { data } = await supabase
      .from("agente_tarefas")
      .select("*")
      .eq("id", tarefaId)
      .eq("criador_id", user.id)
      .single();
    return NextResponse.json(data);
  }

  const { data } = await supabase
    .from("agente_tarefas")
    .select("*")
    .eq("criador_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(20);

  return NextResponse.json(data);
}
