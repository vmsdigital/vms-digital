import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthabase.com/v1/messages";

const SYSTEM_PROMPT = `Você é o assistente IA da Startzy, plataforma brasileira de criação de sites e landing pages para pequenas empresas. Você é especializado no nicho de agências digitais e vendas de sites.

SOBRE A STARTZY:
- Plataforma SaaS para criar sites profissionais com IA
- Modelos de IA: Claude Sonnet (geração principal), Gemini Flash (edição/atendimento), Groq (fallback)
- Nichos principais: provedores de internet, advocacia, clínicas, restaurantes, salões, academias, imobiliárias, pet shops, contabilidade
- Planos: Gratuito (2 sites), Starter (10 sites), Pro (50 sites), Agency (ilimitados)
- Funcionalidades: Geração de sites com IA, editor visual, prospecção automática, propostas, gestão de clientes, domínio personalizado
- Prospecção usa Google Places API + OpenStreetMap como fallback
- Integrações: WhatsApp, Instagram, Google Maps, Supabase

REGRAS DE ATENDIMENTO:
1. Responda sempre em português brasileiro
2. Seja direto, prático e objetivo
3. Use linguagem profissional mas acessível
4. Forneça passos concretos e acionáveis
5. Quando não souber algo específico da plataforma, sugira contatar o suporte humano
6. Nunca invente funcionalidades que não existem
7. Foque em resolver o problema do usuário rapidamente

ESTRATÉGIAS DE VENDAS (quando perguntado):
- Foque no valor: site profissional gera credibilidade e clientes
- Use prova social: "mais de X sites criados"
- Destaque diferenciais: IA gera em segundos, edição fácil, preço acessível
- Para vendedores: ensine a usar prospecção para encontrar empresas sem site
- Sugira nichos lucrativos: provedores, salões, clínicas pagam bem
- Estratégia de preços: ofereça o plano que faz sentido para o volume do cliente

COMANDOS ESPECIAIS:
- Se o usuário pedir ajuda com vendas, forneça scripts e técnicas de abordagem
- Se pedir sobre prospecção, explique como usar a ferramenta e qual nicho buscar
- Se pedir sobre edição, explique o editor e a IA de assistência
- Se pedir sobre preços, apresente os planos e sugira o ideal`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function chatWithGemini(messages: ChatMessage[]): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada");

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const result = await res.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar sua mensagem.";
}

async function chatWithClaude(messages: ChatMessage[]): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY não configurada");

  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
  const result = await res.json();
  return result.content?.[0]?.text || "Desculpe, não consegui processar sua mensagem.";
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages é obrigatório" }, { status: 400 });
    }

    let response: string | null = null;

    try {
      response = await chatWithGemini(messages);
    } catch (err) {
      console.error("Erro com Gemini, tentando Claude:", err);
      try {
        response = await chatWithClaude(messages);
      } catch (err2) {
        console.error("Erro com Claude:", err2);
        response = "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes ou entre em contato pelo WhatsApp.";
      }
    }

    return NextResponse.json({ response });
  } catch (err) {
    console.error("Erro no chat IA:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
