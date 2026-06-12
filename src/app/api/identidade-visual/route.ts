import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface BrandIdentity {
  tem_identidade: boolean;
  cores: {
    primaria: string;
    secundaria: string;
    acento: string;
    fundo: string;
    texto: string;
  };
  fontes: {
    titulo: string;
    corpo: string;
  };
  estilo: "moderno" | "classico" | "minimalista" | "ousado" | "elegante";
  personalidade: string;
  logo_descricao: string;
}

async function detectFromInstagram(username: string): Promise<Partial<BrandIdentity> | null> {
  try {
    const cleanUsername = username.replace("@", "").replace("https://instagram.com/", "").replace("https://www.instagram.com/", "").split("/")[0].split("?")[0];
    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

    const res = await fetch(profileUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) return null;

    const html = await res.text();

    const colorSet = new Set<string>();
    const colorRegex = /#[0-9a-fA-F]{3,8}/g;
    let match;
    while ((match = colorRegex.exec(html)) !== null) {
      const color = match[0].toUpperCase();
      if (color.length === 4) {
        colorSet.add(`#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`);
      } else if (color.length === 7) {
        colorSet.add(color);
      }
    }

    const sharedDataMatch = html.match(/"theme_color"\s*:\s*"([^"]+)"/);
    if (sharedDataMatch) {
      colorSet.add(sharedDataMatch[1].toUpperCase());
    }

    const ogImageMatch = html.match(/og:image["\s]+content=["']([^"']+)/);
    const profileImageUrl = ogImageMatch ? ogImageMatch[1] : null;

    const uniqueColors = Array.from(colorSet).filter((c) => {
      if (c.length !== 7) return false;
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 30 && brightness < 225;
    });

    const sortedColors = uniqueColors.sort((a, b) => {
      const getSat = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const bl = parseInt(hex.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, bl);
        const min = Math.min(r, g, bl);
        const d = max - min;
        return d === 0 ? 0 : d / (1 - Math.abs(max + min - 1));
      };
      return getSat(b) - getSat(a);
    });

    if (sortedColors.length === 0) return null;

    return {
      tem_identidade: true,
      cores: {
        primaria: sortedColors[0] || "#667eea",
        secundaria: sortedColors[1] || sortedColors[0] || "#764ba2",
        acento: sortedColors[2] || sortedColors[0] || "#f093fb",
        fundo: "#0a0a0a",
        texto: "#ffffff",
      },
      fontes: {
        titulo: "Sora",
        corpo: "Inter",
      },
    };
  } catch {
    return null;
  }
}

