package com.agrosys.chamados.web.dto;

import java.time.Instant;

public record MovimentacaoItemDto(
        String campo,
        String de,
        String para,
        Instant quando,
        String arquivoImportacao,
        Long importBatchId
) {
}
