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

@Service
public class AssistantOpenAiService {

    private final ObjectMapper objectMapper;
    private final AssistantToolRunner toolRunner;
    private final RestClient openAi;
    private final String model;
    private final boolean enabled;

    public AssistantOpenAiService(
            ObjectMapper objectMapper,
            AssistantToolRunner toolRunner,
            @Value("${app.assistant.openai-api-key:}") String apiKey,
            @Value("${app.assistant.model:gpt-4o-mini}") String model
    ) {
        this.objectMapper = objectMapper;
        this.toolRunner = toolRunner;
        this.model = model;
        String k = apiKey != null ? apiKey.trim() : "";
        this.enabled = !k.isEmpty();
        this.openAi =
                enabled
                        ? RestClient.builder()
                                .baseUrl("https://api.openai.com/v1")
                                .defaultHeader("Authorization", "Bearer " + k)
                                .build()
                        : null;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String chat(AssistantChatRequest request) throws Exception {
        if (!enabled || openAi == null) {
            throw new IllegalStateException("OpenAI não configurado: defina OPENAI_API_KEY ou app.assistant.openai-api-key.");
        }
        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", AssistantToolDefinitions.SYSTEM_PROMPT));
        if (request.messages() != null) {
            for (AssistantMessageDto m : request.messages()) {
                if (m == null || m.role() == null || m.content() == null) {
                    continue;
                }
                String r = m.role().toLowerCase();
                if (!r.equals("user") && !r.equals("assistant")) {
                    continue;
                }
                messages.add(Map.of("role", r, "content", m.content()));
            }
        }
        if (messages.stream().noneMatch(x -> "user".equals(x.get("role")))) {
            throw new IllegalArgumentException("Envie pelo menos uma mensagem do utilizador.");
        }

        ArrayNode tools = objectMapper.createArrayNode();
        for (Map<String, Object> t : AssistantToolDefinitions.openAiToolList()) {
            tools.add(objectMapper.valueToTree(t));
        }

        int maxRounds = 10;
        for (int round = 0; round < maxRounds; round++) {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model);
            body.set("messages", objectMapper.valueToTree(messages));
            body.set("tools", tools);
            body.put("tool_choice", "auto");

            String raw =
                    openAi
                            .post()
                            .uri("/chat/completions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(body.toString())
                            .retrieve()
                            .body(String.class);

            JsonNode root = objectMapper.readTree(raw);
            JsonNode choice = root.path("choices").path(0);
            String finish = choice.path("finish_reason").asText("");
            JsonNode message = choice.path("message");

            if (message.has("tool_calls") && message.get("tool_calls").isArray()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> assistantMsg = objectMapper.convertValue(message, Map.class);
                messages.add(assistantMsg);
                for (JsonNode tc : message.get("tool_calls")) {
                    String id = tc.path("id").asText("");
                    String name = tc.path("function").path("name").asText("");
                    String args = tc.path("function").path("arguments").asText("{}");
                    String result = toolRunner.run(name, args);
                    messages.add(
                            Map.of(
                                    "role", "tool",
                                    "tool_call_id", id,
                                    "content", result
                            )
                    );
                }
                continue;
            }

            String content = message.path("content").asText(null);
            if (content != null && !content.isBlank()) {
                return content.trim();
            }
            if ("length".equals(finish)) {
                return "A resposta foi cortada pelo limite de tokens. Tenta uma pergunta mais curta.";
            }
            return "Não foi possível obter texto do modelo. finish_reason=" + finish;
        }
        return "Limite de passos de ferramentas atingido. Reformula a pergunta.";
    }
}
