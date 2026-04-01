import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import KpiCard from "@/Components/ui/KpiCard";
import { withPageAuth } from "@/lib/page-helpers";
import { formatHours, formatPercent } from "@/lib/formatters";
import ClientPageWrapper from "@/lib/client-page-wrapper";

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

  const overloaded = byCollaborator.filter((c) => c.ocupacaoPercentual > 100).length;
  const avgOccupation =
    byCollaborator.length > 0
      ? byCollaborator.reduce((acc, item) => acc + item.ocupacaoPercentual, 0) / byCollaborator.length
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
          title="Ocupação média"
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
          value={byModule.filter((m) => m.singlePointOfFailure || m.baixaCobertura).length}
          tone={byModule.some((m) => m.singlePointOfFailure) ? "danger" : "warning"}
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
          { key: "ocupacaoPercentual", label: "% Ocupação", render: (row) => formatPercent(row.ocupacaoPercentual) },
          { key: "sobrecargaPercentual", label: "% Sobrecarga", render: (row) => formatPercent(row.sobrecargaPercentual) },
          { key: "folgaDisponivel", label: "Folga", render: (row) => formatHours(row.folgaDisponivel) },
          { key: "projetosSimultaneos", label: "Projetos simultâneos" },
          { key: "modulosSimultaneos", label: "Módulos simultâneos" },
          { key: "indiceFragmentacao", label: "Índice de fragmentação" },
          { key: "semaforo", label: "Semáforo" },
        ]}
        data={byCollaborator}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="Visão por core"
          columns={[
            { key: "core", label: "Core" },
            { key: "horas", label: "Horas alocadas", render: (row) => formatHours(row.horas) },
            { key: "cobertura", label: "Cobertura de skill" },
            { key: "modulos", label: "Módulos" },
          ]}
          data={byCore}
        />
        <DataTable
          title="Risco por módulo"
          columns={[
            { key: "modulo", label: "Módulo" },
            { key: "horas", label: "Horas", render: (row) => formatHours(row.horas) },
            { key: "pessoasCapacitadas", label: "Capacitados" },
            { key: "minimoRecomendado", label: "Mínimo recomendado" },
            { key: "singlePointOfFailure", label: "SPOF", render: (row) => (row.singlePointOfFailure ? "Sim" : "Não") },
            { key: "baixaCobertura", label: "Baixa cobertura", render: (row) => (row.baixaCobertura ? "Sim" : "Não") },
            { key: "dependenciaEspecialista", label: "Dependência especialista", render: (row) => (row.dependenciaEspecialista ? "Sim" : "Não") },
            { key: "requerCrossTraining", label: "Requer cross-training", render: (row) => (row.requerCrossTraining ? "Sim" : "Não") },
          ]}
          data={byModule}
        />
      </section>
    </div>
    </ClientPageWrapper>
  );
}
