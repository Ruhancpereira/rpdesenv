package com.agrosys.chamados.service;

import com.agrosys.chamados.domain.Chamado;
import com.agrosys.chamados.domain.ImportBatch;
import com.agrosys.chamados.domain.ImportDelta;
import com.agrosys.chamados.domain.TipoDeltaImport;
import com.agrosys.chamados.repo.ChamadoMovimentacaoRepository;
import com.agrosys.chamados.repo.ChamadoRepository;
import com.agrosys.chamados.repo.ImportBatchRepository;
import com.agrosys.chamados.repo.ImportDeltaRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ImportRollbackService {

    private final ImportBatchRepository importBatchRepository;
    private final ImportDeltaRepository importDeltaRepository;
    private final ChamadoMovimentacaoRepository chamadoMovimentacaoRepository;
    private final ChamadoRepository chamadoRepository;
    private final ObjectMapper chamadoImportMapper;

    public ImportRollbackService(
            ImportBatchRepository importBatchRepository,
            ImportDeltaRepository importDeltaRepository,
            ChamadoMovimentacaoRepository chamadoMovimentacaoRepository,
            ChamadoRepository chamadoRepository,
            @Qualifier("chamadoImportMapper") ObjectMapper chamadoImportMapper
    ) {
        this.importBatchRepository = importBatchRepository;
        this.importDeltaRepository = importDeltaRepository;
        this.chamadoMovimentacaoRepository = chamadoMovimentacaoRepository;
        this.chamadoRepository = chamadoRepository;
        this.chamadoImportMapper = chamadoImportMapper;
    }

    @Transactional
    public ImportBatch rollbackUltimo() {
        ImportBatch batch = importBatchRepository
                .findFirstByRevertidoFalseOrderByIdDesc()
                .orElseThrow(() -> new IllegalStateException("Não há importação ativa para desfazer."));
        Long batchId = batch.getId();
        chamadoMovimentacaoRepository.deleteByImportBatch_Id(batchId);

        List<ImportDelta> deltas = importDeltaRepository.findByImportBatch_IdOrderByIdDesc(batchId);
        List<ImportDelta> updates = new ArrayList<>();
        List<ImportDelta> inserts = new ArrayList<>();
        for (ImportDelta d : deltas) {
            if (d.getTipo() == TipoDeltaImport.UPDATE) {
                updates.add(d);
            } else {
                inserts.add(d);
            }
        }

        for (ImportDelta d : updates) {
            restaurarUpdate(d);
        }
        for (ImportDelta d : inserts) {
            if (d.getChamadoId() != null) {
                chamadoRepository.deleteById(d.getChamadoId());
            }
        }

        importDeltaRepository.deleteAll(deltas);
        batch.setRevertido(true);
        importBatchRepository.save(batch);
        return batch;
    }

    private void restaurarUpdate(ImportDelta d) {
        String json = d.getEstadoAnteriorJson();
        if (json == null || json.isBlank()) {
            throw new IllegalStateException("Delta de atualização sem estado anterior.");
        }
        try {
            Chamado antigo = chamadoImportMapper.readValue(json, Chamado.class);
            antigo.setUpdatedAt(Instant.now());
            chamadoRepository.save(antigo);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Falha ao restaurar estado do chamado " + d.getNumeroChamado(), e);
        }
    }
}
