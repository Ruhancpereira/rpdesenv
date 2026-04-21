package com.agrosys.chamados.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@TestPropertySource(
        properties = {
                "spring.datasource.url=jdbc:h2:mem:importit;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
                "spring.jpa.hibernate.ddl-auto=create-drop",
        }
)
class ChamadoImportServiceIT {

    @Autowired
    private ChamadoImportService chamadoImportService;

    @Test
    void importNovoChamado() {
        var rows = List.of(
                Map.of("chamado", "999001", "tipo", "T", "cliente", "ACME")
        );
        ChamadoImportService.ImportResult r = chamadoImportService.upsertAll(rows, "teste.csv");
        assertEquals(1, r.linhasLidas());
        assertEquals(1, r.inseridos());
        assertEquals(0, r.atualizados());
        assertTrue(r.importBatchId() > 0);
    }

    @Test
    void importAtualizaChamadoExistente() {
        var ins = List.of(Map.of("chamado", "999002", "sta_ativ", "Aberto"));
        chamadoImportService.upsertAll(ins, "a.csv");
        var upd = List.of(Map.of("chamado", "999002", "sta_ativ", "Fechado"));
        ChamadoImportService.ImportResult r = chamadoImportService.upsertAll(upd, "b.csv");
        assertEquals(1, r.linhasLidas());
        assertEquals(0, r.inseridos());
        assertEquals(1, r.atualizados());
    }
}
