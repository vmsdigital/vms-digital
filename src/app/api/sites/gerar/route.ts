import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

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

  return `Crie uma landing page profissional completa em HTML para a empresa "${data.nome_empresa}".

INFORMAÇÕES DA EMPRESA:
- Nome: ${data.nome_empresa}
- Descrição: ${data.descricao}
- Objetivo do site: ${data.objetivo}
- Nicho: ${data.nicho}
- Idioma: ${data.idioma}
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

REGRAS OBRIGATÓRIAS:
1. HTML completo e autônomo (funciona sem dependências externas)
2. Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>)
3. Configure as cores no Tailwind config:
   <script>tailwind.config={theme:{extend:{colors:{primaria:'${data.cor_primaria}',secundaria:'${data.cor_secundaria}'}}}}</script>
4. Use Google Fonts (Inter ou Poppins)
5. Use Lucide Icons via CDN se possível, ou SVG inline
6. Responsivo (mobile-first)
7. Animações suaves com CSS (fade-in, slide-up)
8. Seções obrigatórias:
   - HERO: título impactante, subtítulo, CTA (WhatsApp ou formulário)
   - SOBRE: descrição da empresa
   - SERVIÇOS/PRODUTOS: 3-6 cards com ícones
   - GALERIA: placeholder para imagens (se tiver redes sociais)
   - CONTATO: WhatsApp, endereço, redes sociais
   - FOOTER: copyright, links sociais
9. Botão flutuante do WhatsApp no canto inferior direito
10. Se houver endereço, inclua seção de localização com placeholder de mapa
11. NÃO use placeholder images de serviços externos. Use divs com gradientes como placeholder.
12. Todo texto deve ser em ${data.idioma === "pt-BR" ? "português brasileiro" : data.idioma}
13. O HTML deve ser PROFISSIONAL, MODERNO e CONVERSIVO
14. Gere textos persuasivos e realistas para cada seção
15. Inclua meta tags SEO (title, description, og:tags)

Retorne APENAS o código HTML completo, sem markdown, sem explicação.`;
}

async function generateWithAnthropic(data: SiteFormData): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não configurada");
  }

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
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} - ${err}`);
  }

  const result = await res.json();
  let html = result.content?.[0]?.text || "";

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
<a href="#contato" class="hover:text-primaria transition">Contato</a>
<a href="${whatsappLink}" target="_blank" class="bg-primaria text-black px-4 py-2 rounded-lg font-medium hover:brightness-110 transition">Fale Conosco</a>
</div>
</div>
</nav>

<section class="min-h-screen flex items-center pt-16">
<div class="max-w-6xl mx-auto px-4 py-20 text-center">
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
</div>
</section>

<section id="sobre" class="py-20" style="background:${temaCard}">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-12 fade-up">Sobre Nós</h2>
<div class="max-w-3xl mx-auto text-center fade-up delay-1">
<p class="text-lg leading-relaxed" style="opacity:0.8">
${generateAboutText(data)}
</p>
</div>
</div>
</section>

<section id="servicos" class="py-20">
<div class="max-w-6xl mx-auto px-4">
<h2 class="text-3xl font-bold text-center mb-12 fade-up">Nossos Serviços</h2>
<div class="grid md:grid-cols-3 gap-6">
${servicos
  .map(
    (s, i) => `
<div class="p-6 rounded-2xl fade-up delay-${i + 1}" style="background:${temaCard};border:1px solid ${temaBorder}">
<div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style="background:${data.cor_primaria}20;color:${data.cor_primaria}">${s.icon}</div>
<h3 class="text-lg font-semibold mb-2">${s.title}</h3>
<p class="text-sm" style="opacity:0.7">${s.desc}</p>
</div>`
  )
  .join("")}
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
<h2 class="text-3xl font-bold mb-12 fade-up">Entre em Contato</h2>
<div class="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
${data.whatsapp ? `
<a href="${whatsappLink}" target="_blank" class="p-6 rounded-2xl hover:brightness-110 transition fade-up delay-1" style="background:${temaCard};border:1px solid ${temaBorder}">
<div class="text-3xl mb-3">📱</div>
<h3 class="font-semibold mb-1">WhatsApp</h3>
<p class="text-sm" style="opacity:0.7">${data.whatsapp}</p>
</a>` : ""}
${data.instagram ? `
<a href="${instagramLink}" target="_blank" class="p-6 rounded-2xl hover:brightness-110 transition fade-up delay-2" style="background:${temaCard};border:1px solid ${temaBorder}">
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
Fale pelo WhatsApp
</a>
</div>
</div>
</section>

