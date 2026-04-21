package com.agrosys.chamados.agenda.service;

import com.agrosys.chamados.agenda.repo.AgendaAlocacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Valores distintos na agenda importada (para filtros no Gantt), no mesmo espírito de {@code OpcoesFiltroService} dos chamados.
 */
@Service
public class AgendaOpcoesFiltroService {

    private final AgendaAlocacaoRepository agendaAlocacaoRepository;

    public AgendaOpcoesFiltroService(AgendaAlocacaoRepository agendaAlocacaoRepository) {
        this.agendaAlocacaoRepository = agendaAlocacaoRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, List<String>> opcoes() {
        Map<String, List<String>> m = new LinkedHashMap<>();
        m.put("recurso", agendaAlocacaoRepository.distinctRecurso());
        m.put("cliente", agendaAlocacaoRepository.distinctCliente());
        m.put("status", agendaAlocacaoRepository.distinctStatus());
        m.put("local", agendaAlocacaoRepository.distinctLocalAgenda());
        m.put("alocado_por", agendaAlocacaoRepository.distinctAlocadoPor());
        return m;
    }
}
