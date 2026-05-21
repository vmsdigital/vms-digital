import { NextRequest, NextResponse } from "next/server";

const ASAAS_API_URL =
  process.env.ASAAS_API_URL || "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, valor, ciclo, descricao, formaPagamento } = body;

    if (!customerId || !valor) {
      return NextResponse.json(
        { error: "customerId e valor são obrigatórios" },
        { status: 400 }
      );
    }

    const response = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: formaPagamento || "UNDEFINED",
        value: valor,
        cycle: ciclo || "MONTHLY",
        description: descricao || "Assinatura VMS Digital",
        notificationDisabled: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao criar assinatura" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      subscriptionId: data.id,
      linkPagamento: data.invoiceUrl || null,
      data,
    });
  } catch (error) {
    console.error("Erro ao criar subscription Asaas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscriptionId");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId é obrigatório" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${ASAAS_API_URL}/subscriptions/${subscriptionId}`,
      {
        method: "DELETE",
        headers: {
          access_token: ASAAS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao cancelar assinatura" },
        { status: response.status }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Erro ao cancelar subscription Asaas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
