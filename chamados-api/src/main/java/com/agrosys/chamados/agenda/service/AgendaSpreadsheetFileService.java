package com.agrosys.chamados.agenda.service;

import com.agrosys.chamados.util.SpreadsheetRows;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AgendaSpreadsheetFileService {

    private final AgendaImportService agendaImportService;

    public AgendaSpreadsheetFileService(AgendaImportService agendaImportService) {
        this.agendaImportService = agendaImportService;
    }

    public AgendaImportService.AgendaImportResult importFile(MultipartFile file) throws Exception {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String lower = name.toLowerCase(Locale.ROOT);
        List<Map<String, String>> rows;
        if (lower.endsWith(".csv")) {
            rows = SpreadsheetRows.readCsv(file.getInputStream());
        } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
            rows = SpreadsheetRows.readExcel(file.getInputStream(), name);
        } else {
            throw new IllegalArgumentException("Envie um arquivo .csv, .xlsx ou .xls");
        }
        return agendaImportService.importarPlanilha(rows);
    }
}
