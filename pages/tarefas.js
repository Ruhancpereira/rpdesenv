import { useState } from "react";
import { requirePageAccess, resolveBaseUrl } from "@/lib/page-helpers";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { PRIORITY_OPTIONS, TASK_ORIGIN_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/constants";
import { formatDateBR } from "@/lib/formatters";
import { ClientPageWrapper } from "@/lib/client-page-wrapper";

const defaultForm = {
  title: "",
  description: "",
  responsibleId: "",
  dueDate: "",
  priority: "MEDIA",
  status: "ABERTA",
  origin: "PROJETO",
  clientId: "",
  projectId: "",
  comments: "",
};

export default function TarefasPage({ user, initial, metadata }) {
  const [items, setItems] = useState(initial || []);
  const [form, setForm] = useState({
    ...defaultForm,
    responsibleId: metadata.collaborators[0]?.id || "",
    clientId: metadata.clients[0]?.id || "",
    projectId: metadata.projects[0]?.id || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await response.json();
      if (!response.ok) throw new Error(created.error || "Falha ao criar tarefa.");
      setItems((prev) => [created, ...prev]);
      setForm((prev) => ({
        ...defaultForm,
        responsibleId: prev.responsibleId,
        clientId: prev.clientId,
        projectId: prev.projectId,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Tarefas e Planos de Ação"
          subtitle="Gestão de tarefas vinculadas a projeto, NPS, risco, health score e pendências."
        />

        <section className="ag-card">
          <div className="ag-card-body">
            <h2 className="mb-3 text-sm font-semibold">Nova tarefa</h2>
            <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleSubmit}>
              <input
                className="ag-input lg:col-span-2"
                placeholder="Título"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
              <select
                className="ag-select"
                value={form.responsibleId}
                onChange={(e) => setForm((p) => ({ ...p, responsibleId: e.target.value }))}
                required
              >
                {metadata.collaborators.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <input
                className="ag-input"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                required
              />
              <select className="ag-select" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                {PRIORITY_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select className="ag-select" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                {TASK_STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select className="ag-select" value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))}>
                {TASK_ORIGIN_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select className="ag-select" value={form.clientId} onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}>
                {metadata.clients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tradeName}
                  </option>
                ))}
              </select>
              <select className="ag-select" value={form.projectId} onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}>
                {metadata.projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <textarea
                className="ag-textarea lg:col-span-2"
                placeholder="Descrição"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
              <textarea
                className="ag-textarea lg:col-span-2"
                placeholder="Comentários"
                value={form.comments}
                onChange={(e) => setForm((p) => ({ ...p, comments: e.target.value }))}
              />
              <button className="ag-button-primary lg:col-span-4" disabled={saving} type="submit">
                {saving ? "Salvando..." : "Criar tarefa"}
              </button>
              {error ? <p className="text-xs text-rose-300 lg:col-span-4">{error}</p> : null}
            </form>
          </div>
        </section>

        <DataTable
          title="Tarefas"
          columns={[
            { key: "title", label: "Título" },
            { key: "origin", label: "Origem" },
            { key: "priority", label: "Prioridade" },
            { key: "status", label: "Status" },
            { key: "responsible", label: "Responsável", render: (row) => row.responsible?.name || "-" },
            { key: "project", label: "Projeto", render: (row) => row.project?.name || "-" },
            { key: "client", label: "Cliente", render: (row) => row.client?.tradeName || "-" },
            { key: "dueDate", label: "Prazo", render: (row) => formatDateBR(row.dueDate) },
          ]}
          data={items}
          emptyMessage="Sem tarefas cadastradas."
        />
      </div>
    </ClientPageWrapper>
  );
}

export async function getServerSideProps(context) {
  return requirePageAccess(context, "tarefas", async ({ req }) => {
    const baseUrl = resolveBaseUrl(req);
    const [tasksRes, metaRes] = await Promise.all([
      fetch(`${baseUrl}/api/tasks`, {
        headers: { cookie: req.headers.cookie || "" },
      }).then((r) => r.json()),
      fetch(`${baseUrl}/api/metadata`, {
        headers: { cookie: req.headers.cookie || "" },
      }).then((r) => r.json()),
    ]);

    return {
      props: {
        initial: tasksRes || [],
        metadata: metaRes,
      },
    };
  });
}

