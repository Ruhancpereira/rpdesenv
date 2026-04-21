package com.agrosys.chamados.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "import_batch")
public class ImportBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_arquivo", nullable = false, length = 512)
    private String nomeArquivo;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @Column(name = "linhas_lidas", nullable = false)
    private int linhasLidas;

    @Column(name = "inseridos", nullable = false)
    private int inseridos;

    @Column(name = "atualizados", nullable = false)
    private int atualizados;

    @Column(name = "revertido", nullable = false)
    private boolean revertido;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public int getLinhasLidas() {
        return linhasLidas;
    }

    public void setLinhasLidas(int linhasLidas) {
        this.linhasLidas = linhasLidas;
    }

    public int getInseridos() {
        return inseridos;
    }

    public void setInseridos(int inseridos) {
        this.inseridos = inseridos;
    }

    public int getAtualizados() {
        return atualizados;
    }

    public void setAtualizados(int atualizados) {
        this.atualizados = atualizados;
    }

    public boolean isRevertido() {
        return revertido;
    }

    public void setRevertido(boolean revertido) {
        this.revertido = revertido;
    }
}
