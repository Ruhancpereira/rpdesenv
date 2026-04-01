import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth } from "@/lib/page-helpers";
import { ClientPageWrapper } from "@/lib/client-page-wrapper";

const initialForm = {
  name: "",
  roleTitle: "Consultor de Implantação",
  dailyHours: 8,
  weeklyHours: 40,
  nominalCapacity: 160,
  usefulCapacity: 128,
  email: "",
  phone: "",
  managerName: "",
  cityRegion: "",
  canTravel: false,
  remoteEnabled: true,
  notes: "",
};

export default function ColaboradoresPage({ user, initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar colaborador.");
      setItems((prev) => [data.item, ...prev]);
      setForm(initialForm);
      toast.success("Colaborador cadastrado.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Cadastro de Colaboradores"
          subtitle="Gestão de jornada, capacidade nominal/útil e perfil de atendimento."
        />

        <section className="ag-card">
          <div className="ag-card-body">
            <h2 className="mb-4 text-sm font-semibold text-white">Novo colaborador</h2>
            <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleSubmit}>
              <input className="ag-input" placeholder="Nome" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="ag-input" placeholder="Cargo" value={form.roleTitle} onChange={(e) => setForm((p) => ({ ...p, roleTitle: e.target.value }))} required />
              <input className="ag-input" type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              <input className="ag-input" placeholder="Telefone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <input className="ag-input" type="number" step="0.5" min="1" placeholder="Jornada diária" value={form.dailyHours} onChange={(e) => setForm((p) => ({ ...p, dailyHours: Number(e.target.value) }))} />
              <input className="ag-input" type="number" step="0.5" min="1" placeholder="Jornada semanal" value={form.weeklyHours} onChange={(e) => setForm((p) => ({ ...p, weeklyHours: Number(e.target.value) }))} />
              <input className="ag-input" type="number" step="0.5" min="1" placeholder="Capacidade nominal" value={form.nominalCapacity} onChange={(e) => setForm((p) => ({ ...p, nominalCapacity: Number(e.target.value) }))} />
              <input className="ag-input" type="number" step="0.5" min="1" placeholder="Capacidade útil" value={form.usefulCapacity} onChange={(e) => setForm((p) => ({ ...p, usefulCapacity: Number(e.target.value) }))} />
              <input className="ag-input" placeholder="Cidade/Região" value={form.cityRegion} onChange={(e) => setForm((p) => ({ ...p, cityRegion: e.target.value }))} required />
              <input className="ag-input" placeholder="Gestor" value={form.managerName} onChange={(e) => setForm((p) => ({ ...p, managerName: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.canTravel} onChange={(e) => setForm((p) => ({ ...p, canTravel: e.target.checked }))} />
                Pode viajar
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.remoteEnabled} onChange={(e) => setForm((p) => ({ ...p, remoteEnabled: e.target.checked }))} />
                Atua remoto
              </label>
              <textarea className="ag-textarea lg:col-span-4" placeholder="Observações" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              <button className="ag-button-primary lg:col-span-4" disabled={saving} type="submit">
                {saving ? "Salvando..." : "Salvar colaborador"}
              </button>
            </form>
          </div>
        </section>

        <DataTable
          title="Colaboradores"
          columns={[
            { key: "name", label: "Nome" },
            { key: "roleTitle", label: "Cargo" },
            { key: "cityRegion", label: "Cidade/Região" },
            { key: "usefulCapacity", label: "Capacidade útil" },
            { key: "canTravel", label: "Viaja?", render: (row) => (row.canTravel ? "Sim" : "Não") },
            { key: "remoteEnabled", label: "Remoto", render: (row) => (row.remoteEnabled ? "Sim" : "Não") },
            { key: "status", label: "Status", render: (row) => (row.status ? "Ativo" : "Inativo") },
          ]}
          data={items}
          emptyMessage="Nenhum colaborador cadastrado."
        />
      </div>
    </ClientPageWrapper>
  );
}

export const getServerSideProps = withPageAuth(
  ["ADMIN", "COORDENADOR", "GERENTE"],
  async ({ context }) => {
    const baseUrl = `${(context.req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${context.req.headers.host}`;
    const response = await fetch(`${baseUrl}/api/collaborators`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const payload = await response.json();
    return { props: { initialItems: payload.items || [] } };
  },
);
