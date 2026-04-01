import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth, resolveBaseUrl } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import { formatDateBR, formatPercent } from "@/lib/formatters";
import { useMemo, useState } from "react";

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
  const npsRows = useMemo(() => payload?.nps || [], [payload?.nps]);
  const projectRows = useMemo(() => payload?.projects || [], [payload?.projects]);
  const taskRows = useMemo(() => payload?.tasks || [], [payload?.tasks]);
  const [filters, setFilters] = useState({
    statusProjeto: "",
    riscoProjeto: "",
    classificacaoNps: "",
    statusTarefa: "",
    prioridadeTarefa: "",
  });

  const filteredProjects = useMemo(() => {
    return projectRows.filter((row) => {
      if (filters.statusProjeto && row.status !== filters.statusProjeto) return false;
      if (filters.riscoProjeto && row.projectRisk !== filters.riscoProjeto) return false;
      return true;
    });
  }, [projectRows, filters.statusProjeto, filters.riscoProjeto]);

  const filteredNps = useMemo(() => {
    return npsRows.filter((row) => {
      if (filters.classificacaoNps && row.classification !== filters.classificacaoNps) return false;
      return true;
    });
  }, [npsRows, filters.classificacaoNps]);

  const filteredTasks = useMemo(() => {
    return taskRows.filter((row) => {
      if (filters.statusTarefa && row.status !== filters.statusTarefa) return false;
      if (filters.prioridadeTarefa && row.priority !== filters.prioridadeTarefa) return false;
      return true;
    });
  }, [taskRows, filters.statusTarefa, filters.prioridadeTarefa]);

  function exportCapacityCsv() {
    const csv = toCsv(
      capacityRows.map((row) => [
        row.nome,
        row.capacidadeUtil,
        row.horasMes,
        formatPercent(row.ocupacaoMes),
        row.semaforoMes,
      ]),
      ["Colaborador", "Capacidade Útil", "Horas Mês", "% Ocupação Mês", "Semáforo Mês"],
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

        <section className="ag-card">
          <div className="ag-card-body">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">Filtros avançados</h2>
            <div className="grid gap-3 md:grid-cols-5">
              <select
                className="ag-select"
                value={filters.statusProjeto}
                onChange={(e) => setFilters((p) => ({ ...p, statusProjeto: e.target.value }))}
              >
                <option value="">Status projeto (todos)</option>
                {["PLANEJADO", "EM_ANDAMENTO", "ATRASADO", "BLOQUEADO", "CONCLUIDO"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                className="ag-select"
                value={filters.riscoProjeto}
                onChange={(e) => setFilters((p) => ({ ...p, riscoProjeto: e.target.value }))}
              >
                <option value="">Risco projeto (todos)</option>
                {["BAIXO", "MEDIO", "ALTO", "CRITICO"].map((risk) => (
                  <option key={risk} value={risk}>
                    {risk}
                  </option>
                ))}
              </select>
              <select
                className="ag-select"
                value={filters.classificacaoNps}
                onChange={(e) => setFilters((p) => ({ ...p, classificacaoNps: e.target.value }))}
              >
                <option value="">NPS (todas classificações)</option>
                {["PROMOTOR", "NEUTRO", "DETRATOR"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="ag-select"
                value={filters.statusTarefa}
                onChange={(e) => setFilters((p) => ({ ...p, statusTarefa: e.target.value }))}
              >
                <option value="">Status tarefa (todos)</option>
                {["ABERTA", "EM_ANDAMENTO", "BLOQUEADA", "CONCLUIDA"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="ag-select"
                value={filters.prioridadeTarefa}
                onChange={(e) => setFilters((p) => ({ ...p, prioridadeTarefa: e.target.value }))}
              >
                <option value="">Prioridade tarefa (todas)</option>
                {["BAIXA", "MEDIA", "ALTA", "CRITICA"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <DataTable
          title="Relatório de capacity por colaborador"
          columns={[
            { key: "nome", label: "Colaborador" },
            { key: "capacidadeUtil", label: "Capacidade útil" },
            { key: "horasMes", label: "Horas no mês" },
            { key: "ocupacaoMes", label: "% Ocupação", render: (row) => formatPercent(row.ocupacaoMes) },
            { key: "semaforoMes", label: "Semáforo" },
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
          data={filteredNps}
        />

        <DataTable
          title="Relatório de projetos"
          columns={[
            { key: "name", label: "Projeto" },
            { key: "client", label: "Cliente", render: (row) => row.client?.tradeName || "-" },
            { key: "status", label: "Status" },
            { key: "currentPhase", label: "Fase atual" },
            {
              key: "progressPercent",
              label: "% avanço",
              render: (row) => formatPercent(row.progressPercent),
            },
            { key: "projectRisk", label: "Risco" },
          ]}
          data={filteredProjects}
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
          data={filteredTasks}
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
          nps: Array.isArray(npsRes) ? npsRes : [],
          projects: projectsRes,
          tasks: tasksRes,
        },
      },
    };
  },
);

