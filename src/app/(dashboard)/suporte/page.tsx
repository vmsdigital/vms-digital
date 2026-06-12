"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  Send,
  Bot,
  User,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const FAQ_ITEMS = [
  {
    pergunta: "Como criar um site?",
    resposta:
      "Acesse 'Criar Site' no menu lateral, preencha as informações do negócio (nome, descrição, objetivo, cores, redes sociais), escolha a fonte e tema, e clique em 'Gerar Site com IA'. Em segundos seu site estará pronto para editar e personalizar!",
  },
  {
    pergunta: "Posso editar o site depois de criado?",
    resposta:
      "Sim! Acesse 'Meus Sites', clique no site e depois em 'Editar'. Você pode editar textos diretamente no site (clique no texto e digite), usar a barra de seções para navegar, ajustar cores/fontes/SEO na barra direita, ou pedir para a IA fazer alterações pelo chat StartEngine AI.",
  },
  {
    pergunta: "Como conectar um domínio personalizado?",
    resposta:
      "Disponível a partir do plano Starter. No editor do site, vá na seção 'Domínio' e insira seu domínio. Você precisará configurar um registro CNAME no seu provedor de DNS apontando para cname.startzy.com.br. O sistema verifica automaticamente.",
  },
  {
    pergunta: "Quais formas de pagamento são aceitas?",
    resposta:
      "Aceitamos boleto bancário, PIX e cartão de crédito via Asaas. Os pagamentos são processados de forma segura com split automático: 95% para você, 5% para a Startzy. Gerencie tudo pela aba 'Carteira' e 'Financeiro'.",
  },
  {
    pergunta: "Como funciona o programa de afiliados?",
    resposta:
      "No plano Pro, você pode se tornar afiliado e ganhar comissão indicando a plataforma. Acesse a aba 'Afiliados' para gerar seu link de indicação e acompanhar suas comissões.",
  },
  {
    pergunta: "Posso cancelar a qualquer momento?",
    resposta:
      "Sim, não há fidelidade. Você pode cancelar sua assinatura a qualquer momento. Seu site permanecerá ativo até o final do período já pago.",
  },
  {
    pergunta: "Quantos sites posso criar?",
    resposta:
      "Depende do seu plano: Grátis (1 site), Starter (80 sites/mês) e Pro (150 sites/mês). Você pode fazer upgrade a qualquer momento para liberar mais sites e recursos.",
  },
  {
    pergunta: "O site é otimizado para celular?",
    resposta:
      "Sim! Todos os sites gerados são 100% responsivos e otimizados para dispositivos móveis, tablets e desktops automaticamente. O design é mobile-first.",
  },
  {
    pergunta: "Como prospectar empresas sem site?",
    resposta:
      "Use a ferramenta de Prospecção no menu lateral. Selecione o nicho e a cidade, e o sistema buscará empresas SEM site usando o Google Maps. Plano Grátis: 3 buscas/mês, Starter: 15 buscas/mês, Pro: ilimitado. Você pode gerar propostas automaticamente para essas empresas.",
  },
  {
    pergunta: "Como compartilhar o portal com meu cliente?",
    resposta:
      "Na página de Clientes, clique no ícone de compartilhar ao lado do cliente. Isso copiará o link do portal personalizado onde seu cliente pode ver o status do projeto, pagamentos e visualizar o site.",
  },
  {
    pergunta: "Posso publicar meu site no plano Grátis?",
    resposta:
      "Não. A publicação está disponível a partir do plano Starter (R$ 97/mês ou R$ 77/mês no anual). No plano Grátis você pode criar, editar e visualizar o site, mas para publicar e ativar domínio personalizado é necessário fazer upgrade.",
  },
  {
    pergunta: "O que é o Agente IA Piloto Automático?",
    resposta:
      "É um recurso exclusivo do plano Pro que prospecta e cria sites automaticamente. Você configura os critérios e o agente trabalha sozinho, encontrando empresas sem site e gerando propostas enquanto você foca em fechar vendas.",
  },
  {
    pergunta: "Como funciona o SEO gerado por IA?",
    resposta:
      "No editor do site, na seção SEO, clique em 'Gerar SEO com IA'. O sistema usa o Gemini para criar automaticamente o título, meta description e keywords otimizados para o Google, baseado no nome e descrição da empresa. Você pode editar manualmente depois.",
  },
  {
    pergunta: "Quais são os diferenciais da Startzy?",
    resposta:
      "Agente IA Piloto Automático que prospecta e cria sites sozinho, Gateway próprio com checkout personalizado incluso, Split automático de pagamento (95% você / 5% Startzy), Prospecção integrada com Google Maps, e Curso incluso em todos os planos pagos.",
  },
];

