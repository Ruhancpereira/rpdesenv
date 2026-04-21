package com.agrosys.chamados.util;

public final class CamelSnake {

    private CamelSnake() {
    }

    public static String camelToSnake(String camel) {
        if (camel == null || camel.isEmpty()) {
            return camel;
        }
        return camel.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
}
