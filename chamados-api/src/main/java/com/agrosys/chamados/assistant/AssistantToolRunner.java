package com.agrosys.chamados.assistant;

import com.agrosys.chamados.agenda.service.AgendaMarcacaoService;
import com.agrosys.chamados.agenda.service.AgendaOpcoesFiltroService;
import com.agrosys.chamados.agenda.service.AgendaQueryService;
import com.agrosys.chamados.agenda.web.dto.CriarAgendaAlocacaoRequest;
import com.agrosys.chamados.agenda.web.dto.MarcacaoValidacaoDto;
import com.agrosys.chamados.domain.Chamado;
import com.agrosys.chamados.service.ChamadoQueryService;
import com.agrosys.chamados.service.DashboardService;
import com.agrosys.chamados.service.OpcoesFiltroService;
import com.agrosys.chamados.web.MetaController;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Executa ferramentas pedidas pelo modelo (dados reais da base).
 */
@Component
public class AssistantToolRunner {

    private static final int GANTT_MAX = 200;

    private final ObjectMapper objectMapper;
    private final DashboardService dashboardService;
    private final AgendaQueryService agendaQueryService;
    private final AgendaOpcoesFiltroService agendaOpcoesFiltroService;
    private final AgendaMarcacaoService agendaMarcacaoService;
    private final OpcoesFiltroService opcoesFiltroService;
    private final MetaController metaController;
    private final ChamadoQueryService chamadoQueryService;
    /** Quantos chamados enviar na ferramenta (consolidado até este teto). */
    private final int assistantChamadosLimite;

    public AssistantToolRunner(
            ObjectMapper objectMapper,
            DashboardService dashboardService,
            AgendaQueryService agendaQueryService,
            AgendaOpcoesFiltroService agendaOpcoesFiltroService,
            AgendaMarcacaoService agendaMarcacaoService,
            OpcoesFiltroService opcoesFiltroService,
            MetaController metaController,
            ChamadoQueryService chamadoQueryService,
            @Value("${app.chamados.assistant-chamados-limite:20000}") int assistantChamadosLimite
    ) {
        this.objectMapper = objectMapper;
        this.dashboardService = dashboardService;
        this.agendaQueryService = agendaQueryService;
        this.agendaOpcoesFiltroService = agendaOpcoesFiltroService;
        this.agendaMarcacaoService = agendaMarcacaoService;
        this.opcoesFiltroService = opcoesFiltroService;
        this.metaController = metaController;
        this.chamadoQueryService = chamadoQueryService;
        this.assistantChamadosLimite = Math.max(500, assistantChamadosLimite);
    }

    public String run(String name, String argumentsJson) {
        try {
            return switch (name) {
                case "dashboard_estrategico" -> json(dashboardService.estrategico(Map.of()));
                case "dashboard_operacional" -> json(dashboardService.operacional(Map.of()));
                case "dashboard_tatico" -> json(dashboardService.tatico(Map.of()));
                case "agenda_gantt" -> json(truncarGantt());
                case "agenda_dashboard" -> json(agendaQueryService.dashboard());
                case "agenda_opcoes_filtro" -> json(agendaOpcoesFiltroService.opcoes());
                case "agenda_meta_marcacao" -> json(agendaMarcacaoService.metaMarcacao());
                case "meta_chamados_colunas" -> json(metaController.colunasFiltro());
                case "meta_chamados_opcoes" -> json(opcoesFiltroService.opcoes());
                case "chamados_amostra" -> json(amostraChamados());
                case "agenda_criar_marcacao" -> criarMarcacao(argumentsJson);
                default -> "{\"erro\":\"Ferramenta desconhecida: " + name + "\"}";
            };
        } catch (Exception e) {
            try {
                return objectMapper.writeValueAsString(
                        Map.of("erro", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName())
                );
            } catch (JsonProcessingException ex) {
                return "{\"erro\":\"falha ao serializar\"}";
            }
        }
    }

    private Map<String, Object> truncarGantt() {
        var items = agendaQueryService.gantt();
        boolean truncado = items.size() > GANTT_MAX;
        var lista = truncado ? items.subList(0, GANTT_MAX) : items;
        Map<String, Object> m = new HashMap<>();
        m.put("total", items.size());
        m.put("truncado", truncado);
        m.put("itens", lista);
        if (truncado) {
            m.put("aviso", "Lista truncada a " + GANTT_MAX + " linhas. Peça filtros mais específicos na UI do Gantt se precisar de tudo.");
        }
        return m;
    }

    private Map<String, Object> amostraChamados() {
        var page = chamadoQueryService.search(
                Map.of(),
                PageRequest.of(0, assistantChamadosLimite, Sort.by(Sort.Direction.DESC, "numeroChamado"))
        );
        long total = page.getTotalElements();
        int entregues = page.getNumberOfElements();
        boolean truncado = total > entregues;
        Map<String, Object> m = new HashMap<>();
        m.put("totalNaBase", total);
        m.put("linhasNestaResposta", entregues);
        m.put("limiteFerramenta", assistantChamadosLimite);
        m.put("truncado", truncado);
        m.put("chamados", page.getContent().stream().map(this::resumoChamado).toList());
        if (truncado) {
            m.put(
                    "aviso",
                    "Total na base maior que as linhas enviadas. Para agregados use dashboard_*; para mais linhas "
                            + "aumente CHAMADOS_ASSISTENTE_MAX ou peça filtros na lista."
            );
        }
        return m;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> resumoChamado(Chamado c) {
        try {
            Map<String, Object> full =
                    objectMapper.readValue(objectMapper.writeValueAsString(c), Map.class);
            var keep =
                    Set.of("numeroChamado", "cliente", "consultor", "staAtiv", "tipoCha", "dataAbre", "areaAtend");
            Map<String, Object> m = new HashMap<>();
            for (String k : keep) {
                if (full.containsKey(k)) {
                    m.put(k, full.get(k));
                }
            }
            return m;
        } catch (JsonProcessingException e) {
            return Map.of("numeroChamado", c.getNumeroChamado());
        }
    }

    private String criarMarcacao(String argumentsJson) throws JsonProcessingException {
        CriarAgendaAlocacaoRequest req = objectMapper.readValue(
                argumentsJson == null || argumentsJson.isBlank() ? "{}" : argumentsJson,
                CriarAgendaAlocacaoRequest.class
        );
        MarcacaoValidacaoDto err = agendaMarcacaoService.validarOuErro(req);
        if (err != null) {
            return objectMapper.writeValueAsString(
                    Map.of("ok", false, "validacao", err)
            );
        }
        long id = agendaMarcacaoService.criar(req);
        return objectMapper.writeValueAsString(
                Map.of("ok", true, "id", id, "mensagem", "Marcação gravada.")
        );
    }

    private String json(Object o) throws JsonProcessingException {
        return objectMapper.writeValueAsString(o);
    }
}
