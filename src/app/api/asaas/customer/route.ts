import { NextRequest, NextResponse } from "next/server";

const ASAAS_API_URL =
  process.env.ASAAS_API_URL || "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, cpfCnpj, phone } = body;

    if (!nome || !cpfCnpj) {
      return NextResponse.json(
        { error: "Nome e CPF/CNPJ são obrigatórios" },
        { status: 400 }
      );
    }

    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name: nome,
        email: email || undefined,
        cpfCnpj,
        phone: phone || undefined,
        notificationDisabled: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.description || "Erro ao criar cliente no Asaas" },
        { status: response.status }
      );
    }

    return NextResponse.json({ customerId: data.id, data });
  } catch (error) {
    console.error("Erro ao criar customer Asaas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId é obrigatório" },
        { status: 400 }
      );
    }

    const response = await fetch(`${ASAAS_API_URL}/customers/${customerId}`, {
      headers: {
        access_token: ASAAS_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: response.status }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Erro ao buscar customer Asaas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
