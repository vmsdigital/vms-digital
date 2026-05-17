"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Sparkles,
  Search,
  LayoutGrid,
  TrendingUp,
  ArrowRight,
  Check,
  Zap,
  Globe,
  Users,
  Crown,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Geração com IA",
    desc: "Crie sites profissionais em minutos com inteligência artificial. Basta descrever o negócio e a IA faz o resto.",
  },
  {
    icon: Search,
    title: "Prospecção Inteligente",
    desc: "Encontre clientes potenciais na sua região com busca por segmento e raio de distância.",
  },
  {
    icon: LayoutGrid,
    title: "Templates Prontos",
    desc: "Biblioteca de templates por nicho para criar sites rapidamente com visual profissional.",
  },
  {
    icon: TrendingUp,
    title: "Programa de Afiliados",
    desc: "Ganhe 30% de comissão em cada indicação. Monetize sua rede de contatos.",
  },
];

const steps = [
  {
    num: "01",
    title: "Cadastre-se grátis",
    desc: "Crie sua conta em segundos e comece a explorar a plataforma.",
  },
  {
    num: "02",
    title: "Crie com IA",
    desc: "Descreva o negócio, escolha o nicho e deixe a IA gerar um site completo.",
  },
  {
    num: "03",
    title: "Venda seu site",
    desc: "Publique, envie propostas e comece a faturar com seus sites profissionais.",
  },
];

