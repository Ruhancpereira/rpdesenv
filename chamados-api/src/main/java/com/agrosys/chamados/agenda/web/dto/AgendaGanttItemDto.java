package com.agrosys.chamados.agenda.web.dto;

import java.time.LocalDate;

public record AgendaGanttItemDto(
        long id,
        String recurso,
        String atividade,
        String cliente,
        String status,
        String localAgenda,
        String alocadoPor,
        LocalDate dataInicio,
        LocalDate dataFinal,
        Double horas
) {
}
