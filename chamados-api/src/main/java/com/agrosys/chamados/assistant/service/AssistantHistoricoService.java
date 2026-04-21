package com.agrosys.chamados.assistant.service;

import com.agrosys.chamados.assistant.domain.AssistantConversa;
import com.agrosys.chamados.assistant.dto.AssistantConversaDetalheDto;
import com.agrosys.chamados.assistant.dto.AssistantConversaResumoDto;
import com.agrosys.chamados.assistant.dto.AssistantMessageDto;
import com.agrosys.chamados.assistant.repo.AssistantConversaRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class AssistantHistoricoService {

    private static final int TITULO_MAX = 120;

    private final AssistantConversaRepository repository;
    private final ObjectMapper objectMapper;

    public AssistantHistoricoService(AssistantConversaRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<AssistantConversaResumoDto> listar(String utilizador) {
        return repository.findByUtilizadorOrderByAtualizadoEmDesc(utilizador).stream()
                .map(c -> new AssistantConversaResumoDto(
                        c.getId(),
                        c.getTitulo() != null ? c.getTitulo() : "Conversa",
                        c.getAtualizadoEm()))
                .toList();
    }

    @Transactional(readOnly = true)
    public AssistantConversaDetalheDto obter(long id, String utilizador) {
        AssistantConversa c =
                repository.findByIdAndUtilizador(id, utilizador).orElseThrow(() -> notFound());
        List<AssistantMessageDto> msgs = deserializar(c.getHistoricoJson());
        return new AssistantConversaDetalheDto(c.getId(), c.getTitulo() != null ? c.getTitulo() : "Conversa", msgs);
    }

    @Transactional
    public long persistirAposResposta(
            String utilizador, Long conversaId, List<AssistantMessageDto> mensagensCompletas, String respostaAssistente) {
        List<AssistantMessageDto> copia = new ArrayList<>(mensagensCompletas);
        copia.add(new AssistantMessageDto("assistant", respostaAssistente));
        String json;
        try {
            json = objectMapper.writeValueAsString(copia);
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao serializar histórico do assistente.");
        }
        Instant agora = Instant.now();
        if (conversaId == null) {
            AssistantConversa c = new AssistantConversa();
            c.setUtilizador(utilizador);
            c.setTitulo(tituloDe(copia));
            c.setHistoricoJson(json);
            c.setCriadoEm(agora);
            c.setAtualizadoEm(agora);
            return repository.save(c).getId();
        }
        AssistantConversa c =
                repository.findByIdAndUtilizador(conversaId, utilizador).orElseThrow(() -> notFound());
        c.setHistoricoJson(json);
        c.setAtualizadoEm(agora);
        if (c.getTitulo() == null || c.getTitulo().isBlank()) {
            c.setTitulo(tituloDe(copia));
        }
        repository.save(c);
        return c.getId();
    }

    @Transactional
    public void apagar(long id, String utilizador) {
        AssistantConversa c = repository.findByIdAndUtilizador(id, utilizador).orElseThrow(() -> notFound());
        repository.delete(c);
    }

    private List<AssistantMessageDto> deserializar(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private static String tituloDe(List<AssistantMessageDto> msgs) {
        for (AssistantMessageDto m : msgs) {
            if (m == null || m.role() == null || m.content() == null) {
                continue;
            }
            if ("user".equalsIgnoreCase(m.role().trim())) {
                String t = m.content().trim().replaceAll("\\s+", " ");
                if (t.isEmpty()) {
                    continue;
                }
                return t.length() > TITULO_MAX ? t.substring(0, TITULO_MAX) + "…" : t;
            }
        }
        return "Conversa";
    }

    private static IllegalArgumentException notFound() {
        return new IllegalArgumentException("Conversa não encontrada.");
    }
}