const planos = [
  {
    nome: "Gratuito",
    preco: "0",
    features: ["2 sites", "1 prospecção/mês", "5 edições IA", "Sem afiliados"],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    nome: "Starter",
    preco: "47",
    features: ["10 sites", "20 prospecções/mês", "20 edições IA", "Sem afiliados"],
    cta: "Assinar Starter",
    highlight: false,
  },
  {
    nome: "Pro",
    preco: "97",
    features: ["50 sites", "100 prospecções/mês", "Edições IA ilimitadas", "Programa de afiliados"],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    nome: "Agency",
    preco: "197",
    features: ["Sites ilimitados", "Prospecções ilimitadas", "Edições IA ilimitadas", "Programa de afiliados"],
    cta: "Assinar Agency",
    highlight: false,
  },
];

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("animate-fade-in-up");
              entry.target.classList.remove("opacity-0", "translate-y-5");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`opacity-0 translate-y-5 transition-all duration-700 ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-vms-fundo text-vms-texto-2">
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-vms-fundo/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold text-vms-primaria text-glow">VMS</span>
            <span className="text-xl font-bold text-vms-dark-5">DIGITAL</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#funcionalidades" className="text-sm text-vms-muted hover:text-vms-texto transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-sm text-vms-muted hover:text-vms-texto transition-colors">Como funciona</a>
            <a href="#planos" className="text-sm text-vms-muted hover:text-vms-texto transition-colors">Planos</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-vms-muted hover:text-vms-texto transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-xl bg-vms-primaria px-5 py-2 text-sm font-semibold text-black hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110 transition-all"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-vms-primaria/[0.07] blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-vms-primaria/[0.04] blur-[100px]" />
        <div className="absolute right-1/4 top-1/3 h-[250px] w-[250px] rounded-full bg-vms-blue/[0.03] blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center">
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-vms-primaria">
            <Zap size={12} className="animate-pulse" />
            Plataforma de sites com IA
          </div>
          <h1 className="animate-fade-in-up mx-auto max-w-4xl text-4xl font-bold leading-tight text-vms-texto sm:text-5xl lg:text-6xl" style={{ animationDelay: "0.1s" }}>
            Crie sites profissionais com{" "}
            <span className="text-vms-primaria text-glow">IA</span> em minutos
          </h1>
          <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-vms-muted" style={{ animationDelay: "0.2s" }}>
            A plataforma completa para criar, alugar e vender sites. Gere sites com inteligência artificial, encontre clientes com prospecção inteligente e scale seu negócio digital.
          </p>
          <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: "0.3s" }}>
            <Link
              href="/cadastro"
              className="group inline-flex items-center gap-2 rounded-xl bg-vms-primaria px-8 py-3.5 text-base font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(170,255,0,0.3)] hover:brightness-110"
            >
              Começar grátis
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-medium text-vms-texto-2 backdrop-blur-sm transition-all hover:bg-white/[0.08] hover:border-white/15"
            >
              Ver planos
            </a>
          </div>
          <div className="animate-fade-in-up mt-16 flex items-center justify-center gap-8 text-vms-muted" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2 text-sm">
              <Globe size={16} className="text-vms-primaria" />
              <span>+500 sites criados</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users size={16} className="text-vms-primaria" />
              <span>+200 usuários ativos</span>
            </div>
            <div className="hidden items-center gap-2 text-sm sm:flex">
              <Crown size={16} className="text-vms-primaria" />
              <span>4.9/5 satisfação</span>
            </div>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-vms-texto sm:text-4xl">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mt-4 text-vms-muted">
              Ferramentas poderosas para criar e vender sites profissionais
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <AnimatedSection key={feat.title} delay={idx * 100}>
                  <div className="group rounded-2xl glass-card p-6 transition-all duration-300 hover:border-vms-primaria/20 hover:shadow-[0_0_30px_rgba(170,255,0,0.05)] glass-hover">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-vms-primaria/10 transition-all group-hover:bg-vms-primaria/20 group-hover:shadow-[0_0_15px_rgba(170,255,0,0.1)]">
                      <Icon size={20} className="text-vms-primaria" />
                    </div>
                    <h3 className="mb-2 text-base font-medium text-vms-texto">{feat.title}</h3>
                    <p className="text-sm leading-relaxed text-vms-muted">{feat.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-vms-texto sm:text-4xl">
              Como funciona
            </h2>
            <p className="mt-4 text-vms-muted">
              Três passos simples para começar a faturar
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, idx) => (
              <AnimatedSection key={step.num} delay={idx * 150}>
                <div className="relative text-center">
                  {idx < steps.length - 1 && (
                    <div className="absolute top-10 left-1/2 hidden h-px w-full bg-gradient-to-r from-vms-primaria/20 to-transparent md:block" />
                  )}
                  <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl glass animate-pulse-glow">
                    <span className="text-2xl font-bold text-vms-primaria text-glow">{step.num}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-vms-texto">{step.title}</h3>
                  <p className="text-sm text-vms-muted">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-vms-texto sm:text-4xl">
              Planos para todos os tamanhos
            </h2>
            <p className="mt-4 text-vms-muted">
              Comece grátis e faça upgrade conforme cresce
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {planos.map((plano, idx) => (
              <AnimatedSection key={plano.nome} delay={idx * 100}>
                <div
                  className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                    plano.highlight
                      ? "glass glow-primaria border-vms-primaria/30"
                      : "glass-card hover:border-vms-primaria/15"
                  }`}
                >
                  {plano.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-vms-primaria px-4 py-1 text-xs font-bold text-black uppercase shadow-[0_0_15px_rgba(170,255,0,0.3)]">
                      Mais popular
                    </span>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-vms-texto">{plano.nome}</h3>
                    <div className="mt-3">
                      <span className="text-4xl font-bold text-vms-texto">R${plano.preco}</span>
                      {plano.preco !== "0" && (
                        <span className="text-vms-muted">/mês</span>
                      )}
                    </div>
                  </div>
                  <ul className="mb-8 flex flex-1 flex-col gap-3">
                    {plano.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-vms-texto-2">
                        <Check size={14} className="shrink-0 text-vms-primaria" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/cadastro"
                    className={`w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-all ${
                      plano.highlight
                        ? "bg-vms-primaria text-black hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110"
                        : "bg-white/5 text-vms-texto-2 hover:bg-white/[0.08] border border-white/5"
                    }`}
                  >
                    {plano.cta}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <AnimatedSection>
            <div className="rounded-2xl glass glow-primaria-sm p-12">
              <h2 className="text-3xl font-bold text-vms-texto sm:text-4xl">
                Pronto para criar seu primeiro site?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-vms-muted">
                Comece gratuitamente e veja como é fácil criar sites profissionais com inteligência artificial.
              </p>
              <Link
                href="/cadastro"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-vms-primaria px-8 py-3.5 text-base font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(170,255,0,0.3)] hover:brightness-110"
              >
                Começar grátis
                <ArrowRight size={18} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-vms-primaria text-glow">VMS</span>
              <span className="text-xl font-bold text-vms-dark-5">DIGITAL</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-vms-muted">
              <a href="#funcionalidades" className="hover:text-vms-texto transition-colors">Funcionalidades</a>
              <a href="#planos" className="hover:text-vms-texto transition-colors">Planos</a>
              <a href="#como-funciona" className="hover:text-vms-texto transition-colors">Como funciona</a>
            </div>
            <p className="text-xs text-vms-dark-5">
              &copy; {new Date().getFullYear()} VMS Digital. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
