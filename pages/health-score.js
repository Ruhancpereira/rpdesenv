import { useState } from "react";
import { requirePageAccess, resolveBaseUrl } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { formatDateBR, formatPercent } from "@/lib/formatters";

const initialForm = {
  clientId: "",
  projectId: "",
  csOwnerId: "",
  engagement: 70,
  scheduleAdherence: 70,
  meetingPresence: 70,
  openPendencies: 0,
  progressPerception: 70,
  notes: "",
};

export default function HealthScorePage({ user, initialItems, metadata }) {
  const [items, setItems] = useState(initialItems || []);
  const [form, setForm] = useState({
    ...initialForm,
    clientId: metadata.clients[0]?.id || "",
    projectId: metadata.projects[0]?.id || "",
    csOwnerId: metadata.collaborators[0]?.id || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/health-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Falha ao registrar health score.");
      window.location.reload();
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
          title="Health Score"
          subtitle="Acompanhamento contínuo da saúde da implantação e risco de escalada."
        />

        <section className="ag-card">
          <div className="ag-card-body">
            <h2 className="mb-4 text-sm font-semibold text-white">Novo health score</h2>
            <form className="grid gap-3 md:grid-cols-3" onSubmit={submit}>
              <select className="ag-select" value={form.clientId} onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))} required>
                {metadata.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.tradeName}
                  </option>
                ))}
              </select>
              <select className="ag-select" value={form.projectId} onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))} required>
                {metadata.projects.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select className="ag-select" value={form.csOwnerId} onChange={(e) => setForm((p) => ({ ...p, csOwnerId: e.target.value }))} required>
                {metadata.collaborators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label className="text-xs text-slate-300">
                Engajamento ({form.engagement})
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.engagement}
                  onChange={(e) => setForm((p) => ({ ...p, engagement: Number(e.target.value) }))}
                  className="w-full"
                />
              </label>
              <label className="text-xs text-slate-300">
                Aderência ao cronograma ({form.scheduleAdherence})
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.scheduleAdherence}
                  onChange={(e) => setForm((p) => ({ ...p, scheduleAdherence: Number(e.target.value) }))}
                  className="w-full"
                />
              </label>
              <label className="text-xs text-slate-300">
                Presença em reuniões ({form.meetingPresence})
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.meetingPresence}
                  onChange={(e) => setForm((p) => ({ ...p, meetingPresence: Number(e.target.value) }))}
                  className="w-full"
                />
              </label>
              <input
                className="ag-input"
                type="number"
                min="0"
                value={form.openPendencies}
                onChange={(e) => setForm((p) => ({ ...p, openPendencies: Number(e.target.value) }))}
                placeholder="Pendências em aberto"
              />
              <label className="text-xs text-slate-300">
                Percepção de progresso ({form.progressPerception})
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.progressPerception}
                  onChange={(e) => setForm((p) => ({ ...p, progressPerception: Number(e.target.value) }))}
                  className="w-full"
                />
              </label>
              <textarea className="ag-textarea" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Observações" />

              <button className="ag-button-primary md:col-span-3" disabled={saving}>
                {saving ? "Salvando..." : "Registrar health score"}
              </button>
              {error ? <p className="md:col-span-3 text-xs text-rose-300">{error}</p> : null}
            </form>
          </div>
        </section>

        <DataTable
          title="Histórico de health score"
          columns={[
            { key: "client", label: "Cliente" },
            { key: "project", label: "Projeto" },
            { key: "csOwner", label: "CS responsável" },
            { key: "score", label: "Score", render: (row) => row.score.toFixed(1) },
            { key: "status", label: "Status" },
            { key: "engagement", label: "Engajamento", render: (row) => formatPercent(row.engagement) },
            { key: "scheduleAdherence", label: "Aderência", render: (row) => formatPercent(row.scheduleAdherence) },
            { key: "openPendencies", label: "Pendências" },
            { key: "updatedAt", label: "Atualizado", render: (row) => formatDateBR(row.updatedAt) },
          ]}
          data={items}
          emptyMessage="Sem health scores cadastrados."
        />
      </div>
    </ClientPageWrapper>
  );
}

export async function getServerSideProps(context) {
  return requirePageAccess(context, "health", async ({ req }) => {
    const baseUrl = resolveBaseUrl(req);
    const [healthRes, metaRes] = await Promise.all([
      fetch(`${baseUrl}/api/health-score`, {
        headers: { cookie: req.headers.cookie || "" },
      }).then((r) => r.json()),
      fetch(`${baseUrl}/api/metadata`, {
        headers: { cookie: req.headers.cookie || "" },
      }).then((r) => r.json()),
    ]);
    return {
      props: {
        initialItems: healthRes.items || [],
        metadata: metaRes,
      },
    };
  });
}
