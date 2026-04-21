package com.agrosys.chamados.agenda.service;

import com.agrosys.chamados.agenda.domain.AgendaAlocacao;
import com.agrosys.chamados.agenda.repo.AgendaAlocacaoRepository;
import com.agrosys.chamados.util.FieldParsers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AgendaImportService {

    private final AgendaAlocacaoRepository agendaAlocacaoRepository;

    public AgendaImportService(AgendaAlocacaoRepository agendaAlocacaoRepository) {
        this.agendaAlocacaoRepository = agendaAlocacaoRepository;
    }

    @Transactional
    public AgendaImportResult importarPlanilha(List<Map<String, String>> rows) {
        Instant agora = FieldParsers.now();
        agendaAlocacaoRepository.deleteAllInBatch();

        int lidas = 0;
        List<AgendaAlocacao> buffer = new ArrayList<>();
        for (Map<String, String> row : rows) {
            if (isLinhaVazia(row)) {
                continue;
            }
            lidas++;
            AgendaAlocacao a = new AgendaAlocacao();
            a.setRecurso(trimToNull(str(row, "recurso")));
            a.setCliente(trimToNull(str(row, "cliente")));
            a.setLocalAgenda(trimToNull(str(row, "local")));
            a.setSedeAgrosys(trimToNull(str(row, "sedeagrosys")));
            a.setStatus(trimToNull(str(row, "status")));
            a.setPassagem(trimToNull(str(row, "passagem")));
            a.setAprovador(trimToNull(str(row, "aprovador")));
            LocalDate di = FieldParsers.parseDate(str(row, "datainicio"));
            LocalDate df = FieldParsers.parseDate(str(row, "datafinal"));
            if (df == null && di != null) {
                df = di;
            }
            a.setDataInicio(di);
            a.setDataFinal(df);
            a.setAtividade(trimToNull(str(row, "atividade")));
            a.setHoras(FieldParsers.parseDouble(str(row, "horas")));
            a.setAlocadoPor(trimToNull(str(row, "alocadopor")));
            a.setImportadoEm(agora);
            buffer.add(a);
            if (buffer.size() >= 200) {
                agendaAlocacaoRepository.saveAll(buffer);
                buffer.clear();
            }
        }
        if (!buffer.isEmpty()) {
            agendaAlocacaoRepository.saveAll(buffer);
        }

        return new AgendaImportResult(lidas, agendaAlocacaoRepository.count());
    }

    private static boolean isLinhaVazia(Map<String, String> row) {
        return row.values().stream().allMatch(v -> v == null || v.isBlank());
    }

    private static String str(Map<String, String> row, String key) {
        String v = row.get(key);
        if (v == null) {
            return "";
        }
        return v;
    }

    private static String trimToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    public record AgendaImportResult(int linhasValidas, long totalGravado) {
    }
}
