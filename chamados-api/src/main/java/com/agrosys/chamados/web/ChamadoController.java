package com.agrosys.chamados.web;

import com.agrosys.chamados.domain.Chamado;
import com.agrosys.chamados.service.ChamadoMovimentacaoQueryService;
import com.agrosys.chamados.service.ChamadoQueryService;
import com.agrosys.chamados.web.dto.MovimentacaoItemDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chamados")
public class ChamadoController {

    private static final int TAMANHO_PAGINA_MAX = 500;

    private final ChamadoQueryService chamadoQueryService;
    private final ChamadoMovimentacaoQueryService chamadoMovimentacaoQueryService;
    private final int listaMaxRegistrosTudo;

    public ChamadoController(
            ChamadoQueryService chamadoQueryService,
            ChamadoMovimentacaoQueryService chamadoMovimentacaoQueryService,
            @Value("${app.chamados.lista-max-registros-tudo:100000}") int listaMaxRegistrosTudo
    ) {
        this.chamadoQueryService = chamadoQueryService;
        this.chamadoMovimentacaoQueryService = chamadoMovimentacaoQueryService;
        this.listaMaxRegistrosTudo = Math.max(1_000, listaMaxRegistrosTudo);
    }

    @GetMapping
    public Page<Chamado> list(
            @RequestParam Map<String, String> allParams,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "false") boolean listarTodos,
            @RequestParam(defaultValue = "numeroChamado") String sort,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Map<String, String> params = new HashMap<>(allParams);
        params.remove("page");
        params.remove("size");
        params.remove("sort");
        params.remove("direction");
        params.remove("listarTodos");
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Sort sortObj = Sort.by(dir, sort);
        Pageable pageable;
        if (listarTodos) {
            pageable = PageRequest.of(0, listaMaxRegistrosTudo, sortObj);
        } else {
            int safeSize = Math.min(Math.max(size, 1), TAMANHO_PAGINA_MAX);
            pageable = PageRequest.of(Math.max(0, page), safeSize, sortObj);
        }
        return chamadoQueryService.search(params, pageable);
    }

    @GetMapping("/numero/{numeroChamado}/movimentacoes")
    public List<MovimentacaoItemDto> movimentacoes(@PathVariable Long numeroChamado) {
        return chamadoMovimentacaoQueryService.listarPorNumeroChamado(numeroChamado);
    }
}
