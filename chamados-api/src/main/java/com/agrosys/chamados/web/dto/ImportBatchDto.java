package com.agrosys.chamados.web.dto;

import java.time.Instant;

public record ImportBatchDto(
        long id,
        String nomeArquivo,
        Instant criadoEm,
        int linhasLidas,
        int inseridos,
        int atualizados,
        boolean revertido
) {
}