<footer class="py-8 border-t" style="border-color:${temaBorder}">
<div class="max-w-6xl mx-auto px-4 text-center text-sm" style="opacity:0.5">
<p>&copy; ${new Date().getFullYear()} ${data.nome_empresa}. Todos os direitos reservados.</p>
<p class="mt-1">Criado com VMS Digital</p>
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

function generateAboutText(data: SiteFormData): string {
  return `A ${data.nome_empresa} é referência no mercado, oferecendo soluções de qualidade com atendimento personalizado. Com anos de experiência, nossa missão é proporcionar a melhor experiência para nossos clientes, combinando profissionalismo, inovação e dedicação em cada detalhe. Estamos comprometidos em superar suas expectativas e construir relações duradouras baseadas em confiança e resultados.`;
}

function generateServices(nicho: string, descricao: string): Array<{ icon: string; title: string; desc: string }> {
  const services: Record<string, Array<{ icon: string; title: string; desc: string }>> = {
    provedor: [
      { icon: "🌐", title: "Internet Fibra", desc: "Planos de internet de alta velocidade com fibra óptica para residências e empresas." },
      { icon: "🔧", title: "Suporte Técnico", desc: "Equipe técnica especializada disponível para atendimento rápido e eficiente." },
      { icon: "📡", title: "Instalação Gratuita", desc: "Instalação sem custo adicional com agendamento flexível." },
    ],
    advocacia: [
      { icon: "⚖️", title: "Direito Civil", desc: "Atuação em contratos, responsabilidade civil e direito do consumidor." },
      { icon: "🏢", title: "Direito Empresarial", desc: "Assessoria jurídica completa para empresas e empreendedores." },
      { icon: "👨‍👩‍👧", title: "Direito de Família", desc: "Acompanhamento em processos de família com sensibilidade e competência." },
    ],
    clinica: [
      { icon: "🩺", title: "Consultas Médicas", desc: "Atendimento médico humanizado com profissionais qualificados." },
      { icon: "🔬", title: "Exames Laboratoriais", desc: "Exames completos com resultados rápidos e confiáveis." },
      { icon: "💊", title: "Tratamentos", desc: "Planos de tratamento personalizados para cada paciente." },
    ],
    restaurante: [
      { icon: "🍽️", title: "Cardápio Variado", desc: "Pratos preparados com ingredientes frescos e selecionados." },
      { icon: "🚗", title: "Delivery Rápido", desc: "Entrega rápida e segura na sua casa ou escritório." },
      { icon: "🎉", title: "Eventos", desc: "Espaço para eventos corporativos e comemorações especiais." },
    ],
    salao: [
      { icon: "✂️", title: "Corte e Estilo", desc: "Cortes modernos e personalizados para todos os estilos." },
      { icon: "🎨", title: "Coloração", desc: "Técnicas de coloração com produtos de alta qualidade." },
      { icon: "💅", title: "Manicure e Pedicure", desc: "Cuidado completo para unhas com esmaltação premium." },
    ],
  };

  return (
    services[nicho] || [
      { icon: "⭐", title: "Qualidade Premium", desc: "Produtos e serviços com os mais altos padrões de qualidade." },
      { icon: "🤝", title: "Atendimento Personalizado", desc: "Cada cliente recebe atenção e cuidado individual." },
      { icon: "🏆", title: "Experiência Comprovada", desc: "Anos de experiência e centenas de clientes satisfeitos." },
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

    let html: string;

    if (ANTHROPIC_API_KEY) {
      try {
        html = await generateWithAnthropic(data);
      } catch (err) {
        console.error("Erro na API Anthropic, usando fallback:", err);
        html = generateFallbackSite(data);
      }
    } else {
      html = generateFallbackSite(data);
    }

    return NextResponse.json({
      html,
      gerado_com_ia: !!ANTHROPIC_API_KEY,
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
