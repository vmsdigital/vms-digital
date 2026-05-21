import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface SiteFormData {
  nome_empresa: string;
  descricao: string;
  objetivo: string;
  idioma: string;
  nicho: string;
  tem_logo: boolean;
  cor_primaria: string;
  cor_secundaria: string;
  tema: "claro" | "escuro";
  endereco: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
}

function buildPrompt(data: SiteFormData): string {
  const temaBg = data.tema === "escuro" ? "#0a0a0a" : "#ffffff";
  const temaText = data.tema === "escuro" ? "#f5f5f5" : "#1a1a1a";
  const temaCard = data.tema === "escuro" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const temaBorder = data.tema === "escuro" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const idiomaNome = data.idioma === "pt-BR" ? "português brasileiro" : data.idioma;

  return `Você é um web designer sênior e desenvolvedor front-end especializado em criar landing pages de alta conversão. Crie um site profissional e moderno para a empresa "${data.nome_empresa}".

DADOS DA EMPRESA:
- Nome: ${data.nome_empresa}
- Descrição: ${data.descricao}
- Objetivo: ${data.objetivo}
- Nicho: ${data.nicho}
- Idioma: ${idiomaNome}
- Endereço: ${data.endereco || "Não informado"}
- WhatsApp: ${data.whatsapp || "Não informado"}
- Instagram: ${data.instagram || "Não informado"}
- Facebook: ${data.facebook || "Não informado"}

CORES E TEMA:
- Cor primária: ${data.cor_primaria}
- Cor secundária: ${data.cor_secundaria}
- Tema: ${data.tema}
- Fundo: ${temaBg}
- Texto: ${temaText}
- Card: ${temaCard}
- Borda: ${temaBorder}

REGRAS DE CÓDIGO:
1. HTML completo e autônomo
2. Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Configure cores: <script>tailwind.config={theme:{extend:{colors:{primaria:'${data.cor_primaria}',secundaria:'${data.cor_secundaria}'}}}}</script>
4. Google Fonts: Inter (400,500,600,700,800)
5. Responsivo mobile-first
6. Animações suaves: fade-in ao scroll com IntersectionObserver
7. NÃO use imagens externas. Use SVGs inline ou divs com gradientes como placeholders visuais.
8. Texto em ${idiomaNome}
9. Meta tags SEO completas
10. Rodapé: "Criado por VMS Digital" (discreto)

REGRAS DE DESIGN — CRÍTICO:
- Use SEMÂNTICA HTML: <header>, <nav>, <main>, <section>, <article>, <footer>
- NÃO crie divs genéricas sem significado. Cada elemento deve ter propósito semântico.
- Espaçamento generoso: py-16 md:py-24 entre seções, gap-8 entre elementos
- Tipografia com hierarquia clara: títulos bold/large, corpo regular, captions small
- Use max-w-6xl mx-auto px-4 como container padrão
- Cards com rounded-2xl, sombras suaves, hover com scale-[1.02] e shadow-lg
- CTAs com bg-primaria text-white (ou text-black se primária for clara), rounded-xl, py-3 px-6
- NÃO use emojis nos títulos ou CTAs — texto limpo e profissional
- Gradientes sutis para elementos visuais, nunca chamativos demais
- Ícones SVG inline simples (setas, checkmarks, etc) — NÃO use bibliotecas externas de ícones

ESTRUTURA DO SITE (7 seções):

1. NAVEGAÇÃO
   - Nome da empresa à esquerda (font-bold text-xl)
   - Links centrais: Sobre · Serviços · Depoimentos · Contato
   - Botão CTA à direita
   - Fixed no topo com backdrop-blur e bg semi-transparente

2. HERO
   - Headline grande e direta (text-4xl md:text-6xl font-extrabold)
   - Subheadline curta (2-3 linhas, text-lg, opacity-70)
   - Dois botões: CTA primário + secundário outline
   - Micro-copy abaixo dos botões (text-xs opacity-50)
   - Layout: texto à esquerda, elemento visual à direita (gradiente abstrato ou forma geométrica SVG)

3. SERVIÇOS
   - Título da seção + subtítulo
   - Grid de 3 cards (md:grid-cols-3)
   - Cada card: ícone SVG + título + descrição de 2 linhas
   - Cards com bg do tema, border, rounded-2xl, p-6

4. SOBRE / DIFERENCIAIS
   - Layout 2 colunas (imagem/gradiente + texto)
   - 3-4 diferenciais com ícone + texto
   - Números de impacto (X+ clientes, Y anos, etc)

5. DEPOIMENTOS
   - 3 cards de depoimentos
   - Cada um: aspas + texto + nome + empresa
   - Visual limpo, sem fotos placeholder

6. FAQ
   - 5-6 perguntas relevantes
   - Accordion com <details>/<summary> (funciona sem JS)
   - Estilizado com border, rounded-xl

7. CTA FINAL + FOOTER
   - Seção com fundo gradiente sutil
   - Headline de ação + botão grande
   - Footer com nome, links, copyright
   - "Criado por VMS Digital"
   - Botão WhatsApp flutuante (fixed bottom-6 right-6)

${data.whatsapp ? `WHATSAPP: Use https://wa.me/55${data.whatsapp.replace(/\D/g, "")} em todos os CTAs de WhatsApp` : ""}

IMPORTANTE:
- O site deve parecer REAL, como se fosse feito por uma agência profissional
- NÃO pareça um template genérico ou artificial
- Copy deve ser específica para o nicho "${data.nicho}", não genérica
- Use linguagem natural e persuasiva, sem exageros
- Cada seção deve ter personalidade própria, não parece cópia uma da outra

Retorne APENAS o código HTML completo, sem markdown, sem explicação.`;
}

async function generateWithGemini(data: SiteFormData): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada");

  const prompt = buildPrompt(data);
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

async function generateWithGroq(data: SiteFormData): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY não configurada");

  const prompt = buildPrompt(data);

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

async function generateWithAnthropic(data: SiteFormData): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY não configurada");

  const prompt = buildPrompt(data);

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
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
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

function generateFallbackSite(data: SiteFormData): string {
  const temaBg = data.tema === "escuro" ? "#0a0a0a" : "#ffffff";
  const temaText = data.tema === "escuro" ? "#f5f5f5" : "#1a1a1a";
  const temaCard = data.tema === "escuro" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const temaBorder = data.tema === "escuro" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const servicos = generateServices(data.nicho, data.descricao);
  const whatsappLink = data.whatsapp
    ? `https://wa.me/55${data.whatsapp.replace(/\D/g, "")}`
    : "#";
  const instagramLink = data.instagram
    ? `https://instagram.com/${data.instagram.replace("@", "")}`
    : "#";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${data.nome_empresa} - Site Oficial</title>
<meta name="description" content="${data.descricao}">
<meta property="og:title" content="${data.nome_empresa}">
<meta property="og:description" content="${data.descricao}">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={theme:{extend:{colors:{primaria:'${data.cor_primaria}',secundaria:'${data.cor_secundaria}'}}}}</script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>*{font-family:'Inter',sans-serif}html{scroll-behavior:smooth}@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp .6s ease-out forwards;opacity:0}.delay-1{animation-delay:.1s}.delay-2{animation-delay:.2s}.delay-3{animation-delay:.3s}.delay-4{animation-delay:.4s}.delay-5{animation-delay:.5s}</style>
</head>
<body style="background:${temaBg};color:${temaText}">

