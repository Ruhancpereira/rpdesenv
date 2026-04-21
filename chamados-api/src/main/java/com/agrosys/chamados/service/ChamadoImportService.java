package com.agrosys.chamados.service;

import com.agrosys.chamados.domain.*;
import com.agrosys.chamados.repo.ChamadoMovimentacaoRepository;
import com.agrosys.chamados.repo.ChamadoRepository;
import com.agrosys.chamados.repo.ImportBatchRepository;
import com.agrosys.chamados.repo.ImportDeltaRepository;
import com.agrosys.chamados.util.ChamadoDiff;
import com.agrosys.chamados.util.FieldParsers;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class ChamadoImportService {

    private static final String CAMPO_REGISTRO = "_registro";

    private final ChamadoRepository chamadoRepository;
    private final ImportBatchRepository importBatchRepository;
    private final ImportDeltaRepository importDeltaRepository;
    private final ChamadoMovimentacaoRepository chamadoMovimentacaoRepository;
    private final ObjectMapper chamadoImportMapper;

    public ChamadoImportService(
            ChamadoRepository chamadoRepository,
            ImportBatchRepository importBatchRepository,
            ImportDeltaRepository importDeltaRepository,
            ChamadoMovimentacaoRepository chamadoMovimentacaoRepository,
            @Qualifier("chamadoImportMapper") ObjectMapper chamadoImportMapper
    ) {
        this.chamadoRepository = chamadoRepository;
        this.importBatchRepository = importBatchRepository;
        this.importDeltaRepository = importDeltaRepository;
        this.chamadoMovimentacaoRepository = chamadoMovimentacaoRepository;
        this.chamadoImportMapper = chamadoImportMapper;
    }

    @Transactional
    public ImportResult upsertAll(List<Map<String, String>> rows, String nomeArquivo) {
        Instant now = FieldParsers.now();
        ImportBatch batch = new ImportBatch();
        batch.setNomeArquivo(nomeArquivo != null ? nomeArquivo : "");
        batch.setCriadoEm(now);
        batch.setRevertido(false);
        batch.setLinhasLidas(0);
        batch.setInseridos(0);
        batch.setAtualizados(0);
        importBatchRepository.save(batch);

        int inserted = 0;
        int updated = 0;
        int lidas = 0;

        for (Map<String, String> row : rows) {
            Long numero = FieldParsers.parseLong(first(row, "chamado"));
            if (numero == null) {
                continue;
            }
            lidas++;
            Chamado c = chamadoRepository.findByNumeroChamado(numero).orElse(null);
            boolean isNew = c == null;
            Chamado antes = null;
            if (!isNew) {
                antes = cloneChamado(c);
            }
            if (c == null) {
                c = new Chamado();
                c.setNumeroChamado(numero);
                c.setCreatedAt(now);
            }
            applyRow(c, row);
            c.setUpdatedAt(now);
            chamadoRepository.save(c);

            if (isNew) {
                inserted++;
                ImportDelta delta = new ImportDelta();
                delta.setImportBatch(batch);
                delta.setNumeroChamado(numero);
                delta.setChamadoId(c.getId());
                delta.setTipo(TipoDeltaImport.INSERT);
                delta.setEstadoAnteriorJson(null);
                importDeltaRepository.save(delta);
                registrarCriacao(c, batch, now);
            } else {
                updated++;
                String jsonAntes;
                try {
                    jsonAntes = chamadoImportMapper.writeValueAsString(antes);
                } catch (JsonProcessingException e) {
                    throw new IllegalStateException("Falha ao serializar estado anterior do chamado", e);
                }
                ImportDelta delta = new ImportDelta();
                delta.setImportBatch(batch);
                delta.setNumeroChamado(numero);
                delta.setChamadoId(c.getId());
                delta.setTipo(TipoDeltaImport.UPDATE);
                delta.setEstadoAnteriorJson(jsonAntes);
                importDeltaRepository.save(delta);
                registrarAlteracoes(antes, c, batch, now);
            }
        }

        batch.setLinhasLidas(lidas);
        batch.setInseridos(inserted);
        batch.setAtualizados(updated);
        importBatchRepository.save(batch);

        return new ImportResult(lidas, inserted, updated, batch.getId());
    }

    private Chamado cloneChamado(Chamado c) {
        try {
            return chamadoImportMapper.readValue(chamadoImportMapper.writeValueAsString(c), Chamado.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Falha ao clonar chamado", e);
        }
    }

    private void registrarCriacao(Chamado c, ImportBatch batch, Instant now) {
        ChamadoMovimentacao m = new ChamadoMovimentacao();
        m.setChamado(c);
        m.setCampo(CAMPO_REGISTRO);
        m.setValorAnterior(null);
        m.setValorNovo("Registro criado nesta importação");
        m.setRegistradoEm(now);
        m.setImportBatch(batch);
        chamadoMovimentacaoRepository.save(m);
    }

    private void registrarAlteracoes(Chamado antes, Chamado depois, ImportBatch batch, Instant now) {
        for (ChamadoDiff.CampoAlterado ch : ChamadoDiff.diff(antes, depois)) {
            ChamadoMovimentacao m = new ChamadoMovimentacao();
            m.setChamado(depois);
            m.setCampo(ch.campoSnake());
            m.setValorAnterior(ch.de().isEmpty() ? null : ch.de());
            m.setValorNovo(ch.para().isEmpty() ? null : ch.para());
            m.setRegistradoEm(now);
            m.setImportBatch(batch);
            chamadoMovimentacaoRepository.save(m);
        }
    }

    private void applyRow(Chamado c, Map<String, String> row) {
        c.setTipo(str(row, "tipo"));
        c.setCliente(str(row, "cliente"));
        c.setLogomarca(str(row, "logomarca"));
        c.setNumRet(FieldParsers.parseDouble(first(row, "num_ret")));
        c.setConsultor(str(row, "consultor"));
        c.setGerente(str(row, "gerente"));
        c.setAreaIni(str(row, "area_ini"));
        c.setAreaAtend(str(row, "area_atend"));
        c.setTipoCha(str(row, "tipo_cha"));
        c.setBancadaAtend(str(row, "bancada_atend"));
        c.setDataAbre(FieldParsers.parseDate(first(row, "data_abre")));
        c.setHrsOrc(FieldParsers.parseDouble(first(row, "hrs_orc")));
        c.setHrsEfe(FieldParsers.parseDouble(first(row, "hrs_efe")));
        c.setCobAprov(FieldParsers.parseDouble(first(row, "cob_aprov")));
        c.setDias(FieldParsers.parseDouble(first(row, "dias")));
        c.setUserSuporte(str(row, "user_suporte"));
        c.setStaAtiv(str(row, "sta_ativ"));
        c.setNota(str(row, "nota"));
        c.setCategoria(str(row, "categoria"));
        c.setTipoProb(str(row, "tipo_prob"));
        c.setDataEncAgro(FieldParsers.parseDate(first(row, "data_enc_agro")));
        c.setDataEncCli(FieldParsers.parseDate(first(row, "data_enc_cli")));
        c.setMes(str(row, "mes"));
        c.setAno(str(row, "ano"));
        c.setMesNum(FieldParsers.parseDouble(first(row, "mes_num")));
        c.setDataEncAtiv(FieldParsers.parseDate(first(row, "data_enc_ativ")));
        c.setChaInt(str(row, "cha_int"));
        c.setGrupo(str(row, "grupo"));
        c.setUserCliente(str(row, "user_cliente"));
        c.setTitulo(str(row, "titulo"));
        c.setDataSla(FieldParsers.parseDate(first(row, "data_sla")));
        c.setPrioridade(FieldParsers.parseDouble(first(row, "prioridade")));
        c.setTipoPrior(FieldParsers.parseDouble(first(row, "tipo_prior")));
        c.setVlrPrior(FieldParsers.parseDouble(first(row, "vlr_prior")));
        c.setDataUltRet(FieldParsers.parseDate(first(row, "data_ult_ret")));
        c.setAreaMae(str(row, "area_mae"));
        c.setNivelAtend(FieldParsers.parseDouble(first(row, "nivel_atend")));
        c.setQttransf(FieldParsers.parseDouble(first(row, "qttransf")));
        c.setHrsreal(FieldParsers.parseDouble(first(row, "hrsreal")));
        c.setMotivoIns(str(row, "motivo_ins"));
    }

    private static String str(Map<String, String> row, String key) {
        String v = first(row, key);
        if (v == null || v.isBlank()) {
            return null;
        }
        return v.trim();
    }

    private static String first(Map<String, String> row, String key) {
        return row.getOrDefault(key, "");
    }

    public record ImportResult(int linhasLidas, int inseridos, int atualizados, long importBatchId) {
    }
}
