package com.agrosys.chamados.util;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.InputStream;
import java.util.*;

public final class SpreadsheetRows {

    private SpreadsheetRows() {}

    public static List<Map<String, String>> readExcel(InputStream in, String filename) throws Exception {
        Workbook wb;
        String lower = filename.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".xlsx")) {
            wb = new XSSFWorkbook(in);
        } else if (lower.endsWith(".xls")) {
            wb = new HSSFWorkbook(in);
        } else {
            throw new IllegalArgumentException("Formato Excel não suportado: " + filename);
        }
        try (wb) {
            Sheet sheet = wb.getSheetAt(0);
            Iterator<Row> it = sheet.rowIterator();
            if (!it.hasNext()) {
                return List.of();
            }
            Row header = it.next();
            List<String> keys = new ArrayList<>();
            for (Cell c : header) {
                keys.add(normalizeHeader(cellToString(c)));
            }
            List<Map<String, String>> rows = new ArrayList<>();
            DataFormatter formatter = new DataFormatter(Locale.ROOT);
            FormulaEvaluator evaluator = wb.getCreationHelper().createFormulaEvaluator();
            while (it.hasNext()) {
                Row row = it.next();
                boolean empty = true;
                Map<String, String> map = new LinkedHashMap<>();
                for (int i = 0; i < keys.size(); i++) {
                    String key = keys.get(i);
                    if (key.isEmpty()) {
                        continue;
                    }
                    Cell cell = row.getCell(i, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    String val = cell == null ? "" : formatCell(cell, formatter, evaluator);
                    if (!val.isBlank()) {
                        empty = false;
                    }
                    map.put(key, val);
                }
                if (!empty) {
                    rows.add(map);
                }
            }
            return rows;
        }
    }

    public static List<Map<String, String>> readCsv(InputStream in) throws Exception {
        byte[] raw = in.readAllBytes();
        String text = stripBom(new String(raw, detectCharset(raw)));
        char delim = detectDelimiter(text);
        try (CSVParser parser = CSVParser.parse(text, CSVFormat.DEFAULT.builder()
                .setDelimiter(delim)
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreEmptyLines(true)
                .setTrim(true)
                .build())) {
            List<Map<String, String>> rows = new ArrayList<>();
            for (CSVRecord rec : parser) {
                Map<String, String> map = new LinkedHashMap<>();
                boolean empty = true;
                for (String h : parser.getHeaderNames()) {
                    String key = normalizeHeader(h);
                    String v = rec.isMapped(h) ? rec.get(h) : "";
                    if (v != null && !v.isBlank()) {
                        empty = false;
                    }
                    map.put(key, v == null ? "" : v);
                }
                if (!empty) {
                    rows.add(map);
                }
            }
            return rows;
        }
    }

    private static String stripBom(String s) {
        if (s.startsWith("\uFEFF")) {
            return s.substring(1);
        }
        return s;
    }

    private static java.nio.charset.Charset detectCharset(byte[] raw) {
        return java.nio.charset.StandardCharsets.UTF_8;
    }

    private static char detectDelimiter(String sample) {
        int semi = countLinesChar(sample, ';');
        int comma = countLinesChar(sample, ',');
        return semi >= comma ? ';' : ',';
    }

    private static int countLinesChar(String text, char ch) {
        int n = 0;
        int lines = 0;
        for (int i = 0; i < text.length(); i++) {
            if (text.charAt(i) == '\n') {
                lines++;
            }
            if (text.charAt(i) == ch) {
                n++;
            }
        }
        return lines > 0 ? n / Math.max(lines, 1) : n;
    }

    static String normalizeHeader(String h) {
        if (h == null) {
            return "";
        }
        return h.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    private static String formatCell(Cell cell, DataFormatter formatter, FormulaEvaluator evaluator) {
        if (cell.getCellType() == CellType.FORMULA) {
            try {
                return formatter.formatCellValue(cell, evaluator);
            } catch (Exception e) {
                return "";
            }
        }
        return formatter.formatCellValue(cell);
    }

    private static String cellToString(Cell cell) {
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getDateCellValue().toInstant().toString()
                    : String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellType() == CellType.NUMERIC
                    ? String.valueOf(cell.getNumericCellValue())
                    : cell.toString();
            default -> "";
        };
    }
}