<nav style="background:${data.tema === "escuro" ? "rgba(10,10,10,0.9)" : "rgba(255,255,255,0.9)"};backdrop-filter:blur(20px)" class="fixed top-0 w-full z-50 border-b" style="border-color:${temaBorder}">
<div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
<span class="text-xl font-bold text-primaria">${data.nome_empresa}</span>
<div class="hidden md:flex items-center gap-6 text-sm">
<a href="#sobre" class="hover:text-primaria transition">Sobre</a>
<a href="#servicos" class="hover:text-primaria transition">Serviços</a>
<a href="#depoimentos" class="hover:text-primaria transition">Depoimentos</a>
<a href="#contato" class="hover:text-primaria transition">Contato</a>
<a href="${whatsappLink}" target="_blank" class="bg-primaria text-black px-4 py-2 rounded-lg font-medium hover:brightness-110 transition">Fale Conosco</a>
</div>
</div>
</nav>

<section class="min-h-screen flex items-center pt-16">
<div class="max-w-6xl mx-auto px-4 py-20 text-center">
<div class="inline-block bg-primaria/10 text-primaria px-4 py-1.5 rounded-full text-sm font-medium mb-6 fade-up">${data.nicho === "provedor" ? "Internet de verdade pra quem não aceita menos" : "Qualidade que faz a diferença"}</div>
<h1 class="text-4xl md:text-6xl font-extrabold leading-tight fade-up" style="color:${data.cor_primaria}">
${generateHeadline(data)}
</h1>
<p class="mt-6 text-lg md:text-xl max-w-2xl mx-auto fade-up delay-1" style="color:${temaText};opacity:0.7">
${data.descricao}
</p>
<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center fade-up delay-2">
<a href="${whatsappLink}" target="_blank" class="bg-primaria text-black px-8 py-4 rounded-xl font-semibold text-lg hover:brightness-110 transition shadow-lg">
Solicitar Orçamento
</a>
<a href="#servicos" class="border px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primaria/10 transition" style="border-color:${temaBorder}">
Nossos Serviços
</a>
</div>
<p class="mt-4 text-xs fade-up delay-3" style="opacity:0.4">Sem compromisso · Resposta em até 2 horas</p>
</div>
</section>

