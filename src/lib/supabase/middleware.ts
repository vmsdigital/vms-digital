import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/cadastro", "/recuperar-senha", "/cliente/login"];
  const isPublic = publicPaths.some((p) => pathname === p) || pathname.startsWith("/proposta/") || pathname.startsWith("/auth/");

  const dashboardPaths = [
    "/dashboard", "/sites", "/prospeccao", "/propostas",
    "/clientes", "/afiliados", "/templates", "/financeiro",
    "/configuracoes", "/relatorios", "/suporte", "/admin",
  ];
  const isProtected = dashboardPaths.some((p) => pathname.startsWith(p));

  const clienteProtectedPaths = ["/cliente/dashboard", "/cliente/dominio", "/cliente/midias", "/cliente/pagamentos", "/cliente/perfil", "/cliente/site"];
  const isClienteProtected = clienteProtectedPaths.some((p) => pathname.startsWith(p));

  if (!user && (isProtected || isClienteProtected)) {
    const url = request.nextUrl.clone();
    url.pathname = isClienteProtected ? "/cliente/login" : "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublic && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/cliente") ? "/cliente/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
