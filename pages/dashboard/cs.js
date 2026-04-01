import PageHeader from "@/Components/ui/PageHeader";
import KpiCard from "@/Components/ui/KpiCard";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import { formatPercent } from "@/lib/formatters";

function semaforoClass(status) {
  if (status === "ALTO" || status === "CRITICO") return "border border-rose-500/40 bg-rose-500/10 text-rose-300";
  if (status === "MEDIO") return "border border-amber-500/40 bg-amber-500/10 text-amber-200";
  return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
}

export const getServerSideProps = withPageAuth(
  ["ADMIN", "CS", "GERENTE", "DIRETORIA"],
  async ({ context }) => {
    const baseUrl = `${(context.req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${context.req.headers.host}`;
    const response = await fetch(`${baseUrl}/api/dashboard/cs`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const data = await response.json();
    return { props: { data } };
  },
);

export default function DashboardCSPage({ user, data }) {
  const summary = data?.summary || {};
  const npsEtapa = data?.npsPorEtapa || [];
  const healthCards = data?.healthDetalhado || [];

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard CS / NPS"
          subtitle="Visão da experiência do cliente durante a implantação e tratativas em andamento."
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Clientes verdes" value={summary.clientesVerdes ?? 0} tone="success" />
          <KpiCard title="Clientes amarelos" value={summary.clientesAmarelos ?? 0} tone="warning" />
          <KpiCard
            title="Clientes vermelhos"
            value={summary.clientesVermelhos ?? 0}
            tone={summary.clientesVermelhos > 0 ? "danger" : "success"}
          />
          <KpiCard
            title="NPS geral"
            value={summary.npsGeral ?? 0}
            tone={summary.npsGeral >= 50 ? "success" : "warning"}
          />
          <KpiCard
            title="Detratores abertos"
            value={summary.detratoresAbertos ?? 0}
            tone={summary.detratoresAbertos > 0 ? "danger" : "success"}
          />
          <KpiCard
            title="Planos pendentes"
            value={summary.planosPendentes ?? 0}
            tone={summary.planosPendentes > 0 ? "warning" : "success"}
          />
          <KpiCard title="% Clientes verdes" value={formatPercent(summary.percentualVerde ?? 0)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-200">Clientes por health score</h2>
            <p className="mb-4 text-xs text-slate-400">Semáforo de risco por cliente/projeto.</p>

            <div className="space-y-3">
              {healthCards.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{item.cliente}</p>
                      <p className="text-xs text-slate-400">
                        Escore {item.score.toFixed(1)} | Pendências {item.pendencias}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${semaforoClass(item.score < 55 ? "ALTO" : item.score < 75 ? "MEDIO" : "BAIXO")}`}
                    >
                      {item.score < 55 ? "Vermelho" : item.score < 75 ? "Amarelo" : "Verde"}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${Math.max(0, Math.min(item.score, 100))}%` }}
                    />
                  </div>
                </div>
              ))}
              {healthCards.length === 0 && (
                <p className="text-sm text-slate-400">Sem registros.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-200">NPS por etapa</h2>
            <p className="mb-4 text-xs text-slate-400">Média de nota e total de respostas por fase.</p>

            <div className="space-y-3">
              {npsEtapa.map((item) => (
                <div key={item.phase} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                  <div className="flex items-center justify-between text-sm text-slate-100">
                    <span>{item.phase}</span>
                    <span className="font-semibold">{item.media.toFixed(1)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.respostas} respostas</p>
                </div>
              ))}
              {npsEtapa.length === 0 && (
                <p className="text-sm text-slate-400">Sem NPS registrado.</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <DataTable
            title="Detalhamento de health score"
            columns={[
              { key: "cliente", label: "Cliente" },
              { key: "score", label: "Score", render: (row) => row.score.toFixed(1) },
              { key: "engajamento", label: "Engajamento" },
              { key: "aderenciaCronograma", label: "Aderência" },
              { key: "pendencias", label: "Pendências" },
              {
                key: "riscoEscalada",
                label: "Escalada",
                render: (row) => (row.riscoEscalada ? "Sim" : "Não"),
              },
            ]}
            data={healthCards}
            emptyMessage="Sem dados de health score."
          />
        </section>

        <section>
          <DataTable
            title="NPS por etapa"
            columns={[
              { key: "phase", label: "Etapa" },
              { key: "media", label: "Média", render: (row) => row.media.toFixed(1) },
              { key: "respostas", label: "Respostas" },
            ]}
            data={npsEtapa}
            emptyMessage="Sem dados de NPS."
          />
        </section>
      </div>
    </ClientPageWrapper>
  );
}
