package com.agrosys.chamados.agenda.web.dto;

/**
 * Descrição de um campo da marcação (para UI e para agentes: mesmo contrato).
 */
public record AgendaCampoMetaDto(
        String id,
        String label,
        String tipo,
        boolean obrigatorio,
        String descricao
) {
}
