package com.agrosys.chamados.service;

import com.agrosys.chamados.domain.Chamado;
import com.agrosys.chamados.repo.ChamadoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ChamadoQueryService {

    private final ChamadoRepository chamadoRepository;

    public ChamadoQueryService(ChamadoRepository chamadoRepository) {
        this.chamadoRepository = chamadoRepository;
    }

    public Page<Chamado> search(Map<String, String> rawParams, Pageable pageable) {
        Specification<Chamado> spec = ChamadoSpecifications.fromParams(rawParams);
        return chamadoRepository.findAll(spec, pageable);
    }
}
