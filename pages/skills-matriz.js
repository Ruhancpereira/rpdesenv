import { useMemo, useState } from "react";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth, resolveBaseUrl } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";

function levelStyle(level) {
  if (level >= 4) return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
  if (level === 3) return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40";
  if (level === 2) return "bg-amber-500/20 text-amber-300 border border-amber-500/40";
  if (level === 1) return "bg-slate-700/60 text-slate-300 border border-slate-600";
  return "bg-slate-900 text-slate-500 border border-slate-800";
}

function levelLabel(level) {
  if (level === 4) return "N4";
  if (level === 3) return "N3";
  if (level === 2) return "N2";
  if (level === 1) return "N1";
  return "-";
}

export const getServerSideProps = withPageAuth(
  ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"],
  async ({ context }) => {
    const baseUrl = resolveBaseUrl(context.req);
    const response = await fetch(`${baseUrl}/api/skills-matrix`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const data = await response.json();
    return { props: { data } };
  },
);

export default function SkillsMatrizPage({ user, data }) {
  const modules = useMemo(() => data?.modules || [], [data?.modules]);
  const rows = useMemo(() => data?.rows || [], [data?.rows]);
  const moduleCoverage = data?.moduleCoverage || [];
  const [search, setSearch] = useState("");
  const [coreFilter, setCoreFilter] = useState("TODOS");

  const cores = useMemo(
    () => ["TODOS", ...new Set(modules.map((m) => m.core))],
    [modules],
  );

  const filteredModules = useMemo(() => {
    if (coreFilter === "TODOS") return modules;
    return modules.filter((m) => m.core === coreFilter);
  }, [modules, coreFilter]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows
      .filter((row) => row.collaborator.toLowerCase().includes(query))
      .map((row) => ({
        ...row,
        modules: row.modules.filter((m) =>
          filteredModules.some((f) => f.id === m.moduleId),
        ),
      }));
  }, [rows, search, filteredModules]);

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Matriz de Skills"
          subtitle="Visualização por colaborador x módulo com níveis N1 a N4 e cobertura por especialidade."
          actions={
            <div className="flex gap-2">
              <input
                className="ag-input w-56"
                placeholder="Buscar colaborador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="ag-select w-48"
                value={coreFilter}
                onChange={(e) => setCoreFilter(e.target.value)}
              >
                {cores.map((core) => (
                  <option key={core} value={core}>
                    {core}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        <section className="ag-card">
          <div className="ag-card-body overflow-x-auto">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Matriz de skills por colaborador e módulo
            </h2>
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-900 px-3 py-2 text-left text-xs uppercase tracking-wide text-slate-400">
                    Colaborador
                  </th>
                  {filteredModules.map((mod) => (
                    <th
                      key={mod.id}
                      className="min-w-[120px] px-2 py-2 text-center text-xs uppercase tracking-wide text-slate-400"
                    >
                      <div>{mod.name}</div>
                      <div className="text-[10px] text-slate-500">{mod.core}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.collaboratorId} className="border-t border-slate-800">
                    <td className="sticky left-0 z-10 bg-slate-900 px-3 py-2">
                      <div className="font-medium text-slate-100">{row.collaborator}</div>
                      <div className="text-xs text-slate-500">{row.roleTitle}</div>
                    </td>
                    {row.modules.map((m) => (
                      <td key={`${row.collaboratorId}-${m.moduleId}`} className="px-2 py-2 text-center">
                        <span className={`inline-flex min-w-[42px] justify-center rounded-md px-2 py-1 text-xs font-semibold ${levelStyle(m.level)}`}>
                          {levelLabel(m.level)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <DataTable
          title="Cobertura por módulo"
          columns={[
            { key: "module", label: "Módulo" },
            { key: "core", label: "Core" },
            { key: "minimum", label: "Mínimo" },
            { key: "specialists", label: "N4" },
            { key: "autonomous", label: "N3+" },
            { key: "spof", label: "SPOF", render: (row) => (row.spof ? "Sim" : "Não") },
            {
              key: "lowCoverage",
              label: "Baixa cobertura",
              render: (row) => (row.lowCoverage ? "Sim" : "Não"),
            },
          ]}
          data={moduleCoverage}
        />
      </div>
    </ClientPageWrapper>
  );
}
