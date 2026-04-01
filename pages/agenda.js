import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ClientPageWrapper } from "@/lib/client-page-wrapper";
import { requirePageAccess, resolveBaseUrl } from "@/lib/page-helpers";
import PageHeader from "@/Components/ui/PageHeader";
import DataTable from "@/Components/ui/DataTable";
import { formatDateBR, formatHourRange, formatNumberBR } from "@/lib/formatters";
import {
  ACTIVITY_TYPE_OPTIONS,
  AGENDA_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  ALLOCATION_LOCATION_OPTIONS,
} from "@/lib/constants";

function parseTimeToMinutes(t) {
  if (!t || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export default function AgendaPage({ user, allocations, alerts, metadata }) {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("SEMANAL");
  const [filters, setFilters] = useState({
    collaboratorId: "",
    clientId: "",
    coreId: "",
    moduleId: "",
    onlyAlerts: false,
  });
  const [form, setForm] = useState({
    collaboratorId: metadata.collaborators[0]?.id || "",
    clientId: metadata.clients[0]?.id || "",
    projectId: metadata.projects[0]?.id || "",
    coreId: metadata.cores[0]?.id || "",
    moduleId: metadata.modules[0]?.id || "",
    activityType: ACTIVITY_TYPE_OPTIONS[0]?.value || "IMPLANTACAO_PRODUTIVA",
    date: new Date().toISOString().slice(0, 10),
    startTime: "08:00",
    endTime: "10:00",
    allocatedHours: 2,
    location: "REMOTO",
    city: "Remoto",
    requester: user.name,
    priority: "MEDIA",
    agendaStatus: "PLANEJADA",
    notes: "",
  });

  const enriched = useMemo(() => {
    return allocations.map((a) => {
      const dateKey = new Date(a.date).toISOString().slice(0, 10);
      const dayAllocations = allocations.filter(
        (b) =>
          b.collaboratorId === a.collaboratorId &&
          new Date(b.date).toISOString().slice(0, 10) === dateKey &&
          b.id !== a.id,
      );
      const aStart = parseTimeToMinutes(a.startTime);
      const aEnd = parseTimeToMinutes(a.endTime);
      const conflict = dayAllocations.some((b) =>
        overlaps(aStart, aEnd, parseTimeToMinutes(b.startTime), parseTimeToMinutes(b.endTime)),
      );
      const totalHoursDay =
        dayAllocations.reduce((sum, item) => sum + Number(item.allocatedHours), 0) + Number(a.allocatedHours);
      const overloaded = totalHoursDay > Number(a.collaborator.usefulCapacity / 20);
      const contextSwitches = new Set(
        [a, ...dayAllocations].map((item) => `${item.projectId}-${item.moduleId}`),
      ).size;
      const fragmented = contextSwitches >= 4;

      return { ...a, conflict, overloaded, fragmented, contextSwitches, totalHoursDay };
    });
  }, [allocations]);

  const visibleRows = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    let end = new Date(start);
    if (viewMode === "DIARIA") {
      end.setDate(end.getDate() + 1);
    } else if (viewMode === "SEMANAL") {
      end.setDate(end.getDate() + 7);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    return enriched.filter((item) => {
      const d = new Date(item.date);
      if (!(d >= start && d < end)) return false;
      if (filters.collaboratorId && item.collaboratorId !== filters.collaboratorId) return false;
      if (filters.clientId && item.clientId !== filters.clientId) return false;
      if (filters.coreId && item.coreId !== filters.coreId) return false;
      if (filters.moduleId && item.moduleId !== filters.moduleId) return false;
      if (filters.onlyAlerts && !item.conflict && !item.overloaded && !item.fragmented) return false;
      return true;
    });
  }, [enriched, viewMode, filters]);

  const summary = useMemo(() => {
    const total = visibleRows.length;
    const conflicts = visibleRows.filter((r) => r.conflict).length;
    const overloaded = visibleRows.filter((r) => r.overloaded).length;
    const fragmented = visibleRows.filter((r) => r.fragmented).length;
    const hours = visibleRows.reduce((sum, row) => sum + Number(row.allocatedHours || 0), 0);
    const severeAlerts = (alerts || []).filter((a) => a.severity === "CRITICO" || a.severity === "ALTO").length;
    return {
      total,
      conflicts,
      overloaded,
      fragmented,
      hours: Number(hours.toFixed(1)),
      severeAlerts,
    };
  }, [visibleRows, alerts]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao criar alocação.");
      toast.success("Alocação criada.");
      window.location.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ClientPageWrapper user={user}>
      <PageHeader
        title="Agenda e Alocação"
        subtitle="Alocação por consultor, cliente, módulo e fase com alertas de conflito, sobrecarga e fragmentação."
        actions={
          <select
            className="ag-select max-w-[220px]"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="DIARIA">Agenda diária</option>
            <option value="SEMANAL">Agenda semanal</option>
            <option value="MENSAL">Agenda mensal</option>
          </select>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="ag-kpi">
          <p className="text-xs uppercase tracking-wide text-slate-400">Alocações visíveis</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{summary.total}</p>
        </div>
        <div className="ag-kpi">
          <p className="text-xs uppercase tracking-wide text-slate-400">Conflitos</p>
          <p className="mt-2 text-2xl font-semibold text-rose-300">{summary.conflicts}</p>
        </div>
        <div className="ag-kpi">
          <p className="text-xs uppercase tracking-wide text-slate-400">Sobrecargas</p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">{summary.overloaded}</p>
        </div>
        <div className="ag-kpi">
          <p className="text-xs uppercase tracking-wide text-slate-400">Fragmentação</p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">{summary.fragmented}</p>
        </div>
        <div className="ag-kpi">
          <p className="text-xs uppercase tracking-wide text-slate-400">Horas</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{formatNumberBR(summary.hours)}h</p>
        </div>
        <div className="ag-kpi">
          <p className="text-xs uppercase tracking-wide text-slate-400">Alertas críticos/altos</p>
          <p className="mt-2 text-2xl font-semibold text-rose-300">{summary.severeAlerts}</p>
        </div>
      </section>

      <section className="ag-card">
        <div className="ag-card-body">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">Filtros operacionais</h2>
          <div className="grid gap-3 md:grid-cols-5">
            <select
              className="ag-select"
              value={filters.collaboratorId}
              onChange={(e) => setFilters((p) => ({ ...p, collaboratorId: e.target.value }))}
            >
              <option value="">Todos consultores</option>
              {metadata.collaborators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={filters.clientId}
              onChange={(e) => setFilters((p) => ({ ...p, clientId: e.target.value }))}
            >
              <option value="">Todos clientes</option>
              {metadata.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradeName}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={filters.coreId}
              onChange={(e) => setFilters((p) => ({ ...p, coreId: e.target.value }))}
            >
              <option value="">Todos cores</option>
              {metadata.cores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={filters.moduleId}
              onChange={(e) => setFilters((p) => ({ ...p, moduleId: e.target.value }))}
            >
              <option value="">Todos módulos</option>
              {metadata.modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={filters.onlyAlerts}
                onChange={(e) => setFilters((p) => ({ ...p, onlyAlerts: e.target.checked }))}
              />
              Apenas com alertas
            </label>
          </div>
        </div>
      </section>

      <section className="ag-card">
        <div className="ag-card-body">
          <h2 className="mb-4 text-sm font-semibold text-white">Nova alocação</h2>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
            <select
              className="ag-select"
              value={form.collaboratorId}
              onChange={(e) => setForm((p) => ({ ...p, collaboratorId: e.target.value }))}
              required
            >
              {metadata.collaborators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={form.clientId}
              onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
              required
            >
              {metadata.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradeName}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={form.projectId}
              onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
              required
            >
              {metadata.projects.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={form.coreId}
              onChange={(e) => setForm((p) => ({ ...p, coreId: e.target.value }))}
              required
            >
              {metadata.cores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={form.moduleId}
              onChange={(e) => setForm((p) => ({ ...p, moduleId: e.target.value }))}
              required
            >
              {metadata.modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={form.activityType}
              onChange={(e) => setForm((p) => ({ ...p, activityType: e.target.value }))}
            >
              {ACTIVITY_TYPE_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <input
              className="ag-input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="ag-input"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                required
              />
              <input
                className="ag-input"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                required
              />
            </div>
            <input
              className="ag-input"
              type="number"
              step="0.5"
              min="0.5"
              value={form.allocatedHours}
              onChange={(e) => setForm((p) => ({ ...p, allocatedHours: Number(e.target.value) }))}
            />
            <select
              className="ag-select"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            >
              {ALLOCATION_LOCATION_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <input
              className="ag-input"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="Cidade"
            />
            <select
              className="ag-select"
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
            >
              {PRIORITY_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <select
              className="ag-select"
              value={form.agendaStatus}
              onChange={(e) => setForm((p) => ({ ...p, agendaStatus: e.target.value }))}
            >
              {AGENDA_STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <input
              className="ag-input md:col-span-2"
              value={form.requester}
              onChange={(e) => setForm((p) => ({ ...p, requester: e.target.value }))}
              placeholder="Solicitante"
            />
            <textarea
              className="ag-textarea md:col-span-4"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Observações"
            />
            <button className="ag-button-primary md:col-span-4" disabled={loading} type="submit">
              {loading ? "Salvando..." : "Criar alocação"}
            </button>
          </form>
        </div>
      </section>

      <section className="ag-card mt-6">
        <div className="ag-card-body">
          <h2 className="mb-4 text-sm font-semibold text-white">Agenda operacional</h2>
          <DataTable
            columns={[
              { key: "date", label: "Data", render: (row) => formatDateBR(row.date) },
              { key: "colaborador", label: "Consultor", render: (row) => row.collaborator.name },
              { key: "cliente", label: "Cliente", render: (row) => row.client.tradeName },
              { key: "projeto", label: "Projeto", render: (row) => row.project.name },
              { key: "modulo", label: "Módulo", render: (row) => row.module.name },
              {
                key: "horario",
                label: "Horário",
                render: (row) => formatHourRange(row.startTime, row.endTime),
              },
              { key: "horas", label: "Horas", render: (row) => formatNumberBR(row.allocatedHours) },
              {
                key: "alertas",
                label: "Alertas",
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    {row.conflict && <span className="chip-danger">Conflito</span>}
                    {row.overloaded && <span className="chip-warning">Sobrecarga</span>}
                    {row.fragmented && <span className="chip-warning">Fragmentação</span>}
                    {!row.conflict && !row.overloaded && !row.fragmented && (
                      <span className="chip-success">OK</span>
                    )}
                  </div>
                ),
              },
              {
                key: "semaforo",
                label: "Semáforo",
                render: (row) => {
                  const status = row.overloaded ? "VERMELHO" : row.conflict || row.fragmented ? "AMARELO" : "VERDE";
                  const className =
                    status === "VERMELHO"
                      ? "chip-danger"
                      : status === "AMARELO"
                        ? "chip-warning"
                        : "chip-success";
                  return <span className={className}>{status}</span>;
                },
              },
            ]}
            data={visibleRows}
            emptyMessage="Sem alocações cadastradas."
          />
        </div>
      </section>

      <section className="ag-card mt-6">
        <div className="ag-card-body">
          <h2 className="mb-4 text-sm font-semibold text-white">Alertas automáticos</h2>
          <DataTable
            columns={[
              { key: "type", label: "Tipo" },
              { key: "collaborator", label: "Consultor" },
              { key: "date", label: "Data" },
              { key: "severity", label: "Severidade" },
              { key: "message", label: "Mensagem" },
            ]}
            data={alerts || []}
            emptyMessage="Sem alertas para o período."
          />
        </div>
      </section>
    </ClientPageWrapper>
  );
}

export async function getServerSideProps(context) {
  return requirePageAccess(context, "agenda", async ({ req }) => {
    const baseUrl = resolveBaseUrl(req);
    const [allocRes, metaRes] = await Promise.all([
      fetch(`${baseUrl}/api/allocations`, {
        headers: { cookie: req.headers.cookie || "" },
      }).then((r) => r.json()),
      fetch(`${baseUrl}/api/metadata`, {
        headers: { cookie: req.headers.cookie || "" },
      }).then((r) => r.json()),
    ]);

    return {
      props: {
        allocations: allocRes.allocations || [],
        alerts: allocRes.alerts || [],
        metadata: metaRes,
      },
    };
  });
}
