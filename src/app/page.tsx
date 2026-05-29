"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Bot,
  Radar,
  BarChart3,
  Paintbrush,
  Search,
  Headphones,
  Check,
  ChevronDown,
  Zap,
  DollarSign,
  Crosshair,
  Globe,
  MessageSquare,
  Shield,
  Star,
  X,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EASE = [0.16, 1, 0.3, 1] as const;

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setIsLoggedIn(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className={`ab-nav${scrolled ? " ab-nav-scrolled" : ""}`}>
      <a href="/" className="ab-nav-logo">
        <Image src="/logo-startzy.svg" alt="Startzy" width={70} height={20} priority />
      </a>
      <div className={`ab-nav-links${menuOpen ? " ab-nav-links-open" : ""}`}>
        <a href="#como" onClick={() => setMenuOpen(false)}>Como funciona</a>
        <a href="#recursos" onClick={() => setMenuOpen(false)}>Recursos</a>
        <a href="#precos" onClick={() => setMenuOpen(false)}>Planos</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
      </div>
      <div className="ab-nav-cta">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="ab-btn-ghost-sm ab-btn-dashboard">
              <LayoutDashboard size={14} />
              Entrar no sistema
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="ab-btn-ghost-sm">Entrar</Link>
            <Link href="/cadastro" className="ab-btn-primary-sm">Começar grátis</Link>
          </>
        )}
        <button className="ab-nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const words = ["agências.", "freelancers.", "empreendedores.", "vendedores."];
  const particleCount = isMobile ? 8 : 20;

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => {
      clearInterval(interval);
      mql.removeEventListener('change', handler);
    };
  }, [words.length]);

  return (
    <section className="ab-hero">
      <div className="ab-hero-bg-image" />
      <div className="ab-hero-overlay" />
      {!isMobile && <div className="ab-hero-glow" />}
      {mounted && !isMobile && (
        <div className="ab-hero-particles">
          {Array.from({ length: particleCount }).map((_, i) => (
            <motion.div
              key={i}
              className="ab-hero-particle"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: 0,
                scale: Math.random() * 0.5 + 0.3,
              }}
              animate={{
                y: [`${Math.random() * 100}%`, `${Math.random() * 60}%`],
                opacity: [0, Math.random() * 0.4 + 0.1, 0],
              }}
              transition={{
                duration: Math.random() * 6 + 4,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
      <div className="ab-hero-content">
        <motion.div
          className="ab-hero-badge"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="ab-hero-badge-dot" />
          Plataforma de agências digitais
        </motion.div>

        <motion.h1
          className="ab-hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          Crie sites com IA.
          <br />
          <motion.span
            className="ab-hero-accent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            Fature com recorrência.
          </motion.span>
        </motion.h1>

        <motion.p
          className="ab-hero-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        >
          Prospecção, criação e gestão — tudo automatizado.
          <br />
          Para{" "}
          <span className="ab-hero-word-wrap">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                className="ab-hero-word"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.p>

        <motion.div
          className="ab-hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
        >
          <Link href="/cadastro" className="ab-btn-primary ab-btn-hero">
            Começar grátis
            <ArrowRight size={16} />
          </Link>
          <a href="#como" className="ab-btn-outline">
            Ver como funciona
            <ChevronDown size={14} />
          </a>
        </motion.div>

        <motion.div
          className="ab-hero-trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <span><Check size={14} /> Grátis para começar</span>
          <span><Zap size={14} /> Site em 3 minutos</span>
          <span><Bot size={14} /> IA inclusa</span>
        </motion.div>
      </div>
    </section>
  );
}

function HowSection() {
  const steps = [
    {
      icon: <Crosshair size={24} />,
      title: "Encontre",
      text: "Prospecção inteligente mapeia negócios sem site na sua região automaticamente.",
    },
    {
      icon: <Zap size={24} />,
      title: "Crie",
      text: "IA monta o site completo em minutos. Revise, personalize e publique.",
    },
    {
      icon: <DollarSign size={24} />,
      title: "Fature",
      text: "Entregue, cobre mensalidade e escale. Mais clientes, mais receita.",
    },
  ];

  return (
    <section className="ab-section" id="como">
      <div className="ab-container">
        <FadeIn>
          <div className="ab-section-header">
            <span className="ab-label">Como funciona</span>
            <h2 className="ab-title">Três passos. Do zero ao faturamento.</h2>
          </div>
        </FadeIn>
        <div className="ab-steps">
          {steps.map((step, i) => (
            <FadeIn key={step.title} delay={0.15 * (i + 1)}>
              <motion.div
                className="ab-step"
                whileHover={{ y: -6, transition: { duration: 0.3, ease: EASE } }}
              >
                <motion.div
                  className="ab-step-icon"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {step.icon}
                </motion.div>
                <div className="ab-step-number">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="ab-step-title">{step.title}</h3>
                <p className="ab-step-text">{step.text}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Bot size={22} />,
      title: "IA Editorial",
      text: "Crie e edite conteúdo com IA. Textos persuasivos, SEO otimizado — em segundos.",
      tag: "Exclusivo",
    },
    {
      icon: <Radar size={22} />,
      title: "Prospecção Inteligente",
      text: "Radar automático de negócios sem presença digital na sua região.",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Dashboard Pro",
      text: "Gerencie clientes, sites e métricas em um painel intuitivo.",
    },
    {
      icon: <Paintbrush size={22} />,
      title: "Templates Premium",
      text: "Templates otimizados por segmento: restaurante, clínica, salão...",
    },
    {
      icon: <Search size={22} />,
      title: "SEO Automático",
      text: "Cada site já nasce otimizado para Google. Seus clientes aparecem.",
    },
    {
      icon: <Headphones size={22} />,
      title: "Suporte 24h",
      text: "Time real disponível a qualquer hora. Gente resolvendo seu problema.",
    },
  ];

  return (
    <section className="ab-section ab-section-alt" id="recursos">
      <div className="ab-container">
        <FadeIn>
          <div className="ab-section-header">
            <span className="ab-label">Recursos</span>
            <h2 className="ab-title">Ferramentas que convertem.</h2>
          </div>
        </FadeIn>
        <div className="ab-features-grid">
          {features.map((feat, i) => (
            <FadeIn key={feat.title} delay={0.06 * (i + 1)}>
              <motion.div
                className={`ab-feat${feat.tag ? " ab-feat-featured" : ""}`}
                whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
              >
                <motion.div
                  className="ab-feat-icon"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {feat.icon}
                </motion.div>
                <h3 className="ab-feat-title">{feat.title}</h3>
                <p className="ab-feat-text">{feat.text}</p>
                {feat.tag && <span className="ab-feat-tag">{feat.tag}</span>}
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Grátis",
      price: "R$0",
      period: "/mês",
      desc: "Para começar a testar",
      features: ["2 sites com IA", "Prospecção básica", "Templates simples", "Suporte por email"],
      cta: "Começar grátis",
      primary: false,
    },
    {
      name: "Starter",
      price: "R$97",
      period: "/mês",
      desc: "Para quem quer faturar",
      features: [
        "10 sites com IA",
        "Prospecção completa",
        "Templates premium",
        "Editor avançado",
        "SEO automático",
        "Suporte prioritário",
      ],
      cta: "Assinar Starter",
      primary: true,
      popular: true,
    },
    {
      name: "Pro",
      price: "R$197",
      period: "/mês",
      desc: "Para escalar como agência",
      features: [
        "50 sites com IA",
        "Prospecção ilimitada",
        "Templates premium",
        "Editor avançado",
        "Domínio personalizado",
        "IA Editorial exclusiva",
        "Suporte 24h",
      ],
      cta: "Assinar Pro",
      primary: false,
    },
  ];

  return (
    <section className="ab-section" id="precos">
      <div className="ab-container">
        <FadeIn>
          <div className="ab-section-header">
            <span className="ab-label">Planos</span>
            <h2 className="ab-title">Comece grátis. Escale quando quiser.</h2>
          </div>
        </FadeIn>
        <div className="ab-pricing-grid">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={0.08 * (i + 1)}>
              <div className={`ab-price${plan.popular ? " ab-price-popular" : ""}`}>
                {plan.popular && <span className="ab-price-badge">Popular</span>}
                <div className="ab-price-name">{plan.name}</div>
                <div className="ab-price-val">
                  {plan.price}
                  <span>{plan.period}</span>
                </div>
                <div className="ab-price-desc">{plan.desc}</div>
                <div className="ab-price-divider" />
                <ul className="ab-price-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} className="ab-check" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={plan.primary ? "ab-btn-primary ab-price-cta" : "ab-btn-outline ab-price-cta"}
                >
                  {plan.cta}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const testimonials = [
    {
      result: "+R$500/mês",
      text: "Comecei no plano grátis e em 2 semanas já tinha meu primeiro cliente. Uma padaria do meu bairro agora paga minha conta todo mês.",
      name: "Lucas Mendes",
      role: "Freelancer · Startzy desde Fev/24",
      initials: "LM",
      stars: 5,
    },
    {
      result: "+R$700/mês",
      text: "A prospecção inteligente me entregou 12 leads na primeira semana. Fechei 4. O ROI foi absurdo.",
      name: "Ana Beatriz",
      role: "Designer · Startzy desde Mar/24",
      initials: "AB",
      stars: 5,
    },
    {
      result: "+R$1.200/mês",
      text: "Trabalho de casa com minha agenda. A Startzy me deu toda estrutura que eu precisava.",
      name: "Pedro Henrique",
      role: "Ex-vendedor · Startzy desde Jan/24",
      initials: "PH",
      stars: 5,
    },
    {
      result: "+R$850/mês",
      text: "Não sabia nada de código. A IA montou o site do meu cliente em 3 minutos. Ele amou.",
      name: "Camila Rocha",
      role: "Empreendedora · Startzy desde Abr/24",
      initials: "CR",
      stars: 5,
    },
    {
      result: "+R$600/mês",
      text: "Tenho 7 clientes pagando mensalidade. A plataforma se paga no primeiro dia.",
      name: "Thiago Santos",
      role: "Agência digital · Startzy desde Dez/23",
      initials: "TS",
      stars: 5,
    },
    {
      result: "+R$950/mês",
      text: "O suporte é incrível. Tive uma dúvida às 23h e fui respondido em 10 minutos. Isso não tem preço.",
      name: "Fernanda Lima",
      role: "Freelancer · Startzy desde Mai/24",
      initials: "FL",
      stars: 5,
    },
    {
      result: "+R$1.500/mês",
      text: "Escalei de 3 para 15 clientes em 2 meses. A Startzy é o motor da minha agência.",
      name: "Roberto Alves",
      role: "Agência · Startzy desde Out/23",
      initials: "RA",
      stars: 5,
    },
    {
      result: "+R$400/mês",
      text: "Comecei como renda extra. Hoje já penso em largar o emprego e viver disso.",
      name: "Juliana Costa",
      role: "Estudante · Startzy desde Jun/24",
      initials: "JC",
      stars: 5,
    },
  ];

  function checkScroll() {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }

  function scroll(direction: "left" | "right") {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  }

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  return (
    <section className="ab-section ab-section-alt" id="depoimentos">
      <div className="ab-container">
        <FadeIn>
          <div className="ab-section-header">
            <span className="ab-label">Depoimentos</span>
            <h2 className="ab-title">Histórias reais de quem fatura com a Startzy.</h2>
          </div>
        </FadeIn>
        <div className="ab-testimonials-carousel">
          {canScrollLeft && (
            <button className="ab-testi-nav ab-testi-nav-left" onClick={() => scroll("left")}>
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="ab-testimonials-track" ref={scrollRef}>
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="ab-testi"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.05 * i, ease: EASE }}
              >
                <div className="ab-testi-stars">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} size={14} fill="var(--lime)" color="var(--lime)" />
                  ))}
                </div>
                <span className="ab-testi-result">{t.result}</span>
                <p className="ab-testi-text">&ldquo;{t.text}&rdquo;</p>
                <div className="ab-testi-author">
                  <div className="ab-testi-avatar">{t.initials}</div>
                  <div>
                    <div className="ab-testi-name">{t.name}</div>
                    <div className="ab-testi-role">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {canScrollRight && (
            <button className="ab-testi-nav ab-testi-nav-right" onClick={() => scroll("right")}>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function NumbersSection() {
  const numbers = [
    { val: "3.200+", label: "Agências ativas" },
    { val: "18.400+", label: "Sites publicados" },
    { val: "3min", label: "Tempo por site" },
    { val: "R$4k+", label: "Faturamento médio" },
  ];

  return (
    <section className="ab-numbers">
      <div className="ab-container">
        <div className="ab-numbers-grid">
          {numbers.map((n, i) => (
            <FadeIn key={n.label} delay={0.08 * i}>
              <div className="ab-num-item">
                <div className="ab-num-val">{n.val}</div>
                <div className="ab-num-label">{n.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "O que é a Startzy e para quem ela serve?",
      a: "A Startzy é uma plataforma de agências digitais que combina prospecção inteligente, criação de sites com IA e gestão de clientes. Serve para freelancers, empreendedores e agências que querem faturar com recorrência.",
    },
    {
      q: "Preciso saber programar para usar?",
      a: "Não. A IA cria o site completo em minutos. Você só revisa, personaliza e publica. Zero código necessário.",
    },
    {
      q: "Como funciona a prospecção inteligente?",
      a: "O radar mapeia automaticamente negócios sem presença digital na sua região. Você recebe leads qualificados prontos para abordar.",
    },
    {
      q: "Posso usar com pessoa física?",
      a: "Sim! A Startzy funciona tanto para pessoa física quanto jurídica. Você pode começar hoje mesmo.",
    },
    {
      q: "Quanto tempo leva para criar um site?",
      a: "Em média 3 minutos. A IA gera o site completo com copy, design e SEO otimizado. Você revisa e publica.",
    },
    {
      q: "Como funciona a cobrança da mensalidade?",
      a: "Você define o valor da mensalidade para cada cliente. A cobrança é feita via PIX recorrente integrado à plataforma.",
    },
  ];

  return (
    <section className="ab-section" id="faq">
      <div className="ab-container">
        <FadeIn>
          <div className="ab-section-header ab-section-header-center">
            <span className="ab-label">Dúvidas frequentes</span>
            <h2 className="ab-title ab-title-center">Tem dúvidas? Relaxa, nós temos as respostas.</h2>
          </div>
        </FadeIn>
        <div className="ab-faq-list">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={0.04 * (i + 1)}>
              <div className={`ab-faq-item${openIdx === i ? " ab-faq-open" : ""}`}>
                <button className="ab-faq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                  <span>{faq.q}</span>
                  {openIdx === i ? <X size={16} /> : <ChevronDown size={16} />}
                </button>
                <div className="ab-faq-a">
                  <p>{faq.a}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section className="ab-section ab-section-alt">
      <div className="ab-container">
        <div className="ab-support">
          <FadeIn>
            <div className="ab-support-content">
              <div className="ab-support-icon">
                <Headphones size={28} />
              </div>
              <span className="ab-label">Suporte</span>
              <h2 className="ab-title">E tudo isso com um suporte que não te deixa na mão.</h2>
              <p className="ab-support-body">
                Na Startzy, você conta com diferentes canais para receber atendimento rápido e eficiente.
              </p>
              <a
                href="https://wa.me/5511997513044"
                target="_blank"
                rel="noopener noreferrer"
                className="ab-btn-primary"
              >
                <WhatsAppIcon size={16} />
                Falar com suporte
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="ab-section">
      <div className="ab-container">
        <FadeIn>
          <div className="ab-cta">
            <div className="ab-cta-glow" />
            <span className="ab-label">Próximo passo</span>
            <h2 className="ab-cta-title">
              Comece agora.
              <br />
              Fature amanhã.
            </h2>
            <p className="ab-cta-body">
              Sem cartão. Sem risco. O plano grátis é seu ponto de partida.
            </p>
            <Link href="/cadastro" className="ab-btn-primary ab-btn-lg">
              Começar grátis
              <ArrowRight size={18} />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="ab-footer">
      <div className="ab-container">
        <div className="ab-footer-top">
          <div className="ab-footer-brand">
            <Image src="/logo-startzy.svg" alt="Startzy" width={120} height={36} className="ab-footer-logo" />
            <p>Plataforma de agências digitais. Crie sites com IA e fature com recorrência.</p>
          </div>
          <div className="ab-footer-col">
            <h4>Produto</h4>
            <a href="#como">Como funciona</a>
            <a href="#recursos">Recursos</a>
            <a href="#precos">Planos</a>
            <a href="#depoimentos">Depoimentos</a>
          </div>
          <div className="ab-footer-col">
            <h4>Empresa</h4>
            <a href="/termos">Termos</a>
            <a href="/privacidade">Privacidade</a>
            <a href="/ajuda">Ajuda</a>
          </div>
          <div className="ab-footer-col">
            <h4>Contato</h4>
            <a href="https://wa.me/5511997513044" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="mailto:contato@startzy.com.br">Email</a>
          </div>
        </div>
        <div className="ab-footer-bottom">
          <span>© {new Date().getFullYear()} <strong>Startzy</strong>. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}

function CinematicVignette() {
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll();
  const vignetteOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.85, 0.95, 1], [0, 0.3, 0, 0, 0.3, 0.6]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (isMobile) return null;

  return (
    <motion.div
      className="ab-cinematic-vignette"
      style={{ opacity: vignetteOpacity }}
    />
  );
}

function CinematicSectionDivider() {
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center", "end start"],
  });
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, 8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (isMobile) {
    return (
      <div className="ab-cinematic-divider-static">
        <div className="ab-cinematic-divider-line" />
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="ab-cinematic-divider"
      style={{ filter: blur, opacity }}
    >
      <div className="ab-cinematic-divider-line" />
    </motion.div>
  );
}

function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="ab-splash"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="ab-splash-lights">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="ab-splash-light"
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            initial={{
              scale: 0,
              opacity: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              scale: [0, 1, 2, 0],
              opacity: [0, 0.8, 0.4, 0],
              x: [
                0,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 300,
                (Math.random() - 0.5) * 400,
              ],
              y: [
                0,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 300,
                (Math.random() - 0.5) * 400,
              ],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: i * 0.25,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
      <div className="ab-splash-inner">
        <motion.div
          className="ab-splash-logo"
          initial={{ scale: 0.4, opacity: 0, filter: "blur(20px)" }}
          animate={{
            scale: [0.4, 1.05, 1],
            opacity: [0, 1, 1],
            filter: ["blur(20px)", "blur(0px)", "blur(0px)"],
          }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Image src="/logo-animacao.svg" alt="Startzy" width={100} height={47} priority />
        </motion.div>
        <motion.div
          className="ab-splash-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}

function SalesNotification() {
  const [dismissed, setDismissed] = useState(false);
  const [started, setStarted] = useState(false);
  const [show, setShow] = useState(false);
  const [index, setIndex] = useState(0);

  const notifications = useMemo(() => [
    "Lucas de SP acabou de faturar R$700",
    "Ana de RJ fechou um cliente de R$1.200",
    "Pedro de BH faturou R$500 hoje",
    "Camila de MG fechou 2 clientes de R$800",
    "Thiago de SP faturou R$950 essa semana",
    "Fernanda de RJ acabou de faturar R$1.500",
    "Roberto de BH fechou um site de R$1.200",
    "Juliana de SP faturou R$400 hoje",
    "Rafael de MG fechou 3 clientes de R$600",
    "Patrícia de RJ faturou R$1.100 essa semana",
  ], []);

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setStarted(true), 8000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  useEffect(() => {
    if (!started || dismissed) return;

    const showTimer = setTimeout(() => setShow(true), 1200);
    const hideTimer = setTimeout(() => setShow(false), 7200);
    const nextTimer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % notifications.length);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [started, dismissed, index, notifications.length]);

  if (dismissed || !started) return null;

  return (
    <div
      className={`ab-sales-notification ${show ? "ab-sales-notification-visible" : "ab-sales-notification-hidden"}`}
    >
      <div className="ab-sales-notification-content">
        <span className="ab-sales-notification-dot" />
        <span className="ab-sales-notification-text">{notifications[index]}</span>
      </div>
      <button
        className="ab-sales-notification-close"
        onClick={() => setDismissed(true)}
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-page">
      <AnimatePresence mode="wait">
        {!showContent && <SplashScreen key="splash" />}
      </AnimatePresence>
      {showContent && (
        <>
      <CinematicVignette />
      <Navbar />
      <HeroSection />
      <CinematicSectionDivider />
      <HowSection />
      <CinematicSectionDivider />
      <FeaturesSection />
      <CinematicSectionDivider />
      <PricingSection />
      <CinematicSectionDivider />
      <NumbersSection />
      <CinematicSectionDivider />
      <TestimonialsSection />
      <CinematicSectionDivider />
      <FAQSection />
      <CinematicSectionDivider />
      <SupportSection />
      <CinematicSectionDivider />
      <CTASection />
      <FooterSection />
      <SalesNotification />
        </>
      )}
    </div>
  );
}
