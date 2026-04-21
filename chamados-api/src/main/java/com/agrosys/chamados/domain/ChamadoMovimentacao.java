package com.agrosys.chamados.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "chamado_movimentacao",
        indexes = {
                @Index(name = "idx_mov_chamado", columnList = "chamado_id"),
                @Index(name = "idx_mov_batch", columnList = "import_batch_id")
        }
)
public class ChamadoMovimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "chamado_id", nullable = false)
    private Chamado chamado;

    /** Nome lógico da coluna (ex.: sta_ativ, data_abre). */
    @Column(name = "campo", nullable = false, length = 64)
    private String campo;

    @Column(name = "valor_anterior", length = 2048)
    private String valorAnterior;

    @Column(name = "valor_novo", length = 2048)
    private String valorNovo;

    @Column(name = "registrado_em", nullable = false)
    private Instant registradoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_batch_id")
    private ImportBatch importBatch;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Chamado getChamado() {
        return chamado;
    }

    public void setChamado(Chamado chamado) {
        this.chamado = chamado;
    }

    public String getCampo() {
        return campo;
    }

    public void setCampo(String campo) {
        this.campo = campo;
    }

    public String getValorAnterior() {
        return valorAnterior;
    }

    public void setValorAnterior(String valorAnterior) {
        this.valorAnterior = valorAnterior;
    }

    public String getValorNovo() {
        return valorNovo;
    }

    public void setValorNovo(String valorNovo) {
        this.valorNovo = valorNovo;
    }

    public Instant getRegistradoEm() {
        return registradoEm;
    }

    public void setRegistradoEm(Instant registradoEm) {
        this.registradoEm = registradoEm;
    }

    public ImportBatch getImportBatch() {
        return importBatch;
    }

    public void setImportBatch(ImportBatch importBatch) {
        this.importBatch = importBatch;
    }
}
