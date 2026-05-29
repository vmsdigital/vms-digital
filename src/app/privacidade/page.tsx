"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUp, Shield } from "lucide-react";

const sections = [
  { id: "secao-1", label: "Dados que Coletamos" },
  { id: "secao-2", label: "Como Usamos os Dados" },
  { id: "secao-3", label: "Compartilhamento de Dados" },
  { id: "secao-4", label: "Armazenamento e Segurança" },
  { id: "secao-5", label: "Direitos do Titular" },
  { id: "secao-6", label: "Retenção de Dados" },
  { id: "secao-7", label: "Menores de Idade" },
  { id: "secao-8", label: "Alterações na Política" },
  { id: "secao-9", label: "Contato" },
];

export default function PrivacidadePage() {
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
              <Shield className="w-5 h-5 text-lime-400" />
            </div>
            <span className="text-sm font-medium text-lime-400 tracking-wide uppercase">Privacidade</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Política de <span className="text-lime-400">Privacidade</span>
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
              Dados que Coletamos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-4">
              A Startzy, operadora da plataforma Startzy, coleta e processa dados pessoais necessários para a prestação de nossos serviços. Os dados coletados se enquadram nas seguintes categorias:
            </p>

            <h3 className="text-base font-medium text-vms-texto mb-2 mt-6">
              1.1 Dados Pessoais
            </h3>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1 mb-4">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Nome completo e nome social</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Endereço de e-mail</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Número de telefone e WhatsApp</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>CPF ou CNPJ (para fins de cobrança)</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Endereço comercial ou residencial</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Informações de pagamento processadas por nossos parceiros</li>
            </ul>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              1.2 Dados de Uso
            </h3>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1 mb-4">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Páginas visitadas e tempo de permanência</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Funcionalidades utilizadas na plataforma</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Ações realizadas (criação, edição, publicação de sites)</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Interações com suporte e chat</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Histórico de transações e assinaturas</li>
            </ul>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              1.3 Dados Técnicos
            </h3>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Endereço IP e localização aproximada</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Tipo e versão do navegador</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Sistema operacional e resolução de tela</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Dados de cookies e tecnologias similares</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Identificador único do dispositivo</li>
            </ul>
          </section>

          <section id="secao-2" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">2</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Como Usamos os Dados
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Utilizamos seus dados pessoais para as seguintes finalidades:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Prestação e manutenção dos serviços contratados</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Criação e gerenciamento de sua conta</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Processamento de pagamentos e cobranças</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Comunicação sobre atualizações, novidades e suporte</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Melhoria contínua da plataforma e experiência do usuário</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Prevenção de fraudes e garantia da segurança do sistema</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Cumprimento de obrigações legais e regulatórias</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Geração de relatórios agregados e anônimos para análise de desempenho</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Personalização da experiência de uso</li>
            </ul>
          </section>

          <section id="secao-3" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">3</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Compartilhamento de Dados
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy não vende, aluga ou comercializa seus dados pessoais. Podemos compartilhar informações apenas nas seguintes situações:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Processadores de pagamento:</span> dados necessários para processar transações financeiras</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Provedores de infraestrutura:</span> serviços de hospedagem e CDN para operação da plataforma</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Ferramentas de análise:</span> serviços de métricas com dados anonimizados quando possível</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Obrigações legais:</span> quando exigido por lei, decisão judicial ou requisição de autoridade competente</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Proteção de direitos:</span> para proteger os direitos, a segurança ou a propriedade da Startzy ou de terceiros</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Todos os terceiros com quem compartilhamos dados estão sujeitos a acordos de confidencialidade e processamento de dados em conformidade com a LGPD.
            </p>
          </section>

          <section id="secao-4" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">4</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Armazenamento e Segurança
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado, destruição, perda, alteração ou tratamento indevido. Nossas medidas incluem:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Criptografia de dados em trânsito (TLS/SSL) e em repouso</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Controle de acesso baseado em funções e privilégios mínimos</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Monitoramento contínuo de segurança e detecção de intrusão</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Backups regulares com criptografia e redundância geográfica</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Auditorias periódicas de segurança</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Treinamento de equipe em proteção de dados</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Seus dados são armazenados em servidores localizados no Brasil, utilizando provedores de infraestrutura de alta confiabilidade.
            </p>
          </section>

          <section id="secao-5" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">5</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Direitos do Titular
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você possui os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Acesso:</span> solicitar cópia dos dados pessoais que mantemos sobre você</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Correção:</span> solicitar a correção de dados incompletos, inexatos ou desatualizados</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Exclusão:</span> solicitar a eliminação dos dados pessoais tratados com base no seu consentimento</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Portabilidade:</span> solicitar a transferência dos seus dados a outro fornecedor de serviço</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Revogação do consentimento:</span> retirar seu consentimento a qualquer momento para tratamentos baseados nesta fundamentação</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Oposição:</span> opor-se ao tratamento de dados em determinadas circunstâncias</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span><span className="text-vms-texto font-medium">Informação:</span> ser informado sobre as entidades com as quais compartilhamos seus dados</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Para exercer qualquer um destes direitos, entre em contato conosco através do e-mail contato@startzy.com.br. Responderemos sua solicitação no prazo de até 15 dias úteis.
            </p>
          </section>

          <section id="secao-6" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">6</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Retenção de Dados
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Seus dados pessoais serão mantidos pelo tempo necessário para cumprir as finalidades para as quais foram coletados, incluindo:
            </p>
            <ul className="list-none text-vms-texto-2 space-y-2 ml-1">
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Dados de conta: mantidos enquanto a conta estiver ativa e por até 30 dias após o cancelamento</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Dados financeiros: mantidos pelo prazo mínimo exigido pela legislação tributária e contábil (5 anos)</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Dados de uso: mantidos por até 2 anos para fins de análise e melhoria dos serviços</li>
              <li className="flex items-start gap-2"><span className="text-lime-400 mt-1.5 text-[8px]">●</span>Logs de acesso: mantidos por até 6 meses conforme o Marco Civil da Internet</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Após o período de retenção, os dados serão eliminados de forma segura ou anonimizados, salvo quando houver base legal para sua manutenção.
            </p>
          </section>

          <section id="secao-7" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">7</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Menores de Idade
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              A plataforma Startzy não é destinada a menores de 18 anos. Não coletamos intencionalmente dados pessoais de menores de idade. Caso tomemos conhecimento de que coletamos dados de um menor, providenciaremos a exclusão imediata dessas informações. Se você é pai, mãe ou responsável e acredita que seu filho forneceu dados pessoais a nós, entre em contato através do e-mail contato@startzy.com.br.
            </p>
          </section>

          <section id="secao-8" className="relative pl-10 border-l-2 border-lime-400/20 mb-12 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">8</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Alterações na Política
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas serão comunicadas por e-mail ou por aviso destacado na plataforma. A data da última atualização será sempre indicada no topo desta página. Recomendamos que você revise esta política regularmente para se manter informado sobre como protegemos seus dados.
            </p>
          </section>

          <section id="secao-9" className="relative pl-10 border-l-2 border-lime-400/20 scroll-mt-24">
            <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-full bg-lime-400/10 border-2 border-lime-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.15)]">
              <span className="text-lime-400 text-sm font-bold">9</span>
            </div>
            <h2 className="text-xl font-semibold text-vms-texto mb-4">
              Contato
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Para dúvidas, solicitações ou reclamações relacionadas a esta Política de Privacidade ou ao tratamento de seus dados pessoais, entre em contato:
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
