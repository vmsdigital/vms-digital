"use client";

import { useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const FAQ_ITEMS = [
  {
    pergunta: "Como criar um site?",
    resposta:
      "Acesse a aba 'Criar Site' no menu lateral, preencha as informações do seu negócio (nome, descrição, objetivo), escolha as cores e tema, e clique em 'Gerar Site com IA'. Em segundos seu site estará pronto!",
  },
  {
    pergunta: "Posso editar o site depois de criado?",
    resposta:
      "Sim! Acesse 'Meus Sites', clique no site desejado e depois em 'Editar'. Você pode alterar textos, cores, imagens e muito mais. Seu cliente também pode editar pela Área do Cliente.",
  },
  {
    pergunta: "Como conectar um domínio personalizado?",
    resposta:
      "Na Área do Cliente, vá em 'Domínio' e insira seu domínio. Você precisará configurar um registro CNAME no seu provedor de DNS apontando para cname.vmsdigital.com.br. O sistema verifica automaticamente.",
  },
  {
    pergunta: "Quais formas de pagamento são aceitas?",
    resposta:
      "Aceitamos boleto bancário, PIX e cartão de crédito. Os pagamentos são processados de forma segura pelo Asaas. Você pode gerenciar tudo pela aba 'Pagamentos' na Área do Cliente.",
  },
  {
    pergunta: "Como funciona o programa de afiliados?",
    resposta:
      "Nos planos Pro e Agency, você pode se tornar afiliado e ganhar comissão indicando a plataforma. Acesse a aba 'Afiliados' para gerar seu link de indicação e acompanhar suas comissões.",
  },
  {
    pergunta: "Posso cancelar a qualquer momento?",
    resposta:
      "Sim, não há fidelidade. Você pode cancelar sua assinatura a qualquer momento pela Área do Cliente em 'Pagamentos'. Seu site permanecerá ativo até o final do período já pago.",
  },
  {
    pergunta: "Quantos sites posso criar?",
    resposta:
      "Depende do seu plano: Gratuito (2 sites), Starter (10 sites), Pro (50 sites) e Agency (ilimitados). Você pode fazer upgrade a qualquer momento.",
  },
  {
    pergunta: "O site é otimizado para celular?",
    resposta:
      "Sim! Todos os sites gerados são 100% responsivos e otimizados para dispositivos móveis, tablets e desktops automaticamente.",
  },
];

export default function SuportePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            href="mailto:contato@vmsdigital.com.br"
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
                contato@vmsdigital.com.br
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
            Fale diretamente com nosso time pelo WhatsApp
          </p>
          <a
            href="https://wa.me/5511997513044?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20a%20plataforma%20VMS%20Digital"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            <MessageCircle size={16} />
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
