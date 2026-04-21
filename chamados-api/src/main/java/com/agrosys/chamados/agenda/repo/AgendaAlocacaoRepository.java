package com.agrosys.chamados.agenda.repo;

import com.agrosys.chamados.agenda.domain.AgendaAlocacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AgendaAlocacaoRepository extends JpaRepository<AgendaAlocacao, Long> {

    long count();

    @Query("select coalesce(sum(a.horas), 0.0) from AgendaAlocacao a")
    Double sumHorasTotal();

    @Query("select a.recurso, coalesce(sum(a.horas), 0.0), count(a) from AgendaAlocacao a where a.recurso is not null and trim(a.recurso) <> '' group by a.recurso order by coalesce(sum(a.horas), 0.0) desc")
    List<Object[]> agregadoPorRecurso();

    @Query("select a.cliente, coalesce(sum(a.horas), 0.0), count(a) from AgendaAlocacao a where a.cliente is not null and trim(a.cliente) <> '' group by a.cliente order by coalesce(sum(a.horas), 0.0) desc")
    List<Object[]> agregadoPorCliente();

    @Query("select a.status, count(a), coalesce(sum(a.horas), 0.0) from AgendaAlocacao a where a.status is not null group by a.status order by count(a) desc")
    List<Object[]> agregadoPorStatus();

    @Query("select a.alocadoPor, coalesce(sum(a.horas), 0.0), count(a) from AgendaAlocacao a where a.alocadoPor is not null and trim(a.alocadoPor) <> '' group by a.alocadoPor order by coalesce(sum(a.horas), 0.0) desc")
    List<Object[]> agregadoPorAlocadoPor();

    @Query("select distinct trim(a.recurso) from AgendaAlocacao a where a.recurso is not null and trim(a.recurso) <> '' order by trim(a.recurso)")
    List<String> distinctRecurso();

    @Query("select distinct trim(a.cliente) from AgendaAlocacao a where a.cliente is not null and trim(a.cliente) <> '' order by trim(a.cliente)")
    List<String> distinctCliente();

    @Query("select distinct trim(a.status) from AgendaAlocacao a where a.status is not null and trim(a.status) <> '' order by trim(a.status)")
    List<String> distinctStatus();

    @Query("select distinct trim(a.localAgenda) from AgendaAlocacao a where a.localAgenda is not null and trim(a.localAgenda) <> '' order by trim(a.localAgenda)")
    List<String> distinctLocalAgenda();

    @Query("select distinct trim(a.alocadoPor) from AgendaAlocacao a where a.alocadoPor is not null and trim(a.alocadoPor) <> '' order by trim(a.alocadoPor)")
    List<String> distinctAlocadoPor();
}
