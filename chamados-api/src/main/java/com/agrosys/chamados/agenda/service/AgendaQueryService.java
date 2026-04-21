package com.agrosys.chamados.agenda.service;

import com.agrosys.chamados.agenda.domain.AgendaAlocacao;
import com.agrosys.chamados.agenda.repo.AgendaAlocacaoRepository;
import com.agrosys.chamados.agenda.web.dto.AgendaDashboardDto;
import com.agrosys.chamados.agenda.web.dto.AgendaGanttItemDto;
import com.agrosys.chamados.agenda.web.dto.NamedTotalDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AgendaQueryService {

    private final AgendaAlocacaoRepository agendaAlocacaoRepository;

    public AgendaQueryService(AgendaAlocacaoRepository agendaAlocacaoRepository) {
        this.agendaAlocacaoRepository = agendaAlocacaoRepository;
    }

    @Transactional(readOnly = true)
    public AgendaDashboardDto dashboard() {
        long n = agendaAlocacaoRepository.count();
        Double sum = agendaAlocacaoRepository.sumHorasTotal();
        double totalHoras = sum != null ? sum : 0;
        List<NamedTotalDto> porRecurso = mapTriples(agendaAlocacaoRepository.agregadoPorRecurso());
        List<NamedTotalDto> porCliente = mapTriples(agendaAlocacaoRepository.agregadoPorCliente());
        List<NamedTotalDto> porStatus = mapStatus(agendaAlocacaoRepository.agregadoPorStatus());
        List<NamedTotalDto> porAlocado = mapTriples(agendaAlocacaoRepository.agregadoPorAlocadoPor());

        return new AgendaDashboardDto(n, totalHoras, porRecurso, porCliente, porStatus, porAlocado);
    }

    private static List<NamedTotalDto> mapTriples(List<Object[]> rows) {
        List<NamedTotalDto> out = new ArrayList<>();
        for (Object[] o : rows) {
            String nome = o[0] != null ? String.valueOf(o[0]) : "";
            double horas = o[1] instanceof Number ? ((Number) o[1]).doubleValue() : 0;
            long registros = o[2] instanceof Number ? ((Number) o[2]).longValue() : 0;
            out.add(new NamedTotalDto(nome, horas, registros));
        }
        return out;
    }

    private static List<NamedTotalDto> mapStatus(List<Object[]> rows) {
        List<NamedTotalDto> out = new ArrayList<>();
        for (Object[] o : rows) {
            String nome = o[0] != null ? String.valueOf(o[0]) : "";
            long registros = o[1] instanceof Number ? ((Number) o[1]).longValue() : 0;
            double horas = o[2] instanceof Number ? ((Number) o[2]).doubleValue() : 0;
            out.add(new NamedTotalDto(nome, horas, registros));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<AgendaGanttItemDto> gantt() {
        List<AgendaAlocacao> all = agendaAlocacaoRepository.findAll();
        List<AgendaGanttItemDto> out = new ArrayList<>();
        for (AgendaAlocacao a : all) {
            if (a.getDataInicio() == null) {
                continue;
            }
            LocalDate end = a.getDataFinal() != null ? a.getDataFinal() : a.getDataInicio();
            out.add(
                    new AgendaGanttItemDto(
                            a.getId(),
                            a.getRecurso(),
                            a.getAtividade(),
                            a.getCliente(),
                            a.getStatus(),
                            a.getLocalAgenda(),
                            a.getAlocadoPor(),
                            a.getDataInicio(),
                            end,
                            a.getHoras()
                    )
            );
        }
        return out;
    }
}
