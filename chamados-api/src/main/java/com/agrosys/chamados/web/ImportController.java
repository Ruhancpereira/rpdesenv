package com.agrosys.chamados.web;

import com.agrosys.chamados.service.ChamadoImportService;
import com.agrosys.chamados.service.ImportBatchQueryService;
import com.agrosys.chamados.service.ImportRollbackService;
import com.agrosys.chamados.service.SpreadsheetFileService;
import com.agrosys.chamados.web.dto.ImportBatchDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final SpreadsheetFileService spreadsheetFileService;
    private final ImportBatchQueryService importBatchQueryService;
    private final ImportRollbackService importRollbackService;

    public ImportController(
            SpreadsheetFileService spreadsheetFileService,
            ImportBatchQueryService importBatchQueryService,
            ImportRollbackService importRollbackService
    ) {
        this.spreadsheetFileService = spreadsheetFileService;
        this.importBatchQueryService = importBatchQueryService;
        this.importRollbackService = importRollbackService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) throws Exception {
        ChamadoImportService.ImportResult r = spreadsheetFileService.importFile(file);
        return ResponseEntity.ok(Map.of(
                "linhasLidas", r.linhasLidas(),
                "inseridos", r.inseridos(),
                "atualizados", r.atualizados(),
                "importBatchId", r.importBatchId(),
                "mensagem", "Importação concluída. Chamados existentes foram atualizados pelo número do chamado."
        ));
    }

    @GetMapping("/historico")
    public List<ImportBatchDto> historicoImportacoes() {
        return importBatchQueryService.listarTodos();
    }

    @PostMapping("/rollback/ultimo")
    public Map<String, Object> rollbackUltimo() {
        try {
            var b = importRollbackService.rollbackUltimo();
            return Map.of(
                    "ok", true,
                    "importBatchId", b.getId(),
                    "nomeArquivo", b.getNomeArquivo(),
                    "mensagem", "Última importação foi desfeita e os dados foram restaurados."
            );
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
