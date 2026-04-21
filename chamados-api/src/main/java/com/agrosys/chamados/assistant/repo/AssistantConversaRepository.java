package com.agrosys.chamados.assistant.repo;

import com.agrosys.chamados.assistant.domain.AssistantConversa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssistantConversaRepository extends JpaRepository<AssistantConversa, Long> {

    List<AssistantConversa> findByUtilizadorOrderByAtualizadoEmDesc(String utilizador);

    Optional<AssistantConversa> findByIdAndUtilizador(Long id, String utilizador);
}