<section class="py-20" style="background:${temaCard}">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-4 fade-up">Você se identifica?</h2>
<p class="text-center mb-12 fade-up delay-1" style="opacity:0.5">Problemas que muitos dos nossos clientes enfrentavam antes de nos conhecer</p>
<div class="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
${generatePainPoints(data).map((p, i) => `
<div class="flex items-start gap-3 p-4 rounded-xl fade-up delay-${i + 1}" style="background:${temaBg};border:1px solid ${temaBorder}">
<span class="text-primaria text-lg mt-0.5">→</span>
<p class="text-sm" style="opacity:0.8">${p}</p>
</div>`).join("")}
</div>
</div>
</section>

<section id="sobre" class="py-20">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-12 fade-up">A Solução</h2>
<div class="max-w-3xl mx-auto text-center fade-up delay-1">
<p class="text-lg leading-relaxed mb-8" style="opacity:0.8">
${generateAboutText(data)}
</p>
<div class="grid md:grid-cols-3 gap-6">
${[{ icon: "⚡", title: "Rapidez", desc: "Resultados que você vê desde o primeiro dia" }, { icon: "🎯", title: "Precisão", desc: "Soluções sob medida para sua necessidade" }, { icon: "🤝", title: "Parceria", desc: "Acompanhamento contínuo e suporte real" }].map((p, i) => `
<div class="p-5 rounded-2xl fade-up delay-${i + 1}" style="background:${temaCard};border:1px solid ${temaBorder}">
<div class="text-2xl mb-3">${p.icon}</div>
<h3 class="font-semibold mb-1">${p.title}</h3>
<p class="text-sm" style="opacity:0.6">${p.desc}</p>
</div>`).join("")}
</div>
</div>
</div>
</section>

<section id="servicos" class="py-20" style="background:${temaCard}">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-4 fade-up">O que você vai ter</h2>
<p class="text-center mb-12 fade-up delay-1" style="opacity:0.5">Serviços pensados pra entregar resultado real</p>
<div class="grid md:grid-cols-3 gap-6">
${servicos.map((s, i) => `
<div class="p-6 rounded-2xl hover:scale-[1.02] transition-transform fade-up delay-${i + 1}" style="background:${temaBg};border:1px solid ${temaBorder}">
<div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style="background:${data.cor_primaria}20;color:${data.cor_primaria}">${s.icon}</div>
<h3 class="text-lg font-semibold mb-2">${s.title}</h3>
<p class="text-sm mb-3" style="opacity:0.7">${s.desc}</p>
<p class="text-xs font-medium text-primaria">${s.benefit}</p>
</div>`).join("")}
</div>
</div>
</section>

