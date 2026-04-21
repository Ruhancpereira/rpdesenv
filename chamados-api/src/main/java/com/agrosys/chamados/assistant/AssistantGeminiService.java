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
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * Google Gemini via REST (Generative Language API). Requer {@code GEMINI_API_KEY} ou
 * {@code app.assistant.gemini-api-key}.
 */
@Service
public class AssistantGeminiService {

    private final ObjectMapper objectMapper;
    private final AssistantToolRunner toolRunner;
    private final RestClient gemini;
    private final String modelId;
    private final String apiKey;
    private final boolean enabled;

    public AssistantGeminiService(
            ObjectMapper objectMapper,
            AssistantToolRunner toolRunner,
            @Value("${app.assistant.gemini-api-key:}") String apiKey,
            @Value("${app.assistant.gemini-model:gemini-2.0-flash}") String modelId
    ) {
        this.objectMapper = objectMapper;
        this.toolRunner = toolRunner;
        String k = apiKey != null ? apiKey.trim() : "";
        this.apiKey = k;
        this.modelId = modelId != null && !modelId.isBlank() ? modelId.trim() : "gemini-2.0-flash";
        this.enabled = !k.isEmpty();
        this.gemini = enabled ? RestClient.builder().build() : null;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getModel() {
        return modelId;
    }

    public String chat(AssistantChatRequest request) throws Exception {
        if (!enabled || gemini == null) {
            throw new IllegalStateException(
                    "Gemini não configurado: defina GEMINI_API_KEY ou app.assistant.gemini-api-key."
            );
        }
        ArrayNode contents = objectMapper.createArrayNode();
        if (request.messages() != null) {
            for (AssistantMessageDto m : request.messages()) {
                if (m == null || m.role() == null || m.content() == null) {
                    continue;
                }
                String r = m.role().toLowerCase();
                if (!r.equals("user") && !r.equals("assistant")) {
                    continue;
                }
                String geminiRole = r.equals("assistant") ? "model" : "user";
                ObjectNode row = objectMapper.createObjectNode();
                row.put("role", geminiRole);
                ArrayNode parts = objectMapper.createArrayNode();
                ObjectNode textPart = objectMapper.createObjectNode();
                textPart.put("text", m.content());
                parts.add(textPart);
                row.set("parts", parts);
                contents.add(row);
            }
        }
        boolean hasUser = false;
        for (JsonNode n : contents) {
            if ("user".equals(n.path("role").asText())) {
                hasUser = true;
                break;
            }
        }
        if (!hasUser) {
            throw new IllegalArgumentException("Envie pelo menos uma mensagem do utilizador.");
        }

        ArrayNode tools = objectMapper.createArrayNode();
        ObjectNode toolObj = objectMapper.createObjectNode();
        toolObj.set(
                "functionDeclarations",
                objectMapper.valueToTree(AssistantToolDefinitions.geminiFunctionDeclarations())
        );
        tools.add(toolObj);

        ObjectNode systemInstruction = objectMapper.createObjectNode();
        systemInstruction.put("role", "user");
        ArrayNode sysParts = objectMapper.createArrayNode();
        ObjectNode sysText = objectMapper.createObjectNode();
        sysText.put("text", AssistantToolDefinitions.SYSTEM_PROMPT);
        sysParts.add(sysText);
        systemInstruction.set("parts", sysParts);

        int maxRounds = 10;
        for (int round = 0; round < maxRounds; round++) {
            ObjectNode body = objectMapper.createObjectNode();
            body.set("systemInstruction", systemInstruction);
            body.set("contents", contents);
            body.set("tools", tools);
            ObjectNode toolConfig = objectMapper.createObjectNode();
            ObjectNode fcc = objectMapper.createObjectNode();
            fcc.put("mode", "AUTO");
            toolConfig.set("functionCallingConfig", fcc);
            body.set("toolConfig", toolConfig);

            URI endpoint =
                    UriComponentsBuilder.fromUriString(
                                    "https://generativelanguage.googleapis.com/v1beta/models/"
                                            + modelId
                                            + ":generateContent")
                            .queryParam("key", apiKey)
                            .build(true)
                            .toUri();

            String raw =
                    gemini
                            .post()
                            .uri(endpoint)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(body.toString())
                            .retrieve()
                            .body(String.class);

            JsonNode root = objectMapper.readTree(raw);
            if (root.has("error")) {
                String msg = root.path("error").path("message").asText("Erro desconhecido da API Gemini.");
                throw new IllegalStateException(msg);
            }
            JsonNode candidate = root.path("candidates").path(0);
            JsonNode cContent = candidate.path("content");
            if (cContent.isMissingNode() || !cContent.has("parts")) {
                return "Resposta inválida da API Gemini (sem conteúdo).";
            }

            List<JsonNode> functionCalls = new ArrayList<>();
            StringBuilder textOut = new StringBuilder();
            for (JsonNode part : cContent.get("parts")) {
                if (part.has("functionCall")) {
                    functionCalls.add(part.get("functionCall"));
                }
                if (part.has("text")) {
                    textOut.append(part.path("text").asText(""));
                }
            }

            if (!functionCalls.isEmpty()) {
                contents.add(cContent);

                ArrayNode responseParts = objectMapper.createArrayNode();
                for (JsonNode fc : functionCalls) {
                    String name = fc.path("name").asText("");
                    JsonNode argsNode = fc.get("args");
                    String args = argsNode == null || argsNode.isNull() ? "{}" : argsNode.toString();
                    String result = toolRunner.run(name, args);

                    ObjectNode frPart = objectMapper.createObjectNode();
                    ObjectNode fr = objectMapper.createObjectNode();
                    fr.put("name", name);
                    ObjectNode responseObj = objectMapper.createObjectNode();
                    responseObj.put("result", result);
                    fr.set("response", responseObj);
                    frPart.set("functionResponse", fr);
                    responseParts.add(frPart);
                }
                ObjectNode userFn = objectMapper.createObjectNode();
                userFn.put("role", "user");
                userFn.set("parts", responseParts);
                contents.add(userFn);
                continue;
            }

            String combined = textOut.toString().trim();
            if (!combined.isEmpty()) {
                return combined;
            }
            String finish = candidate.path("finishReason").asText("");
            if ("MAX_TOKENS".equals(finish) || "LENGTH".equals(finish)) {
                return "A resposta foi cortada pelo limite de tokens. Tenta uma pergunta mais curta.";
            }
            return "Não foi possível obter texto do modelo. finishReason=" + finish;
        }
        return "Limite de passos de ferramentas atingido. Reformula a pergunta.";
    }
}
