import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth, resolveBaseUrl } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import { formatDateBR, formatPercent } from "@/lib/formatters";

function toCsv(rows, headers) {
  const escape = (value) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  const headerLine = headers.map((h) => escape(h)).join(",");
  const body = rows.map((row) => row.map((cell) => escape(cell)).join(",")).join("\n");
  return `${headerLine}\n${body}`;
}

export default function RelatoriosPage({ user, payload }) {
  const capacityRows = payload?.capacity?.byCollaborator || [];
  const npsRows = payload?.nps || [];
  const projectRows = payload?.projects || [];
  const taskRows = payload?.tasks || [];

  function exportCapacityCsv() {
    const csv = toCsv(
      capacityRows.map((row) => [
        row.nome,
        row.capacidadeUtil,
        row.horasMes,
        formatPercent(row.ocupacaoPercentual),
        row.semaforo,
      ]),
      ["Colaborador", "Capacidade Útil", "Horas Mês", "% Ocupação", "Semáforo"],
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-capacity-agrosys.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Relatórios"
          subtitle="Visões consolidadas e exportação para análise operacional e executiva."
          actions={
            <button className="ag-button-primary" type="button" onClick={exportCapacityCsv}>
              Exportar Capacity (CSV)
            </button>
          }
        />

        <DataTable
          title="Relatório de capacity por colaborador"
          columns={[
            { key: "nome", label: "Colaborador" },
            { key: "capacidadeUtil", label: "Capacidade útil" },
            { key: "horasMes", label: "Horas no mês" },
            { key: "ocupacaoPercentual", label: "% Ocupação", render: (row) => formatPercent(row.ocupacaoPercentual) },
            { key: "semaforo", label: "Semáforo" },
          ]}
          data={capacityRows}
        />

        <DataTable
          title="Relatório de NPS"
          columns={[
            { key: "client", label: "Cliente", render: (row) => row.client?.tradeName || "-" },
            { key: "project", label: "Projeto", render: (row) => row.project?.name || "-" },
            { key: "phase", label: "Fase" },
            { key: "score", label: "Nota" },
            { key: "classification", label: "Classificação" },
            { key: "date", label: "Data", render: (row) => formatDateBR(row.date) },
          ]}
          data={npsRows}
        />

        <DataTable
          title="Relatório de projetos"
          columns={[
            { key: "name", label: "Projeto" },
            { key: "client", label: "Cliente", render: (row) => row.client?.tradeName || "-" },
            { key: "status", label: "Status" },
            { key: "currentPhase", label: "Fase atual" },
            { key: "progressPercent", label: "% avanço", render: (row) => formatPercent(row.progressPercent) },
            { key: "projectRisk", label: "Risco" },
          ]}
          data={projectRows}
        />

        <DataTable
          title="Relatório de tarefas"
          columns={[
            { key: "title", label: "Título" },
            { key: "origin", label: "Origem" },
            { key: "priority", label: "Prioridade" },
            { key: "status", label: "Status" },
            { key: "responsible", label: "Responsável", render: (row) => row.responsible?.name || "-" },
            { key: "dueDate", label: "Prazo", render: (row) => formatDateBR(row.dueDate) },
          ]}
          data={taskRows}
        />
      </div>
    </ClientPageWrapper>
  );
}

export const getServerSideProps = withPageAuth(
  ["ADMIN", "DIRETORIA", "COORDENADOR", "GERENTE", "CS"],
  async ({ context }) => {
    const baseUrl = resolveBaseUrl(context.req);
    const [capacityRes, npsRes, projectsRes, tasksRes] = await Promise.all([
      fetch(`${baseUrl}/api/capacity`, { headers: { cookie: context.req.headers.cookie || "" } }).then((r) => r.json()),
      fetch(`${baseUrl}/api/nps`, { headers: { cookie: context.req.headers.cookie || "" } }).then((r) => r.json()),
      fetch(`${baseUrl}/api/projects`, { headers: { cookie: context.req.headers.cookie || "" } }).then((r) => r.json()),
      fetch(`${baseUrl}/api/tasks`, { headers: { cookie: context.req.headers.cookie || "" } }).then((r) => r.json()),
    ]);

    return {
      props: {
        payload: {
          capacity: capacityRes,
          nps: npsRes,
          projects: projectsRes,
          tasks: tasksRes,
        },
      },
    };
  },
);

