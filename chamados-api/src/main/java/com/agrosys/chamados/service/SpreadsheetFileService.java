package com.agrosys.chamados.service;

import com.agrosys.chamados.util.SpreadsheetRows;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SpreadsheetFileService {

    private final ChamadoImportService chamadoImportService;

    public SpreadsheetFileService(ChamadoImportService chamadoImportService) {
        this.chamadoImportService = chamadoImportService;
    }

    public ChamadoImportService.ImportResult importFile(MultipartFile file) throws Exception {
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
        return chamadoImportService.upsertAll(rows, name);
    }
}