<section class="py-20">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-4 fade-up">Por que ${data.nome_empresa}?</h2>
<p class="text-center mb-12 fade-up delay-1" style="opacity:0.5">Diferenciais que fazem nossos clientes voltarem</p>
<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
${[{ icon: "🏆", title: "Experiência", desc: "Anos no mercado" }, { icon: "⭐", title: "Qualidade", desc: "Padrão premium" }, { icon: "📞", title: "Suporte", desc: "Atendimento real" }, { icon: "💰", title: "Justo", desc: "Preço honesto" }].map((d, i) => `
<div class="p-4 rounded-xl text-center fade-up delay-${i + 1}" style="background:${temaCard};border:1px solid ${temaBorder}">
<div class="text-2xl mb-2">${d.icon}</div>
<h3 class="font-semibold text-sm">${d.title}</h3>
<p class="text-xs" style="opacity:0.5">${d.desc}</p>
</div>`).join("")}
</div>
<p class="text-center mt-8 text-sm fade-up delay-5" style="opacity:0.6">Tudo isso pra você <strong class="text-primaria">ter resultado de verdade</strong>.</p>
</div>
</section>

<section id="depoimentos" class="py-20" style="background:${temaCard}">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-4 fade-up">O que nossos clientes dizem</h2>
<div class="flex justify-center gap-8 mb-12 fade-up delay-1">
<div class="text-center"><span class="text-3xl font-bold text-primaria">500+</span><br><span class="text-xs" style="opacity:0.5">Clientes</span></div>
<div class="text-center"><span class="text-3xl font-bold text-primaria">1000+</span><br><span class="text-xs" style="opacity:0.5">Projetos</span></div>
<div class="text-center"><span class="text-3xl font-bold text-primaria">5 anos</span><br><span class="text-xs" style="opacity:0.5">De experiência</span></div>
</div>
<div class="grid md:grid-cols-3 gap-6">
${[{ name: "Maria S.", result: "Resultado incrível, superou expectativas" }, { name: "João P.", result: "Atendimento nota 10, recomendo demais" }, { name: "Ana C.", result: "Melhor investimento que fiz pro meu negócio" }].map((d, i) => `
<div class="p-6 rounded-2xl fade-up delay-${i + 1}" style="background:${temaBg};border:1px solid ${temaBorder}">
<div class="flex items-center gap-3 mb-3">
<div class="w-10 h-10 rounded-full" style="background:linear-gradient(135deg,${data.cor_primaria},${data.cor_secundaria})"></div>
<div><p class="font-semibold text-sm">${d.name}</p><p class="text-xs" style="opacity:0.4">Cliente verificado</p></div>
</div>
<p class="text-sm" style="opacity:0.7">"${d.result}"</p>
<div class="mt-2 text-primaria text-xs">★★★★★</div>
</div>`).join("")}
</div>
</div>
</section>

