import PageHeader from "@/Components/ui/PageHeader";
import KpiCard from "@/Components/ui/KpiCard";
import DataTable from "@/Components/ui/DataTable";
import { withPageAuth, resolveBaseUrl } from "@/lib/page-helpers";
import ClientPageWrapper from "@/lib/client-page-wrapper";
import { formatDateBR, formatPercent, formatRiskLabel } from "@/lib/formatters";

export const getServerSideProps = withPageAuth(
  ["ADMIN", "DIRETORIA", "COORDENADOR", "GERENTE"],
  async ({ context }) => {
    const baseUrl = resolveBaseUrl(context.req);
    const response = await fetch(`${baseUrl}/api/dashboard/executivo`, {
      headers: { cookie: context.req.headers.cookie || "" },
    });
    const data = await response.json();
    return { props: { data } };
  },
);

function semaforoChip(value) {
  if (value === "VERMELHO") return "chip-danger";
  if (value === "AMARELO") return "chip-warning";
  return "chip-success";
}

function riskChip(value) {
  if (value === "CRITICO" || value === "ALTO") return "chip-danger";
  if (value === "MEDIO") return "chip-warning";
  return "chip-success";
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </div>
  );
}

function HorizontalBar({ label, value, max, tone = "default", helper }) {
  const safeMax = Math.max(1, Number(max || 0));
  const safeValue = Math.max(0, Number(value || 0));
  const width = Math.max(4, Math.min(100, (safeValue / safeMax) * 100));
  const barClass =
    tone === "danger"
      ? "bg-rose-500/70"
      : tone === "warning"
        ? "bg-amber-500/70"
        : tone === "success"
          ? "bg-emerald-500/70"
          : "bg-slate-500/70";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="truncate text-slate-300">{label}</p>
        <p className="whitespace-nowrap text-slate-100">{helper || safeValue}</p>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function DashboardExecutivoPage({ user, data }) {
  const metrics = data?.metrics || {};
  const distribution = data?.distribution?.capacidade || {};
  const overloadedCollaborators = data?.overloadedCollaborators || [];
  const topModules = data?.topModulesRisk || [];
  const criticalClients = data?.criticalClients || [];
  const operationalBottlenecks = data?.operationalBottlenecks || [];
  const capacityByCollaborator = data?.capacityByCollaborator || [];
  const maxModuleRisk = Math.max(1, ...topModules.map((item) => Number(item.riscoScore || 0)));
  const maxClientRisk = Math.max(1, ...criticalClients.map((item) => Number(item.riscoScore || 0)));
  const maxOccupancy = Math.max(100, ...capacityByCollaborator.map((item) => Number(item.ocupacaoMes || 0)));
  const totalCapacityDistribution = Math.max(
    1,
    Number(distribution.verde || 0) +
      Number(distribution.amarelo || 0) +
      Number(distribution.vermelho || 0),
  );

  return (
    <ClientPageWrapper user={user}>
      <div className="space-y-6">
        <PageHeader
          title="Camada Executiva da Diretoria"
          subtitle="Indicadores estratégicos de implantação com semáforo de risco, capacidade e gargalos operacionais."
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total de projetos ativos" value={metrics.projetosAtivos ?? 0} />
          <KpiCard
            label="Projetos em risco"
            value={metrics.projetosEmRisco ?? 0}
            tone={metrics.projetosEmRisco > 0 ? "danger" : "success"}
          />
          <KpiCard
            label="Atraso médio"
            value={`${Number(metrics.atrasoMedioDias || 0).toFixed(1)} dias`}
            tone={metrics.atrasoMedioDias > 15 ? "danger" : metrics.atrasoMedioDias > 5 ? "warning" : "success"}
          />
          <KpiCard
            label="Taxa de implantação no prazo"
            value={formatPercent(metrics.taxaNoPrazo ?? 0)}
            tone={metrics.taxaNoPrazo >= 85 ? "success" : metrics.taxaNoPrazo >= 70 ? "warning" : "danger"}
          />
          <KpiCard
            label="NPS geral"
            value={metrics.npsGeral ?? 0}
            tone={metrics.npsGeral >= 50 ? "success" : metrics.npsGeral >= 20 ? "warning" : "danger"}
          />
          <KpiCard
            label="Health score médio"
            value={Number(metrics.healthScoreMedio || 0).toFixed(1)}
            tone={metrics.healthScoreMedio >= 75 ? "success" : metrics.healthScoreMedio >= 60 ? "warning" : "danger"}
          />
          <KpiCard
            label="Capacidade média"
            value={formatPercent(metrics.capacidadeMediaTime ?? 0)}
            tone={
              metrics.capacidadeMediaTime > 100
                ? "danger"
                : metrics.capacidadeMediaTime > 80
                  ? "warning"
                  : "success"
            }
          />
          <KpiCard
            label="Colaboradores sobrecarregados"
            value={metrics.colaboradoresSobrecarregados ?? 0}
            tone={metrics.colaboradoresSobrecarregados > 0 ? "danger" : "success"}
          />
          <KpiCard
            label="Módulos com maior risco"
            value={metrics.modulosComMaiorRisco ?? 0}
            tone={metrics.modulosComMaiorRisco > 0 ? "warning" : "success"}
          />
          <KpiCard
            label="Clientes críticos"
            value={metrics.clientesCriticos ?? 0}
            tone={metrics.clientesCriticos > 0 ? "danger" : "success"}
          />
          <KpiCard
            label="Alertas operacionais abertos"
            value={metrics.alertasAbertos ?? 0}
            tone={metrics.alertasAbertos > 0 ? "warning" : "success"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Distribuição da capacidade do time"
            subtitle="Semáforo mensal por colaborador com base na ocupação da capacidade útil."
          >
            <HorizontalBar
              label="Verde (até 80%)"
              value={distribution.verde || 0}
              max={totalCapacityDistribution}
              tone="success"
              helper={`${distribution.verde || 0} colaboradores`}
            />
            <HorizontalBar
              label="Amarelo (81% a 100%)"
              value={distribution.amarelo || 0}
              max={totalCapacityDistribution}
              tone="warning"
              helper={`${distribution.amarelo || 0} colaboradores`}
            />
            <HorizontalBar
              label="Vermelho (>100%)"
              value={distribution.vermelho || 0}
              max={totalCapacityDistribution}
              tone="danger"
              helper={`${distribution.vermelho || 0} colaboradores`}
            />
          </ChartCard>

          <ChartCard
            title="Colaboradores sobrecarregados"
            subtitle="Top ocupação mensal em percentual da capacidade útil."
          >
            {capacityByCollaborator.slice(0, 8).map((item) => (
              <HorizontalBar
                key={item.collaboratorId}
                label={item.collaborator}
                value={item.ocupacaoMes}
                max={maxOccupancy}
                tone={item.ocupacaoMes > 100 ? "danger" : item.ocupacaoMes > 80 ? "warning" : "success"}
                helper={`${item.ocupacaoMes.toFixed(1)}%`}
              />
            ))}
            {capacityByCollaborator.length === 0 ? (
              <p className="text-xs text-slate-400">Sem dados de capacidade para o período.</p>
            ) : null}
          </ChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Módulos com maior risco" subtitle="Ranking por score de risco operacional e cobertura.">
            {topModules.map((item) => (
              <HorizontalBar
                key={item.moduleId}
                label={`${item.modulo} (${item.core})`}
                value={item.riscoScore}
                max={maxModuleRisk}
                tone={item.severidade === "CRITICO" ? "danger" : item.severidade === "ALTO" ? "warning" : "success"}
                helper={`${item.riscoScore.toFixed(1)} pts`}
              />
            ))}
            {topModules.length === 0 ? (
              <p className="text-xs text-slate-400">Sem módulos críticos no período.</p>
            ) : null}
          </ChartCard>

          <ChartCard title="Clientes críticos" subtitle="Risco consolidado com health score, NPS e atrasos.">
            {criticalClients.map((item) => (
              <HorizontalBar
                key={item.clientId}
                label={item.client}
                value={item.riscoScore}
                max={maxClientRisk}
                tone={item.risco === "CRITICO" ? "danger" : item.risco === "ALTO" ? "warning" : "success"}
                helper={`${item.riscoScore.toFixed(1)} pts`}
              />
            ))}
            {criticalClients.length === 0 ? (
              <p className="text-xs text-slate-400">Sem clientes críticos no momento.</p>
            ) : null}
          </ChartCard>
        </section>

        <DataTable
          title="Ranking de gargalos operacionais"
          columns={[
            { key: "tipo", label: "Tipo" },
            { key: "item", label: "Item crítico" },
            { key: "impacto", label: "Impacto" },
            {
              key: "semaforo",
              label: "Semáforo",
              render: (row) => <span className={semaforoChip(row.semaforo)}>{row.semaforo}</span>,
            },
            {
              key: "severidade",
              label: "Risco",
              render: (row) => <span className={riskChip(row.severidade)}>{formatRiskLabel(row.severidade)}</span>,
            },
            { key: "detalhe", label: "Detalhamento" },
          ]}
          data={operationalBottlenecks}
          emptyMessage="Sem gargalos operacionais no momento."
        />

        <section className="grid gap-6 xl:grid-cols-2">
          <DataTable
            title="Lista de colaboradores sobrecarregados"
            columns={[
              { key: "collaborator", label: "Colaborador" },
              { key: "horasAlocadasMes", label: "Horas no mês", render: (row) => `${row.horasAlocadasMes}h` },
              { key: "capacidadeUtil", label: "Capacidade útil", render: (row) => `${row.capacidadeUtil}h` },
              { key: "ocupacaoMes", label: "Ocupação", render: (row) => formatPercent(row.ocupacaoMes) },
              { key: "sobrecargaHoras", label: "Sobrecarga", render: (row) => `${row.sobrecargaHoras}h` },
              {
                key: "semaforo",
                label: "Semáforo",
                render: (row) => <span className={semaforoChip(row.semaforo)}>{row.semaforo}</span>,
              },
            ]}
            data={overloadedCollaborators}
            emptyMessage="Sem colaboradores em sobrecarga no período."
          />

          <DataTable
            title="Alertas operacionais abertos"
            columns={[
              { key: "type", label: "Tipo" },
              {
                key: "severity",
                label: "Severidade",
                render: (row) => <span className={riskChip(row.severity)}>{formatRiskLabel(row.severity)}</span>,
              },
              { key: "message", label: "Mensagem" },
              { key: "createdAt", label: "Data", render: (row) => formatDateBR(row.createdAt) },
            ]}
            data={data?.alertas || []}
            emptyMessage="Sem alertas operacionais em aberto."
          />
        </section>
      </div>
    </ClientPageWrapper>
  );
}
