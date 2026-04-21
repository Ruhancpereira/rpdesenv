package com.agrosys.chamados.repo;

import com.agrosys.chamados.domain.ImportBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImportBatchRepository extends JpaRepository<ImportBatch, Long> {

    List<ImportBatch> findAllByOrderByIdDesc();

    Optional<ImportBatch> findFirstByRevertidoFalseOrderByIdDesc();
}
