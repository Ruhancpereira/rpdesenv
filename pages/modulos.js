import { useMemo, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import { RISK_LEVEL_OPTIONS } from "@/lib/constants";

function ModuleForm({ cores, onCreated }) {
  const [form, setForm] = useState({
    type: "core",
    name: "",
    description: "",
    criticality: "MEDIO",
    coreId: "",
    moduleId: "",
    minimumCapacitated: 1,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Erro ao salvar");
      setForm((prev) => ({
        ...prev,
        name: "",
        description: "",
        minimumCapacitated: 1,
      }));
      toast.success("Registro criado.");
      onCreated();
    } catch {
      toast.error("Falha ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  const modulesForSubmodule = useMemo(
    () => cores.flatMap((core) => core.modules.map((mod) => ({ ...mod, coreName: core.name }))),
    [cores],
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="mb-3 text-sm font-semibold">Novo registro de core/módulo/submódulo</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <select
          value={form.type}
          onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        >
          <option value="core">Core</option>
          <option value="module">Módulo</option>
          <option value="submodule">Submódulo</option>
        </select>
        <input
          required
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Nome"
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <select
          value={form.criticality}
          onChange={(event) => setForm((prev) => ({ ...prev, criticality: event.target.value }))}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        >
          {RISK_LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {form.type === "module" && (
          <select
            required
            value={form.coreId}
            onChange={(event) => setForm((prev) => ({ ...prev, coreId: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="">Selecione o core</option>
            {cores.map((core) => (
              <option key={core.id} value={core.id}>
                {core.name}
              </option>
            ))}
          </select>
        )}

        {form.type === "submodule" && (
          <select
            required
            value={form.moduleId}
            onChange={(event) => setForm((prev) => ({ ...prev, moduleId: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="">Selecione o módulo</option>
            {modulesForSubmodule.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.name} ({mod.coreName})
              </option>
            ))}
          </select>
        )}

        {form.type === "core" && (
          <input
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Descrição"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
        )}

        {form.type === "module" && (
          <input
            type="number"
            min="1"
            value={form.minimumCapacitated}
            onChange={(event) => setForm((prev) => ({ ...prev, minimumCapacitated: Number(event.target.value) }))}
            placeholder="Qtd mínima capacitada"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
        )}
      </div>

      <div className="mt-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export default function ModulosPage({ user, canAccess, initialData }) {
  const [cores, setCores] = useState(initialData.cores || []);

  async function refresh() {
    const response = await fetch("/api/modules");
    const data = await response.json();
    setCores(data.cores || []);
  }

  if (!canAccess) {
    return (
      <ClientPageWrapper user={user}>
        <div className="rounded-xl border border-amber-700/40 bg-amber-500/10 p-6 text-amber-100">
          Seu perfil não possui acesso ao módulo de cores e módulos.
        </div>
      </ClientPageWrapper>
    );
  }

  const moduleRows = cores.flatMap((core) =>
    core.modules.map((mod) => ({
      core: core.name,
      modulo: mod.name,
      criticidade: mod.criticality,
      minimoCapacitado: mod.minimumCapacitated,
      submodulos: mod.submodules?.length || 0,
      especialistas: (mod.skills || []).filter((skill) => skill.level >= 4).length,
    })),
  );

  return (
    <ClientPageWrapper user={user}>
      <PageHeader
        title="Cores e Módulos"
        subtitle="Cadastro estruturado de cores, módulos, submódulos, criticidade e cobertura mínima."
      />

      <div className="space-y-4">
        <ModuleForm cores={cores} onCreated={refresh} />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="mb-2 text-sm font-semibold">Cores cadastrados</p>
            <div className="space-y-2">
              {cores.map((core) => (
                <div key={core.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm">
                  <p className="font-medium">{core.name}</p>
                  <p className="text-xs text-slate-400">{core.description || "Sem descrição"}</p>
                  <p className="mt-1 text-xs text-slate-500">Criticidade: {core.criticality}</p>
                </div>
              ))}
            </div>
          </div>

          <DataTable
            title="Cobertura por módulo"
            columns={[
              { key: "core", label: "Core" },
              { key: "modulo", label: "Módulo" },
              { key: "criticidade", label: "Criticidade" },
              { key: "minimoCapacitado", label: "Mínimo capacitado" },
              { key: "especialistas", label: "Especialistas nível 4" },
              { key: "submodulos", label: "Submódulos" },
            ]}
            rows={moduleRows}
            emptyText="Nenhum módulo cadastrado."
          />
        </div>
      </div>
    </ClientPageWrapper>
  );
}

export const getServerSideProps = withPageAuth(
  ["ADMIN", "COORDENADOR", "GERENTE"],
  async ({ context }) => {
    const baseUrl = `${(context.req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${context.req.headers.host}`;
    const response = await fetch(`${baseUrl}/api/modules`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const data = await response.json();
    return {
      props: {
        canAccess: true,
        initialData: data,
      },
    };
  },
);
