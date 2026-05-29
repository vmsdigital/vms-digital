"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function TermosPage() {
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
            Termos de Uso
          </h1>
          <p className="text-sm text-vms-texto-2 mb-8">
            Última atualização: Maio de 2026
          </p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              1. Aceitação dos Termos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Ao acessar ou utilizar a plataforma Startzy, operada pela Startzy, você concorda com estes Termos de Uso em sua integralidade. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              O uso continuado da plataforma após a publicação de alterações nestes termos constitui sua aceitação das modificações realizadas. Recomendamos que você revise esta página periodicamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              2. Descrição do Serviço
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy é uma plataforma SaaS que permite a criação, gerenciamento e publicação de sites e landing pages profissionais. Nosso serviço inclui, mas não se limita a:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Criação de sites com templates personalizáveis</li>
              <li>Gerenciamento de domínios e hospedagem</li>
              <li>Ferramentas de prospecção e gestão de clientes</li>
              <li>Painel do cliente para acompanhamento de projetos</li>
              <li>Integrações com serviços de pagamento e comunicação</li>
              <li>Relatórios e métricas de desempenho</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              3. Cadastro e Conta
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Para utilizar os serviços da Startzy, você deve criar uma conta fornecendo informações verdadeiras, completas e atualizadas. Você é responsável por:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Todas as atividades realizadas em sua conta</li>
              <li>Notificar imediatamente qualquer uso não autorizado</li>
              <li>Manter seus dados cadastrais atualizados</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              A Startzy reserva-se o direito de suspender ou encerrar contas que violem estes termos ou que apresentem atividades suspeitas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              4. Uso Aceitável
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Você se compromete a utilizar a plataforma de forma ética e em conformidade com a legislação brasileira. É expressamente proibido:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Publicar conteúdo ilegal, difamatório, obsceno ou prejudicial</li>
              <li>Violar direitos de propriedade intelectual de terceiros</li>
              <li>Distribuir malware, vírus ou código malicioso</li>
              <li>Realizar tentativas de acesso não autorizado ao sistema</li>
              <li>Utilizar a plataforma para spam ou comunicações não solicitadas</li>
              <li>Interferir no funcionamento adequado da plataforma</li>
              <li>Criar contas falsas ou se passar por terceiros</li>
              <li>Coletar dados pessoais de outros usuários sem autorização</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              5. Propriedade Intelectual
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

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              6. Pagamentos e Planos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              O uso da plataforma está sujeito à contratação de um plano pago, conforme opções disponíveis no momento da assinatura. As condições de pagamento incluem:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Os valores dos planos são divulgados em nossa página de preços e podem ser alterados com aviso prévio de 30 dias</li>
              <li>Cobranças são realizadas de forma recorrente conforme o ciclo escolhido (mensal ou anual)</li>
              <li>Falhas no pagamento podem resultar na suspensão temporária dos serviços</li>
              <li>Planos anuais não são reembolsáveis proporcionalmente após o período de garantia de 7 dias</li>
              <li>Impostos e taxas aplicáveis estão incluídos nos valores divulgados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              7. Cancelamento
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta ou entrando em contato com nosso suporte. Ao cancelar:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Seu acesso aos serviços continuará até o final do período já pago</li>
              <li>Seus sites poderão ser despublicados ao término do período contratado</li>
              <li>Você terá um prazo de 30 dias após o vencimento para exportar seus dados</li>
              <li>Após 30 dias do vencimento, os dados poderão ser permanentemente excluídos</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              A Startzy reserva-se o direito de cancelar contas que violem estes termos, sem direito a reembolso de valores já pagos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              8. Limitação de Responsabilidade
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy não se responsabiliza por:
            </p>
            <ul className="list-disc list-inside text-vms-texto-2 space-y-2 ml-2">
              <li>Indisponibilidade temporária do serviço por motivos de manutenção ou falhas técnicas</li>
              <li>Perda de dados resultante de casos fortuitos ou força maior</li>
              <li>Conteúdo publicado por usuários em seus sites</li>
              <li>Danos indiretos, incidentais ou consequenciais decorrentes do uso da plataforma</li>
              <li>Falhas em serviços de terceiros integrados à plataforma</li>
              <li>Lucros cessantes ou oportunidades de negócio não realizadas</li>
            </ul>
            <p className="text-vms-texto-2 leading-relaxed mt-3">
              Nossa responsabilidade total em relação a qualquer reclamação não excederá o valor pago por você nos 12 meses anteriores à ocorrência.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              9. Alterações nos Termos
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              A Startzy pode modificar estes Termos de Uso a qualquer momento. As alterações significativas serão comunicadas por e-mail ou por aviso destacado na plataforma com pelo menos 15 dias de antecedência.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              O uso continuado da plataforma após a entrada em vigor das alterações constitui aceitação dos novos termos. Se você não concordar com as modificações, deverá cessar o uso da plataforma e cancelar sua conta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              10. Legislação Aplicável
            </h2>
            <p className="text-vms-texto-2 leading-relaxed mb-3">
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa relacionada a estes termos será submetida ao foro da comarca da sede da Startzy, com exclusão de qualquer outro, por mais privilegiado que seja.
            </p>
            <p className="text-vms-texto-2 leading-relaxed">
              Em caso de conflito entre estes termos e a legislação brasileira, prevalecerá a legislação aplicável, especialmente o Código de Defesa do Consumidor, o Marco Civil da Internet e a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-vms-texto mb-3">
              11. Contato
            </h2>
            <p className="text-vms-texto-2 leading-relaxed">
              Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em contato conosco:
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
