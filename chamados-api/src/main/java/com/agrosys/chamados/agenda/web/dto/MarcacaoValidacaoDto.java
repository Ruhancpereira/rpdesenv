package com.agrosys.chamados.agenda.web.dto;

import java.util.List;

/** Resposta 400 quando a marcação está incompleta (útil para agentes e front). */
public record MarcacaoValidacaoDto(
        String mensagem,
        List<String> camposFaltando,
        List<AgendaCampoMetaDto> camposObrigatorios
) {
}
