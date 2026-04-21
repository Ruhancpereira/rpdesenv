package com.agrosys.chamados.service;

import com.agrosys.chamados.domain.ChamadoMovimentacao;
import com.agrosys.chamados.repo.ChamadoMovimentacaoRepository;
import com.agrosys.chamados.repo.ChamadoRepository;
import com.agrosys.chamados.web.dto.MovimentacaoItemDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ChamadoMovimentacaoQueryService {

    private final ChamadoRepository chamadoRepository;
    private final ChamadoMovimentacaoRepository chamadoMovimentacaoRepository;

    public ChamadoMovimentacaoQueryService(
            ChamadoRepository chamadoRepository,
            ChamadoMovimentacaoRepository chamadoMovimentacaoRepository
    ) {
        this.chamadoRepository = chamadoRepository;
        this.chamadoMovimentacaoRepository = chamadoMovimentacaoRepository;
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoItemDto> listarPorNumeroChamado(Long numeroChamado) {
        var chamado = chamadoRepository
                .findByNumeroChamado(numeroChamado)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chamado não encontrado"));
        List<ChamadoMovimentacao> list = chamadoMovimentacaoRepository.findByChamado_IdOrderByRegistradoEmDesc(
                chamado.getId()
        );
        return list.stream()
                .map(m -> new MovimentacaoItemDto(
                        m.getCampo(),
                        m.getValorAnterior(),
                        m.getValorNovo(),
                        m.getRegistradoEm(),
                        m.getImportBatch() != null ? m.getImportBatch().getNomeArquivo() : null,
                        m.getImportBatch() != null ? m.getImportBatch().getId() : null
                ))
                .toList();
    }
}
