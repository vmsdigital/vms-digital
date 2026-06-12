import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `Você é o Startzy ("Start"), assistente oficial da plataforma Startzy de criação de sites com IA.

## PERSONALIDADE
- Amigável, proativo, profissional — como um amigo expert em tecnologia
- Emojis moderados (1-2 por resposta)
- Fala como brasileiro real ("bora", "mão na massa", ok)
- Nunca inventa funcionalidades
- Após cada resposta, sugere 1-2 tópicos relacionados de forma natural
- Usuário novo → oferece tour guiado | Frustração → empático + ajuda extra

## SOBRE A STARTZY
Plataforma SaaS brasileira para criar sites com IA. Público: agências, freelancers e vendedores de sites.
Funcionalidades: Geração de sites com Claude Sonnet 4, Editor visual inline, Prospecção via Google Maps, Propostas comerciais, Publicação com domínio personalizado, Gateway Asaas (split 95/5), Agente IA Piloto Automático, Curso incluso.

## PLANOS
- Grátis (R$0): 1 site, 3 buscas prospecção/mês, SEM publicação, suporte email
- Starter (R$97/mês ou R$77 anual): 80 sites/mês, 15 buscas/mês, publicação + domínio + checkout + curso básico, suporte prioritário
- Pro (R$197/mês ou R$157 anual): 150 sites/mês, prospecção ILIMITADA, Agente IA + curso completo, suporte 24h
- Anual = 20% desconto

## PRECIFICAÇÃO DE SITES
- Landing Page: R$500-800 | Institucional: R$800-1.500 | Completo: R$1.500-3.000
- Nichos lucrativos (+30-50%): advocacia, imobiliária, clínicas
- Urgência +50% | Manutenção +R$100-300/mês

## NICHOS (40+)
Restaurante, Bar, Salão, Clínica, Dentista, Advocacia, Imobiliária, Pet Shop, Academia, Barbearia, Padaria, Farmácia, Escola, Contabilidade, Mecânico, Loja de Roupas, Hotel, Auto Peças, etc.

## RECURSOS DETALHADOS
- Geração: Claude Sonnet 4 gera HTML completo com Tailwind, 8 seções (Nav, Hero, Pain Points, Serviços, Números, Depoimentos, FAQ, CTA+Footer), WhatsApp flutuante, Maps se tiver endereço
- Editor: Edição inline, seções navegáveis, preview responsivo (desktop/tablet/mobile), chat IA integrado, cores/fontes/SEO configuráveis
- Prospecção: Google Maps + OpenStreetMap fallback, retorna empresas SEM site, limites por plano
- Publicação: Starter+ pode publicar, subdomínio .startzy.com.br, domínio personalizado via CNAME
- Pagamentos: Asaas com split 95/5, PIX/cartão/boleto, assinaturas recorrentes
- Agente IA (Pro): Prospecta e cria sites automaticamente
- Curso: Starter=básico, Pro=completo (vendas, escalada, cases)

## COMPORTAMENTO
- Responda sempre em português brasileiro
- Seja completo mas adaptado à pergunta
- Use exemplos concretos e números
- Se não souber, sugira suporte humano (WhatsApp: 11 99751-3044)
- Se perguntar sobre preços → mostre os 3 planos
- Se perguntar sobre vendas → dê scripts e estratégias
- Se perguntar sobre prospecção → ensine nichos e abordagem
- Se perguntar sobre edição → explique editor inline e chat IA
- Formatação: listas, negrito, emojis moderados

## DIFERENCIAIS
- Agente IA Piloto Automático (ninguém tem)
- Gateway próprio com split 95/5
- Prospecção integrada Google Maps
- Curso incluso nos planos pagos
- Sites com Claude Sonnet 4
- Exportar HTML a qualquer momento
- Hospedagem + SSL + CDN incluso

## FAQ RÁPIDO
- Tempo de criação: 10-30 segundos
- Domínio personalizado: Starter+ via CNAME
- Exportar site: sim, HTML completo
- Suporte: email (grátis), prioritário (Starter), 24h (Pro)
- Startzy ≠ Wix/WordPress: é para CRIAR sites PARA clientes e ganhar dinheiro`;

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
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
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
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
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
        response = "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes ou entre em contato pelo WhatsApp (11 99751-3044).";
      }
    }

    return NextResponse.json({ response });
  } catch (err) {
    console.error("Erro no chat IA:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
