package com.agrosys.chamados.assistant.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "assistant_conversa",
        indexes = {
                @Index(name = "idx_assistant_conv_user", columnList = "utilizador"),
                @Index(name = "idx_assistant_conv_atualizado", columnList = "atualizado_em")
        })
public class AssistantConversa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String utilizador;

    @Column(length = 200)
    private String titulo;

    @Column(name = "historico_json", nullable = false, columnDefinition = "CLOB")
    private String historicoJson;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUtilizador() {
        return utilizador;
    }

    public void setUtilizador(String utilizador) {
        this.utilizador = utilizador;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getHistoricoJson() {
        return historicoJson;
    }

    public void setHistoricoJson(String historicoJson) {
        this.historicoJson = historicoJson;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
