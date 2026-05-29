"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Shield,
  Check,
  Smartphone,
  Lock,
  Globe,
  ChevronDown,
  Copy,
  CheckCircle,
  Loader2,
  CreditCard,
  QrCode,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Monitor,
  SmartphoneIcon,
} from "lucide-react";

const FAQ_ITEMS = [
  {
    pergunta: "Poderei editar meu site depois que ele for publicado?",
    resposta:
      "Sim! Após a publicação, você pode solicitar edições de textos, imagens, adicionar novas informações e muito mais pela sua Área do Cliente.",
  },
  {
    pergunta: "O site funcionará bem em celulares e tablets?",
    resposta:
      "Com certeza! Todos os sites são 100% responsivos e otimizados para qualquer dispositivo — celular, tablet ou computador.",
  },
  {
    pergunta: "O que acontece imediatamente após eu pagar?",
    resposta:
      "Assim que o pagamento for confirmado, seu site é ativado automaticamente. Você recebe um e-mail com os dados de acesso à sua Área do Cliente.",
  },
  {
    pergunta: "O valor inclui o registro do domínio (meusite.com.br)?",
    resposta:
      "O domínio personalizado é uma funcionalidade à parte. Você pode conectar um domínio que já possui ou contratar separadamente. O site funciona perfeitamente no endereço padrão fornecido.",
  },
  {
    pergunta: "O pagamento é seguro?",
    resposta:
      "Sim! Utilizamos criptografia de ponta e processamento seguro via Asaas, plataforma certificada pelo Banco Central. Seus dados estão protegidos.",
  },
];

type PaymentMethod = "pix" | "cartao";
type Step = "form" | "payment";
type ViewMode = "desktop" | "mobile";

