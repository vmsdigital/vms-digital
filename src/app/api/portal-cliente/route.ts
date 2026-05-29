import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cliente_id = searchParams.get("cliente_id");

    if (!cliente_id) {
      return NextResponse.json({ error: "cliente_id é obrigatório" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", cliente_id)
      .eq("criador_id", user.id)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    let siteData = null;
    if (cliente.site_id) {
      const { data: site } = await supabase
        .from("sites")
        .select("id, nome_site, nicho, slug, publicado, criado_em, dados_json")
        .eq("id", cliente.site_id)
        .single();
      siteData = site;
    }

    const { data: pagamentos } = await supabase
      .from("transacoes")
      .select("*")
      .eq("usuario_id", user.id)
      .eq("tipo", "entrada")
      .order("criado_em", { ascending: false })
      .limit(10);

    const { data: vendedor } = await supabase
      .from("usuarios")
      .select("id, nome, email, avatar_url")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      cliente,
      site: siteData,
      pagamentos: pagamentos || [],
      vendedor,
    });
  } catch (err) {
    console.error("Erro na API de portal do cliente:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
