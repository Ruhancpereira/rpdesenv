package com.agrosys.chamados.assistant.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AssistantChatRequest(Long conversaId, List<AssistantMessageDto> messages) {
}
