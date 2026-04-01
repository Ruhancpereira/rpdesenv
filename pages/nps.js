import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { requirePageAccess, resolveBaseUrl } from "@/lib/page-helpers";
import { formatDateBR } from "@/lib/formatters";
import ClientPageWrapper from "@/lib/client-page-wrapper";

const PHASE_OPTIONS = [
  "pós-kickoff",
  "meio da implantação",
  "pós-go-live",
  "pós-estabilização",
];

function classify(score) {
  if (score >= 9) return "Promotor";
  if (score >= 7) return "Neutro";
  return "Detrator";
}

export default function NpsPage({ user, initialEntries, metadata }) {
  const [entries, setEntries] = useState(initialEntries || []);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientId: metadata.clients[0]?.id || "",
    projectId: metadata.projects[0]?.id || "",
    phase: PHASE_OPTIONS[0],
    date: new Date().toISOString().slice(0, 10),
    score: 8,
    comment: "",
    mainReason: "",
    reasonCategory: "Geral",
    treatmentOwnerId: metadata.collaborators[0]?.id || "",
    actionPlan: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await response.json();
      if (!response.ok) throw new Error(created.error || "Erro ao registrar NPS.");
      toast.success("NPS registrado.");
      window.location.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  const detractors = entries.filter((entry) => entry.classification === "DETRATOR");
  const reasons = detractors.reduce((acc, entry) => {
    const key = entry.reasonCategory || "Geral";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="NPS da Implantação"
          subtitle="Registro de NPS por marco, classificação automática e acompanhamento de tratativas."
        />

        <section className="ag-card">
          <div className="ag-card-body">
            <h2 className="mb-4 text-sm font-semibold text-white">Novo registro de NPS</h2>
            <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
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
              <select className="ag-select" value={form.phase} onChange={(e) => setForm((p) => ({ ...p, phase: e.target.value }))}>
                {PHASE_OPTIONS.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
              <input className="ag-input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              <input
                className="ag-input"
                type="number"
                min={0}
                max={10}
                value={form.score}
                onChange={(e) => setForm((p) => ({ ...p, score: Number(e.target.value) }))}
              />
              <input className="ag-input" placeholder="Motivo principal" value={form.mainReason} onChange={(e) => setForm((p) => ({ ...p, mainReason: e.target.value }))} />
              <input className="ag-input" placeholder="Categoria do motivo" value={form.reasonCategory} onChange={(e) => setForm((p) => ({ ...p, reasonCategory: e.target.value }))} />
              <select className="ag-select" value={form.treatmentOwnerId} onChange={(e) => setForm((p) => ({ ...p, treatmentOwnerId: e.target.value }))}>
                {metadata.collaborators.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <textarea className="ag-textarea md:col-span-2" placeholder="Comentário do cliente" value={form.comment} onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))} />
              <textarea className="ag-textarea md:col-span-2" placeholder="Plano de ação" value={form.actionPlan} onChange={(e) => setForm((p) => ({ ...p, actionPlan: e.target.value }))} />
              <button className="ag-button-primary md:col-span-4" disabled={saving} type="submit">
                {saving ? "Salvando..." : "Registrar NPS"}
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <DataTable
            title="Registros de NPS"
            columns={[
              { key: "date", label: "Data", render: (row) => formatDateBR(row.date) },
              { key: "client", label: "Cliente", render: (row) => row.client?.tradeName || "-" },
              { key: "project", label: "Projeto", render: (row) => row.project?.name || "-" },
              { key: "phase", label: "Etapa" },
              { key: "score", label: "Nota" },
              { key: "classification", label: "Classificação" },
              { key: "treatmentStatus", label: "Tratativa" },
            ]}
            data={entries}
            emptyMessage="Sem registros de NPS."
          />

          <DataTable
            title="Principais motivos de detratores"
            columns={[
              { key: "categoria", label: "Categoria" },
              { key: "quantidade", label: "Qtde detratores" },
            ]}
            data={Object.entries(reasons).map(([categoria, quantidade]) => ({ categoria, quantidade }))}
            emptyMessage="Sem detratores no período."
          />
        </section>
      </div>
    </ClientPageWrapper>
  );
}

export async function getServerSideProps(context) {
  return requirePageAccess(context, "nps", async ({ req }) => {
    const baseUrl = resolveBaseUrl(req);
    const [npsResponse, metadataResponse] = await Promise.all([
      fetch(`${baseUrl}/api/nps`, { headers: { cookie: req.headers.cookie || "" } }),
      fetch(`${baseUrl}/api/metadata`, { headers: { cookie: req.headers.cookie || "" } }),
    ]);

    const [initialEntries, metadata] = await Promise.all([npsResponse.json(), metadataResponse.json()]);

    return {
      props: {
        initialEntries: Array.isArray(initialEntries) ? initialEntries : [],
        metadata,
      },
    };
  });
}
