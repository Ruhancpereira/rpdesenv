import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import KpiCard from "@/Components/ui/KpiCard";
import { withPageAuth } from "@/lib/page-helpers";
import { formatHours, formatPercent } from "@/lib/formatters";
import { ClientPageWrapper } from "@/lib/client-page-wrapper";

export const getServerSideProps = withPageAuth(
  ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"],
  async ({ context }) => {
    const baseUrl = `${(context.req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${context.req.headers.host}`;
    const response = await fetch(`${baseUrl}/api/capacity`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const data = await response.json();
    return { props: { data } };
  },
);

export default function CapacityPage({ user, data }) {
  const byCollaborator = data?.byCollaborator || [];
  const byCore = data?.byCore || [];
  const byModule = data?.byModule || [];
  const weeklyPeriods = data?.weeklyPeriods || [];
  const monthlyPeriods = data?.monthlyPeriods || [];
  const capacitySeries = data?.capacitySeries || [];

  const overloaded = byCollaborator.filter((c) => c.ocupacaoMes > 100 || c.ocupacaoSemana > 100).length;
  const avgOccupation =
    byCollaborator.length > 0
      ? byCollaborator.reduce((acc, item) => acc + item.ocupacaoMes, 0) / byCollaborator.length
      : 0;

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Capacity Planning"
          subtitle="Capacidade nominal e útil, ocupação, semáforo e cobertura de skills por colaborador, core e módulo."
        />

        <section className="grid gap-4 md:grid-cols-4">
          <KpiCard title="Colaboradores ativos" value={byCollaborator.length} />
          <KpiCard
            title="Ocupação média mensal"
            value={formatPercent(avgOccupation)}
            tone={avgOccupation > 100 ? "danger" : avgOccupation > 80 ? "warning" : "success"}
          />
          <KpiCard
            title="Sobrecarregados"
            value={overloaded}
            tone={overloaded > 0 ? "danger" : "success"}
          />
          <KpiCard
            title="Módulos com risco de cobertura"
            value={byModule.filter((m) => m.spof || m.gap > 0).length}
            tone={byModule.some((m) => m.spof) ? "danger" : "warning"}
          />
        </section>

        <DataTable
          title="Capacity por colaborador"
          columns={[
            { key: "nome", label: "Colaborador" },
            { key: "capacidadeNominal", label: "Capacidade nominal (h)" },
            { key: "capacidadeUtil", label: "Capacidade útil (h)" },
            { key: "horasSemana", label: "Horas semana", render: (row) => formatHours(row.horasSemana) },
            { key: "horasMes", label: "Horas mês", render: (row) => formatHours(row.horasMes) },
            {
              key: "ocupacaoSemana",
              label: "% Ocupação semana",
              render: (row) => formatPercent(row.ocupacaoSemana),
            },
            {
              key: "ocupacaoMes",
              label: "% Ocupação mês",
              render: (row) => formatPercent(row.ocupacaoMes),
            },
            {
              key: "sobrecargaSemana",
              label: "% Sobrecarga semana",
              render: (row) => formatPercent(row.sobrecargaSemana),
            },
            {
              key: "sobrecargaMes",
              label: "% Sobrecarga mês",
              render: (row) => formatPercent(row.sobrecargaMes),
            },
            { key: "folgaSemana", label: "Folga semana", render: (row) => formatHours(row.folgaSemana) },
            { key: "folgaMes", label: "Folga mês", render: (row) => formatHours(row.folgaMes) },
            { key: "projetosSimultaneos", label: "Projetos simultâneos" },
            { key: "modulosSimultaneos", label: "Módulos simultâneos" },
            { key: "indiceFragmentacao", label: "Índice de fragmentação" },
            { key: "semaforoSemana", label: "Semáforo semana" },
            { key: "semaforoMes", label: "Semáforo mês" },
          ]}
          data={byCollaborator}
        />

        <section className="grid gap-6 xl:grid-cols-2">
          <DataTable
            title="Capacidade por semana (últimas 8)"
            columns={[
              { key: "collaboratorName", label: "Colaborador" },
              ...weeklyPeriods.map((label, idx) => ({
                key: `w${idx}`,
                label,
                render: (row) => {
                  const p = row.weekly[idx];
                  return p ? `${p.horas.toFixed(0)}h / ${p.ocupacao.toFixed(0)}%` : "-";
                },
              })),
            ]}
            data={capacitySeries}
          />
          <DataTable
            title="Capacidade por mês (últimos 6)"
            columns={[
              { key: "collaboratorName", label: "Colaborador" },
              ...monthlyPeriods.map((label, idx) => ({
                key: `m${idx}`,
                label,
                render: (row) => {
                  const p = row.monthly[idx];
                  return p ? `${p.horas.toFixed(0)}h / ${p.ocupacao.toFixed(0)}%` : "-";
                },
              })),
            ]}
            data={capacitySeries}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <DataTable
            title="Visão por core"
            columns={[
              { key: "core", label: "Core" },
              { key: "horasSemana", label: "Horas semana", render: (row) => formatHours(row.horasSemana) },
              { key: "horasMes", label: "Horas mês", render: (row) => formatHours(row.horasMes) },
              { key: "coberturaSkills", label: "Cobertura de skill" },
              { key: "totalModulos", label: "Módulos" },
              { key: "densidadeSkills", label: "Densidade skills" },
            ]}
            data={byCore}
          />
          <DataTable
            title="Risco por módulo"
            columns={[
              { key: "modulo", label: "Módulo" },
              { key: "core", label: "Core" },
              { key: "demandaSemana", label: "Demanda semana", render: (row) => formatHours(row.demandaSemana) },
              { key: "demandaMes", label: "Demanda mês", render: (row) => formatHours(row.demandaMes) },
              { key: "autonomia", label: "Autonomia (N3+)" },
              { key: "especialistas", label: "Especialistas (N4)" },
              { key: "minimo", label: "Mínimo" },
              { key: "gap", label: "Gap" },
              { key: "spof", label: "SPOF", render: (row) => (row.spof ? "Sim" : "Não") },
              { key: "severidade", label: "Severidade" },
            ]}
            data={byModule}
          />
        </section>
      </div>
    </ClientPageWrapper>
  );
}
