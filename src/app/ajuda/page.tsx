"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Search, Bot, Phone, Mail, MessageCircle, ChevronDown, FileText, Shield, Cookie, Scale } from "lucide-react"

const faqItems = [
  {
    question: "Como criar meu primeiro site?",
    answer: "Acesse seu painel, clique em 'Novo Site' e sigo o assistente passo a passo. Escolha um template, personalize o conteúdo e publique com um clique."
  },
  {
    question: "Quais planos estão disponíveis?",
    answer: "Oferecemos planos Starter, Pro e Enterprise. O Starter é ideal para quem está começando, o Pro inclui IA Editorial e prospecção automática, e o Enterprise oferece recursos avançados e suporte dedicado."
  },
  {
    question: "Como funciona a IA Editorial?",
    answer: "Nossa IA Editorial analisa seu nicho e gera conteúdo otimizado para SEO automaticamente. Ela cria títulos, textos e sugestões de imagens com base nas melhores práticas do mercado."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Todos os planos podem ser cancelados a qualquer momento sem multa. Após o cancelamento, você terá acesso até o final do período já pago."
  },
  {
    question: "Como funciona a prospecção automática?",
    answer: "A prospecção automática identifica potenciais clientes com base em critérios que você define, como localização, segmento e porte. O sistema envia mensagens personalizadas e acompanha as respostas."
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "Aceitamos cartões de crédito (Visa, Mastercard, Elo, American Express), PIX e boleto bancário. Pagamentos com cartão e PIX são processados imediatamente."
  },
  {
    question: "Posso usar meu próprio domínio?",
    answer: "Sim! Nos planos Pro e Enterprise você pode conectar seu próprio domínio. Basta acessar as configurações do site e seguir as instruções de apontamento DNS."
  },
  {
    question: "Como entrar em contato com o suporte?",
    answer: "Você pode entrar em contato por telefone, e-mail, WhatsApp ou pelo nosso assistente IA. Todos os canais estão disponíveis nesta Central de Ajuda."
  }
]

export default function AjudaPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-vms-fundo text-vms-texto">
      <header className="border-b border-vms-borda bg-vms-fundo/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
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
            width={200}
            height={56}
            className="object-contain"
            priority
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Central de <span className="text-lime-400">Ajuda</span>
          </h1>
          <p className="text-vms-texto-2 text-lg max-w-2xl mx-auto">
            Encontre respostas para suas dúvidas, fale com nosso suporte ou explore nossos recursos.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-14">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vms-texto-2" />
            <input
              type="text"
              placeholder="Buscar no centro de ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-vms-card border border-vms-borda rounded-[18px] text-vms-texto placeholder:text-vms-texto-2 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/30 transition-all"
            />
          </div>
        </div>

        <div className="mb-14">
          <Link
            href="/suporte"
            className="block glass rounded-[18px] p-6 border border-vms-borda hover:border-lime-400/40 transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-lime-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lime-400/20 transition-colors">
                <Bot className="w-7 h-7 text-lime-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">Assistente IA</h2>
                <p className="text-vms-texto-2 text-sm">
                  Converse com nossa IA para resolver suas dúvidas rapidamente
                </p>
              </div>
              <span className="px-5 py-2.5 bg-lime-400 text-vms-fundo font-semibold rounded-xl text-sm hover:bg-lime-300 transition-colors">
                Iniciar conversa
              </span>
            </div>
          </Link>
        </div>

        <div className="mb-14">
          <h2 className="text-2xl font-bold mb-6">Entre em contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <a
              href="tel:+5511999990000"
              className="glass rounded-[18px] p-6 border border-vms-borda hover:border-vms-primaria-border transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mb-4 group-hover:bg-lime-400/20 transition-colors">
                <Phone className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Telefone</h3>
              <p className="text-lime-400 font-medium mb-1">(11) 99999-0000</p>
              <p className="text-vms-texto-2 text-sm">Seg-Sex, 9h às 18h</p>
            </a>

            <a
              href="mailto:contato@startzy.com.br"
              className="glass rounded-[18px] p-6 border border-vms-borda hover:border-vms-primaria-border transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mb-4 group-hover:bg-lime-400/20 transition-colors">
                <Mail className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">E-mail</h3>
              <p className="text-lime-400 font-medium mb-1">contato@startzy.com.br</p>
              <p className="text-vms-texto-2 text-sm">Resposta em até 24h</p>
            </a>

            <a
              href="https://wa.me/5511999990000"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-[18px] p-6 border border-vms-borda hover:border-vms-primaria-border transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mb-4 group-hover:bg-lime-400/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">WhatsApp</h3>
              <p className="text-lime-400 font-medium mb-1">Chat no WhatsApp</p>
              <p className="text-vms-texto-2 text-sm">Atendimento rápido</p>
            </a>
          </div>
        </div>

        <div className="mb-14">
          <h2 className="text-2xl font-bold mb-6">Perguntas frequentes</h2>
          <div className="glass rounded-[18px] border border-vms-borda overflow-hidden">
            {filteredFaq.length > 0 ? (
              filteredFaq.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-vms-borda last:border-b-0"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-medium pr-4">{item.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-vms-texto-2 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-6 pb-5 text-vms-texto-2 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-vms-texto-2">
                Nenhum resultado encontrado para &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Recursos adicionais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link
              href="/termos"
              className="glass rounded-[18px] p-6 border border-vms-borda hover:border-vms-primaria-border transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mb-4 group-hover:bg-lime-400/20 transition-colors">
                <FileText className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="font-semibold mb-1">Termos de Uso</h3>
              <p className="text-vms-texto-2 text-sm">Leia nossos termos e condições</p>
            </Link>

            <Link
              href="/privacidade"
              className="glass rounded-[18px] p-6 border border-vms-borda hover:border-vms-primaria-border transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mb-4 group-hover:bg-lime-400/20 transition-colors">
                <Shield className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="font-semibold mb-1">Privacidade</h3>
              <p className="text-vms-texto-2 text-sm">Saiba como protegemos seus dados</p>
            </Link>

            <Link
              href="/cookies"
              className="glass rounded-[18px] p-6 border border-vms-borda hover:border-vms-primaria-border transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mb-4 group-hover:bg-lime-400/20 transition-colors">
                <Cookie className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="font-semibold mb-1">Cookies</h3>
              <p className="text-vms-texto-2 text-sm">Política de cookies e rastreamento</p>
            </Link>

            <Link
              href="/lgpd"
              className="glass rounded-[18px] p-6 border border-vms-borda hover:border-vms-primaria-border transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mb-4 group-hover:bg-lime-400/20 transition-colors">
                <Scale className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="font-semibold mb-1">LGPD</h3>
              <p className="text-vms-texto-2 text-sm">Conformidade com a Lei Geral de Proteção de Dados</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
