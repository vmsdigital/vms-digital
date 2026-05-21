"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Send } from "lucide-react";

interface Message {
  role: "bot" | "user";
  text: string;
}

const KNOWLEDGE_BASE: { keywords: string[]; response: string }[] = [
  {
    keywords: ["criar site", "novo site"],
    response:
      "Para criar um novo site, acesse a seção 'Sites' no menu lateral e clique em 'Novo Site'. Nosso gerador com IA vai criar um site profissional em poucos segundos — basta informar o nome do negócio, segmento e preferências! 🚀",
  },
  {
    keywords: ["editar", "personalizar"],
    response:
      "Você pode editar e personalizar seu site usando nosso editor visual. Acesse 'Sites', clique no site desejado e depois em 'Editar'. Lá você pode modificar seções, textos, imagens e muito mais de forma intuitiva! ✏️",
  },
  {
    keywords: ["dominio", "dns"],
    response:
      "Para configurar um domínio personalizado, acesse as configurações do seu site e vá em 'Domínio'. Você precisará apontar os registros DNS (CNAME ou A) para nossos servidores. Temos um guia passo a passo para te ajudar! 🌐",
  },
  {
    keywords: ["painel cliente", "white-label"],
    response:
      "O Painel do Cliente permite que seus clientes acessem e gerenciem seus próprios sites. Com o recurso White-Label, você pode personalizar o painel com a sua marca, logo e cores, oferecendo uma experiência totalmente personalizada! 🎨",
  },
  {
    keywords: ["publicar"],
    response:
      "Para publicar seu site, basta acessar o editor e clicar em 'Publicar'. Seu site ficará disponível online imediatamente. Você também pode agendar publicações ou usar o modo rascunho para pré-visualizar antes! 🌍",
  },
  {
    keywords: ["cores", "tema"],
    response:
      "Para personalizar cores e temas, acesse o editor do site e vá em 'Aparência'. Lá você pode alterar as cores primárias, secundárias, fontes e o tema geral do site. Oferecemos vários temas prontos e a opção de personalização completa! 🎨",
  },
  {
    keywords: ["prospecção"],
    response:
      "A funcionalidade de Prospecção permite que você encontre novos clientes potenciais para sua agência. Acesse 'Prospecção' no menu para buscar negócios por segmento e região, e entre em contato diretamente pela plataforma! 🎯",
  },
  {
    keywords: ["propostas"],
    response:
      "O sistema de Propostas permite criar e enviar propostas comerciais profissionais para seus clientes. Acesse 'Propostas' no menu para criar, personalizar e acompanhar o status de cada proposta enviada! 📋",
  },
  {
    keywords: ["financeiro", "pagamento"],
    response:
      "Na seção Financeiro, você pode acompanhar receitas, despesas, faturas e pagamentos. Também é possível configurar métodos de pagamento e gerar relatórios financeiros detalhados da sua operação! 💰",
  },
  {
    keywords: ["plano", "upgrade"],
    response:
      "Para ver seu plano atual ou fazer upgrade, acesse 'Configurações' > 'Plano'. Temos opções flexíveis que crescem com o seu negócio. O upgrade é imediato e você só paga a diferença proporcional! 📈",
  },
  {
    keywords: ["ajuda", "socorro"],
    response:
      "Estou aqui para ajudar! 😊 Você pode me perguntar sobre: criar sites, editar sites, configurar domínios, painel do cliente, publicar sites, personalizar cores, prospecção, propostas, financeiro ou planos. Se precisar de suporte humano, acesse a seção 'Suporte' no menu!",
  },
  {
    keywords: ["oi", "olá", "ola", "hey", "eai", "e ai"],
    response:
      "Olá! 👋 Que bom ter você aqui! Como posso ajudar com a plataforma Startzy hoje?",
  },
  {
    keywords: ["obrigado", "obrigada", "valeu", "thanks", "vlw"],
    response:
      "De nada! 😊 Fico feliz em ajudar. Se tiver mais alguma dúvida, é só perguntar!",
  },
];

