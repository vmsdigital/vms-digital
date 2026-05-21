"use client";

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Zap,
  Bot,
  Headphones,
  PlayCircle,
  Clock,
  Store,
  HelpCircle,
  Crosshair,
  DollarSign,
  Monitor,
  Radar,
  BarChart3,
  Paintbrush,
  Search,
} from "lucide-react";

export default function LandingPage() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    document.addEventListener("mousemove", onMouseMove);

    let animId: number;
    const animCursor = () => {
      cursor.style.left = mx + "px";
      cursor.style.top = my + "px";
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      animId = requestAnimationFrame(animCursor);
    };
    animId = requestAnimationFrame(animCursor);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll(".landing-page .reveal");
    const revObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revObs.observe(el));
    return () => revObs.disconnect();
  }, []);

  useEffect(() => {
    const counters = document.querySelectorAll(
      ".landing-page [data-target]"
    ) as NodeListOf<HTMLElement>;
    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.target || "0", 10);
            let current = 0;
            const step = target / 60;
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                el.textContent = target.toLocaleString("pt-BR") + "+";
                clearInterval(timer);
              } else {
                el.textContent = Math.floor(current).toLocaleString("pt-BR");
              }
            }, 20);
            countObs.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => countObs.observe(c));
    return () => countObs.disconnect();
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll(".landing-page section[id]");
    const onScroll = () => {
      let current = "";
      sections.forEach((s) => {
        const htmlS = s as HTMLElement;
        if (window.scrollY >= htmlS.offsetTop - 120) current = htmlS.id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page">
      <Script
        src="https://unpkg.com/@phosphor-icons/web@2.1.1"
        strategy="beforeInteractive"
      />

      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
      <div className="ambient amb-1" />
      <div className="ambient amb-2" />

      <nav>
        <a href="https://vmsdigital.com.br" className="nav-logo">
          <Image
            src="/logo-startzy.svg"
            alt="Startzy"
            width={160}
            height={44}
            className="nav-logo-svg"
          />
        </a>

        <ul className="nav-links">
          <li>
            <a
              href="#solucao"
              style={{ color: activeSection === "solucao" ? "var(--lime)" : undefined }}
            >
              Solução
            </a>
          </li>
          <li>
            <a
              href="#plataforma"
              style={{ color: activeSection === "plataforma" ? "var(--lime)" : undefined }}
            >
              Plataforma
            </a>
          </li>
          <li>
            <a
              href="#features"
              style={{ color: activeSection === "features" ? "var(--lime)" : undefined }}
            >
              Recursos
            </a>
          </li>
          <li>
            <a
              href="#precos"
              style={{ color: activeSection === "precos" ? "var(--lime)" : undefined }}
            >
              Planos
            </a>
          </li>
        </ul>

        <div className="nav-cta">
          <Link href="/login" className="btn-nav-ghost">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn-primary">
            Começar agora →
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Plataforma de agências digitais
        </div>
        <div className="hero-title">
          <span>Crie sites com IA.</span>
          <span className="line-accent">Fature como agência.</span>
          <span className="line-ghost">Sem saber programar.</span>
        </div>
        <p className="hero-sub">
          Crie sites profissionais em <strong>minutos</strong> com IA. Prospecção, criação e
          gestão — tudo em uma plataforma.
        </p>
        <div className="hero-actions">
          <Link href="/cadastro" className="btn-hero">
            Começar grátis
            <span className="btn-hero-arrow">→</span>
          </Link>
          <a href="#solucao" className="btn-hero-outline">
            <PlayCircle size={18} /> Ver como funciona
          </a>
        </div>
        <div className="hero-trust">
          <div className="hero-trust-item">
            <span className="hero-trust-dot">
              <Check size={10} />
            </span>
            Plano grátis disponível
          </div>
          <div className="hero-trust-item">
            <span className="hero-trust-dot">
              <Zap size={10} />
            </span>
            Site em 3 minutos
          </div>
          <div className="hero-trust-item">
            <span className="hero-trust-dot">
              <Bot size={10} />
            </span>
            IA Editorial inclusa
          </div>
          <div className="hero-trust-item">
            <span className="hero-trust-dot">
              <Headphones size={10} />
            </span>
            Suporte 24h
          </div>
        </div>
      </section>

      <div className="ticker-wrap">
        <div className="ticker-track">
          <span className="ticker-item">
            Prospecção Automática <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Sites com IA <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Receita Recorrente <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Dashboard Profissional <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            SEO Automático <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Templates Premium <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Suporte 24h <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Prospecção Automática <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Sites com IA <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Receita Recorrente <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Dashboard Profissional <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            SEO Automático <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Templates Premium <span className="ticker-sep" />
          </span>
          <span className="ticker-item">
            Suporte 24h <span className="ticker-sep" />
          </span>
        </div>
      </div>

      <section className="pain" id="solucao">
        <div className="pain-inner">
          <div className="pain-visual reveal">
            <div className="pain-card reveal reveal-delay-1">
              <span className="pain-card-icon">
                <Clock size={24} />
              </span>
              <div className="pain-card-title">Troca horas por dinheiro</div>
              <div className="pain-card-text">Sem previsibilidade. Todo mês é uma aposta.</div>
            </div>
            <div className="pain-card reveal reveal-delay-2">
              <span className="pain-card-icon">
                <Store size={24} />
              </span>
              <div className="pain-card-title">87% dos negócios locais sem site</div>
              <div className="pain-card-text">Milhões de clientes esperando por uma solução.</div>
            </div>
            <div className="pain-card reveal reveal-delay-3">
              <span className="pain-card-icon">
                <HelpCircle size={24} />
              </span>
              <div className="pain-card-title">Quer mais, mas não sabe como</div>
              <div className="pain-card-text">Você precisa de um sistema, não de mais esforço.</div>
            </div>
          </div>
          <div className="pain-text reveal reveal-delay-2">
            <div className="section-label">O problema</div>
            <h2 className="section-title">
              Você precisa de um <em>sistema</em>, não de mais esforço.
            </h2>
            <p className="section-body">
              5 milhões de negócios locais sem site. A Startzy entrega o sistema completo para você
              atendê-los.
            </p>
            <div className="pain-stat">
              <div className="pain-stat-item">
                <div className="pain-stat-num">87%</div>
                <div className="pain-stat-label">Sem site</div>
              </div>
              <div className="pain-stat-item">
                <div className="pain-stat-num">5M+</div>
                <div className="pain-stat-label">Negócios locais</div>
              </div>
              <div className="pain-stat-item">
                <div className="pain-stat-num">R$800</div>
                <div className="pain-stat-label">Ticket médio/site</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="how">
          <div className="how-header">
            <div>
              <div className="section-label reveal">Como funciona</div>
              <h2 className="section-title reveal reveal-delay-1">
                3 passos. Do zero ao <em>faturamento</em>.
              </h2>
            </div>
            <p className="section-body reveal reveal-delay-2">
              Sem curva de aprendizado. Três passos e você já pode faturar.
            </p>
          </div>
          <div className="steps-grid reveal">
            <div className="step-card">
              <span className="step-num">01</span>
              <div className="step-icon-wrap">
                <Crosshair size={22} />
              </div>
              <div className="step-title">Encontre o cliente</div>
              <div className="step-text">
                Prospecção inteligente que mapeia negócios sem site na sua região.
              </div>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <div className="step-icon-wrap">
                <Zap size={22} />
              </div>
              <div className="step-title">Crie o site em minutos</div>
              <div className="step-text">
                IA Editorial monta o site completo. Revise e publique. Sem código.
              </div>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <div className="step-icon-wrap">
                <DollarSign size={22} />
              </div>
              <div className="step-title">Cobre e escale</div>
              <div className="step-text">
                Entregue, receba. Mais clientes = mais receita, sem mais horas.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="platform-section" id="plataforma">
        <div className="platform-inner">
          <div className="platform-header reveal">
            <div className="section-label">A plataforma</div>
            <h2 className="section-title">
              Tudo que você precisa em <em>um lugar</em>.
            </h2>
          </div>
          <div className="platform-showcase reveal reveal-delay-1">
            <div className="platform-showcase-placeholder">
              <Monitor size={64} style={{ color: "rgba(223,254,0,0.15)" }} />
              <p>Imagem da plataforma aqui</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="features-inner">
          <div className="features-header reveal">
            <div className="section-label">Recursos</div>
            <h2 className="section-title">
              Ferramentas que <em>convertem</em>.
            </h2>
          </div>
          <div className="features-grid">
            <div className="feat-card featured reveal">
              <div className="feat-icon">
                <Bot size={24} />
              </div>
              <div className="feat-title">IA Editorial Startzy</div>
              <div className="feat-text">
                Crie e edite conteúdo com IA. Textos persuasivos, SEO otimizado — em segundos.
              </div>
              <span className="feat-tag">⚡ Exclusivo</span>
            </div>
            <div className="feat-card reveal reveal-delay-1">
              <div className="feat-icon">
                <Radar size={24} />
              </div>
              <div className="feat-title">Prospecção Inteligente</div>
              <div className="feat-text">
                Radar automático de negócios sem presença digital na sua região.
              </div>
            </div>
            <div className="feat-card reveal reveal-delay-2">
              <div className="feat-icon">
                <BarChart3 size={24} />
              </div>
              <div className="feat-title">Dashboard Profissional</div>
              <div className="feat-text">
                Gerencie clientes, sites e métricas em um painel intuitivo.
              </div>
            </div>
            <div className="feat-card reveal reveal-delay-1">
              <div className="feat-icon">
                <Paintbrush size={24} />
              </div>
              <div className="feat-title">Templates Premium</div>
              <div className="feat-text">
                Templates otimizados por segmento: restaurante, clínica, salão...
              </div>
            </div>
            <div className="feat-card reveal reveal-delay-2">
              <div className="feat-icon">
                <Search size={24} />
              </div>
              <div className="feat-title">SEO Automático</div>
              <div className="feat-text">
                Cada site já nasce otimizado para Google. Seus clientes aparecem.
              </div>
            </div>
            <div className="feat-card reveal reveal-delay-3">
              <div className="feat-icon">
                <Headphones size={24} />
              </div>
              <div className="feat-title">Suporte Humano 24h</div>
              <div className="feat-text">
                Time real disponível a qualquer hora. Gente resolvendo seu problema.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="numbers-section reveal">
        <div className="numbers-grid">
          <div className="num-item">
            <div className="num-val" data-target="3200">
              0
            </div>
            <div className="num-label">Agências Ativas</div>
          </div>
          <div className="num-item">
            <div className="num-val" data-target="18400">
              0
            </div>
            <div className="num-label">Sites Publicados</div>
          </div>
          <div className="num-item">
            <div className="num-val">3min</div>
            <div className="num-label">Tempo por site</div>
          </div>
          <div className="num-item">
            <div className="num-val">R$4k+</div>
            <div className="num-label">Faturamento médio</div>
          </div>
        </div>
      </div>

      <section id="resultados">
        <div className="proof-section">
          <div className="proof-header">
            <div>
              <div className="section-label reveal">Resultados</div>
              <h2 className="section-title reveal reveal-delay-1">
                Quem <em>fatura</em> com a Startzy.
              </h2>
            </div>
            <p className="section-body reveal reveal-delay-2">Resultados reais de quem começou.</p>
          </div>
          <div className="testimonials">
            <div className="testi-card reveal">
              <span className="testi-result">+R$6.800/mês</span>
              <div className="testi-quote">&ldquo;</div>
              <p className="testi-text">
                Em 3 meses já tinha 9 clientes pagando mensalidade. Um restaurante e uma barbearia
                dão mais renda que meu CLT.
              </p>
              <div className="testi-author">
                <div className="testi-avatar">MC</div>
                <div>
                  <div className="testi-name">Marcos Carvalho</div>
                  <div className="testi-role">Ex-analista · Startzy desde Jan/24</div>
                </div>
              </div>
            </div>
            <div className="testi-card reveal reveal-delay-1">
              <span className="testi-result">+R$4.200/mês</span>
              <div className="testi-quote">&ldquo;</div>
              <p className="testi-text">
                Trabalho de casa. A Startzy me deu estrutura para montar renda real.
              </p>
              <div className="testi-author">
                <div className="testi-avatar">JP</div>
                <div>
                  <div className="testi-name">Juliana Pereira</div>
                  <div className="testi-role">Designer · Startzy desde Mar/24</div>
                </div>
              </div>
            </div>
            <div className="testi-card reveal reveal-delay-2">
              <span className="testi-result">+R$9.100/mês</span>
              <div className="testi-quote">&ldquo;</div>
              <p className="testi-text">
                Não preciso caçar cliente — a plataforma já entrega quem precisa. Domínio digital
                puro.
              </p>
              <div className="testi-author">
                <div className="testi-avatar">RF</div>
                <div>
                  <div className="testi-name">Ricardo Fontes</div>
                  <div className="testi-role">Empreendedor · Startzy desde Nov/23</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="precos">
        <div className="pricing-section">
          <div className="pricing-header reveal">
            <div className="section-label">Planos</div>
            <h2 className="section-title">
              Comece grátis. <em>Escale quando quiser.</em>
            </h2>
          </div>
          <div className="pricing-grid">
            <div className="price-card reveal">
              <div className="price-plan">Starter</div>
              <div className="price-val">
                <span>R$</span>47<sub>/mês</sub>
              </div>
              <div className="price-desc">Para quem está começando e quer validar o modelo.</div>
              <div className="price-divider" />
              <ul className="price-features">
                <li>
                  <span className="check">✓</span> Até 10 sites ativos
                </li>
                <li>
                  <span className="check">✓</span> 20 edições IA/mês
                </li>
                <li>
                  <span className="check">✓</span> 20 prospecções/mês
                </li>
                <li>
                  <span className="check">✓</span> Templates premium
                </li>
                <li>
                  <span className="check">✓</span> Suporte via chat
                </li>
              </ul>
              <Link href="/cadastro?plano=starter" className="btn-plan">
                Começar com Starter
              </Link>
            </div>

            <div className="price-card popular reveal reveal-delay-1">
              <span className="price-popular-badge">Mais popular</span>
              <div className="price-plan accent">Pro</div>
              <div className="price-val">
                <span>R$</span>97<sub>/mês</sub>
              </div>
              <div className="price-desc">Para quem quer escalar e construir receita real.</div>
              <div className="price-divider" />
              <ul className="price-features">
                <li>
                  <span className="check">✓</span> Até 50 sites ativos
                </li>
                <li>
                  <span className="check">✓</span> IA Editorial ilimitada
                </li>
                <li>
                  <span className="check">✓</span> 100 prospecções/mês
                </li>
                <li>
                  <span className="check">✓</span> SEO automático completo
                </li>
                <li>
                  <span className="check">✓</span> Domínio personalizado
                </li>
                <li>
                  <span className="check">✓</span> Suporte prioritário 24h
                </li>
                <li>
                  <span className="check">✓</span> Relatórios de performance
                </li>
                <li>
                  <span className="check">✓</span> Programa de afiliados
                </li>
              </ul>
              <Link href="/cadastro?plano=pro" className="btn-plan primary">
                Quero o Plano Pro →
              </Link>
            </div>

            <div className="price-card reveal reveal-delay-2">
              <div className="price-plan">Agency</div>
              <div className="price-val">
                <span>R$</span>197<sub>/mês</sub>
              </div>
              <div className="price-desc">Para agências que querem dominar o mercado local.</div>
              <div className="price-divider" />
              <ul className="price-features">
                <li>
                  <span className="check">✓</span> Sites ilimitados
                </li>
                <li>
                  <span className="check">✓</span> IA Editorial ilimitada
                </li>
                <li>
                  <span className="check">✓</span> Prospecção ilimitada
                </li>
                <li>
                  <span className="check">✓</span> Marca branca (white label)
                </li>
                <li>
                  <span className="check">✓</span> Sub-contas para equipe
                </li>
                <li>
                  <span className="check">✓</span> Gerente de conta exclusivo
                </li>
                <li>
                  <span className="check">✓</span> Integrações via API
                </li>
                <li>
                  <span className="check">✓</span> Programa de afiliados
                </li>
              </ul>
              <Link href="/cadastro?plano=agency" className="btn-plan">
                Falar com consultor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="awakening">
        <div className="awakening-inner">
          <div className="awakening-kicker">// comece agora</div>
          <h2 className="awakening-title reveal">
            Daqui a 1 ano você vai
            <br />
            estar no mesmo lugar
            <br />
            <em>ou muito além.</em>
          </h2>
          <p className="awakening-body reveal reveal-delay-1">
            A diferença é a decisão de{" "}
            <strong>agir quando a oportunidade está na sua frente</strong>. O mercado está aberto. A
            plataforma está pronta.
            <br />
            <br />
            <strong>Falta só você.</strong>
          </p>
          <div className="reveal reveal-delay-2">
            <Link href="/cadastro" className="awakening-btn">
              Começar grátis agora
              <span style={{ fontSize: 20 }}>→</span>
            </Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Image
                src="/logo-startzy.svg"
                alt="Startzy"
                width={140}
                height={40}
                className="footer-logo-svg"
              />
              <p>Crie sites com IA e fature como agência digital.</p>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Produto</div>
              <a href="#features">Recursos</a>
              <a href="#precos">Planos</a>
              <a href="#solucao">Como funciona</a>
              <Link href="/cadastro">Cadastro</Link>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Suporte</div>
              <a href="https://vmsdigital.com.br/suporte">Central de ajuda</a>
              <a href="mailto:contato@vmsdigital.com.br">Contato</a>
              <a href="#">FAQ</a>
              <a href="#">Status</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Legal</div>
              <a href="#">Termos de uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Cookies</a>
              <a href="#">LGPD</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">
              © 2025 <strong>Startzy</strong> — Todos os direitos reservados.
            </div>
            <div className="footer-social">
              <a href="#" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" title="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
              <a href="#" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" title="Twitter">
                <span style={{ fontWeight: 800, fontSize: "14px" }}>X</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
