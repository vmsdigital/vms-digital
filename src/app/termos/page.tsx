"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUp, FileText } from "lucide-react";

const sections = [
  { id: "secao-1", label: "Aceitação dos Termos" },
  { id: "secao-2", label: "Descrição do Serviço" },
  { id: "secao-3", label: "Cadastro e Conta" },
  { id: "secao-4", label: "Uso Aceitável" },
  { id: "secao-5", label: "Propriedade Intelectual" },
  { id: "secao-6", label: "Pagamentos e Planos" },
  { id: "secao-7", label: "Cancelamento" },
  { id: "secao-8", label: "Limitação de Responsabilidade" },
  { id: "secao-9", label: "Alterações nos Termos" },
  { id: "secao-10", label: "Legislação Aplicável" },
  { id: "secao-11", label: "Contato" },
];

export default function TermosPage() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [activeSection, setActiveSection] = useState("secao-1");

  useEffect(() => {
    const onScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-vms-fundo text-vms-texto">
      <header className="border-b border-vms-borda bg-vms-fundo/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-vms-texto-2 hover:text-lime-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          <Image
            src="/logo-startzy.svg"
            alt="Startzy"
            width={100}
            height={28}
            className="object-contain"
            priority
          />
          <div className="w-20" />
        </div>
      </header>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-400/5 via-lime-400/[0.02] to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-lime-400/[0.07] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 pt-14 pb-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-lime-400" />
            </div>
            <span className="text-sm font-medium text-lime-400 tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Termos de <span className="text-lime-400">Uso</span>
          </h1>
          <p className="text-sm text-vms-texto-2">
            Última atualização: Maio de 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="glass rounded-[18px] p-5 border border-vms-borda">
          <p className="text-xs font-medium text-vms-texto-2 mb-3 uppercase tracking-wider">Sumário</p>
          <nav className="flex flex-wrap gap-2">
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeSection === s.id
                    ? "bg-lime-400/15 text-lime-400 border border-lime-400/30"
                    : "bg-vms-fundo/50 text-vms-texto-2 border border-transparent hover:bg-vms-fundo hover:text-vms-texto"
                }`}
              >
                <span className="text-lime-400/60 mr-1">{i + 1}.</span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="glass rounded-[18px] p-8 md:p-12 border border-vms-borda relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/[0.03] rounded-full blur-[80px] pointer-events-none" />

          <section id="secao-1" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">1</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Aceitação dos Termos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Ao acessar ou utilizar a plataforma Startzy, operada pela Startzy, você concorda com estes Termos de Uso em sua integralidade. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              O uso continuado da plataforma após a publicação de alterações nestes termos constitui sua aceitação das modificações realizadas. Recomendamos que você revise esta página periodicamente.
            </p>
          </section>

          <section id="secao-2" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">2</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Descrição do Serviço
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy é uma plataforma SaaS que permite a criação, gerenciamento e publicação de sites e landing pages profissionais. Nosso serviço inclui, mas não se limita a:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Criação de sites com templates personalizáveis</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Gerenciamento de domínios e hospedagem</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Ferramentas de prospecção e gestão de clientes</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Painel do cliente para acompanhamento de projetos</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Integrações com serviços de pagamento e comunicação</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Relatórios e métricas de desempenho</li>
            </ul>
          </section>

          <section id="secao-3" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">3</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Cadastro e Conta
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Para utilizar os serviços da Startzy, você deve criar uma conta fornecendo informações verdadeiras, completas e atualizadas. Você é responsável por:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Manter a confidencialidade de suas credenciais de acesso</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Todas as atividades realizadas em sua conta</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Notificar imediatamente qualquer uso não autorizado</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Manter seus dados cadastrais atualizados</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              A Startzy reserva-se o direito de suspender ou encerrar contas que violem estes termos ou que apresentem atividades suspeitas.
            </p>
          </section>

          <section id="secao-4" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">4</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Uso Aceitável
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Você se compromete a utilizar a plataforma de forma ética e em conformidade com a legislação brasileira. É expressamente proibido:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Publicar conteúdo ilegal, difamatório, obsceno ou prejudicial</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Violar direitos de propriedade intelectual de terceiros</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Distribuir malware, vírus ou código malicioso</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Realizar tentativas de acesso não autorizado ao sistema</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Utilizar a plataforma para spam ou comunicações não solicitadas</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Interferir no funcionamento adequado da plataforma</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Criar contas falsas ou se passar por terceiros</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Coletar dados pessoais de outros usuários sem autorização</li>
            </ul>
          </section>

          <section id="secao-5" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">5</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Propriedade Intelectual
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Todo o conteúdo da plataforma Startzy, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, clipes de áudio, código-fonte e software, é de propriedade da Startzy ou de seus licenciadores e está protegido pelas leis brasileiras de propriedade intelectual.
            </p>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              O conteúdo publicado por você em seus sites permanece de sua propriedade. Ao publicar conteúdo através da plataforma, você concede à Startzy uma licença limitada para hospedar, exibir e distribuir tal conteúdo exclusivamente para a prestação dos serviços contratados.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              Os templates oferecidos na plataforma são licenciados para uso dentro da Startzy e não podem ser redistribuídos ou revendidos separadamente.
            </p>
          </section>

          <section id="secao-6" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">6</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Pagamentos e Planos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              O uso da plataforma está sujeito à contratação de um plano pago, conforme opções disponíveis no momento da assinatura. As condições de pagamento incluem:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Os valores dos planos são divulgados em nossa página de preços e podem ser alterados com aviso prévio de 30 dias</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Cobranças são realizadas de forma recorrente conforme o ciclo escolhido (mensal ou anual)</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Falhas no pagamento podem resultar na suspensão temporária dos serviços</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Planos anuais não são reembolsáveis proporcionalmente após o período de garantia de 7 dias</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Impostos e taxas aplicáveis estão incluídos nos valores divulgados</li>
            </ul>
          </section>

          <section id="secao-7" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">7</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Cancelamento
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta ou entrando em contato com nosso suporte. Ao cancelar:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Seu acesso aos serviços continuará até o final do período já pago</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Seus sites poderão ser despublicados ao término do período contratado</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Você terá um prazo de 30 dias após o vencimento para exportar seus dados</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Após 30 dias do vencimento, os dados poderão ser permanentemente excluídos</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              A Startzy reserva-se o direito de cancelar contas que violem estes termos, sem direito a reembolso de valores já pagos.
            </p>
          </section>

          <section id="secao-8" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">8</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Limitação de Responsabilidade
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy não se responsabiliza por:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Indisponibilidade temporária do serviço por motivos de manutenção ou falhas técnicas</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Perda de dados resultante de casos fortuitos ou força maior</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Conteúdo publicado por usuários em seus sites</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Danos indiretos, incidentais ou consequenciais decorrentes do uso da plataforma</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Falhas em serviços de terceiros integrados à plataforma</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Lucros cessantes ou oportunidades de negócio não realizadas</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Nossa responsabilidade total em relação a qualquer reclamação não excederá o valor pago por você nos 12 meses anteriores à ocorrência.
            </p>
          </section>

          <section id="secao-9" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">9</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Alterações nos Termos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy pode modificar estes Termos de Uso a qualquer momento. As alterações significativas serão comunicadas por e-mail ou por aviso destacado na plataforma com pelo menos 15 dias de antecedência.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              O uso continuado da plataforma após a entrada em vigor das alterações constitui aceitação dos novos termos. Se você não concordar com as modificações, deverá cessar o uso da plataforma e cancelar sua conta.
            </p>
          </section>

          <section id="secao-10" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">10</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Legislação Aplicável
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa relacionada a estes termos será submetida ao foro da comarca da sede da Startzy, com exclusão de qualquer outro, por mais privilegiado que seja.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              Em caso de conflito entre estes termos e a legislação brasileira, prevalecerá a legislação aplicável, especialmente o Código de Defesa do Consumidor, o Marco Civil da Internet e a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>

          <section id="secao-11" className="relative pl-10 border-l-2 border-lime-400/20 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">11</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Contato
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em contato conosco:
            </p>
            <p className="text-vms-texto-2 leading-relaxed mt-2">
              <span className="text-vms-primaria font-medium">E-mail:</span> contato@startzy.com.br
            </p>
          </section>
        </div>
      </div>

      <p className="text-center text-vms-texto-2 text-xs pb-10">
        © {new Date().getFullYear()} Startzy. Todos os direitos reservados.
      </p>

      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-lime-400 text-vms-fundo font-semibold text-sm shadow-lg shadow-lime-400/20 hover:brightness-110 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <ArrowUp className="w-4 h-4" />
          Voltar ao topo
        </button>
      )}
    </div>
  );
}
