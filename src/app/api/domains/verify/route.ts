import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dominio, siteId } = body;

    if (!dominio || !siteId) {
      return NextResponse.json(
        { error: "dominio e siteId são obrigatórios" },
        { status: 400 }
      );
    }

    const dominioLimpo = dominio
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .replace(/^www\./, "")
      .trim();

    try {
      const dnsResponse = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(dominioLimpo)}&type=CNAME`
      );
      const dnsData = await dnsResponse.json();

      if (dnsData.Answer) {
        const cnameRecord = dnsData.Answer.find(
          (a: { data: string }) =>
            a.data &&
            (a.data.includes("vmsdigital") ||
              a.data.includes("vercel") ||
              a.data.includes("cname.vmsdigital.com.br"))
        );

        if (cnameRecord) {
          return NextResponse.json({ verified: true, dominio: dominioLimpo });
        }
      }

      const aResponse = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(dominioLimpo)}&type=A`
      );
      const aData = await aResponse.json();

      if (aData.Answer) {
        const aRecord = aData.Answer.find(
          (a: { data: string }) => a.data === "76.76.21.21"
        );

        if (aRecord) {
          return NextResponse.json({ verified: true, dominio: dominioLimpo });
        }
      }

      return NextResponse.json({
        verified: false,
        error:
          "Domínio ainda não está apontando para nossos servidores. Verifique se o CNAME aponta para cname.vmsdigital.com.br ou o registro A aponta para 76.76.21.21",
      });
    } catch {
      return NextResponse.json({
        verified: false,
        error: "Não foi possível verificar o DNS. Tente novamente em alguns minutos.",
      });
    }
  } catch (error) {
    console.error("Erro ao verificar domínio:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
