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
    const response = await fetch(`${baseUrl}/api/dashboard/executivo`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const data = await response.json();
    return { props: { data } };
  },
);

export default function DashboardExecutivoPage({ user, data }) {
  const metrics = data?.metrics || {};

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
