import PageHeader from "@/Components/ui/PageHeader";
import KpiCard from "@/Components/ui/KpiCard";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import { formatDateBR, formatHours, formatPercent, formatHourRange } from "@/lib/formatters";

export const getServerSideProps = withPageAuth(
  ["ADMIN", "COORDENADOR", "GERENTE", "CONSULTOR"],
  async ({ context }) => {
    const baseUrl = `${(context.req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${context.req.headers.host}`;
    const response = await fetch(`${baseUrl}/api/dashboard/operacional`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const data = await response.json();
    return { props: { data } };
  },
);

export default function DashboardOperacional({ user, data }) {
  const metrics = data?.metrics || {};
  const kpis = [
    { title: "Agenda da semana", value: metrics.agendaSemana ?? 0 },
    { title: "Conflitos", value: metrics.conflitos ?? 0 },
    { title: "Horas alocadas", value: formatHours(metrics.horasAlocadas ?? 0) },
    { title: "Horas ociosas", value: formatHours(metrics.horasOciosasEstimadas ?? 0) },
    { title: "Retrabalho", value: metrics.retrabalho ?? 0 },
    { title: "Fases travadas", value: metrics.fasesTravadas ?? 0 },
  ];

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Operacional"
          subtitle="Gestão diária da agenda, conflitos, carga e execução da implantação."
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">
              Conflitos de agenda identificados
            </h3>
            <DataTable
              columns={[
                { key: "collaborator", label: "Consultor" },
                { key: "currentProject", label: "Projeto A" },
                { key: "nextProject", label: "Projeto B" },
                { key: "date", label: "Data", render: (row) => formatDateBR(row.date) },
                { key: "overlap", label: "Sobreposição", render: (row) => `${row.rangeA} x ${row.rangeB}` },
              ]}
              data={data?.collisions || []}
              emptyMessage="Sem conflitos no período."
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">
              Agenda da semana (próximas atividades)
            </h3>
            <DataTable
              columns={[
                { key: "date", label: "Data", render: (row) => formatDateBR(row.date) },
                { key: "collaborator", label: "Consultor", render: (row) => row.collaborator?.name || "-" },
                { key: "client", label: "Cliente", render: (row) => row.client?.tradeName || "-" },
                { key: "project", label: "Projeto", render: (row) => row.project?.name || "-" },
                { key: "module", label: "Módulo", render: (row) => row.module?.name || "-" },
                { key: "range", label: "Horário", render: (row) => formatHourRange(row.startTime, row.endTime) },
                { key: "hours", label: "Horas", render: (row) => formatHours(row.allocatedHours) },
                { key: "status", label: "Status", render: (row) => row.agendaStatus },
              ]}
              data={data?.allocationsWeek || []}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Projetos em atraso</h3>
          <DataTable
            columns={[
              { key: "name", label: "Projeto" },
              { key: "client", label: "Cliente", render: (row) => row.client?.tradeName || "-" },
              { key: "currentPhase", label: "Fase" },
              { key: "progressPercent", label: "Avanço", render: (row) => formatPercent(row.progressPercent || 0) },
              { key: "projectRisk", label: "Risco" },
              { key: "clientPending", label: "Pendências", render: (row) => row.clientPending || "-" },
            ]}
            data={data?.delayedProjects || []}
            emptyMessage="Sem projetos em atraso."
          />
        </section>
      </div>
    </ClientPageWrapper>
  );
}
