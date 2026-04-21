package com.agrosys.chamados.util;

import org.apache.poi.ss.usermodel.DateUtil;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.regex.Pattern;

public final class FieldParsers {

    private static final Pattern ISO = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}");
    private static final DateTimeFormatter[] BR = new DateTimeFormatter[]{
            DateTimeFormatter.ofPattern("d/M/yyyy", Locale.ROOT),
            DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ROOT),
    };

    private FieldParsers() {}

    public static Long parseLong(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        String t = s.trim().replace(",", ".");
        try {
            if (t.contains(".")) {
                return Math.round(Double.parseDouble(t));
            }
            return Long.parseLong(t);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static Double parseDouble(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        String t = s.trim().replace(",", ".");
        try {
            return Double.parseDouble(t);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        String t = s.trim();
        if (ISO.matcher(t).find()) {
            try {
                return LocalDate.parse(t.substring(0, Math.min(10, t.length())));
            } catch (DateTimeParseException ignored) {
            }
        }
        for (DateTimeFormatter f : BR) {
            try {
                return LocalDate.parse(t, f);
            } catch (DateTimeParseException ignored) {
            }
        }
        Double serial = parseDouble(t);
        if (serial != null && serial > 20000 && serial < 60000) {
            try {
                java.util.Date d = DateUtil.getJavaDate(serial);
                return LocalDate.ofInstant(d.toInstant(), ZoneId.systemDefault());
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    public static Instant now() {
        return Instant.now();
    }
}
