"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadePage() {
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
            Política de Privacidade
          </h1>
          <p className="text-sm text-vms-texto-2 mb-8">
            Última atualização: Maio de 2026
          </p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              1. Dados que Coletamos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-4">
              A Startzy, operadora da plataforma Startzy, coleta e processa dados pessoais necessários para a prestação de nossos serviços. Os dados coletados se enquadram nas seguintes categorias:
            </p>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              1.1 Dados Pessoais
            </h3>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2 mb-4">
              <li>Nome completo e nome social</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone e WhatsApp</li>
              <li>CPF ou CNPJ (para fins de cobrança)</li>
              <li>Endereço comercial ou residencial</li>
              <li>Informações de pagamento processadas por nossos parceiros</li>
            </ul>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              1.2 Dados de Uso
            </h3>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2 mb-4">
              <li>Páginas visitadas e tempo de permanência</li>
              <li>Funcionalidades utilizadas na plataforma</li>
              <li>Ações realizadas (criação, edição, publicação de sites)</li>
              <li>Interações com suporte e chat</li>
              <li>Histórico de transações e assinaturas</li>
            </ul>

            <h3 className="text-base font-medium text-vms-texto mb-2">
              1.3 Dados Técnicos
            </h3>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Endereço IP e localização aproximada</li>
              <li>Tipo e versão do navegador</li>
              <li>Sistema operacional e resolução de tela</li>
              <li>Dados de cookies e tecnologias similares</li>
              <li>Identificador único do dispositivo</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              2. Como Usamos os Dados
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Utilizamos seus dados pessoais para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Prestação e manutenção dos serviços contratados</li>
              <li>Criação e gerenciamento de sua conta</li>
              <li>Processamento de pagamentos e cobranças</li>
              <li>Comunicação sobre atualizações, novidades e suporte</li>
              <li>Melhoria contínua da plataforma e experiência do usuário</li>
              <li>Prevenção de fraudes e garantia da segurança do sistema</li>
              <li>Cumprimento de obrigações legais e regulatórias</li>
              <li>Geração de relatórios agregados e anônimos para análise de desempenho</li>
              <li>Personalização da experiência de uso</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              3. Compartilhamento de Dados
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy não vende, aluga ou comercializa seus dados pessoais. Podemos compartilhar informações apenas nas seguintes situações:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">Processadores de pagamento:</span> dados necessários para processar transações financeiras</li>
              <li><span className="text-vms-texto font-medium">Provedores de infraestrutura:</span> serviços de hospedagem e CDN para operação da plataforma</li>
              <li><span className="text-vms-texto font-medium">Ferramentas de análise:</span> serviços de métricas com dados anonimizados quando possível</li>
              <li><span className="text-vms-texto font-medium">Obrigações legais:</span> quando exigido por lei, decisão judicial ou requisição de autoridade competente</li>
              <li><span className="text-vms-texto font-medium">Proteção de direitos:</span> para proteger os direitos, a segurança ou a propriedade da Startzy ou de terceiros</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Todos os terceiros com quem compartilhamos dados estão sujeitos a acordos de confidencialidade e processamento de dados em conformidade com a LGPD.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              4. Armazenamento e Segurança
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado, destruição, perda, alteração ou tratamento indevido. Nossas medidas incluem:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Criptografia de dados em trânsito (TLS/SSL) e em repouso</li>
              <li>Controle de acesso baseado em funções e privilégios mínimos</li>
              <li>Monitoramento contínuo de segurança e detecção de intrusão</li>
              <li>Backups regulares com criptografia e redundância geográfica</li>
              <li>Auditorias periódicas de segurança</li>
              <li>Treinamento de equipe em proteção de dados</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Seus dados são armazenados em servidores localizados no Brasil, utilizando provedores de infraestrutura de alta confiabilidade.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              5. Direitos do Titular
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você possui os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li><span className="text-vms-texto font-medium">Acesso:</span> solicitar cópia dos dados pessoais que mantemos sobre você</li>
              <li><span className="text-vms-texto font-medium">Correção:</span> solicitar a correção de dados incompletos, inexatos ou desatualizados</li>
              <li><span className="text-vms-texto font-medium">Exclusão:</span> solicitar a eliminação dos dados pessoais tratados com base no seu consentimento</li>
              <li><span className="text-vms-texto font-medium">Portabilidade:</span> solicitar a transferência dos seus dados a outro fornecedor de serviço</li>
              <li><span className="text-vms-texto font-medium">Revogação do consentimento:</span> retirar seu consentimento a qualquer momento para tratamentos baseados nesta fundamentação</li>
              <li><span className="text-vms-texto font-medium">Oposição:</span> opor-se ao tratamento de dados em determinadas circunstâncias</li>
              <li><span className="text-vms-texto font-medium">Informação:</span> ser informado sobre as entidades com as quais compartilhamos seus dados</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Para exercer qualquer um destes direitos, entre em contato conosco através do e-mail contato@startzy.com.br. Responderemos sua solicitação no prazo de até 15 dias úteis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              6. Retenção de Dados
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Seus dados pessoais serão mantidos pelo tempo necessário para cumprir as finalidades para as quais foram coletados, incluindo:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Dados de conta: mantidos enquanto a conta estiver ativa e por até 30 dias após o cancelamento</li>
              <li>Dados financeiros: mantidos pelo prazo mínimo exigido pela legislação tributária e contábil (5 anos)</li>
              <li>Dados de uso: mantidos por até 2 anos para fins de análise e melhoria dos serviços</li>
              <li>Logs de acesso: mantidos por até 6 meses conforme o Marco Civil da Internet</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Após o período de retenção, os dados serão eliminados de forma segura ou anonimizados, salvo quando houver base legal para sua manutenção.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              7. Menores de Idade
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              A plataforma Startzy não é destinada a menores de 18 anos. Não coletamos intencionalmente dados pessoais de menores de idade. Caso tomemos conhecimento de que coletamos dados de um menor, providenciaremos a exclusão imediata dessas informações. Se você é pai, mãe ou responsável e acredita que seu filho forneceu dados pessoais a nós, entre em contato através do e-mail contato@startzy.com.br.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              8. Alterações na Política
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas serão comunicadas por e-mail ou por aviso destacado na plataforma. A data da última atualização será sempre indicada no topo desta página. Recomendamos que você revise esta política regularmente para se manter informado sobre como protegemos seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              9. Contato
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Para dúvidas, solicitações ou reclamações relacionadas a esta Política de Privacidade ou ao tratamento de seus dados pessoais, entre em contato:
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
