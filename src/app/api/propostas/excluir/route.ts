import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    const { proposta_id } = await request.json();

    if (!proposta_id) {
      return NextResponse.json({ error: "proposta_id é obrigatório" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: proposta, error: fetchError } = await supabase
      .from("propostas")
      .select("id, usuario_id")
      .eq("id", proposta_id)
      .single();

    if (fetchError || !proposta) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("propostas")
      .delete()
      .eq("id", proposta_id);

    if (deleteError) {
      console.error("Erro ao excluir proposta:", deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro na API de exclusão de propostas:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
