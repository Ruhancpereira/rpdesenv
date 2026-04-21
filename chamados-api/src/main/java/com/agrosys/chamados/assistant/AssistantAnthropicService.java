package com.agrosys.chamados.assistant;

import com.agrosys.chamados.assistant.dto.AssistantChatRequest;
import com.agrosys.chamados.assistant.dto.AssistantMessageDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Claude via API Messages (Anthropic). Requer ANTHROPIC_API_KEY.
 */
@Service
public class AssistantAnthropicService {

    private static final String API_VERSION = "2023-06-01";

    /** Modelo atual quando a API já não expõe snapshots antigos (evita 404 com .env desatualizado). */
    private static final String MODELO_PADRAO_ATUAL = "claude-sonnet-4-6";

    private final ObjectMapper objectMapper;
    private final AssistantToolRunner toolRunner;
    private final RestClient anthropic;
    private final String model;
    private final boolean enabled;
    /** Limite de tokens por resposta (custo de saída); predefinido mais baixo que o máximo da API. */
    private final int maxOutputTokens;
    /** Mais baixo tende a respostas mais focadas (0–1). */
    private final double temperature;
    /** Menos voltas = menos chamadas ao modelo com ferramentas. */
    private final int maxToolRounds;

    public AssistantAnthropicService(
            ObjectMapper objectMapper,
            AssistantToolRunner toolRunner,
            @Value("${app.assistant.anthropic-api-key:}") String apiKey,
            @Value("${app.assistant.anthropic-model:claude-sonnet-4-6}") String model,
            @Value("${app.assistant.anthropic-max-output-tokens:2048}") int maxOutputTokens,
            @Value("${app.assistant.anthropic-temperature:0.3}") double temperature,
            @Value("${app.assistant.anthropic-max-tool-rounds:8}") int maxToolRounds
    ) {
        this.objectMapper = objectMapper;
        this.toolRunner = toolRunner;
        this.model = normalizarIdModelo(model);
        this.maxOutputTokens = limitarMaxTokens(maxOutputTokens);
        this.temperature = limitarTemperatura(temperature);
        this.maxToolRounds = Math.max(1, Math.min(maxToolRounds, 15));
        String k = apiKey != null ? apiKey.trim() : "";
        this.enabled = !k.isEmpty();
        this.anthropic =
                enabled
                        ? RestClient.builder()
                                .baseUrl("https://api.anthropic.com/v1")
                                .defaultHeader("x-api-key", k)
                                .defaultHeader("anthropic-version", API_VERSION)
                                .build()
                        : null;
    }

    /**
     * IDs como {@code claude-3-5-sonnet-20241022} deixaram de existir na API; substituímos pelo modelo
     * suportado em {@link #MODELO_PADRAO_ATUAL}.
     */
    private static String normalizarIdModelo(String model) {
        if (model == null) {
            return MODELO_PADRAO_ATUAL;
        }
        String m = model.trim();
        if (m.isEmpty()) {
            return MODELO_PADRAO_ATUAL;
        }
        if ("claude-3-5-sonnet-20241022".equals(m)
                || m.startsWith("claude-3-5-sonnet-2024")
                || m.equals("claude-3-5-sonnet-latest")) {
            return MODELO_PADRAO_ATUAL;
        }
        return m;
    }

    private static int limitarMaxTokens(int n) {
        return Math.max(256, Math.min(n, 32768));
    }

    private static double limitarTemperatura(double t) {
        if (Double.isNaN(t)) {
            return 0.3;
        }
        return Math.max(0.0, Math.min(1.0, t));
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getModel() {
        return model;
    }

    public String chat(AssistantChatRequest request) throws Exception {
        if (!enabled || anthropic == null) {
            throw new IllegalStateException(
                    "Anthropic não configurado: defina ANTHROPIC_API_KEY ou app.assistant.anthropic-api-key."
            );
        }
        ArrayNode messages = objectMapper.createArrayNode();
        if (request.messages() != null) {
            for (AssistantMessageDto m : request.messages()) {
                if (m == null || m.role() == null || m.content() == null) {
                    continue;
                }
                String r = m.role().toLowerCase();
                if (!r.equals("user") && !r.equals("assistant")) {
                    continue;
                }
                ObjectNode row = objectMapper.createObjectNode();
                row.put("role", r);
                row.put("content", m.content());
                messages.add(row);
            }
        }
        boolean hasUser = false;
        for (JsonNode n : messages) {
            if ("user".equals(n.path("role").asText())) {
                hasUser = true;
                break;
            }
        }
        if (!hasUser) {
            throw new IllegalArgumentException("Envie pelo menos uma mensagem do utilizador.");
        }

        ArrayNode tools = objectMapper.createArrayNode();
        for (Map<String, Object> t : AssistantToolDefinitions.anthropicToolList()) {
            tools.add(objectMapper.valueToTree(t));
        }

        for (int round = 0; round < maxToolRounds; round++) {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxOutputTokens);
            body.put("temperature", temperature);
            body.put("system", AssistantToolDefinitions.SYSTEM_PROMPT);
            body.set("messages", messages);
            body.set("tools", tools);

            String raw =
                    anthropic
                            .post()
                            .uri("/messages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(body.toString())
                            .retrieve()
                            .body(String.class);

            JsonNode root = objectMapper.readTree(raw);
            JsonNode content = root.get("content");
            String stopReason = root.path("stop_reason").asText("");

            if (content == null || !content.isArray()) {
                return "Resposta inválida da API Anthropic.";
            }

            boolean hasToolUse = false;
            List<JsonNode> toolUseBlocks = new ArrayList<>();
            for (JsonNode block : content) {
                if ("tool_use".equals(block.path("type").asText())) {
                    hasToolUse = true;
                    toolUseBlocks.add(block);
                }
            }

            if (hasToolUse) {
                ObjectNode assistantMsg = objectMapper.createObjectNode();
                assistantMsg.put("role", "assistant");
                assistantMsg.set("content", content);
                messages.add(assistantMsg);

                ArrayNode toolResults = objectMapper.createArrayNode();
                for (JsonNode block : toolUseBlocks) {
                    String id = block.path("id").asText("");
                    String name = block.path("name").asText("");
                    JsonNode input = block.get("input");
                    String args = input == null || input.isNull() ? "{}" : input.toString();
                    String result = toolRunner.run(name, args);
                    ObjectNode tr = objectMapper.createObjectNode();
                    tr.put("type", "tool_result");
                    tr.put("tool_use_id", id);
                    tr.put("content", result);
                    toolResults.add(tr);
                }
                ObjectNode userMsg = objectMapper.createObjectNode();
                userMsg.put("role", "user");
                userMsg.set("content", toolResults);
                messages.add(userMsg);
                continue;
            }

            StringBuilder textOut = new StringBuilder();
            for (JsonNode block : content) {
                if ("text".equals(block.path("type").asText())) {
                    textOut.append(block.path("text").asText(""));
                }
            }
            String combined = textOut.toString().trim();
            if (!combined.isEmpty()) {
                return combined;
            }
            if ("max_tokens".equals(stopReason)) {
                return "A resposta foi cortada pelo limite de tokens. Tenta uma pergunta mais curta.";
            }
            return "Não foi possível obter texto do modelo. stop_reason=" + stopReason;
        }
        return "Limite de passos de ferramentas atingido. Reformula a pergunta.";
    }
}
