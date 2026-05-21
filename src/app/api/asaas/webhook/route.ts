import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ASAAS_API_URL =
  process.env.ASAAS_API_URL || "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

function verifyWebhookSignature(request: NextRequest): boolean {
  const asaasAccessToken = request.headers.get("asaas-access-token");
  if (asaasAccessToken && asaasAccessToken === ASAAS_API_KEY) {
    return true;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyWebhookSignature(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event, payment } = body;

    if (!event || !payment) {
      return NextResponse.json(
        { error: "Evento ou pagamento inválido" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const statusMap: Record<string, string> = {
      PAYMENT_CREATED: "pending",
      PAYMENT_UPDATED: "pending",
      PAYMENT_CONFIRMED: "received",
      PAYMENT_RECEIVED: "received",
      PAYMENT_OVERDUE: "overdue",
      PAYMENT_DELETED: "cancelled",
      PAYMENT_REFUNDED: "cancelled",
      PAYMENT_RECEIVED_IN_CASH_UNDONE: "pending",
    };

    const newStatus = statusMap[event];

    if (!newStatus) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const { data: pagamentoExistente } = await supabase
      .from("pagamento_asaas")
      .select("id, cliente_id")
      .eq("asaas_payment_id", payment.id)
      .single();

    if (pagamentoExistente) {
      const updateData: Record<string, unknown> = {
        status: newStatus,
      };

      if (newStatus === "received") {
        updateData.pago_em = new Date().toISOString();
      }

      await supabase
        .from("pagamento_asaas")
        .update(updateData)
        .eq("id", pagamentoExistente.id);

      if (newStatus === "received" && pagamentoExistente.cliente_id) {
        await supabase
          .from("clientes")
          .update({ status: "ativo" })
          .eq("id", pagamentoExistente.cliente_id);
      }

      if (newStatus === "overdue" && pagamentoExistente.cliente_id) {
        await supabase
          .from("clientes")
          .update({ status: "inadimplente" })
          .eq("id", pagamentoExistente.cliente_id);
      }
    } else {
      const { data: clienteData } = await supabase
        .from("clientes")
        .select("id, criador_id")
        .eq("asaas_customer_id", payment.customer)
        .single();

      if (clienteData) {
        const insertData: Record<string, unknown> = {
          criador_id: clienteData.criador_id,
          cliente_id: clienteData.id,
          asaas_payment_id: payment.id,
          asaas_customer_id: payment.customer,
          tipo: payment.billingType === "CREDIT_CARD" ? "cartao" : payment.billingType === "BOLETO" ? "boleto" : "pix",
          valor: payment.value,
          status: newStatus,
          link_pagamento: payment.invoiceUrl || null,
          vencimento: payment.dueDate,
          pago_em: newStatus === "received" ? new Date().toISOString() : null,
        };

        await supabase.from("pagamento_asaas").insert(insertData);

        if (newStatus === "received") {
          await supabase
            .from("clientes")
            .update({ status: "ativo" })
            .eq("id", clienteData.id);
        }

        if (newStatus === "overdue") {
          await supabase
            .from("clientes")
            .update({ status: "inadimplente" })
            .eq("id", clienteData.id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook Asaas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
