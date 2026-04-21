package com.agrosys.chamados.agenda.web.dto;

import java.util.List;

public record AgendaDashboardDto(
        long totalRegistros,
        double totalHoras,
        List<NamedTotalDto> porRecurso,
        List<NamedTotalDto> porCliente,
        List<NamedTotalDto> porStatus,
        List<NamedTotalDto> porAlocadoPor
) {
}
