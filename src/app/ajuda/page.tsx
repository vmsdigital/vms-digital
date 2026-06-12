"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Search, Bot, Phone, Mail, MessageCircle, ChevronDown, FileText, Shield, Cookie, Scale, X, Send, Sparkles, Loader2 } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

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
  const [chatOpen, setChatOpen] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! 👋 Eu sou o assistente IA da Startzy. Como posso ajudar você hoje?" }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 150)
    }
  }, [chatOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const sendMessage = useCallback(async () => {
    const text = chatInput.trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = { role: "user", content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setChatInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      })

      if (!res.ok) throw new Error("Erro na requisição")

      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response || "Desculpe, não consegui processar sua mensagem." }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes ou entre em contato pelo WhatsApp." }])
    } finally {
      setIsLoading(false)
    }
  }, [chatInput, isLoading, messages])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function openChat() {
    setChatOpen(true)
  }

  return (
    <div className="min-h-screen bg-vms-fundo text-vms-texto">
      <header className="border-b border-vms-borda bg-vms-fundo sticky top-0 z-50">
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
          <button
            onClick={openChat}
            className="w-full text-left glass rounded-[18px] p-6 border border-vms-borda hover:border-lime-400/40 transition-all group cursor-pointer"
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
          </button>
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

      {chatOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setChatOpen(false)}
          />
          <div className="relative w-full max-w-md h-full flex flex-col bg-[#121212] border-l border-vms-borda shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 border-b border-vms-borda px-5 py-4 bg-[#0E0E0E]">
              <div className="w-10 h-10 rounded-full bg-lime-400/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-lime-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-vms-texto">Assistente IA</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-vms-sucesso" />
                  <span className="text-[11px] text-vms-muted">Online com Gemini</span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-vms-muted hover:text-vms-texto hover:bg-vms-dark-3 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-lime-400/15 flex items-center justify-center shrink-0 mr-2.5 mt-1">
                      <Bot className="w-3.5 h-3.5 text-lime-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-[14px] px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-lime-400 text-vms-fundo font-medium rounded-br-[4px]"
                        : "bg-[#1A1A1A] text-vms-texto-2 rounded-bl-[4px] border border-vms-borda/50"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-lime-400/15 flex items-center justify-center shrink-0 mr-2.5 mt-1">
                    <Bot className="w-3.5 h-3.5 text-lime-400" />
                  </div>
                  <div className="flex items-center gap-2 rounded-[14px] rounded-bl-[4px] bg-[#1A1A1A] border border-vms-borda/50 px-4 py-3">
                    <Loader2 className="w-4 h-4 text-lime-400 animate-spin" />
                    <span className="text-[13px] text-vms-muted">Pensando...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-vms-borda p-4 bg-[#0E0E0E]">
              <div className="flex items-center gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua dúvida..."
                  disabled={isLoading}
                  className="flex-1 rounded-[12px] border border-vms-borda bg-[#1A1A1A] px-4 py-3 text-[13px] text-vms-texto placeholder-vms-ghost outline-none transition-all focus:border-lime-400/50 focus:shadow-[0_0_0_1px_rgba(200,241,53,0.08)] disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || isLoading}
                  className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-lime-400 text-vms-fundo hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-vms-muted mt-2 text-center">
                Powered by Gemini AI · Respostas geradas por IA
              </p>
            </div>
          </div>
        </div>
      )}

      {!chatOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 shadow-lg shadow-lime-400/20 hover:brightness-110 transition-all cursor-pointer group"
        >
          <div className="absolute -top-10 right-0 whitespace-nowrap rounded-[8px] bg-vms-dark-2 px-3 py-1.5 text-xs font-medium text-vms-texto opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none">
            Assistente IA
          </div>
          <Bot className="w-6 h-6 text-vms-fundo" />
        </button>
      )}
    </div>
  )
}
