import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clienteId, email, nome } = body;

    if (!clienteId || !email) {
      return NextResponse.json(
        { error: "clienteId e email são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tempPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase() + "!1";

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          role: "cliente",
          nome,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Este e-mail já possui cadastro. O cliente pode usar sua senha existente para acessar o painel." },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      tempPassword,
      message: "Acesso criado com sucesso. Compartilhe as credenciais com o cliente.",
    });
  } catch (error) {
    console.error("Erro ao criar acesso do cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
