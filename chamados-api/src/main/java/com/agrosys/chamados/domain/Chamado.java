package com.agrosys.chamados.domain;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.Formula;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "chamados",
        indexes = {
                @Index(name = "idx_chamados_sta", columnList = "sta_ativ"),
                @Index(name = "idx_chamados_area", columnList = "area_atend"),
                @Index(name = "idx_chamados_consultor", columnList = "consultor")
        },
        uniqueConstraints = @UniqueConstraint(name = "uk_chamados_numero", columnNames = "numero_chamado")
)
@JsonAutoDetect(
        fieldVisibility = JsonAutoDetect.Visibility.ANY,
        getterVisibility = JsonAutoDetect.Visibility.NONE,
        isGetterVisibility = JsonAutoDetect.Visibility.NONE
)
@JsonIgnoreProperties(ignoreUnknown = true)
@Access(AccessType.FIELD)
public class Chamado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_chamado", nullable = false, unique = true)
    private Long numeroChamado;

    private String tipo;
    private String cliente;
    private String logomarca;

    @Column(name = "num_ret")
    private Double numRet;

    private String consultor;
    private String gerente;
    private String areaIni;
    private String areaAtend;
    private String tipoCha;
    private String bancadaAtend;

    private LocalDate dataAbre;

    private Double hrsOrc;
    private Double hrsEfe;
    private Double cobAprov;
    private Double dias;

    private String userSuporte;
    private String staAtiv;
    private String nota;
    private String categoria;
    private String tipoProb;

    private LocalDate dataEncAgro;
    private LocalDate dataEncCli;

    private String mes;
    private String ano;

    @Column(name = "mes_num")
    private Double mesNum;

    private LocalDate dataEncAtiv;
    private String chaInt;
    private String grupo;
    private String userCliente;
    private String titulo;

    private LocalDate dataSla;

    private Double prioridade;
    private Double tipoPrior;
    private Double vlrPrior;

    private LocalDate dataUltRet;
    private String areaMae;

    @Column(name = "nivel_atend")
    private Double nivelAtend;

    private Double qttransf;
    private Double hrsreal;
    private String motivoIns;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    /**
     * Contagem de movimentações. Campo ignorado no JSON; o valor exposto é o getter {@link #getHistoricoMovCount()}
     * (número sempre presente), pois o campo bruto pode ser omitido pelo Jackson com {@code NON_NULL}.
     */
    @JsonIgnore
    @Formula("(select coalesce(count(m.id), 0) from chamado_movimentacao m where m.chamado_id = id)")
    @Column(insertable = false, updatable = false)
    private Long historicoMovCount;

    @JsonProperty("historicoMovCount")
    public long getHistoricoMovCount() {
        return historicoMovCount == null ? 0L : historicoMovCount;
    }

    public Long getId() {
        return id;
    }

    public Long getNumeroChamado() {
        return numeroChamado;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNumeroChamado(Long numeroChamado) {
        this.numeroChamado = numeroChamado;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public void setLogomarca(String logomarca) {
        this.logomarca = logomarca;
    }

    public void setNumRet(Double numRet) {
        this.numRet = numRet;
    }

    public void setConsultor(String consultor) {
        this.consultor = consultor;
    }

    public void setGerente(String gerente) {
        this.gerente = gerente;
    }

    public void setAreaIni(String areaIni) {
        this.areaIni = areaIni;
    }

    public void setAreaAtend(String areaAtend) {
        this.areaAtend = areaAtend;
    }

    public void setTipoCha(String tipoCha) {
        this.tipoCha = tipoCha;
    }

    public void setBancadaAtend(String bancadaAtend) {
        this.bancadaAtend = bancadaAtend;
    }

    public void setDataAbre(LocalDate dataAbre) {
        this.dataAbre = dataAbre;
    }

    public void setHrsOrc(Double hrsOrc) {
        this.hrsOrc = hrsOrc;
    }

    public void setHrsEfe(Double hrsEfe) {
        this.hrsEfe = hrsEfe;
    }

    public void setCobAprov(Double cobAprov) {
        this.cobAprov = cobAprov;
    }

    public void setDias(Double dias) {
        this.dias = dias;
    }

    public void setUserSuporte(String userSuporte) {
        this.userSuporte = userSuporte;
    }

    public void setStaAtiv(String staAtiv) {
        this.staAtiv = staAtiv;
    }

    public void setNota(String nota) {
        this.nota = nota;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public void setTipoProb(String tipoProb) {
        this.tipoProb = tipoProb;
    }

    public void setDataEncAgro(LocalDate dataEncAgro) {
        this.dataEncAgro = dataEncAgro;
    }

    public void setDataEncCli(LocalDate dataEncCli) {
        this.dataEncCli = dataEncCli;
    }

    public void setMes(String mes) {
        this.mes = mes;
    }

    public void setAno(String ano) {
        this.ano = ano;
    }

    public void setMesNum(Double mesNum) {
        this.mesNum = mesNum;
    }

    public void setDataEncAtiv(LocalDate dataEncAtiv) {
        this.dataEncAtiv = dataEncAtiv;
    }

    public void setChaInt(String chaInt) {
        this.chaInt = chaInt;
    }

    public void setGrupo(String grupo) {
        this.grupo = grupo;
    }

    public void setUserCliente(String userCliente) {
        this.userCliente = userCliente;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setDataSla(LocalDate dataSla) {
        this.dataSla = dataSla;
    }

    public void setPrioridade(Double prioridade) {
        this.prioridade = prioridade;
    }

    public void setTipoPrior(Double tipoPrior) {
        this.tipoPrior = tipoPrior;
    }

    public void setVlrPrior(Double vlrPrior) {
        this.vlrPrior = vlrPrior;
    }

    public void setDataUltRet(LocalDate dataUltRet) {
        this.dataUltRet = dataUltRet;
    }

    public void setAreaMae(String areaMae) {
        this.areaMae = areaMae;
    }

    public void setNivelAtend(Double nivelAtend) {
        this.nivelAtend = nivelAtend;
    }

    public void setQttransf(Double qttransf) {
        this.qttransf = qttransf;
    }

    public void setHrsreal(Double hrsreal) {
        this.hrsreal = hrsreal;
    }

    public void setMotivoIns(String motivoIns) {
        this.motivoIns = motivoIns;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
