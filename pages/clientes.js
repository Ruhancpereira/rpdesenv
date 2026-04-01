import { useState } from "react";
import { withPageAuth } from "@/lib/page-helpers";
import { ClientPageWrapper } from "@/lib/client-page-wrapper";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { PROJECT_STATUS_OPTIONS, RISK_LEVEL_OPTIONS } from "@/lib/constants";
import { formatDateBR } from "@/lib/formatters";

export default function ClientesPage({ user, initialItems }) {
  const [clients, setClients] = useState(initialItems || []);
  const [form, setForm] = useState({
    corporateName: "",
    tradeName: "",
    segment: "",
    companySize: "Médio",
    city: "",
    state: "",
    mainContact: "",
    executiveSponsor: "",
    implementationStatus: "PLANEJADO",
    currentRisk: "MEDIO",
    startDate: "",
    goLiveForecast: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await response.json();
      if (!response.ok) throw new Error(created.error || "Erro ao salvar.");
      setClients((prev) => [created, ...prev]);
      setForm({
        corporateName: "",
        tradeName: "",
        segment: "",
        companySize: "Médio",
        city: "",
        state: "",
        mainContact: "",
        executiveSponsor: "",
        implementationStatus: "PLANEJADO",
        currentRisk: "MEDIO",
        startDate: "",
        goLiveForecast: "",
        notes: "",
      });
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
          title="Cadastro de Clientes"
          subtitle="Gestão do cliente, status da implantação, risco e previsões de go-live."
        />

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">Novo cliente</h2>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit}>
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Razão social"
              value={form.corporateName}
              onChange={(e) => setForm((p) => ({ ...p, corporateName: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Nome fantasia"
              value={form.tradeName}
              onChange={(e) => setForm((p) => ({ ...p, tradeName: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Segmento"
              value={form.segment}
              onChange={(e) => setForm((p) => ({ ...p, segment: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Porte"
              value={form.companySize}
              onChange={(e) => setForm((p) => ({ ...p, companySize: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Estado"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Contato principal"
              value={form.mainContact}
              onChange={(e) => setForm((p) => ({ ...p, mainContact: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Sponsor executivo"
              value={form.executiveSponsor}
              onChange={(e) => setForm((p) => ({ ...p, executiveSponsor: e.target.value }))}
            />
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={form.implementationStatus}
              onChange={(e) => setForm((p) => ({ ...p, implementationStatus: e.target.value }))}
            >
              {PROJECT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={form.currentRisk}
              onChange={(e) => setForm((p) => ({ ...p, currentRisk: e.target.value }))}
            >
              {RISK_LEVEL_OPTIONS.map((risk) => (
                <option key={risk.value} value={risk.value}>
                  {risk.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            />
            <input
              type="date"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={form.goLiveForecast}
              onChange={(e) => setForm((p) => ({ ...p, goLiveForecast: e.target.value }))}
            />
            <textarea
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm sm:col-span-2 lg:col-span-3"
              placeholder="Observações"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Cadastrar cliente"}
              </button>
              {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
            </div>
          </form>
        </section>

        <section>
          <DataTable
            title="Clientes"
            columns={[
              { key: "tradeName", label: "Cliente" },
              { key: "segment", label: "Segmento" },
              { key: "companySize", label: "Porte" },
              {
                key: "city",
                label: "Local",
                render: (row) => `${row.city}/${row.state}`,
              },
              { key: "implementationStatus", label: "Status implantação" },
              { key: "currentRisk", label: "Risco" },
              {
                key: "goLiveForecast",
                label: "Go-live previsto",
                render: (row) => formatDateBR(row.goLiveForecast),
              },
            ]}
            data={clients}
          />
        </section>
      </div>
    </ClientPageWrapper>
  );
}

export const getServerSideProps = withPageAuth(
  ["ADMIN", "COORDENADOR", "GERENTE", "CS"],
  async ({ context }) => {
    const baseUrl = `${(context.req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${context.req.headers.host}`;
    const response = await fetch(`${baseUrl}/api/clients`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const payload = await response.json();
    return { props: { initialItems: payload.items || [] } };
  },
);