async function detectFromWebsite(url: string): Promise<Partial<BrandIdentity> | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) return null;

    const html = await res.text();

    const colorSet = new Set<string>();
    const colorRegex = /#[0-9a-fA-F]{3,8}/g;
    let match;
    while ((match = colorRegex.exec(html)) !== null) {
      const color = match[0].toUpperCase();
      if (color.length === 4) {
        colorSet.add(`#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`);
      } else {
        colorSet.add(color);
      }
    }

    const rgbRegex = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;
    while ((match = rgbRegex.exec(html)) !== null) {
      const r = parseInt(match[1]).toString(16).padStart(2, "0");
      const g = parseInt(match[2]).toString(16).padStart(2, "0");
      const b = parseInt(match[3]).toString(16).padStart(2, "0");
      colorSet.add(`#${r}${g}${b}`.toUpperCase());
    }

    const fontSet: string[] = [];
    const fontRegex = /font-family\s*:\s*['"]?([^'";:\n}]+)/g;
    while ((match = fontRegex.exec(html)) !== null) {
      const fonts = match[1].split(",").map((f) => f.trim().replace(/['"]/g, ""));
      fontSet.push(...fonts);
    }

    const googleFontMatch = html.match(/fonts\.googleapis\.com\/css2\?family=([^&"']+)/);
    if (googleFontMatch) {
      const fonts = googleFontMatch[1].split("|").map((f) => f.replace(/\+/g, " "));
      fontSet.push(...fonts);
    }

    const uniqueColors = Array.from(colorSet).filter((c) => {
      if (c.length !== 7) return false;
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 30 && brightness < 225;
    });

    const uniqueFonts = [...new Set(fontSet)].filter(
      (f) => !["sans-serif", "serif", "monospace", "inherit", "initial", "-apple-system", "system-ui"].includes(f.toLowerCase())
    );

    if (uniqueColors.length === 0 && uniqueFonts.length === 0) return null;

    const sortedColors = uniqueColors.sort((a, b) => {
      const getSat = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const bl = parseInt(hex.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, bl);
        const min = Math.min(r, g, bl);
        const d = max - min;
        return d === 0 ? 0 : d / (1 - Math.abs(max + min - 1));
      };
      return getSat(b) - getSat(a);
    });

    return {
      tem_identidade: true,
      cores: {
        primaria: sortedColors[0] || "#667eea",
        secundaria: sortedColors[1] || "#764ba2",
        acento: sortedColors[2] || sortedColors[0] || "#f093fb",
        fundo: "#0a0a0a",
        texto: "#ffffff",
      },
      fontes: {
        titulo: uniqueFonts[0] || "Inter",
        corpo: uniqueFonts[1] || uniqueFonts[0] || "Inter",
      },
    };
  } catch {
    return null;
  }
}

async function fetchCssColors(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const cssUrls: string[] = [];
    const linkRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      try {
        cssUrls.push(new URL(match[1], url).href);
      } catch { /* skip invalid */ }
    }

    const colorSet = new Set<string>();
    for (const cssUrl of cssUrls.slice(0, 5)) {
      try {
        const cssRes = await fetch(cssUrl, {
          signal: AbortSignal.timeout(8000),
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        if (!cssRes.ok) continue;
        const cssText = await cssRes.text();
        const colorRegex = /#[0-9a-fA-F]{3,8}/g;
        let cMatch;
        while ((cMatch = colorRegex.exec(cssText)) !== null) {
          const color = cMatch[0].toUpperCase();
          if (color.length === 4) {
            colorSet.add(`#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`);
          } else if (color.length === 7) {
            colorSet.add(color);
          }
        }
      } catch { /* skip failed CSS */ }
    }
    return Array.from(colorSet);
  } catch {
    return [];
  }
}

async function detectFromScreenshot(
  url: string,
  nomeEmpresa: string
): Promise<Partial<BrandIdentity> | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
    const metaRes = await fetch(screenshotUrl, { signal: AbortSignal.timeout(15000) });
    if (!metaRes.ok) return null;

    const metaData = await metaRes.json();
    const imageUrl = metaData?.data?.screenshot?.url;
    if (!imageUrl) return null;

    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!imgRes.ok) return null;
    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(imgBuffer).toString("base64");
    const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `Analise esta captura de tela do site/Instagram da empresa "${nomeEmpresa}". Extraia as cores da identidade visual (cores principais da marca, não cores de fundo genéricas). Retorne APENAS JSON: {"primaria":"#hex","secundaria":"#hex","acento":"#hex","fundo":"#hex","texto":"#hex"}` },
            { inlineData: { mimeType, data: base64 } },
          ],
        }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.3 },
      }),
    });

    if (!res.ok) return null;
    const result = await res.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const colors = JSON.parse(jsonMatch[0]);
    return {
      tem_identidade: true,
      cores: {
        primaria: colors.primaria || "#667eea",
        secundaria: colors.secundaria || "#764ba2",
        acento: colors.acento || "#f093fb",
        fundo: colors.fundo || "#0a0a0a",
        texto: colors.texto || "#ffffff",
      },
    };
  } catch {
    return null;
  }
}

