"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-vms-fundo px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-vms-texto-2 hover:text-vms-primaria transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Voltar ao início</span>
        </Link>

        <div className="flex justify-center mb-10">
          <Image
            src="/logo-startzy.svg"
            alt="Startzy"
            width={200}
            height={56}
            priority
          />
        </div>

        <div className="glass rounded-[18px] p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-vms-texto mb-2">
            Política de Cookies
          </h1>
          <p className="text-sm text-vms-texto-2 mb-8">
            Última atualização: Maio de 2026
          </p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              1. O Que São Cookies
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou smartphone) quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente, além de fornecer informações aos proprietários do site.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              Os cookies permitem que um site reconheça o seu dispositivo e lembre informações sobre a sua visita, como suas preferências e configurações. Eles podem ser persistentes (permanecem no dispositivo até expirarem ou serem excluídos) ou de sessão (são excluídos quando você fecha o navegador).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              2. Tipos de Cookies que Usamos
            </h2>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              2.1 Cookies Essenciais
            </h3>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Estes cookies são estritamente necessários para o funcionamento da plataforma Startzy. Sem eles, serviços como autenticação, segurança e acesso a áreas protegidas não seriam possíveis. Eles não armazenam informações pessoais identificáveis.
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2 mb-5">
              <li><span className="text-vms-texto font-medium">session_id</span> — identifica sua sessão autenticada na plataforma</li>
              <li><span className="text-vms-texto font-medium">csrf_token</span> — protege contra ataques de falsificação de solicitação entre sites</li>
              <li><span className="text-vms-texto font-medium">auth_token</span> — mantém seu login ativo entre visitas</li>
              <li><span className="text-vms-texto font-medium">cookie_consent</span> — registra sua preferência sobre o uso de cookies</li>
            </ul>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              2.2 Cookies de Performance
            </h3>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Estes cookies coletam informações sobre como os visitantes utilizam a plataforma, permitindo-nos otimizar a experiência de uso. Todos os dados são agregados e anônimos.
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2 mb-5">
              <li><span className="text-vms-texto font-medium">_ga / _ga_*</span> — Google Analytics: métricas de visitação e comportamento</li>
              <li><span className="text-vms-texto font-medium">_ym_uid / _ym_is</span> — Yandex Metrica: análise de tráfego</li>
              <li><span className="text-vms-texto font-medium">page_load_time</span> — monitora o tempo de carregamento das páginas</li>
            </ul>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              2.3 Cookies de Funcionalidade
            </h3>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Estes cookies permitem que a plataforma lembre suas escolhas e preferências para oferecer uma experiência mais personalizada.
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2 mb-5">
              <li><span className="text-vms-texto font-medium">theme_preference</span> — armazena sua preferência de tema (claro/escuro)</li>
              <li><span className="text-vms-texto font-medium">language</span> — registra o idioma selecionado</li>
              <li><span className="text-vms-texto font-medium">layout_settings</span> — salva configurações de layout do painel</li>
              <li><span className="text-vms-texto font-medium">recent_sites</span> — lembra os sites acessados recentemente</li>
            </ul>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              2.4 Cookies de Publicidade
            </h3>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Estes cookies são utilizados para entregar anúncios mais relevantes para você e medir a eficácia de nossas campanhas publicitárias. Eles podem ser definidos por nós ou por nossos parceiros de publicidade.
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">_fbp / _fbc</span> — Meta Pixel: rastreamento de conversões de anúncios</li>
              <li><span className="text-vms-texto font-medium">_gcl_au</span> — Google Ads: rastreamento de conversões</li>
              <li><span className="text-vms-texto font-medium">ads_prefs</span> — preferências de publicidade personalizada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              3. Como Gerenciar Cookies
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Você pode controlar e gerenciar cookies de diversas formas. Lembre-se de que a remoção ou o bloqueio de cookies pode impactar sua experiência de uso e algumas funcionalidades da plataforma podem não funcionar corretamente.
            </p>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              3.1 Configurações do Navegador
            </h3>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A maioria dos navegadores permite que você controle cookies através das configurações de preferências. Consulte a documentação do seu navegador para saber como gerenciar cookies:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2 mb-5">
              <li>Google Chrome: Configurações → Privacidade e segurança → Cookies</li>
              <li>Mozilla Firefox: Opções → Privacidade e Segurança → Cookies</li>
              <li>Safari: Preferências → Privacidade → Cookies e dados de sites</li>
              <li>Microsoft Edge: Configurações → Cookies e permissões do site</li>
            </ul>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              3.2 Banner de Consentimento
            </h3>
            <p className="text-vms-texto-2 leading-relaxed">
              Ao acessar a plataforma Startzy pela primeira vez, você será apresentado a um banner de consentimento de cookies, onde poderá aceitar ou recusar categorias específicas de cookies (exceto os essenciais, que são obrigatórios para o funcionamento da plataforma).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              4. Cookies de Terceiros
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Alguns cookies são definidos por serviços de terceiros que aparecem em nossas páginas. Não controlamos a configuração desses cookies e recomendamos que consulte as políticas de privacidade desses terceiros para mais informações:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">Google Analytics / Google Ads</span> — análise de dados e publicidade</li>
              <li><span className="text-vms-texto font-medium">Meta (Facebook)</span> — rastreamento de conversões e publicidade</li>
              <li><span className="text-vms-texto font-medium">Stripe / PagSeguro</span> — processamento de pagamentos</li>
              <li><span className="text-vms-texto font-medium">Cloudflare</span> — segurança e performance</li>
              <li><span className="text-vms-texto font-medium">Vercel</span> — hospedagem e infraestrutura</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              5. Alterações na Política
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Esta Política de Cookies pode ser atualizada periodicamente para refletir mudanças nos cookies que utilizamos ou por razões operacionais, legais ou regulatórias. Alterações significativas serão comunicadas por e-mail ou por aviso destacado na plataforma. A data da última atualização será sempre indicada no topo desta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              6. Contato
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Para dúvidas ou solicitações relacionadas a esta Política de Cookies, entre em contato:
            </p>
            <p className="text-vms-texto-2 leading-relaxed mt-2">
              <span className="text-vms-primaria font-medium">E-mail:</span> contato@startzy.com.br
            </p>
          </section>
        </div>

        <p className="text-center text-vms-texto-2 text-xs mt-8">
          © {new Date().getFullYear()} Startzy. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
