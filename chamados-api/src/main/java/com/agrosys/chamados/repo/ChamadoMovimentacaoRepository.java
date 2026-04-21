package com.agrosys.chamados.repo;

import com.agrosys.chamados.domain.ChamadoMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChamadoMovimentacaoRepository extends JpaRepository<ChamadoMovimentacao, Long> {

    void deleteByImportBatch_Id(Long importBatchId);

    List<ChamadoMovimentacao> findByChamado_IdOrderByRegistradoEmDesc(Long chamadoId);
}
