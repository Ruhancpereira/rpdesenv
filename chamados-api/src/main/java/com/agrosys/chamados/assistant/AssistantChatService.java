package com.agrosys.chamados.assistant;

import com.agrosys.chamados.assistant.dto.AssistantChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Escolhe Claude, OpenAI ou Gemini conforme {@code app.assistant.provider} e chaves disponíveis.
 */
@Service
public class AssistantChatService {

    private enum ProviderMode {
        AUTO,
        ANTHROPIC,
        OPENAI,
        GEMINI
    }

    private final AssistantAnthropicService anthropicService;
    private final AssistantOpenAiService openAiService;
    private final AssistantGeminiService geminiService;
    private final ProviderMode mode;

    public AssistantChatService(
            AssistantAnthropicService anthropicService,
            AssistantOpenAiService openAiService,
            AssistantGeminiService geminiService,
            @Value("${app.assistant.provider:anthropic}") String provider
    ) {
        this.anthropicService = anthropicService;
        this.openAiService = openAiService;
        this.geminiService = geminiService;
        String p = provider != null ? provider.trim().toLowerCase() : "";
        if (p.isEmpty()) {
            p = "anthropic";
        }
        if ("openai".equals(p)) {
            this.mode = ProviderMode.OPENAI;
        } else if ("anthropic".equals(p) || "claude".equals(p)) {
            this.mode = ProviderMode.ANTHROPIC;
        } else if ("gemini".equals(p) || "google".equals(p)) {
            this.mode = ProviderMode.GEMINI;
        } else {
            // "auto" ou valor desconhecido: primeira chave disponível na ordem do resolve()
            this.mode = ProviderMode.AUTO;
        }
    }

    public boolean isEnabled() {
        return resolve() != null;
    }

    /** anthropic | openai | gemini | nenhum */
    public String provedorAtivo() {
        Resolved r = resolve();
        if (r == null) {
            return "nenhum";
        }
        return switch (r) {
            case ANTHROPIC -> "anthropic";
            case OPENAI -> "openai";
            case GEMINI -> "gemini";
        };
    }

    public String chat(AssistantChatRequest request) throws Exception {
        Resolved r = resolve();
        if (r == null) {
            throw new IllegalStateException(mensagemAssistenteIndisponivel());
        }
        return switch (r) {
            case ANTHROPIC -> anthropicService.chat(request);
            case OPENAI -> openAiService.chat(request);
            case GEMINI -> geminiService.chat(request);
        };
    }

    private enum Resolved {
        ANTHROPIC,
        OPENAI,
        GEMINI
    }

    /** Modo auto: Claude → OpenAI → Gemini (primeira chave disponível). */
    private Resolved resolve() {
        return switch (mode) {
            case ANTHROPIC -> anthropicService.isEnabled() ? Resolved.ANTHROPIC : null;
            case OPENAI -> openAiService.isEnabled() ? Resolved.OPENAI : null;
            case GEMINI -> geminiService.isEnabled() ? Resolved.GEMINI : null;
            case AUTO -> {
                if (anthropicService.isEnabled()) {
                    yield Resolved.ANTHROPIC;
                }
                if (openAiService.isEnabled()) {
                    yield Resolved.OPENAI;
                }
                if (geminiService.isEnabled()) {
                    yield Resolved.GEMINI;
                }
                yield null;
            }
        };
    }

    private String mensagemAssistenteIndisponivel() {
        return switch (mode) {
            case ANTHROPIC ->
                    "Assistente Claude: defina ANTHROPIC_API_KEY (ou app.assistant.anthropic-api-key) e reinicie a API.";
            case OPENAI -> "Assistente OpenAI: defina OPENAI_API_KEY e reinicie a API.";
            case GEMINI -> "Assistente Gemini: defina GEMINI_API_KEY e reinicie a API.";
            case AUTO ->
                    "Assistente não configurado: defina ANTHROPIC_API_KEY (Claude) ou outra chave suportada; "
                            + "opcionalmente ASSISTANT_PROVIDER=anthropic|openai|gemini.";
        };
    }
}