const OFF_TOPIC_RESPONSE =
  "Desculpe, não consegui encontrar uma resposta para isso. 😔 Para falar com nossa equipe, chame no WhatsApp! 📱";

const DEFAULT_RESPONSE =
  "Posso ajudar com dúvidas sobre a plataforma Startzy. Experimente perguntar sobre criar sites, editar, domínios ou planos!";

function findResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  for (const entry of KNOWLEDGE_BASE) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.response;
      }
    }
  }

  const platformTerms = [
    "site",
    "startzy",
    "vms",
    "plataforma",
    "editor",
    "ia",
    "template",
    "componente",
    "cliente",
    "agência",
    "agencia",
  ];
  const hasPlatformTerm = platformTerms.some((term) => lower.includes(term));

  if (lower.length > 3 && !hasPlatformTerm) {
    return OFF_TOPIC_RESPONSE;
  }

  return DEFAULT_RESPONSE;
}

export default function StartzyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Olá! 👋 Eu sou o Startzy, seu assistente na plataforma. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const delay = 800 + Math.random() * 700;

    setTimeout(() => {
      const botResponse = findResponse(text);
      setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
      setIsTyping(false);
    }, delay);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <div className="group relative">
            <div className="absolute -top-10 right-0 whitespace-nowrap rounded-[8px] bg-vms-dark-2 px-3 py-1.5 text-xs font-medium text-vms-texto opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none">
              Falar com o Startzy
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-vms-primaria shadow-lg shadow-vms-primaria/20 hover:brightness-110 transition-all cursor-pointer overflow-hidden"
            >
              <span className="absolute inset-0 rounded-full bg-vms-primaria startzy-pulse-ring" />
              <Image
                src="/logo-curta.svg"
                alt="Startzy"
                width={28}
                height={28}
                className="relative z-10 brightness-0"
              />
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col overflow-hidden w-[calc(100vw-2rem)] sm:w-[350px] h-[80vh] sm:h-[480px]"
        >
          <div className="flex flex-col h-full rounded-[16px] bg-[#121212] border border-vms-borda shadow-2xl">
            <div className="flex items-center gap-3 border-b border-vms-borda px-4 py-3 bg-[#0E0E0E] rounded-t-[16px]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vms-primaria/15 shrink-0 overflow-hidden">
                <Image
                  src="/logo-curta.svg"
                  alt="Startzy"
                  width={22}
                  height={22}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-vms-texto">Startzy</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-vms-sucesso" />
                  <span className="text-[11px] text-vms-muted">Online</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-vms-muted hover:text-vms-texto hover:bg-vms-dark-3 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#121212]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-[12px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-vms-primaria text-black rounded-br-[4px]"
                        : "bg-[#1A1A1A] text-vms-texto-2 rounded-bl-[4px]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-[12px] rounded-bl-[4px] bg-[#1A1A1A] px-4 py-3">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-vms-muted" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-vms-muted" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-vms-muted" />
                  </div>
                </div>
              )}

              {messages.length > 0 && messages[messages.length - 1].role === "bot" && messages[messages.length - 1].text.includes("WhatsApp") && (
                <div className="flex justify-start">
                  <a
                    href="https://wa.me/5500000000000?text=Olá! Preciso de ajuda com a plataforma Startzy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[10px] bg-[#25D366] px-4 py-2.5 text-[13px] font-medium text-white hover:brightness-110 transition-all"
                  >
                    📱 Chamar no WhatsApp
                  </a>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-vms-borda p-3 bg-[#0E0E0E] rounded-b-[16px]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 rounded-[10px] border border-vms-borda bg-[#1A1A1A] px-3.5 py-2.5 text-[13px] text-vms-texto placeholder-vms-ghost outline-none transition-all focus:border-vms-primaria-border focus:shadow-[0_0_0_1px_rgba(200,241,53,0.08)]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-primaria text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
