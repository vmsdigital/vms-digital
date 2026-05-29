import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: tarefasAgendadas } = await supabase
    .from("agente_tarefas")
    .select("id, criador_id, horario_limite")
    .in("status", ["prospectando", "gerando"]);

  if (!tarefasAgendadas?.length) {
    return NextResponse.json({ message: "Nenhuma tarefa ativa", processadas: 0 });
  }

  let canceladas = 0;

  for (const tarefa of tarefasAgendadas) {
    const agora = new Date();
    const [h, m] = tarefa.horario_limite.split(":").map(Number);
    const limite = new Date(agora);
    limite.setHours(h, m, 0, 0);

    if (agora >= limite) {
      await supabase
        .from("agente_tarefas")
        .update({
          status: "parcial",
          concluido_em: new Date().toISOString(),
          log: [
            `⏰ Horário limite atingido (${tarefa.horario_limite})`,
            "Tarefa cancelada automaticamente pelo cron",
          ],
        })
        .eq("id", tarefa.id);

      await supabase.from("notificacoes").insert({
        usuario_id: tarefa.criador_id,
        tipo: "sistema",
        titulo: "Agente IA — Horário limite atingido",
        mensagem: `A tarefa foi parada automaticamente às ${tarefa.horario_limite}. Sites já criados estão disponíveis em Propostas.`,
        lida: false,
      });

      canceladas++;
    }
  }

  return NextResponse.json({
    message: `Verificação concluída`,
    ativas: tarefasAgendadas.length,
    canceladas,
  });
}
