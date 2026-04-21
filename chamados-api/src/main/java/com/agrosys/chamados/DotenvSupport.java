package com.agrosys.chamados;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.util.StringUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Localiza o primeiro <code>.env</code> (cwd e até 5 níveis acima) e extrai pares chave/valor.
 */
final class DotenvSupport {

    private DotenvSupport() {}

    static Map<String, String> carregarPrimeiroEnv() {
        Map<String, String> out = new HashMap<>();
        for (Path envFile : candidatosEnv()) {
            if (!Files.isRegularFile(envFile)) {
                continue;
            }
            try {
                Dotenv dotenv =
                        Dotenv.configure()
                                .directory(envFile.getParent().toString())
                                .filename(envFile.getFileName().toString())
                                .load();
                for (DotenvEntry e : dotenv.entries()) {
                    String key = normalizarChave(e.getKey());
                    if (!StringUtils.hasText(key)) {
                        continue;
                    }
                    String val = e.getValue() != null ? e.getValue().trim() : "";
                    out.put(key, val);
                }
                if (!out.isEmpty()) {
                    return out;
                }
            } catch (Exception ex) {
                System.err.println(
                        "[agrosys] Aviso: não foi possível ler " + envFile.toAbsolutePath() + ": " + ex.getMessage());
            }
        }
        return out;
    }

    /**
     * Injeta no ambiente do processo só o que ainda não está definido com texto (evita sobrescrever IDE/OS).
     */
    static void aplicarNoSystemAntesDoSpring(Map<String, String> vars) {
        for (Map.Entry<String, String> e : vars.entrySet()) {
            String key = e.getKey();
            String val = e.getValue();
            if (!StringUtils.hasText(val)) {
                continue;
            }
            if (StringUtils.hasText(System.getenv(key))) {
                continue;
            }
            if (StringUtils.hasText(System.getProperty(key))) {
                continue;
            }
            System.setProperty(key, val);
        }
        String ak = vars.get("ANTHROPIC_API_KEY");
        if (StringUtils.hasText(ak)
                && !StringUtils.hasText(System.getProperty("app.assistant.anthropic-api-key"))) {
            System.setProperty("app.assistant.anthropic-api-key", ak.trim());
        }
    }

    static Map<String, Object> paraPropertySource(Map<String, String> vars, org.springframework.core.env.ConfigurableEnvironment env) {
        Map<String, Object> map = new HashMap<>();
        for (Map.Entry<String, String> e : vars.entrySet()) {
            String key = e.getKey();
            String val = e.getValue();
            if (key == null || !StringUtils.hasText(val)) {
                continue;
            }
            if (StringUtils.hasText(env.getProperty(key, ""))) {
                continue;
            }
            map.put(key, val);
        }
        String ak = vars.get("ANTHROPIC_API_KEY");
        String appKey = env.getProperty("app.assistant.anthropic-api-key");
        if (StringUtils.hasText(ak) && !StringUtils.hasText(appKey)) {
            map.put("app.assistant.anthropic-api-key", ak.trim());
        }
        return map;
    }

    private static String normalizarChave(String key) {
        if (key == null) {
            return "";
        }
        String k = key.trim();
        if (k.startsWith("\uFEFF")) {
            k = k.substring(1).trim();
        }
        return k;
    }

    private static List<Path> candidatosEnv() {
        List<Path> out = new ArrayList<>();
        Path dir = Path.of("").toAbsolutePath();
        for (int i = 0; i < 6 && dir != null; i++) {
            out.add(dir.resolve(".env"));
            dir = dir.getParent();
        }
        return out;
    }
}
