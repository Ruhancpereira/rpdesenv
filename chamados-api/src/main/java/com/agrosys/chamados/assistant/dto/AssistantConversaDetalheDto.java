package com.agrosys.chamados.assistant.dto;

import java.util.List;

public record AssistantConversaDetalheDto(long id, String titulo, List<AssistantMessageDto> mensagens) {}
