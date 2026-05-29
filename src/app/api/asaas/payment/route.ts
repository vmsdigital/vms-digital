import { NextRequest, NextResponse } from "next/server";

const ASAAS_API_URL =
  process.env.ASAAS_API_URL || "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      valor,
      formaPagamento,
      vencimento,
      descricao,
      siteId,
      nome,
      email,
      whatsapp,
      tipo,
    } = body;

    let asaasCustomerId = customerId;

    if (!asaasCustomerId && nome) {
      const customerRes = await fetch(`${ASAAS_API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: ASAAS_API_KEY,
        },
        body: JSON.stringify({
          name: nome,
          email: email || undefined,
          cpfCnpj: undefined,
          phone: whatsapp || undefined,
          notificationDisabled: false,
        }),
      });

      const customerData = await customerRes.json();

      if (customerRes.ok && customerData.id) {
        asaasCustomerId = customerData.id;
      } else if (customerData.errors?.[0]?.code === "invalid_cpfCnpj") {
        const retryRes = await fetch(`${ASAAS_API_URL}/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: ASAAS_API_KEY,
          },
          body: JSON.stringify({
            name: nome,
            email: email || undefined,
            phone: whatsapp || undefined,
            notificationDisabled: false,
          }),
        });
        const retryData = await retryRes.json();
        if (retryRes.ok && retryData.id) {
          asaasCustomerId = retryData.id;
        }
      }
    }

    if (!asaasCustomerId) {
      return NextResponse.json(
        { error: "customerId ou dados do cliente são obrigatórios" },
        { status: 400 }
      );
    }

    const billingType = tipo === "pix" ? "PIX" : tipo === "cartao" ? "CREDIT_CARD" : formaPagamento || "UNDEFINED";

    const paymentPayload: Record<string, unknown> = {
      customer: asaasCustomerId,
      billingType,
      value: valor,
      dueDate: vencimento || new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      description: descricao || `Publicação de site - Startzy${siteId ? ` (${siteId})` : ""}`,
      notificationDisabled: false,
    };

    if (billingType === "CREDIT_CARD") {
      paymentPayload.dueDate = new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0];
    }

    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(paymentPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao criar pagamento" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      payment_id: data.id,
      invoice_url: data.invoiceUrl || null,
      qr_code: data.pixQrCode || null,
      pix_code: data.pixPayload || null,
      encodedImage: data.pixQrCode || null,
      payload: data.pixPayload || null,
      bank_slip_url: data.bankSlipUrl || null,
      status: data.status,
      asaas_customer_id: asaasCustomerId,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento Asaas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "id é obrigatório" },
        { status: 400 }
      );
    }

    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      headers: {
        access_token: ASAAS_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: data.status,
      data,
    });
  } catch (error) {
    console.error("Erro ao buscar pagamento Asaas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
