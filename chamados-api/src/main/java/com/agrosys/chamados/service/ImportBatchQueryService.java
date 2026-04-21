package com.agrosys.chamados.service;

import com.agrosys.chamados.domain.ImportBatch;
import com.agrosys.chamados.repo.ImportBatchRepository;
import com.agrosys.chamados.web.dto.ImportBatchDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ImportBatchQueryService {

    private final ImportBatchRepository importBatchRepository;

    public ImportBatchQueryService(ImportBatchRepository importBatchRepository) {
        this.importBatchRepository = importBatchRepository;
    }

    @Transactional(readOnly = true)
    public List<ImportBatchDto> listarTodos() {
        return importBatchRepository.findAllByOrderByIdDesc().stream().map(this::toDto).toList();
    }

    private ImportBatchDto toDto(ImportBatch b) {
        return new ImportBatchDto(
                b.getId(),
                b.getNomeArquivo(),
                b.getCriadoEm(),
                b.getLinhasLidas(),
                b.getInseridos(),
                b.getAtualizados(),
                b.isRevertido()
        );
    }
}
