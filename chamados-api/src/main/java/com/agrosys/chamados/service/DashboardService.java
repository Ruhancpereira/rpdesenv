package com.agrosys.chamados.service;

import com.agrosys.chamados.domain.Chamado;
import com.agrosys.chamados.repo.ChamadoRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ChamadoRepository chamadoRepository;
    private final DashboardQuerySupport dashboardQuerySupport;

    public DashboardService(ChamadoRepository chamadoRepository, DashboardQuerySupport dashboardQuerySupport) {
        this.chamadoRepository = chamadoRepository;
        this.dashboardQuerySupport = dashboardQuerySupport;
    }

    public Map<String, Object> estrategico(Map<String, String> rawParams) {
        Specification<Chamado> spec = ChamadoSpecifications.fromParams(rawParams);
        Map<String, Object> m = new HashMap<>();
        m.put("totalChamados", chamadoRepository.count(spec));
        m.put("porStatus", toPairs(dashboardQuerySupport.groupBy(spec, "staAtiv", true)));
        m.put("porAreaAtendimento", toPairs(dashboardQuerySupport.groupBy(spec, "areaAtend", true)));
        m.put("porTipoChamado", toPairs(dashboardQuerySupport.groupBy(spec, "tipoCha", true)));
        m.put("porMes", toPairs(dashboardQuerySupport.groupBy(spec, "mes", false)));
        m.put(
                "topConsultores",
                toPairs(
                        dashboardQuerySupport.groupBy(spec, "consultor", true).stream()
                                .limit(10)
                                .toList()
                )
        );
        m.put("slaEstourados", dashboardQuerySupport.countSlaEstourado(spec));
        m.put("slaDentroOuAberto", dashboardQuerySupport.countSlaDentroOuAberto(spec));
        m.put("tempoMedioDiasAguardando", dashboardQuerySupport.avgDiasByStatus(spec, "Aguardando"));
        m.put("tempoMedioDiasExecucao", dashboardQuerySupport.avgDiasByStatus(spec, "Em Execução"));
        return m;
    }

    public Map<String, Object> operacional(Map<String, String> rawParams) {
        Specification<Chamado> spec = ChamadoSpecifications.fromParams(rawParams);
        Map<String, Object> m = new HashMap<>();
        m.put("porBancada", toPairs(dashboardQuerySupport.groupBy(spec, "bancadaAtend", true)));
        m.put("porAreaInicial", toPairs(dashboardQuerySupport.groupBy(spec, "areaIni", true)));
        m.put("porGerente", toPairs(dashboardQuerySupport.groupBy(spec, "gerente", true)));
        m.put("porPrioridade", toPairs(dashboardQuerySupport.groupBy(spec, "prioridade", true)));
        m.put("transferencias", resumoTransferencias(spec));
        return m;
    }

    public Map<String, Object> tatico(Map<String, String> rawParams) {
        Specification<Chamado> spec = ChamadoSpecifications.fromParams(rawParams);
        Map<String, Object> m = new HashMap<>();
        m.put("heatmapStatusArea", heatmapStatusArea(spec));
        m.put("volumeDiarioAbertura", Map.of("nota", "Use filtros na listagem por data_abre para análises no período"));
        return m;
    }

    private Map<String, Object> resumoTransferencias(Specification<Chamado> spec) {
        double avg = dashboardQuerySupport.avgQttransf(spec);
        long comTransf = dashboardQuerySupport.countComTransferencia(spec);
        return Map.of("mediaQtTransf", avg, "chamadosComTransferencia", comTransf);
    }

    private Map<String, Object> heatmapStatusArea(Specification<Chamado> spec) {
        return Map.of(
                "status", toPairs(dashboardQuerySupport.groupBy(spec, "staAtiv", true)),
                "areas", toPairs(dashboardQuerySupport.groupBy(spec, "areaAtend", true))
        );
    }

    private List<Map<String, String>> toPairs(List<DashboardQuerySupport.LabelCount> list) {
        return list.stream()
                .map(p -> {
                    String lab = p.label() != null ? p.label() : "(vazio)";
                    return Map.of("label", lab, "total", String.valueOf(p.total()));
                })
                .collect(Collectors.toList());
    }
}
