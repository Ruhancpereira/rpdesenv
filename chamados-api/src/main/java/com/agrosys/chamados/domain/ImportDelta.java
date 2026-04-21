package com.agrosys.chamados.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "import_delta", indexes = @Index(name = "idx_import_delta_batch", columnList = "import_batch_id"))
public class ImportDelta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "import_batch_id", nullable = false)
    private ImportBatch importBatch;

    @Column(name = "numero_chamado", nullable = false)
    private Long numeroChamado;

    @Column(name = "chamado_id")
    private Long chamadoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 16)
    private TipoDeltaImport tipo;

    @Column(name = "estado_anterior_json", columnDefinition = "CLOB")
    private String estadoAnteriorJson;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ImportBatch getImportBatch() {
        return importBatch;
    }

    public void setImportBatch(ImportBatch importBatch) {
        this.importBatch = importBatch;
    }

    public Long getNumeroChamado() {
        return numeroChamado;
    }

    public void setNumeroChamado(Long numeroChamado) {
        this.numeroChamado = numeroChamado;
    }

    public Long getChamadoId() {
        return chamadoId;
    }

    public void setChamadoId(Long chamadoId) {
        this.chamadoId = chamadoId;
    }

    public TipoDeltaImport getTipo() {
        return tipo;
    }

    public void setTipo(TipoDeltaImport tipo) {
        this.tipo = tipo;
    }

    public String getEstadoAnteriorJson() {
        return estadoAnteriorJson;
    }

    public void setEstadoAnteriorJson(String estadoAnteriorJson) {
        this.estadoAnteriorJson = estadoAnteriorJson;
    }
}
