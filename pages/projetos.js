import { useState } from "react";
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Nome do projeto"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              type="date"
              value={form.targetEndDate}
              onChange={(e) => update("targetEndDate", e.target.value)}
              required
            />
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              rows={2}
              placeholder="Pendências do cliente"
              value={form.clientPending}
              onChange={(e) => update("clientPending", e.target.value)}
            />
            <textarea
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              rows={2}
              placeholder="Pendências internas"
              value={form.internalPending}
              onChange={(e) => update("internalPending", e.target.value)}
            />
            <textarea
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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
      </div>
    </ClientPageWrapper>
  );
}

export async function getServerSideProps(context) {
  return requirePageAccess(context, "projetos", async ({ req }) => {
    const baseUrl = resolveBaseUrl(req);
    const [projectsRes, metadataRes] = await Promise.all([
      fetch(`${baseUrl}/api/projects`, {
        headers: { cookie: req.headers.cookie || "" },
      }),
      fetch(`${baseUrl}/api/metadata`, {
        headers: { cookie: req.headers.cookie || "" },
      }),
    ]);

    const [projects, metadata] = await Promise.all([projectsRes.json(), metadataRes.json()]);

    return {
      props: {
        initial: {
          projects,
          clients: metadata.clients,
          collaborators: metadata.collaborators,
        },
      },
    };
  });
}
