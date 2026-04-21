package com.agrosys.chamados.agenda.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "agenda_alocacao",
        indexes = {
                @Index(name = "idx_agenda_recurso", columnList = "recurso"),
                @Index(name = "idx_agenda_cliente", columnList = "cliente"),
                @Index(name = "idx_agenda_status", columnList = "status"),
                @Index(name = "idx_agenda_inicio", columnList = "data_inicio")
        }
)
public class AgendaAlocacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 512)
    private String recurso;

    @Column(length = 512)
    private String cliente;

    @Column(name = "local_agenda", length = 512)
    private String localAgenda;

    @Column(name = "sede_agrosys", length = 32)
    private String sedeAgrosys;

    @Column(length = 64)
    private String status;

    @Column(length = 32)
    private String passagem;

    @Column(length = 512)
    private String aprovador;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_final")
    private LocalDate dataFinal;

    @Column(columnDefinition = "CLOB")
    private String atividade;

    private Double horas;

    @Column(name = "alocado_por", length = 256)
    private String alocadoPor;

    @Column(name = "importado_em", nullable = false)
    private Instant importadoEm = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecurso() {
        return recurso;
    }

    public void setRecurso(String recurso) {
        this.recurso = recurso;
    }

    public String getCliente() {
        return cliente;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public String getLocalAgenda() {
        return localAgenda;
    }

    public void setLocalAgenda(String localAgenda) {
        this.localAgenda = localAgenda;
    }

    public String getSedeAgrosys() {
        return sedeAgrosys;
    }

    public void setSedeAgrosys(String sedeAgrosys) {
        this.sedeAgrosys = sedeAgrosys;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPassagem() {
        return passagem;
    }

    public void setPassagem(String passagem) {
        this.passagem = passagem;
    }

    public String getAprovador() {
        return aprovador;
    }

    public void setAprovador(String aprovador) {
        this.aprovador = aprovador;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFinal() {
        return dataFinal;
    }

    public void setDataFinal(LocalDate dataFinal) {
        this.dataFinal = dataFinal;
    }

    public String getAtividade() {
        return atividade;
    }

    public void setAtividade(String atividade) {
        this.atividade = atividade;
    }

    public Double getHoras() {
        return horas;
    }

    public void setHoras(Double horas) {
        this.horas = horas;
    }

    public String getAlocadoPor() {
        return alocadoPor;
    }

    public void setAlocadoPor(String alocadoPor) {
        this.alocadoPor = alocadoPor;
    }

    public Instant getImportadoEm() {
        return importadoEm;
    }

    public void setImportadoEm(Instant importadoEm) {
        this.importadoEm = importadoEm;
    }
}
