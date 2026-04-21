package com.agrosys.chamados.service;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

final class FilterKeys {

    private FilterKeys() {}

    static Map<String, String> normalize(Map<String, String> raw) {
        Map<String, String> m = new HashMap<>();
        for (var e : raw.entrySet()) {
            if (e.getValue() == null || e.getValue().isBlank()) {
                continue;
            }
            String k = e.getKey().trim().toLowerCase(Locale.ROOT).replace('-', '_');
            m.put(k, e.getValue());
        }
        return m;
    }
}
