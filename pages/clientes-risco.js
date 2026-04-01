import PageHeader from "@/Components/ui/PageHeader";
import KpiCard from "@/Components/ui/KpiCard";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth, resolveBaseUrl } from "@/lib/page-helpers";
import { formatDateBR } from "@/lib/formatters";
import ClientPageWrapper from "@/lib/client-page-wrapper";

function riskChip(risk) {
  if (risk === "CRITICO" || risk === "ALTO") return "chip-danger";
  if (risk === "MEDIO") return "chip-warning";
  return "chip-success";
}

export const getServerSideProps = withPageAuth(
  ["ADMIN", "DIRETORIA", "COORDENADOR", "GERENTE", "CS"],
  async ({ context }) => {
    const baseUrl = resolveBaseUrl(context.req);
    const response = await fetch(`${baseUrl}/api/client-risk`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const data = await response.json();
    return { props: { data } };
  },
);

export default function ClientesRiscoPage({ user, data }) {
  const summary = data?.summary || {};
  const items = data?.items || [];

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Painel de Clientes em Risco"
          subtitle="Consolidação de Health Score, NPS, atraso e risco operacional por cliente."
        />

        <section className="grid gap-4 md:grid-cols-5">
          <KpiCard title="Clientes totais" value={summary.totalClients ?? 0} />
          <KpiCard
            title="Vermelhos"
            value={summary.red ?? 0}
            tone={summary.red > 0 ? "danger" : "success"}
          />
          <KpiCard title="Amarelos" value={summary.yellow ?? 0} tone="warning" />
          <KpiCard title="Health médio" value={Number(summary.avgHealth || 0).toFixed(1)} />
          <KpiCard title="NPS médio" value={Number(summary.avgNps || 0).toFixed(1)} />
        </section>

        <DataTable
          title="Clientes priorizados por risco"
          columns={[
            { key: "client", label: "Cliente" },
            { key: "segment", label: "Segmento" },
            { key: "city", label: "Cidade/UF" },
            { key: "healthScore", label: "Health score" },
            { key: "nps", label: "NPS" },
            { key: "detractors", label: "Detratores" },
            { key: "delayedProjects", label: "Projetos atrasados" },
            {
              key: "risk",
              label: "Risco",
              render: (row) => <span className={riskChip(row.risk)}>{row.risk}</span>,
            },
            {
              key: "goLiveForecast",
              label: "Go-live previsto",
              render: (row) => formatDateBR(row.goLiveForecast),
            },
          ]}
          data={items}
          emptyMessage="Sem dados de risco de clientes."
        />
      </div>
    </ClientPageWrapper>
  );
}