export default function SuportePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! Sou o assistente IA da Startzy. Como posso te ajudar hoje? Posso responder dúvidas sobre a plataforma, dar dicas de vendas ou ajudar com prospecção." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleChatSend() {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    const userMessage: ChatMessage = { role: "user", content: msg };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatMessages, userMessage] }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Desculpe, não consegui processar sua mensagem. Tente novamente." },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro de conexão. Tente novamente em alguns instantes." },
      ]);
    }
    setChatLoading(false);
  }

  return (
    <DashboardLayout title="Suporte">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-xl font-semibold text-vms-texto flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-vms-primaria" />
            Central de Suporte
          </h1>
          <p className="text-vms-muted text-sm mt-1">
            Encontre respostas para as dúvidas mais comuns ou entre em contato conosco
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://wa.me/5511997513044"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card-premium rounded-[14px] p-5 flex items-start gap-4 hover:border-vms-primaria/20 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-[10px] bg-green-500/10 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-vms-texto text-sm font-medium group-hover:text-vms-primaria transition-colors">
                WhatsApp
              </h3>
              <p className="text-vms-muted text-xs mt-1">
                (11) 99751-3044
              </p>
              <p className="text-vms-muted text-xs mt-0.5">
                Resposta rápida em horário comercial
              </p>
            </div>
            <ExternalLink size={14} className="text-vms-muted ml-auto mt-1 shrink-0" />
          </a>

          <a
            href="tel:+5511997513044"
            className="glass-card-premium rounded-[14px] p-5 flex items-start gap-4 hover:border-vms-primaria/20 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-[10px] bg-vms-blue-bg flex items-center justify-center shrink-0">
              <Phone size={20} className="text-vms-blue-light" />
            </div>
            <div>
              <h3 className="text-vms-texto text-sm font-medium group-hover:text-vms-primaria transition-colors">
                Telefone
              </h3>
              <p className="text-vms-muted text-xs mt-1">
                (11) 99751-3044
              </p>
              <p className="text-vms-muted text-xs mt-0.5">
                Seg a Sex, 9h às 18h
              </p>
            </div>
            <ExternalLink size={14} className="text-vms-muted ml-auto mt-1 shrink-0" />
          </a>

          <a
            href="mailto:contato@startzy.com.br"
            className="glass-card-premium rounded-[14px] p-5 flex items-start gap-4 hover:border-vms-primaria/20 transition-all group cursor-pointer sm:col-span-2"
          >
            <div className="w-10 h-10 rounded-[10px] bg-vms-primaria/10 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-vms-primaria" />
            </div>
            <div>
              <h3 className="text-vms-texto text-sm font-medium group-hover:text-vms-primaria transition-colors">
                E-mail
              </h3>
              <p className="text-vms-muted text-xs mt-1">
                contato@startzy.com.br
              </p>
              <p className="text-vms-muted text-xs mt-0.5">
                Para assuntos detalhados, respondemos em até 24h
              </p>
            </div>
            <ExternalLink size={14} className="text-vms-muted ml-auto mt-1 shrink-0" />
          </a>
        </div>

        <div>
          <h2 className="text-base font-semibold text-vms-texto mb-4">
            Perguntas Frequentes
          </h2>
          <div className="flex flex-col gap-2">
            {FAQ_ITEMS.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card-premium rounded-[10px] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-vms-primaria-hover transition-colors"
                >
                  <span className="text-sm font-medium text-vms-texto pr-4">
                    {faq.pergunta}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-vms-muted shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-vms-texto-2 leading-relaxed">
                      {faq.resposta}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px] p-6 text-center">
          <h3 className="text-vms-texto text-sm font-medium mb-2">
            Não encontrou o que procurava?
          </h3>
          <p className="text-vms-muted text-xs mb-4">
            Converse com nosso assistente IA ou fale pelo WhatsApp
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-2 rounded-[10px] bg-vms-primaria px-6 py-2.5 text-sm font-semibold text-vms-fundo transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(102,126,234,0.3)]"
            >
              <Sparkles size={16} />
              Chat IA
            </button>
            <a
              href="https://wa.me/5511997513044?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20a%20plataforma%20Startzy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[10px] bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {chatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-vms-dark-1 border border-vms-borda rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "520px" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-vms-borda bg-vms-dark-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vms-primaria to-vms-secundaria flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-vms-texto">Assistente Startzy</p>
                <p className="text-[10px] text-vms-ghost">IA especializada em vendas de sites</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded-lg hover:bg-vms-dark-3 text-vms-ghost hover:text-vms-texto transition"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-vms-primaria to-vms-secundaria flex items-center justify-center shrink-0 mt-1">
                    <Bot size={12} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-vms-primaria text-vms-fundo rounded-br-sm"
                      : "bg-vms-dark-3 text-vms-texto rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-vms-dark-3 flex items-center justify-center shrink-0 mt-1">
                    <User size={12} className="text-vms-ghost" />
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-vms-primaria to-vms-secundaria flex items-center justify-center shrink-0 mt-1">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-vms-dark-3 text-vms-ghost px-3 py-2 rounded-xl rounded-bl-sm text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-vms-borda">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-vms-dark-3 border border-vms-borda rounded-xl px-3 py-2 text-sm text-vms-texto placeholder:text-vms-ghost focus:outline-none focus:border-vms-primaria transition"
                disabled={chatLoading}
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 rounded-xl bg-vms-primaria text-vms-fundo hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-vms-primaria to-vms-secundaria rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Sparkles size={24} className="text-white" />
        </button>
      )}
    </DashboardLayout>
  );
}
