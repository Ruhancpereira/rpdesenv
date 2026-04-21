package com.agrosys.chamados.util;

import com.agrosys.chamados.domain.Chamado;

import java.lang.reflect.Field;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public final class ChamadoDiff {

    private static final Set<String> SKIP = Set.of(
            "id",
            "numeroChamado",
            "createdAt",
            "updatedAt",
            "historicoMovCount"
    );

    private ChamadoDiff() {
    }

    public record CampoAlterado(String campoSnake, String de, String para) {
    }

    public static List<CampoAlterado> diff(Chamado antes, Chamado depois) {
        List<CampoAlterado> out = new ArrayList<>();
        for (Field f : Chamado.class.getDeclaredFields()) {
            if (SKIP.contains(f.getName())) {
                continue;
            }
            f.setAccessible(true);
            try {
                Object v1 = f.get(antes);
                Object v2 = f.get(depois);
                if (!Objects.equals(v1, v2)) {
                    String key = CamelSnake.camelToSnake(f.getName());
                    out.add(new CampoAlterado(key, format(v1), format(v2)));
                }
            } catch (IllegalAccessException e) {
                throw new IllegalStateException(e);
            }
        }
        return out;
    }

    private static String format(Object v) {
        if (v == null) {
            return "";
        }
        if (v instanceof LocalDate d) {
            return d.toString();
        }
        if (v instanceof Instant i) {
            return i.toString();
        }
        return String.valueOf(v);
    }
}
