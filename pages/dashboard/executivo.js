import PageHeader from "@/Components/ui/PageHeader";
import KpiCard from "@/Components/ui/KpiCard";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import { formatDateBR, formatPercent, formatRiskLabel } from "@/lib/formatters";

export const getServerSideProps = withPageAuth(
  ["ADMIN", "DIRETORIA", "COORDENADOR", "GERENTE"],
  async ({ context }) => {
    const baseUrl = `${(context.req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${context.req.headers.host}`;
    const [dashboardResponse, overviewResponse] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/executivo`, {
        headers: { cookie: context.req.headers.cookie || "" },
      }),
      fetch(`${baseUrl}/api/operations-overview`, {
        headers: { cookie: context.req.headers.cookie || "" },
      }),
    ]);
    const [data, overview] = await Promise.all([
      dashboardResponse.json(),
      overviewResponse.json(),
    ]);
    return { props: { data, overview } };
  },
);

export default function DashboardExecutivoPage({ user, data, overview }) {
  const metrics = data?.metrics || {};
  const risks = overview?.clientRisk?.summary || {};
  const bottlenecks = overview?.bottlenecks?.summary || {};
  const spofSync = overview?.spofSync || {};
  const topClients = (overview?.clientRisk?.items || []).slice(0, 6);
  const topModules = (overview?.bottlenecks?.moduleBottlenecks || []).slice(0, 8);

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Executivo"
          subtitle="Visão consolidada de performance, risco, capacidade e experiência do cliente."
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Projetos ativos" value={metrics.projetosAtivos ?? 0} />
          <KpiCard
            label="Projetos em risco"
            value={metrics.projetosEmRisco ?? 0}
            tone={metrics.projetosEmRisco > 0 ? "warning" : "success"}
          />
          <KpiCard
            label="Taxa no prazo"
            value={formatPercent(metrics.taxaNoPrazo ?? 0)}
            tone={metrics.taxaNoPrazo >= 80 ? "success" : "warning"}
          />
          <KpiCard
            label="NPS geral"
            value={metrics.npsGeral ?? 0}
            tone={metrics.npsGeral >= 50 ? "success" : "warning"}
          />
          <KpiCard label="Health score médio" value={metrics.healthScoreMedio ?? 0} />
          <KpiCard
            label="Capacidade média"
            value={formatPercent(metrics.capacidadeMediaTime ?? 0)}
          />
          <KpiCard
            label="Consultores sobrecarregados"
            value={metrics.consultoresSobrecarregados ?? 0}
            tone={metrics.consultoresSobrecarregados > 0 ? "danger" : "success"}
          />
          <KpiCard
            label="Clientes vermelhos"
            value={metrics.clientesVermelhos ?? 0}
            tone={metrics.clientesVermelhos > 0 ? "danger" : "success"}
          />
          <KpiCard
            label="Módulos com SPOF"
            value={bottlenecks.modulesWithSpof ?? 0}
            tone={(bottlenecks.modulesWithSpof || 0) > 0 ? "danger" : "success"}
          />
          <KpiCard
            label="Clientes em risco (painel)"
            value={risks.red ?? 0}
            tone={(risks.red || 0) > 0 ? "danger" : "success"}
          />
          <KpiCard
            label="SPOF ativos"
            value={spofSync.active ?? 0}
            helper={`+${spofSync.created || 0} novos / ${spofSync.resolved || 0} resolvidos`}
            tone={(spofSync.active || 0) > 0 ? "warning" : "success"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <DataTable
            title="Clientes prioritários por risco"
            columns={[
              { key: "client", label: "Cliente" },
              { key: "healthScore", label: "Health" },
              { key: "nps", label: "NPS" },
              { key: "delayedProjects", label: "Atrasos" },
              { key: "risk", label: "Risco" },
            ]}
            data={topClients}
            emptyMessage="Sem clientes críticos no momento."
          />
          <DataTable
            title="Gargalos de módulos"
            columns={[
              { key: "modulo", label: "Módulo" },
              { key: "core", label: "Core" },
              { key: "especialistas", label: "N4" },
              { key: "gap", label: "Gap" },
              { key: "severidade", label: "Severidade" },
            ]}
            data={topModules}
            emptyMessage="Sem gargalos críticos."
          />
        </section>

        <DataTable
          title="Alertas operacionais abertos"
          columns={[
            { key: "type", label: "Tipo" },
            {
              key: "severity",
              label: "Severidade",
              render: (row) => formatRiskLabel(row.severity),
            },
            { key: "message", label: "Mensagem" },
            { key: "createdAt", label: "Data", render: (row) => formatDateBR(row.createdAt) },
          ]}
          data={data?.alertas || []}
          emptyMessage="Sem alertas operacionais em aberto."
        />
      </div>
    </ClientPageWrapper>
  );
}
