package com.agrosys.chamados.repo;

import com.agrosys.chamados.domain.ImportDelta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportDeltaRepository extends JpaRepository<ImportDelta, Long> {

    List<ImportDelta> findByImportBatch_IdOrderByIdDesc(Long importBatchId);
}