export default function PropostaPage() {
  const params = useParams();
  const propostaId = params.id as string;

  const [site, setSite] = useState<{
    id: string;
    nome_site: string;
    nicho: string;
    dados_json: Record<string, unknown>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("form");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [showPreview, setShowPreview] = useState(true);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [pixCode, setPixCode] = useState("");
  const [pixQrCode, setPixQrCode] = useState("");
  const [pixLoading, setPixLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "confirmed">("pending");

  const valor = 1500;
  const valorCartaoParcela = Math.ceil(valor / 12);

  useEffect(() => {
    function blockRightClick(e: MouseEvent) {
      e.preventDefault();
    }
    function blockDevTools(e: KeyboardEvent) {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    }
    document.addEventListener("contextmenu", blockRightClick);
    document.addEventListener("keydown", blockDevTools);
    return () => {
      document.removeEventListener("contextmenu", blockRightClick);
      document.removeEventListener("keydown", blockDevTools);
    };
  }, []);

  const fetchSite = useCallback(async () => {
    const supabaseModule = await import("@/lib/supabase/client");
    const supabase = supabaseModule.createClient();

    const { data } = await supabase
      .from("sites")
      .select("id, nome_site, nicho, dados_json")
      .eq("id", propostaId)
      .single();

    if (data) setSite(data as typeof site);
    setLoading(false);
  }, [propostaId]);

  useEffect(() => {
    if (propostaId) fetchSite();
  }, [propostaId, fetchSite]);

  async function handleGerarPagamento(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !email || !whatsapp) return;

    setPixLoading(true);

    try {
      const res = await fetch("/api/asaas/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: site?.id,
          nome,
          email,
          whatsapp,
          valor,
          tipo: paymentMethod === "pix" ? "pix" : "cartao",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (paymentMethod === "pix") {
          setPixCode(data.pix_code || data.payload || "");
          setPixQrCode(data.qr_code || data.encodedImage || "");
          setStep("payment");

          pollPaymentStatus(data.payment_id);
        } else {
          if (data.invoice_url) {
            window.location.href = data.invoice_url;
          }
        }
      }
    } catch {
    }

    setPixLoading(false);
  }

  function pollPaymentStatus(paymentId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/asaas/payment?id=${paymentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "received" || data.status === "confirmed") {
            setPaymentStatus("confirmed");
            clearInterval(interval);
          }
        }
      } catch {
      }
    }, 5000);

    setTimeout(() => clearInterval(interval), 600000);
  }

  async function handleCopyPix() {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#AAFF00] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#888] text-sm">Carregando proposta...</span>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-xl font-semibold">Proposta não encontrada</h1>
          <p className="text-[#888] text-sm mt-2">Esta proposta pode ter expirado ou sido removida.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-lg mx-auto px-4 py-8">
        {step === "form" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-white text-2xl font-bold leading-tight">
                Seu site está pronto!
              </h1>
              <p className="text-[#999] text-sm mt-2 leading-relaxed">
                Confira como ficou o site profissional que preparamos para você. Complete o pagamento para publicá-lo.
              </p>
            </div>

            {(site.dados_json?.html_gerado as string | undefined) && showPreview && (
              <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#222]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-[#666] text-[10px] ml-2">{site.nome_site}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewMode(viewMode === "desktop" ? "mobile" : "desktop")}
                      className="p-1.5 rounded-[8px] text-[#666] hover:text-white hover:bg-[#222] transition-colors cursor-pointer"
                      title={viewMode === "desktop" ? "Visualizar mobile" : "Visualizar desktop"}
                    >
                      {viewMode === "desktop" ? <SmartphoneIcon size={14} /> : <Monitor size={14} />}
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-1.5 rounded-[8px] text-[#666] hover:text-white hover:bg-[#222] transition-colors cursor-pointer"
                      title="Ocultar preview"
                    >
                      <EyeOff size={14} />
                    </button>
                  </div>
                </div>
                <div className={`flex justify-center ${viewMode === "desktop" ? "w-full" : "px-4 py-3"}`}>
                  <iframe
                    srcDoc={site.dados_json.html_gerado as string}
                    className={`bg-white transition-all duration-300 ${
                      viewMode === "desktop"
                        ? "w-full aspect-video"
                        : "w-[320px] h-[568px] rounded-2xl border-4 border-[#333]"
                    }`}
                    sandbox="allow-scripts"
                    title={`Preview ${site.nome_site}`}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              </div>
            )}

            {!showPreview && (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center justify-center gap-2 bg-[#111] border border-[#222] rounded-[10px] py-3 text-sm text-[#999] hover:text-white hover:border-[#AAFF00]/30 transition-all cursor-pointer"
              >
                <Eye size={14} />
                Mostrar preview do site
              </button>
            )}

            <div className="bg-[#111] border border-[#222] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#888] text-xs uppercase tracking-wider">Site</span>
                <span className="text-white text-sm font-semibold">{site.nome_site}</span>
              </div>

              <div className="text-center py-4">
                <span className="text-[#AAFF00] text-4xl font-bold">
                  R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[#666] text-xs mt-1">valor único para publicação</p>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { icon: <Globe size={14} />, text: "Design profissional" },
                  { icon: <Lock size={14} />, text: "SSL/HTTPS incluso" },
                  { icon: <Smartphone size={14} />, text: "Otimizado para celular" },
                  { icon: <Shield size={14} />, text: "Hospedagem inclusa" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="text-[#AAFF00]">{item.icon}</div>
                    <span className="text-[#ccc] text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleGerarPagamento} className="flex flex-col gap-5">
              <div>
                <h2 className="text-white text-base font-semibold mb-1">Seus dados</h2>
                <p className="text-[#888] text-xs">Preencha para ativar seu site</p>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[#999] text-xs font-medium mb-1 block">Nome completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full bg-[#111] border border-[#222] rounded-[10px] px-4 py-3 text-sm text-white placeholder:text-[#444] outline-none focus:border-[#AAFF00]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[#999] text-xs font-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full bg-[#111] border border-[#222] rounded-[10px] px-4 py-3 text-sm text-white placeholder:text-[#444] outline-none focus:border-[#AAFF00]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[#999] text-xs font-medium mb-1 block">WhatsApp</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                    className="w-full bg-[#111] border border-[#222] rounded-[10px] px-4 py-3 text-sm text-white placeholder:text-[#444] outline-none focus:border-[#AAFF00]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#999] text-xs font-medium mb-2 block">Forma de pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-[10px] border-2 transition-all cursor-pointer ${
                      paymentMethod === "pix"
                        ? "border-[#AAFF00] bg-[#AAFF00]/5"
                        : "border-[#222] bg-[#111] hover:border-[#333]"
                    }`}
                  >
                    <QrCode size={20} className={paymentMethod === "pix" ? "text-[#AAFF00]" : "text-[#666]"} />
                    <span className={`text-sm font-medium ${paymentMethod === "pix" ? "text-white" : "text-[#888]"}`}>
                      PIX
                    </span>
                    <span className="text-[#AAFF00] text-xs font-semibold">À vista</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cartao")}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-[10px] border-2 transition-all cursor-pointer ${
                      paymentMethod === "cartao"
                        ? "border-[#AAFF00] bg-[#AAFF00]/5"
                        : "border-[#222] bg-[#111] hover:border-[#333]"
                    }`}
                  >
                    <CreditCard size={20} className={paymentMethod === "cartao" ? "text-[#AAFF00]" : "text-[#666]"} />
                    <span className={`text-sm font-medium ${paymentMethod === "cartao" ? "text-white" : "text-[#888]"}`}>
                      Cartão
                    </span>
                    <span className="text-[#AAFF00] text-xs font-semibold">Até 12x</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pixLoading || !nome || !email || !whatsapp}
                className="w-full bg-[#AAFF00] text-black font-semibold py-4 rounded-[10px] text-base
                  hover:brightness-110 hover:shadow-[0_0_30px_rgba(170,255,0,0.3)]
                  transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {pixLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : paymentMethod === "pix" ? (
                  `Gerar PIX de R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                ) : (
                  `Pagar R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} com Cartão`
                )}
              </button>

              <p className="text-[#555] text-xs text-center flex items-center justify-center gap-1.5">
                <Lock size={10} />
                Pagamento 100% seguro e criptografado
              </p>
            </form>

            <div>
              <h2 className="text-white text-base font-semibold mb-3">Perguntas frequentes</h2>
              <div className="flex flex-col gap-2">
                {FAQ_ITEMS.map((faq, idx) => (
                  <div key={idx} className="bg-[#111] border border-[#222] rounded-[10px] overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
                    >
                      <span className="text-[#ccc] text-sm pr-4">{faq.pergunta}</span>
                      <ChevronDown
                        size={14}
                        className={`text-[#666] shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="px-4 pb-3">
                        <p className="text-[#888] text-xs leading-relaxed">{faq.resposta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="flex flex-col gap-6">
            {paymentStatus === "confirmed" ? (
              <div className="flex flex-col items-center text-center gap-5 py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">Pagamento confirmado!</h2>
                  <p className="text-[#999] text-sm mt-2">
                    Seu site está sendo ativado. Você receberá os dados de acesso no e-mail {email}.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h1 className="text-white text-xl font-bold">Pague com PIX</h1>
                  <p className="text-[#999] text-sm mt-1">Escaneie o QR Code ou copie o código</p>
                </div>

                <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col items-center gap-4">
                  <div className="bg-white rounded-[10px] p-3">
                    {pixQrCode ? (
                      <img
                        src={`data:image/png;base64,${pixQrCode}`}
                        alt="QR Code PIX"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <QrCode size={120} className="text-black" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="text-[#AAFF00] text-2xl font-bold">
                      R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-white text-sm font-medium mt-1">{site.nome_site}</p>
                  </div>
                </div>

                <button
                  onClick={handleCopyPix}
                  className="w-full flex items-center justify-center gap-2 bg-[#111] border border-[#222]
                    rounded-[10px] py-3.5 text-sm font-medium text-white
                    hover:border-[#AAFF00]/30 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-green-400">Código copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="text-[#AAFF00]" />
                      Copiar código PIX
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 size={14} className="text-[#AAFF00] animate-spin" />
                  <span className="text-[#888] text-sm">Aguardando pagamento...</span>
                </div>

                <p className="text-[#666] text-xs text-center leading-relaxed">
                  Assim que identificarmos o pagamento, seu site será ativado automaticamente.
                </p>

                <p className="text-[#555] text-xs text-center flex items-center justify-center gap-1.5">
                  <Lock size={10} />
                  Pagamento 100% seguro e criptografado
                </p>
              </>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-[#333] text-xs">Startzy — Sites profissionais com IA</p>
        </div>
      </div>
    </div>
  );
}
