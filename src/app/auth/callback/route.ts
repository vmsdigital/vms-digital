import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    console.error("[Auth Callback] OAuth error:", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || "Erro ao autenticar com o provedor.")}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Código de autorização não encontrado.")}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Auth Callback] Supabase env vars not configured");
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Serviço de autenticação não configurado.")}`
    );
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback] Code exchange error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: existingUser } = await supabase
      .from("usuarios")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      const { error: insertError } = await supabase.from("usuarios").insert({
        id: user.id,
        nome: user.user_metadata?.nome || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
        email: user.email!,
        whatsapp: null,
        plano: "gratuito",
      });

      if (insertError) {
        console.error("[Auth Callback] Insert user error:", insertError.message);
      }
    }
  }

  return response;
}
