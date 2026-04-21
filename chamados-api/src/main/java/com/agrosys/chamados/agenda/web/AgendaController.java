package com.agrosys.chamados.agenda.web;

import com.agrosys.chamados.agenda.service.AgendaImportService;
import com.agrosys.chamados.agenda.service.AgendaMarcacaoService;
import com.agrosys.chamados.agenda.service.AgendaOpcoesFiltroService;
import com.agrosys.chamados.agenda.service.AgendaQueryService;
import com.agrosys.chamados.agenda.service.AgendaSpreadsheetFileService;
import com.agrosys.chamados.agenda.web.dto.AgendaCampoMetaDto;
import com.agrosys.chamados.agenda.web.dto.AgendaDashboardDto;
import com.agrosys.chamados.agenda.web.dto.AgendaGanttItemDto;
import com.agrosys.chamados.agenda.web.dto.CriarAgendaAlocacaoRequest;
import com.agrosys.chamados.agenda.web.dto.MarcacaoValidacaoDto;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agenda")
public class AgendaController {

    private final AgendaSpreadsheetFileService agendaSpreadsheetFileService;
    private final AgendaQueryService agendaQueryService;
    private final AgendaOpcoesFiltroService agendaOpcoesFiltroService;
    private final AgendaMarcacaoService agendaMarcacaoService;

    public AgendaController(
            AgendaSpreadsheetFileService agendaSpreadsheetFileService,
            AgendaQueryService agendaQueryService,
            AgendaOpcoesFiltroService agendaOpcoesFiltroService,
            AgendaMarcacaoService agendaMarcacaoService
    ) {
        this.agendaSpreadsheetFileService = agendaSpreadsheetFileService;
        this.agendaQueryService = agendaQueryService;
        this.agendaOpcoesFiltroService = agendaOpcoesFiltroService;
        this.agendaMarcacaoService = agendaMarcacaoService;
    }

    /**
     * Campos da marcação (planilha) e obrigatoriedade — usar em agentes e formulários para saber o que pedir ao utilizador.
     */
    @GetMapping("/meta/marcacao")
    public List<AgendaCampoMetaDto> metaMarcacao() {
        return agendaMarcacaoService.metaMarcacao();
    }

    /**
     * Grava uma alocação avulsa. Se faltar informação obrigatória, responde 400 com {@link MarcacaoValidacaoDto}
     * (lista de ids em {@code camposFaltando} + descrição dos obrigatórios).
     */
    @PostMapping("/alocacao")
    public ResponseEntity<?> criarAlocacao(@RequestBody CriarAgendaAlocacaoRequest body) {
        MarcacaoValidacaoDto erro = agendaMarcacaoService.validarOuErro(body);
        if (erro != null) {
            return ResponseEntity.badRequest().body(erro);
        }
        long id = agendaMarcacaoService.criar(body);
        return ResponseEntity.status(201).body(Map.of(
                "id", id,
                "mensagem", "Marcação gravada na base."
        ));
    }

    /** Valores distintos por coluna (atualizados após cada importação da agenda). */
    @GetMapping("/opcoes-filtro")
    public Map<String, List<String>> opcoesFiltro() {
        return agendaOpcoesFiltroService.opcoes();
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) throws Exception {
        AgendaImportService.AgendaImportResult r = agendaSpreadsheetFileService.importFile(file);
        return ResponseEntity.ok(Map.of(
                "linhasValidas", r.linhasValidas(),
                "totalGravado", r.totalGravado(),
                "mensagem", "Agenda importada. Os registros anteriores foram substituídos."
        ));
    }

    @GetMapping("/dashboard")
    public AgendaDashboardDto dashboard() {
        return agendaQueryService.dashboard();
    }

    @GetMapping("/gantt")
    public List<AgendaGanttItemDto> gantt() {
        return agendaQueryService.gantt();
    }
}
