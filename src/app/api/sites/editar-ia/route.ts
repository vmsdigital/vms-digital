import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function buildEditPrompt(htmlAtual: string, instrucao: string): string {
  return `Você é um especialista em desenvolvimento web e design. Sua tarefa é editar o HTML de um site existente seguindo a instrução do usuário.

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS o código HTML completo e atualizado
2. NÃO adicione markdown, explicações ou comentários fora do HTML
3. Mantenha toda a estrutura e conteúdo que NÃO foi solicitado alterar
4. Preserve as meta tags, scripts do Tailwind e Google Fonts
5. Mantenha o site responsivo e funcional
6. NÃO quebre o layout existente - faça apenas as alterações solicitadas
7. Se a instrução for ambígua, interprete da forma que resulte no melhor visual

HTML ATUAL DO SITE:
${htmlAtual}

INSTRUÇÃO DO USUÁRIO:
${instrucao}

Retorne o HTML completo atualizado:`;
}

async function editWithGemini(htmlAtual: string, instrucao: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada");

  const prompt = buildEditPrompt(htmlAtual, instrucao);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 16384, temperature: 0.5 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const result = await res.json();
  let html = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return cleanHtmlOutput(html);
}

async function editWithGroq(htmlAtual: string, instrucao: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY não configurada");

  const prompt = buildEditPrompt(htmlAtual, instrucao);

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

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const result = await res.json();
  let html = result.choices?.[0]?.message?.content || "";
  return cleanHtmlOutput(html);
}

async function editWithClaude(htmlAtual: string, instrucao: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY não configurada");

  const userMessage = buildEditPrompt(htmlAtual, instrucao);

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const result = await res.json();
  let html = result.content?.[0]?.text || "";
  return cleanHtmlOutput(html);
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
    const { html_atual, instrucao } = body;

    if (!html_atual || !instrucao) {
      return NextResponse.json(
        { error: "html_atual e instrucao são obrigatórios" },
        { status: 400 }
      );
    }

    let html = "";

    try {
      html = await editWithGemini(html_atual, instrucao);
    } catch {
      try {
        html = await editWithGroq(html_atual, instrucao);
      } catch {
        try {
          html = await editWithClaude(html_atual, instrucao);
        } catch {
          return NextResponse.json(
            { error: "Todas as IAs falharam. Tente novamente." },
            { status: 500 }
          );
        }
      }
    }

    if (!html || html.length < 100) {
      return NextResponse.json(
        { error: "A IA não conseguiu gerar um site válido. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ html });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
