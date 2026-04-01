import PageHeader from "@/Components/ui/PageHeader";
import KpiCard from "@/Components/ui/KpiCard";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth, resolveBaseUrl } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import { formatHours } from "@/lib/formatters";

export const getServerSideProps = withPageAuth(
  ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"],
  async ({ context }) => {
    const baseUrl = resolveBaseUrl(context.req);
    const response = await fetch(`${baseUrl}/api/bottlenecks`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const payload = await response.json();
    return { props: { payload } };
  },
);

function severityTone(severity) {
  if (severity === "CRITICO") return "danger";
  if (severity === "ALTO") return "warning";
  return "default";
}

export default function GargalosPage({ user, payload }) {
  const coreBottlenecks = payload?.coreBottlenecks || [];
  const moduleBottlenecks = payload?.moduleBottlenecks || [];
  const summary = payload?.summary || {};

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Gargalos por Módulo e Core"
          subtitle="Identifique rapidamente pontos de estrangulamento por demanda, cobertura e dependência de especialista."
        />

        <section className="grid gap-4 md:grid-cols-4">
          <KpiCard
            title="Módulos críticos"
            value={summary.criticalModules || 0}
            tone={summary.criticalModules > 0 ? "danger" : "success"}
          />
          <KpiCard
            title="Módulos com SPOF"
            value={summary.modulesWithSpof || 0}
            tone={summary.modulesWithSpof > 0 ? "danger" : "success"}
          />
          <KpiCard
            title="Core com maior risco"
            value={summary.topCore || "-"}
            tone={summary.topCoreRiskScore > 0 ? "warning" : "default"}
          />
          <KpiCard
            title="Demanda mensal total"
            value={formatHours(summary.monthDemandTotal || 0)}
          />
        </section>

        <DataTable
          title="Gargalos por módulo"
          columns={[
            { key: "modulo", label: "Módulo" },
            { key: "core", label: "Core" },
            { key: "demandaSemana", label: "Demanda semana", render: (row) => formatHours(row.demandaSemana) },
            { key: "demandaMes", label: "Demanda mês", render: (row) => formatHours(row.demandaMes) },
            { key: "autonomia", label: "Nível 3+" },
            { key: "especialistas", label: "Nível 4" },
            { key: "minimo", label: "Mínimo recomendado" },
            { key: "gap", label: "Gap de cobertura" },
            {
              key: "severidade",
              label: "Severidade",
              render: (row) => (
                <span
                  className={`${
                    severityTone(row.severidade) === "danger"
                      ? "chip-danger"
                      : severityTone(row.severidade) === "warning"
                        ? "chip-warning"
                        : "chip-success"
                  }`}
                >
                  {row.severidade}
                </span>
              ),
            },
            { key: "alerta", label: "Diagnóstico" },
          ]}
          data={moduleBottlenecks}
          emptyMessage="Sem gargalos detectados."
        />

        <DataTable
          title="Gargalos por core"
          columns={[
            { key: "core", label: "Core" },
            { key: "demandaSemana", label: "Demanda semana", render: (row) => formatHours(row.demandaSemana) },
            { key: "demandaMes", label: "Demanda mês", render: (row) => formatHours(row.demandaMes) },
            { key: "skills", label: "Cobertura de skills" },
            { key: "spofModules", label: "Módulos com SPOF" },
            { key: "coverageGapModules", label: "Módulos com gap" },
            { key: "riskScore", label: "Score de risco" },
          ]}
          data={coreBottlenecks}
          emptyMessage="Sem gargalos por core."
        />
      </div>
    </ClientPageWrapper>
  );
}
