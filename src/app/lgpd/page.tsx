"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function LGPDPage() {
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
            LGPD — Lei Geral de Proteção de Dados
          </h1>
          <p className="text-sm text-vms-texto-2 mb-8">
            Última atualização: Maio de 2026
          </p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              1. O Que É a LGPD
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), conhecida como LGPD, é a legislação brasileira que regula o tratamento de dados pessoais de indivíduos no Brasil. Ela estabelece direitos, obrigações e bases legais para que organizações possam coletar, armazenar, processar e compartilhar dados pessoais.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              A Startzy está plenamente comprometida com o cumprimento da LGPD e com a proteção dos dados pessoais de seus usuários, clientes e visitantes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              2. Base Legal para Tratamento
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              O tratamento de dados pessoais pela Startzy é fundamentado nas seguintes bases legais previstas na LGPD (Art. 7º):
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">Consentimento (Art. 7º, I):</span> quando você autoriza expressamente o tratamento para finalidades específicas, como comunicações de marketing</li>
              <li><span className="text-vms-texto font-medium">Execução de contrato (Art. 7º, V):</span> para prestação dos serviços contratados, como criação e hospedagem de sites</li>
              <li><span className="text-vms-texto font-medium">Legítimo interesse (Art. 7º, IX):</span> para melhoria dos serviços, prevenção de fraudes e segurança da plataforma, sempre respeitando seus direitos e liberdades</li>
              <li><span className="text-vms-texto font-medium">Cumprimento de obrigação legal (Art. 7º, II):</span> quando exigido por lei, como obrigações fiscais e contábeis</li>
              <li><span className="text-vms-texto font-medium">Exercício regular de direitos (Art. 7º, VI):</span> para exercício de direitos em processos judiciais ou administrativos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              3. Dados Pessoais Coletados
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Os dados pessoais coletados pela Startzy incluem:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">Dados identificatórios:</span> nome completo, e-mail, telefone, CPF/CNPJ</li>
              <li><span className="text-vms-texto font-medium">Dados de endereço:</span> endereço residencial ou comercial</li>
              <li><span className="text-vms-texto font-medium">Dados de pagamento:</span> informações processadas por gateways de pagamento certificados (não armazenamos dados de cartão)</li>
              <li><span className="text-vms-texto font-medium">Dados técnicos:</span> endereço IP, tipo de navegador, sistema operacional, dados de cookies</li>
              <li><span className="text-vms-texto font-medium">Dados de uso:</span> histórico de navegação, funcionalidades utilizadas, interações com a plataforma</li>
              <li><span className="text-vms-texto font-medium">Dados de comunicação:</span> registros de atendimentos e interações com suporte</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              4. Finalidades do Tratamento
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Seus dados pessoais são tratados para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Criação, autenticação e gerenciamento de conta de usuário</li>
              <li>Prestação dos serviços de criação e hospedagem de sites</li>
              <li>Processamento de pagamentos e gestão de assinaturas</li>
              <li>Comunicação sobre o serviço, atualizações e suporte técnico</li>
              <li>Envio de comunicações de marketing (mediante consentimento expresso)</li>
              <li>Melhoria da plataforma e desenvolvimento de novas funcionalidades</li>
              <li>Prevenção de fraudes e garantia da segurança do sistema</li>
              <li>Geração de relatórios e métricas agregadas e anonimizadas</li>
              <li>Cumprimento de obrigações legais e regulatórias</li>
              <li>Personalização da experiência de uso na plataforma</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              5. Compartilhamento com Terceiros
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy pode compartilhar dados pessoais com terceiros apenas nas seguintes hipóteses:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">Processadores de pagamento:</span> Stripe, PagSeguro e similares para processar transações financeiras</li>
              <li><span className="text-vms-texto font-medium">Provedores de infraestrutura:</span> Vercel, Cloudflare e similares para hospedagem e segurança</li>
              <li><span className="text-vms-texto font-medium">Ferramentas de análise:</span> Google Analytics e similares para métricas de uso (dados anonimizados)</li>
              <li><span className="text-vms-texto font-medium">Autoridades públicas:</span> quando exigido por lei, decisão judicial ou requisição de autoridade competente</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Todos os terceiros são contratualmente obrigados a tratar os dados em conformidade com a LGPD e mediante assinatura de Termo de Confidencialidade e Contrato de Processamento de Dados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              6. Direitos do Titular
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Conforme o Art. 18 da LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">Confirmação da existência de tratamento:</span> saber se seus dados estão sendo tratados pela Startzy</li>
              <li><span className="text-vms-texto font-medium">Acesso aos dados:</span> obter cópia dos dados pessoais que mantemos sobre você</li>
              <li><span className="text-vms-texto font-medium">Correção:</span> solicitar a correção de dados incompletos, inexatos ou desatualizados</li>
              <li><span className="text-vms-texto font-medium">Anonimização, bloqueio ou eliminação:</span> solicitar tratamento de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD</li>
              <li><span className="text-vms-texto font-medium">Portabilidade:</span> solicitar a migração dos seus dados a outro fornecedor de serviço ou produto</li>
              <li><span className="text-vms-texto font-medium">Eliminação dos dados tratados com consentimento:</span> solicitar a exclusão de dados cujo tratamento se baseia no seu consentimento</li>
              <li><span className="text-vms-texto font-medium">Informação sobre compartilhamento:</span> obter informação sobre as entidades públicas e privadas com as quais compartilhamos seus dados</li>
              <li><span className="text-vms-texto font-medium">Revogação do consentimento:</span> retirar seu consentimento a qualquer momento, sem comprometer a licitude do tratamento anterior</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              7. Como Exercer Seus Direitos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Para exercer qualquer um dos direitos previstos na LGPD, você pode:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Enviar um e-mail para contato@startzy.com.br com o assunto &quot;Exercício de Direitos LGPD&quot;</li>
              <li>Utilizar o formulário de contato disponível na plataforma</li>
              <li>Entrar em contato com nosso Encarregado de Dados (DPO)</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              As solicitações serão atendidas no prazo de até 15 dias úteis, conforme previsto na LGPD. Poderemos solicitar informações adicionais para verificar sua identidade antes de processar o pedido, garantindo a segurança dos seus dados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              8. Encarregado de Dados (DPO)
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy designou um Encarregado de Proteção de Dados (DPO) responsável por receber comunicações, supervisionar o cumprimento da LGPD e tratar solicitações dos titulares.
            </p>
            <div className="rounded-[12px] border border-vms-glass-border bg-vms-glass-hover p-4 mt-3">
              <p className="text-vms-texto-2">
                <span className="text-vms-texto font-medium">Encarregado de Dados (DPO)</span>
              </p>
              <p className="text-vms-texto-2 mt-1">
                <span className="text-vms-primaria font-medium">E-mail:</span> contato@startzy.com.br
              </p>
              <p className="text-vms-texto-2 mt-1">
                <span className="text-vms-primaria font-medium">Assunto:</span> LGPD — Encarregado de Dados
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              9. Medidas de Segurança
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Em conformidade com o Art. 46 da LGPD, adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações de destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Criptografia de ponta a ponta para dados em trânsito (TLS 1.3)</li>
              <li>Criptografia AES-256 para dados em repouso</li>
              <li>Autenticação multifator (MFA) disponível para usuários</li>
              <li>Controle de acesso baseado em funções (RBAC)</li>
              <li>Monitoramento contínuo e detecção de anomalias</li>
              <li>Backups criptografados com redundância geográfica</li>
              <li>Testes de penetração e auditorias de segurança periódicas</li>
              <li>Política de segurança da informação e treinamento de equipe</li>
              <li>Plano de resposta a incidentes com notificação à ANPD quando aplicável</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              10. Retenção de Dados
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Os dados pessoais são retidos pelo período necessário para cumprir as finalidades para as quais foram coletados, observados os seguintes prazos:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">Dados de conta:</span> enquanto a conta estiver ativa e por 30 dias após solicitação de exclusão</li>
              <li><span className="text-vms-texto font-medium">Dados financeiros:</span> pelo prazo mínimo de 5 anos, conforme obrigação legal tributária e contábil</li>
              <li><span className="text-vms-texto font-medium">Dados de uso e navegação:</span> por até 2 anos, para fins de melhoria dos serviços</li>
              <li><span className="text-vms-texto font-medium">Logs de acesso:</span> por até 6 meses, conforme o Marco Civil da Internet (Lei nº 12.965/2014)</li>
              <li><span className="text-vms-texto font-medium">Dados de marketing:</span> até a revogação do consentimento</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Após o término do período de retenção, os dados são eliminados de forma segura ou anonimizados de forma irreversível.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              11. Alterações
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Esta página pode ser atualizada periodicamente para refletir mudanças em nossas práticas de tratamento de dados ou alterações na legislação aplicável. Alterações significativas serão comunicadas por e-mail ou por aviso destacado na plataforma. A data da última atualização será sempre indicada no topo desta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              12. Contato
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Para dúvidas, solicitações ou reclamações relacionadas ao tratamento de dados pessoais ou ao cumprimento da LGPD, entre em contato:
            </p>
            <p className="text-vms-texto-2 leading-relaxed mt-2">
              <span className="text-vms-primaria font-medium">E-mail:</span> contato@startzy.com.br
            </p>
            <p className="text-vms-texto-2 leading-relaxed mt-1">
              <span className="text-vms-primaria font-medium">Assunto:</span> LGPD — Proteção de Dados
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
