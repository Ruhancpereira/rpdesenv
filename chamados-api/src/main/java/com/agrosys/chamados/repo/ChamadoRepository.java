package com.agrosys.chamados.repo;

import com.agrosys.chamados.domain.Chamado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChamadoRepository extends JpaRepository<Chamado, Long>, JpaSpecificationExecutor<Chamado> {

    Optional<Chamado> findByNumeroChamado(Long numeroChamado);

    @Query("select distinct c.tipo from Chamado c where c.tipo is not null order by c.tipo")
    List<String> distinctTipo();

    @Query("select distinct c.cliente from Chamado c where c.cliente is not null order by c.cliente")
    List<String> distinctCliente();

    @Query("select distinct c.consultor from Chamado c where c.consultor is not null order by c.consultor")
    List<String> distinctConsultor();

    @Query("select distinct c.gerente from Chamado c where c.gerente is not null order by c.gerente")
    List<String> distinctGerente();

    @Query("select distinct c.areaIni from Chamado c where c.areaIni is not null order by c.areaIni")
    List<String> distinctAreaIni();

    @Query("select distinct c.areaAtend from Chamado c where c.areaAtend is not null order by c.areaAtend")
    List<String> distinctAreaAtend();

    @Query("select distinct c.tipoCha from Chamado c where c.tipoCha is not null order by c.tipoCha")
    List<String> distinctTipoCha();

    @Query("select distinct c.bancadaAtend from Chamado c where c.bancadaAtend is not null order by c.bancadaAtend")
    List<String> distinctBancadaAtend();

    @Query("select distinct c.userSuporte from Chamado c where c.userSuporte is not null order by c.userSuporte")
    List<String> distinctUserSuporte();

    @Query("select distinct c.staAtiv from Chamado c where c.staAtiv is not null order by c.staAtiv")
    List<String> distinctStaAtiv();

    @Query("select distinct c.categoria from Chamado c where c.categoria is not null order by c.categoria")
    List<String> distinctCategoria();

    @Query("select distinct c.tipoProb from Chamado c where c.tipoProb is not null order by c.tipoProb")
    List<String> distinctTipoProb();

    @Query("select distinct c.grupo from Chamado c where c.grupo is not null order by c.grupo")
    List<String> distinctGrupo();

    @Query("select distinct c.areaMae from Chamado c where c.areaMae is not null order by c.areaMae")
    List<String> distinctAreaMae();

    @Query("select distinct c.motivoIns from Chamado c where c.motivoIns is not null order by c.motivoIns")
    List<String> distinctMotivoIns();

    @Query("select distinct c.prioridade from Chamado c where c.prioridade is not null order by c.prioridade")
    List<Double> distinctPrioridade();

    @Query("select distinct c.tipoPrior from Chamado c where c.tipoPrior is not null order by c.tipoPrior")
    List<Double> distinctTipoPrior();

    @Query("select distinct c.nivelAtend from Chamado c where c.nivelAtend is not null order by c.nivelAtend")
    List<Double> distinctNivelAtend();
}
