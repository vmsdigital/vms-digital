import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  try {
    const { createServerClient } = await import("@supabase/ssr");

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

    const protectedPaths = ["/dashboard", "/sites", "/prospeccao", "/propostas", "/clientes", "/afiliados", "/templates", "/financeiro", "/configuracoes"];
    const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

    const clienteProtectedPaths = ["/cliente/dashboard"];
    const isClienteProtected = clienteProtectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (!user && isClienteProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/cliente/login";
      return NextResponse.redirect(url);
    }

    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/cadastro")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (user && request.nextUrl.pathname === "/cliente/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/cliente/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
