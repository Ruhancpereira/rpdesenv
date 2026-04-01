import { useMemo, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { requirePageAccess, resolveBaseUrl } from "@/lib/page-helpers";
import { ClientPageWrapper } from "@/lib/client-page-wrapper";
import { PRIORITY_OPTIONS, RISK_OPTIONS, PROJECT_STATUS_OPTIONS, PHASE_OPTIONS } from "@/lib/constants";
import { formatDateBR } from "@/lib/formatters";

const defaultForm = {
  name: "",
  clientId: "",
  managerId: "",
  csOwnerId: "",
  status: "PLANEJADO",
  currentPhase: "pré-kickoff",
  priority: "MEDIA",
  criticality: "MEDIO",
  startDate: "",
  targetEndDate: "",
  progressPercent: 0,
  projectRisk: "MEDIO",
  clientPending: "",
  internalPending: "",
  notes: "",
  consultantIds: [],
};

export default function ProjetosPage({ user, initial }) {
  const [projects, setProjects] = useState(initial.projects);
  const [viewMode, setViewMode] = useState("KANBAN");
  const [selectedProjectId, setSelectedProjectId] = useState(initial.timeline?.[0]?.projectId || "");
  const [form, setForm] = useState(defaultForm);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleConsultant = (id) => {
    setForm((prev) => ({
      ...prev,
      consultantIds: prev.consultantIds.includes(id)
        ? prev.consultantIds.filter((x) => x !== id)
        : [...prev.consultantIds, id],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Falha ao criar projeto.");
      return;
    }
    toast.success("Projeto criado com sucesso.");
    setProjects((prev) => [...prev, data]);
    setForm(defaultForm);
  };

  const selectedTimeline = useMemo(() => {
    return (initial.timeline || []).find((item) => item.projectId === selectedProjectId) || null;
  }, [initial.timeline, selectedProjectId]);

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-5">
        <PageHeader
          title="Projetos de Implantação"
          subtitle="Acompanhamento da execução, fase atual, risco, avanço e responsáveis."
        />

        <section className="ag-card">
          <div className="ag-card-body">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">Novo projeto</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <input
                  className="ag-input"
                  placeholder="Nome do projeto"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
                <select
                  className="ag-select"
                  value={form.clientId}
                  onChange={(e) => update("clientId", e.target.value)}
                  required
                >
                  <option value="">Cliente</option>
                  {initial.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.tradeName}
                    </option>
                  ))}
                </select>
                <select
                  className="ag-select"
                  value={form.managerId}
                  onChange={(e) => update("managerId", e.target.value)}
                  required
                >
                  <option value="">Gerente</option>
                  {initial.collaborators.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                <select
                  className="ag-select"
                  value={form.csOwnerId}
                  onChange={(e) => update("csOwnerId", e.target.value)}
                  required
                >
                  <option value="">CS responsável</option>
                  {initial.collaborators.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                <select
                  className="ag-select"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {PROJECT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  className="ag-select"
                  value={form.currentPhase}
                  onChange={(e) => update("currentPhase", e.target.value)}
                >
                  {PHASE_OPTIONS.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
                <input
                  className="ag-input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                  required
                />
                <input
                  className="ag-input"
                  type="date"
                  value={form.targetEndDate}
                  onChange={(e) => update("targetEndDate", e.target.value)}
                  required
                />
                <select
                  className="ag-select"
                  value={form.priority}
                  onChange={(e) => update("priority", e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <select
                  className="ag-select"
                  value={form.criticality}
                  onChange={(e) => update("criticality", e.target.value)}
                >
                  {RISK_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <select
                  className="ag-select"
                  value={form.projectRisk}
                  onChange={(e) => update("projectRisk", e.target.value)}
                >
                  {RISK_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <input
                  className="ag-input"
                  type="number"
                  min={0}
                  max={100}
                  value={form.progressPercent}
                  onChange={(e) => update("progressPercent", Number(e.target.value))}
                  placeholder="% avanço"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <textarea
                  className="ag-textarea"
                  rows={2}
                  placeholder="Pendências do cliente"
                  value={form.clientPending}
                  onChange={(e) => update("clientPending", e.target.value)}
                />
                <textarea
                  className="ag-textarea"
                  rows={2}
                  placeholder="Pendências internas"
                  value={form.internalPending}
                  onChange={(e) => update("internalPending", e.target.value)}
                />
                <textarea
                  className="ag-textarea"
                  rows={2}
                  placeholder="Observações"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                  Consultores envolvidos
                </p>
                <div className="flex flex-wrap gap-2">
                  {initial.collaborators.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => toggleConsultant(person.id)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        form.consultantIds.includes(person.id)
                          ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {person.name}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
              >
                Criar projeto
              </button>
            </form>
          </div>
        </section>

        <section className="ag-card">
          <div className="ag-card-body">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-100">Execução da implantação</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={viewMode === "KANBAN" ? "ag-button-primary" : "ag-button-secondary"}
                  onClick={() => setViewMode("KANBAN")}
                >
                  Kanban por fase
                </button>
                <button
                  type="button"
                  className={viewMode === "TIMELINE" ? "ag-button-primary" : "ag-button-secondary"}
                  onClick={() => setViewMode("TIMELINE")}
                >
                  Timeline
                </button>
                <button
                  type="button"
                  className={viewMode === "TABELA" ? "ag-button-primary" : "ag-button-secondary"}
                  onClick={() => setViewMode("TABELA")}
                >
                  Tabela
                </button>
              </div>
            </div>

            {viewMode === "KANBAN" ? (
              <div className="grid gap-3 lg:grid-cols-5">
                {(initial.kanban || []).map((column) => (
                  <div key={column.phase} className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {column.phase}
                    </p>
                    <div className="space-y-2">
                      {column.projects.length === 0 ? (
                        <p className="text-xs text-slate-500">Sem projetos</p>
                      ) : (
                        column.projects.map((item) => (
                          <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                            <p className="text-xs font-semibold text-slate-100">{item.project}</p>
                            <p className="text-[11px] text-slate-400">{item.client}</p>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                              <span>Avanço {item.progress}%</span>
                              <span>{item.risk}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {viewMode === "TIMELINE" ? (
              <div className="space-y-4">
                <select
                  className="ag-select max-w-xl"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  {(initial.timeline || []).map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.project} - {p.client}
                    </option>
                  ))}
                </select>
                {selectedTimeline ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-100">
                      {selectedTimeline.project} ({selectedTimeline.client})
                    </p>
                    <div className="space-y-2">
                      {selectedTimeline.phases.map((phase) => (
                        <div
                          key={phase.phaseId}
                          className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/70 p-3 md:grid-cols-5"
                        >
                          <p className="text-sm text-slate-100">{phase.name}</p>
                          <p className="text-xs text-slate-400">Status: {phase.status}</p>
                          <p className="text-xs text-slate-400">
                            Planejada: {formatDateBR(phase.plannedDate)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Real: {phase.actualDate ? formatDateBR(phase.actualDate) : "-"}
                          </p>
                          <p className="text-xs text-slate-400">Resp.: {phase.responsible}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Selecione um projeto para visualizar timeline.</p>
                )}
              </div>
            ) : null}

            {viewMode === "TABELA" ? (
              <DataTable
                title="Projetos de implantação"
                columns={[
                  { key: "name", label: "Projeto" },
                  { key: "client", label: "Cliente", render: (row) => row.client?.tradeName || "-" },
                  { key: "manager", label: "Gerente", render: (row) => row.manager?.name || "-" },
                  { key: "csOwner", label: "CS", render: (row) => row.csOwner?.name || "-" },
                  { key: "status", label: "Status" },
                  { key: "currentPhase", label: "Fase" },
                  { key: "priority", label: "Prioridade" },
                  { key: "projectRisk", label: "Risco" },
                  { key: "progressPercent", label: "% Avanço", render: (row) => `${row.progressPercent}%` },
                  { key: "targetEndDate", label: "Data alvo", render: (row) => formatDateBR(row.targetEndDate) },
                ]}
                data={projects}
              />
            ) : null}
          </div>
        </section>
      </div>
    </ClientPageWrapper>
  );
}

export async function getServerSideProps(context) {
  return requirePageAccess(context, "projetos", async ({ req }) => {
    const baseUrl = resolveBaseUrl(req);
    const [projectsRes, metadataRes, executionRes] = await Promise.all([
      fetch(`${baseUrl}/api/projects`, {
        headers: { cookie: req.headers.cookie || "" },
      }),
      fetch(`${baseUrl}/api/metadata`, {
        headers: { cookie: req.headers.cookie || "" },
      }),
      fetch(`${baseUrl}/api/projects?view=execution`, {
        headers: { cookie: req.headers.cookie || "" },
      }),
    ]);

    const [projects, metadata, execution] = await Promise.all([
      projectsRes.json(),
      metadataRes.json(),
      executionRes.json(),
    ]);

    return {
      props: {
        initial: {
          projects,
          clients: metadata.clients,
          collaborators: metadata.collaborators,
          kanban: execution.kanban || [],
          timeline: execution.timeline || [],
        },
      },
    };
  });
}