<section class="py-20">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-12 fade-up">Perguntas Frequentes</h2>
<div class="max-w-2xl mx-auto space-y-3">
${[
  { q: "Como funciona o atendimento?", a: "Entre em contato pelo WhatsApp e receba uma proposta personalizada em até 24h." },
  { q: "Serve pro meu tipo de negócio?", a: "Atendemos diversos segmentos. Fale conosco e avaliamos sem compromisso." },
  { q: "Quanto tempo leva?", a: "Depende do projeto, mas trabalhamos com agilidade e prazos claros." },
  { q: "E se eu não gostar?", a: "Trabalhamos com revisões até sua total satisfação." },
  { q: "Quais formas de pagamento?", a: "Aceitamos PIX, cartão de crédito e boleto." },
  { q: "Tem suporte após a entrega?", a: "Sim! Oferecemos suporte contínuo para manter tudo funcionando perfeitamente." }
].map((faq, i) => `
<details class="group rounded-xl overflow-hidden fade-up delay-${(i % 3) + 1}" style="background:${temaCard};border:1px solid ${temaBorder}">
<summary class="p-4 cursor-pointer font-medium text-sm flex items-center justify-between hover:bg-primaria/5 transition">${faq.q}<span class="text-primaria group-open:rotate-45 transition-transform text-lg">+</span></summary>
<div class="px-4 pb-4 text-sm" style="opacity:0.7">${faq.a}</div>
</details>`).join("")}
</div>
</div>
</section>

${data.endereco ? `
<section class="py-20" style="background:${temaCard}">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-12 fade-up">Localização</h2>
<div class="rounded-2xl overflow-hidden fade-up delay-1" style="border:1px solid ${temaBorder}">
<div class="h-64 flex items-center justify-center" style="background:${temaBg}">
<p style="opacity:0.5">📍 ${data.endereco}</p>
</div>
</div>
</div>
</section>` : ""}

<section id="contato" class="py-20">
<div class="max-w-6xl mx-auto px-4 text-center">
<h2 class="text-3xl font-bold mb-4 fade-up">Pronto para transformar seu negócio?</h2>
<p class="mb-12 fade-up delay-1" style="opacity:0.5">Dê o primeiro passo agora mesmo</p>
<div class="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
${data.whatsapp ? `
<a href="${whatsappLink}" target="_blank" class="p-6 rounded-2xl hover:scale-[1.02] transition-transform fade-up delay-1" style="background:${temaCard};border:1px solid ${temaBorder}">
<div class="text-3xl mb-3">📱</div>
<h3 class="font-semibold mb-1">WhatsApp</h3>
<p class="text-sm" style="opacity:0.7">${data.whatsapp}</p>
</a>` : ""}
${data.instagram ? `
<a href="${instagramLink}" target="_blank" class="p-6 rounded-2xl hover:scale-[1.02] transition-transform fade-up delay-2" style="background:${temaCard};border:1px solid ${temaBorder}">
<div class="text-3xl mb-3">📸</div>
<h3 class="font-semibold mb-1">Instagram</h3>
<p class="text-sm" style="opacity:0.7">${data.instagram}</p>
</a>` : ""}
${data.endereco ? `
<div class="p-6 rounded-2xl fade-up delay-3" style="background:${temaCard};border:1px solid ${temaBorder}">
<div class="text-3xl mb-3">📍</div>
<h3 class="font-semibold mb-1">Endereço</h3>
<p class="text-sm" style="opacity:0.7">${data.endereco}</p>
</div>` : ""}
</div>
<div class="mt-12 fade-up delay-4">
<a href="${whatsappLink}" target="_blank" class="inline-block bg-primaria text-black px-10 py-4 rounded-xl font-semibold text-lg hover:brightness-110 transition shadow-lg">
Falar pelo WhatsApp
</a>
<p class="mt-3 text-xs" style="opacity:0.4">Garantia de satisfação · Suporte incluso</p>
</div>
</div>
</section>

<footer class="py-8 border-t" style="border-color:${temaBorder}">
<div class="max-w-6xl mx-auto px-4 text-center text-sm" style="opacity:0.5">
<p>&copy; ${new Date().getFullYear()} ${data.nome_empresa}. Todos os direitos reservados.</p>
<p class="mt-1">Criado por VMS Digital</p>
</div>
</footer>

${data.whatsapp ? `
<a href="${whatsappLink}" target="_blank" class="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-50" style="font-size:24px">
💬
</a>` : ""}

