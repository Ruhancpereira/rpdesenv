package com.agrosys.chamados.assistant.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AssistantChatResponse(String message, Long conversaId) {
    public AssistantChatResponse(String message) {
        this(message, null);
    }
}
