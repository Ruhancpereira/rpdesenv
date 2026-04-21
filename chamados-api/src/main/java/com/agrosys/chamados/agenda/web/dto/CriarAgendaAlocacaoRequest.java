package com.agrosys.chamados.agenda.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Corpo para criar uma linha de agenda (mesmas colunas lógicas da planilha importada).
 * Campos omitidos ou em branco contam como ausentes na validação de obrigatórios.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CriarAgendaAlocacaoRequest(
        String recurso,
        String cliente,
        String local,
        String sedeAgrosys,
        String status,
        String passagem,
        String aprovador,
        /** ISO yyyy-MM-dd ou dd/MM/yyyy */
        String dataInicio,
        String dataFinal,
        String atividade,
        Double horas,
        String alocadoPor
) {
}