<script>
const observer=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.animationPlayState='running';observer.unobserve(e.target)}})},{threshold:0.1});
document.querySelectorAll('.fade-up').forEach(el=>{el.style.animationPlayState='paused';observer.observe(el)});
</script>
</body>
</html>`;
}

function generateHeadline(data: SiteFormData): string {
  const headlines: Record<string, string> = {
    provedor: `Internet Rápida e Confiável para Sua Casa e Empresa`,
    advocacia: `Defenda Seus Direitos com Quem Entende`,
    academia: `Transforme Seu Corpo e Sua Mente`,
    clinica: `Cuidado com a Saúde que Você Merece`,
    dentista: `Seu Sorriso Perfeito Começa Aqui`,
    restaurante: `Sabores que Encantam, Momentos que Ficam`,
    salao: `Sua Beleza em Boas Mãos`,
    imobiliaria: `Encontre o Imóvel dos Seus Sonhos`,
    loja: `Estilo e Qualidade em Cada Detalhe`,
    petshop: `Tudo para o Bem-Estar do Seu Pet`,
    autopecas: `Peças e Serviços com Qualidade Garantida`,
    farmacia: `Saúde e Bem-Estar ao Seu Alcance`,
    supermercado: `Tudo Que Você Precisa, em Um Só Lugar`,
    hotel: `Conforto e Hospitalidade de Excelência`,
    escola: `Educação que Transforma Vidas`,
  };
  return headlines[data.nicho] || `${data.nome_empresa} — Qualidade e Confiança`;
}

function generatePainPoints(data: SiteFormData): string[] {
  const painPoints: Record<string, string[]> = {
    provedor: [
      "Internet que cai toda hora e deixa você na mão",
      "Velocidade que nunca chega no prometido",
      "Suporte que demora dias pra responder",
      "Pagar caro por um serviço que não funciona",
      "Ficar preso em contrato sem saída",
    ],
    advocacia: [
      "Direitos sendo violados e ninguém te ajuda",
      "Processos que parecem não ter fim",
      "Advogado que não retorna suas ligações",
      "Insegurança jurídica no seu negócio",
      "Não saber por onde começar a resolver",
    ],
    clinica: [
      "Dores que persistem e ninguém resolve",
      "Fila de espera interminável nos consultórios",
      "Médicos que não dedicam tempo pro paciente",
      "Exames demorados e resultados confusos",
      "Gastar com tratamentos que não funcionam",
    ],
  };

  return (
    painPoints[data.nicho] || [
      "Procurar qualidade e não encontrar",
      "Atendimento impessoal e sem dedicação",
      "Pagar caro e não ver resultado",
      "Não ter suporte quando precisa",
      "Frustração com serviços que não cumprem o prometido",
    ]
  );
}

function generateAboutText(data: SiteFormData): string {
  return `A ${data.nome_empresa} é referência no mercado, oferecendo soluções de qualidade com atendimento personalizado. Com anos de experiência, nossa missão é proporcionar a melhor experiência para nossos clientes, combinando profissionalismo, inovação e dedicação em cada detalhe. Estamos comprometidos em superar suas expectativas e construir relações duradouras baseadas em confiança e resultados.`;
}

function generateServices(nicho: string, descricao: string): Array<{ icon: string; title: string; desc: string; benefit: string }> {
  const services: Record<string, Array<{ icon: string; title: string; desc: string; benefit: string }>> = {
    provedor: [
      { icon: "🌐", title: "Internet Fibra", desc: "Planos de internet de alta velocidade com fibra óptica para residências e empresas.", benefit: "Navegue sem travamentos" },
      { icon: "🔧", title: "Suporte Técnico", desc: "Equipe técnica especializada disponível para atendimento rápido e eficiente.", benefit: "Resolva problemas em minutos" },
      { icon: "📡", title: "Instalação Gratuita", desc: "Instalação sem custo adicional com agendamento flexível.", benefit: "Comece a usar sem pagar mais" },
    ],
    advocacia: [
      { icon: "⚖️", title: "Direito Civil", desc: "Atuação em contratos, responsabilidade civil e direito do consumidor.", benefit: "Seus direitos protegidos" },
      { icon: "🏢", title: "Direito Empresarial", desc: "Assessoria jurídica completa para empresas e empreendedores.", benefit: "Segurança pro seu negócio" },
      { icon: "👨‍👩‍👧", title: "Direito de Família", desc: "Acompanhamento em processos de família com sensibilidade e competência.", benefit: "Acolhimento em cada etapa" },
    ],
    clinica: [
      { icon: "🩺", title: "Consultas Médicas", desc: "Atendimento médico humanizado com profissionais qualificados.", benefit: "Saúde em primeiro lugar" },
      { icon: "🔬", title: "Exames Laboratoriais", desc: "Exames completos com resultados rápidos e confiáveis.", benefit: "Diagnóstico preciso e rápido" },
      { icon: "💊", title: "Tratamentos", desc: "Planos de tratamento personalizados para cada paciente.", benefit: "Tratamento que funciona" },
    ],
    restaurante: [
      { icon: "🍽️", title: "Cardápio Variado", desc: "Pratos preparados com ingredientes frescos e selecionados.", benefit: "Sabor em cada mordida" },
      { icon: "🚗", title: "Delivery Rápido", desc: "Entrega rápida e segura na sua casa ou escritório.", benefit: "Comida quente na sua porta" },
      { icon: "🎉", title: "Eventos", desc: "Espaço para eventos corporativos e comemorações especiais.", benefit: "Celebrações inesquecíveis" },
    ],
    salao: [
      { icon: "✂️", title: "Corte e Estilo", desc: "Cortes modernos e personalizados para todos os estilos.", benefit: "Visual que impressiona" },
      { icon: "🎨", title: "Coloração", desc: "Técnicas de coloração com produtos de alta qualidade.", benefit: "Cor que dura e brilha" },
      { icon: "💅", title: "Manicure e Pedicure", desc: "Cuidado completo para unhas com esmaltação premium.", benefit: "Mãos e pés impecáveis" },
    ],
  };

  return (
    services[nicho] || [
      { icon: "⭐", title: "Qualidade Premium", desc: "Produtos e serviços com os mais altos padrões de qualidade.", benefit: "Resultado que você vê" },
      { icon: "🤝", title: "Atendimento Personalizado", desc: "Cada cliente recebe atenção e cuidado individual.", benefit: "Você é prioridade" },
      { icon: "🏆", title: "Experiência Comprovada", desc: "Anos de experiência e centenas de clientes satisfeitos.", benefit: "Confiança de quem entrega" },
    ]
  );
}

export async function POST(request: NextRequest) {
  try {
    const data: SiteFormData = await request.json();

    if (!data.nome_empresa || !data.descricao) {
      return NextResponse.json(
        { error: "nome_empresa e descricao são obrigatórios" },
        { status: 400 }
      );
    }

    let html: string | null = null;
    let geradoCom = "fallback";

    const providers: Array<{ name: string; key: string | undefined; fn: () => Promise<string> }> = [
      { name: "gemini", key: GEMINI_API_KEY, fn: () => generateWithGemini(data) },
      { name: "groq", key: GROQ_API_KEY, fn: () => generateWithGroq(data) },
      { name: "anthropic", key: ANTHROPIC_API_KEY, fn: () => generateWithAnthropic(data) },
    ];

    for (const provider of providers) {
      if (provider.key) {
        try {
          html = await provider.fn();
          geradoCom = provider.name;
          break;
        } catch (err) {
          console.error(`Erro com ${provider.name}, tentando próximo:`, err);
          continue;
        }
      }
    }

    if (!html) {
      html = generateFallbackSite(data);
      geradoCom = "fallback";
    }

    return NextResponse.json({
      html,
      gerado_com_ia: geradoCom !== "fallback",
      provedor_ia: geradoCom,
      nome_empresa: data.nome_empresa,
    });
  } catch (err) {
    console.error("Erro ao gerar site:", err);
    return NextResponse.json(
      { error: "Erro interno ao gerar site" },
      { status: 500 }
    );
  }
}