async function generateWithGemini(
  nomeEmpresa: string,
  nicho: string,
  descricao: string,
  websiteUrl?: string,
  instagramUrl?: string
): Promise<BrandIdentity> {
  if (!GEMINI_API_KEY) {
    return generateWithClaude(nomeEmpresa, nicho, descricao, websiteUrl, instagramUrl);
  }

  const contextParts: string[] = [];
  if (websiteUrl) contextParts.push(`Site: ${websiteUrl}`);
  if (instagramUrl) contextParts.push(`Instagram: ${instagramUrl}`);

  const prompt = `Crie identidade visual para "${nomeEmpresa}" (${nicho}). ${descricao ? `Desc: ${descricao}.` : ""} ${contextParts.length > 0 ? contextParts.join(", ") + "." : ""}

Regras: cores modernas (não genéricas), combinantes. Fonte título: Sora/Space Grotesk/Outfit. Fonte corpo: Inter/DM Sans. Estilo reflete nicho.

Retorne APENAS JSON:
{"tem_identidade":true,"cores":{"primaria":"#hex","secundaria":"#hex","acento":"#hex","fundo":"#hex","texto":"#hex"},"fontes":{"titulo":"Fonte","corpo":"Fonte"},"estilo":"moderno|classico|minimalista|ousado|elegante","personalidade":"frase curta","logo_descricao":"descrição logo SVG"}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    });

    if (res.ok) {
      const result = await res.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (e) {
    console.error("Erro ao gerar identidade com Gemini:", e);
  }

  return generateWithClaude(nomeEmpresa, nicho, descricao, websiteUrl, instagramUrl);
}

async function generateWithClaude(
  nomeEmpresa: string,
  nicho: string,
  descricao: string,
  websiteUrl?: string,
  instagramUrl?: string
): Promise<BrandIdentity> {
  if (!ANTHROPIC_API_KEY) {
    return generateFallback(nomeEmpresa, nicho);
  }

  const contextParts: string[] = [];
  if (websiteUrl) contextParts.push(`Site atual: ${websiteUrl}`);
  if (instagramUrl) contextParts.push(`Instagram: ${instagramUrl}`);

  const prompt = `Crie identidade visual para "${nomeEmpresa}" (${nicho}). ${descricao ? `Desc: ${descricao}.` : ""} ${contextParts.length > 0 ? contextParts.join(", ") + "." : ""}

Regras: cores modernas (não genéricas), combinantes. Fonte título: Sora/Space Grotesk/Outfit. Fonte corpo: Inter/DM Sans. Estilo reflete nicho.

Retorne APENAS JSON:
{"tem_identidade":true,"cores":{"primaria":"#hex","secundaria":"#hex","acento":"#hex","fundo":"#hex","texto":"#hex"},"fontes":{"titulo":"Fonte","corpo":"Fonte"},"estilo":"moderno|classico|minimalista|ousado|elegante","personalidade":"frase curta","logo_descricao":"descrição logo SVG"}`;

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (res.ok) {
      const result = await res.json();
      const text = result.content?.[0]?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (e) {
    console.error("Erro ao gerar identidade com Claude:", e);
  }

  return generateFallback(nomeEmpresa, nicho);
}

function generateFallback(nomeEmpresa: string, nicho: string): BrandIdentity {
  const palettes: Record<string, BrandIdentity> = {
    provedor: {
      tem_identidade: true,
      cores: { primaria: "#00D4FF", secundaria: "#0057B7", acento: "#00FFC6", fundo: "#0A0E1A", texto: "#E8F0FE" },
      fontes: { titulo: "Space Grotesk", corpo: "Inter" },
      estilo: "moderno",
      personalidade: "Conexão rápida e confiável que transforma vidas",
      logo_descricao: "Onda estilizada em gradiente azul-ciano representando fluxo de dados",
    },
    advocacia: {
      tem_identidade: true,
      cores: { primaria: "#C9A84C", secundaria: "#1A1A2E", acento: "#E8D5A3", fundo: "#0F0F1A", texto: "#F5F0E8" },
      fontes: { titulo: "Playfair Display", corpo: "Inter" },
      estilo: "elegante",
      personalidade: "Autoridade e confiança que protege seus direitos",
      logo_descricao: "Balança da justiça estilizada em dourado com linhas minimalistas",
    },
    clinica: {
      tem_identidade: true,
      cores: { primaria: "#4ECDC4", secundaria: "#2C3E50", acento: "#A8E6CF", fundo: "#F8FFFE", texto: "#1A2B3C" },
      fontes: { titulo: "Outfit", corpo: "DM Sans" },
      estilo: "minimalista",
      personalidade: "Cuidado humanizado que transforma saúde em bem-estar",
      logo_descricao: "Cruz médica suave com folha integrada representando saúde natural",
    },
    restaurante: {
      tem_identidade: true,
      cores: { primaria: "#E74C3C", secundaria: "#2C1810", acento: "#F39C12", fundo: "#1A0F0A", texto: "#FFF5EB" },
      fontes: { titulo: "Playfair Display", corpo: "Inter" },
      estilo: "classico",
      personalidade: "Sabores autênticos que criam memórias inesquecíveis",
      logo_descricao: "Garfo e faca entrelaçados formando um coração em vermelho",
    },
    salao: {
      tem_identidade: true,
      cores: { primaria: "#E91E9C", secundaria: "#1A0A2E", acento: "#FF6BB5", fundo: "#12061F", texto: "#F8E8FF" },
      fontes: { titulo: "Syne", corpo: "Plus Jakarta Sans" },
      estilo: "ousado",
      personalidade: "Beleza que expressa quem você realmente é",
      logo_descricao: "Tesoura estilizada com brilho formando laço rosa",
    },
    academia: {
      tem_identidade: true,
      cores: { primaria: "#FF6B35", secundaria: "#1B1B2F", acento: "#FFD93D", fundo: "#0D0D1A", texto: "#F0F0F0" },
      fontes: { titulo: "Clash Display", corpo: "Inter" },
      estilo: "ousado",
      personalidade: "Supere seus limites, transforme seu corpo",
      logo_descricao: "Haltere estilizado em laranja com raio de energia",
    },
    imobiliaria: {
      tem_identidade: true,
      cores: { primaria: "#2ECC71", secundaria: "#1A3C34", acento: "#A8E6CF", fundo: "#0A1A14", texto: "#E8FFF0" },
      fontes: { titulo: "Sora", corpo: "Inter" },
      estilo: "elegante",
      personalidade: "Encontre o lar dos seus sonhos com quem entende",
      logo_descricao: "Casa estilizada com chave integrada em verde esmeralda",
    },
    petshop: {
      tem_identidade: true,
      cores: { primaria: "#FF6B8A", secundaria: "#2D1B36", acento: "#FFB3C6", fundo: "#1A0F20", texto: "#FFF0F5" },
      fontes: { titulo: "Outfit", corpo: "DM Sans" },
      estilo: "moderno",
      personalidade: "Amor e cuidado para quem merece o melhor",
      logo_descricao: "Pata de animal estilizada com coração em rosa",
    },
    contabilidade: {
      tem_identidade: true,
      cores: { primaria: "#3498DB", secundaria: "#1A252F", acento: "#85C1E9", fundo: "#0D1117", texto: "#E8F4FD" },
      fontes: { titulo: "Space Grotesk", corpo: "Inter" },
      estilo: "moderno",
      personalidade: "Precisão e transparência para suas finanças",
      logo_descricao: "Gráfico de crescimento estilizado em azul com moeda integrada",
    },
  };

  return (
    palettes[nicho] || {
      tem_identidade: true,
      cores: { primaria: "#667eea", secundaria: "#764ba2", acento: "#f093fb", fundo: "#0a0a0a", texto: "#f5f5f5" },
      fontes: { titulo: "Sora", corpo: "Inter" },
      estilo: "moderno",
      personalidade: "Excelência e inovação que fazem a diferença",
      logo_descricao: "Forma geométrica abstrata em gradiente representando inovação",
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome_empresa, nicho, descricao, website_url, instagram_url, modo } = body;

    if (!nome_empresa) {
      return NextResponse.json({ error: "nome_empresa é obrigatório" }, { status: 400 });
    }

    if (modo === "detectar") {
      let detected: Partial<BrandIdentity> | null = null;
      let fonteDeteccao = "nenhuma";

      if (website_url) {
        detected = await detectFromWebsite(website_url);
        if (detected) fonteDeteccao = "website";

        if (!detected || !detected.cores) {
          const cssColors = await fetchCssColors(website_url);
          if (cssColors.length > 0) {
            const filtered = cssColors.filter((c) => {
              if (c.length !== 7) return false;
              const r = parseInt(c.slice(1, 3), 16);
              const g = parseInt(c.slice(3, 5), 16);
              const b = parseInt(c.slice(5, 7), 16);
              const brightness = (r * 299 + g * 587 + b * 114) / 1000;
              return brightness > 30 && brightness < 225;
            });
            if (filtered.length >= 2) {
              detected = {
                tem_identidade: true,
                cores: {
                  primaria: filtered[0] || "#667eea",
                  secundaria: filtered[1] || "#764ba2",
                  acento: filtered[2] || filtered[0] || "#f093fb",
                  fundo: "#0a0a0a",
                  texto: "#ffffff",
                },
              };
              fonteDeteccao = "website_css";
            }
          }
        }

        if (!detected || !detected.cores) {
          detected = await detectFromScreenshot(website_url, nome_empresa);
          if (detected) fonteDeteccao = "screenshot";
        }
      }

      if (!detected && instagram_url) {
        detected = await detectFromInstagram(instagram_url);
        if (detected) fonteDeteccao = "instagram";

        if (!detected || !detected.cores) {
          detected = await detectFromScreenshot(
            instagram_url.startsWith("http") ? instagram_url : `https://www.instagram.com/${instagram_url.replace("@", "")}/`,
            nome_empresa
          );
          if (detected) fonteDeteccao = "screenshot_instagram";
        }
      }

      if (detected && detected.cores) {
        return NextResponse.json({
          tem_identidade: true,
          modo: "detectado",
          fonte_deteccao: fonteDeteccao,
          ...detected,
          cores: {
            ...detected.cores,
            primaria: detected.cores.primaria,
            secundaria: detected.cores.secundaria,
          },
        });
      }
    }

    const brand = await generateWithGemini(nome_empresa, nicho || "outro", descricao || "", website_url, instagram_url);

    return NextResponse.json({
      ...brand,
      modo: modo === "detectar" ? "gerado_fallback" : "gerado",
    });
  } catch (err) {
    console.error("Erro na API de identidade visual:", err);
    return NextResponse.json({ error: "Erro ao processar identidade visual" }, { status: 500 });
  }
}
