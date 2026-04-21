package com.agrosys.chamados.assistant;

import com.agrosys.chamados.assistant.dto.AssistantChatRequest;
import com.agrosys.chamados.assistant.dto.AssistantChatResponse;
import com.agrosys.chamados.assistant.dto.AssistantConversaDetalheDto;
import com.agrosys.chamados.assistant.dto.AssistantConversaResumoDto;
import com.agrosys.chamados.assistant.service.AssistantHistoricoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final AssistantChatService assistantChatService;
    private final AssistantHistoricoService assistantHistoricoService;

    public AssistantController(
            AssistantChatService assistantChatService, AssistantHistoricoService assistantHistoricoService) {
        this.assistantChatService = assistantChatService;
        this.assistantHistoricoService = assistantHistoricoService;
    }

    /** disponivel + provedor: anthropic | openai | gemini | nenhum */
    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "disponivel", assistantChatService.isEnabled(),
                "provedor", assistantChatService.provedorAtivo()
        );
    }

    /** Histórico de conversas do utilizador autenticado (mais recentes primeiro). */
    @GetMapping("/conversas")
    public List<AssistantConversaResumoDto> listarConversas(Authentication auth) {
        return assistantHistoricoService.listar(auth.getName());
    }

    /** Mensagens guardadas de uma conversa. */
    @GetMapping("/conversas/{id}")
    public ResponseEntity<?> obterConversa(@PathVariable long id, Authentication auth) {
        try {
            return ResponseEntity.ok(assistantHistoricoService.obter(id, auth.getName()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/conversas/{id}")
    public ResponseEntity<Void> apagarConversa(@PathVariable long id, Authentication auth) {
        try {
            assistantHistoricoService.apagar(id, auth.getName());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody AssistantChatRequest body, Authentication auth) {
        if (body.messages() == null || body.messages().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Envia pelo menos uma mensagem."));
        }
        try {
            String msg = assistantChatService.chat(body);
            long conversaId =
                    assistantHistoricoService.persistirAposResposta(
                            auth.getName(), body.conversaId(), body.messages(), msg);
            return ResponseEntity.ok(new AssistantChatResponse(msg, conversaId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(503).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && e.getMessage().contains("não encontrada")) {
                return ResponseEntity.status(404).body(Map.of("erro", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(502)
                    .body(Map.of("erro", "Falha ao contactar o modelo: " + e.getMessage()));
        }
    }
}
