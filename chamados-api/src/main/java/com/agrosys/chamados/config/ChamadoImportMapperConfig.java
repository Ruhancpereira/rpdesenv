package com.agrosys.chamados.config;

import com.agrosys.chamados.domain.Chamado;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

/**
 * Mapper usado só para snapshot/clone de {@link Chamado} na importação e rollback.
 * Ignora {@code historicoMovCount} (@Formula), que não deve ir para o JSON e pode causar
 * falha ao serializar entidade gerenciada pelo Hibernate.
 */
@Configuration
public class ChamadoImportMapperConfig {

    @Bean
    @Qualifier("chamadoImportMapper")
    public ObjectMapper chamadoImportMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper om = builder.build();
        om.addMixIn(Chamado.class, ChamadoImportSnapshotMixIn.class);
        return om;
    }

    @JsonIgnoreProperties({ "historicoMovCount" })
    interface ChamadoImportSnapshotMixIn {
    }
}
