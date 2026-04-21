package com.agrosys.chamados.agenda.service;

import com.agrosys.chamados.agenda.domain.AgendaAlocacao;
import com.agrosys.chamados.agenda.repo.AgendaAlocacaoRepository;
import com.agrosys.chamados.agenda.web.dto.AgendaCampoMetaDto;
import com.agrosys.chamados.agenda.web.dto.CriarAgendaAlocacaoRequest;
import com.agrosys.chamados.agenda.web.dto.MarcacaoValidacaoDto;
import com.agrosys.chamados.util.FieldParsers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AgendaMarcacaoService {

    private final AgendaAlocacaoRepository agendaAlocacaoRepository;

    private static final Map<String, AgendaCampoMetaDto> POR_ID = AgendaMarcacaoMeta.CAMPOS.stream()
            .collect(Collectors.toMap(AgendaCampoMetaDto::id, Function.identity()));

    public AgendaMarcacaoService(AgendaAlocacaoRepository agendaAlocacaoRepository) {
        this.agendaAlocacaoRepository = agendaAlocacaoRepository;
    }

    public List<AgendaCampoMetaDto> metaMarcacao() {
        return AgendaMarcacaoMeta.CAMPOS;
    }

    /**
     * Insere uma nova alocação sem apagar as existentes (diferente do import em massa).
     * Chame {@link #validarOuErro(CriarAgendaAlocacaoRequest)} antes; se ainda faltar campo, lança.
     */
    @Transactional
    public long criar(CriarAgendaAlocacaoRequest req) {
        if (!camposFaltando(req).isEmpty()) {
            throw new IllegalStateException("Marcação incompleta: use validarOuErro antes de criar().");
        }
        AgendaAlocacao a = new AgendaAlocacao();
        a.setRecurso(trim(req.recurso()));
        a.setCliente(trim(req.cliente()));
        a.setLocalAgenda(trim(req.local()));
        a.setSedeAgrosys(trim(req.sedeAgrosys()));
        a.setStatus(trim(req.status()));
        a.setPassagem(trim(req.passagem()));
        a.setAprovador(trim(req.aprovador()));
        LocalDate di = FieldParsers.parseDate(req.dataInicio());
        LocalDate df = FieldParsers.parseDate(req.dataFinal());
        if (df == null && di != null) {
            df = di;
        }
        a.setDataInicio(di);
        a.setDataFinal(df);
        a.setAtividade(trim(req.atividade()));
        a.setHoras(req.horas());
        a.setAlocadoPor(trim(req.alocadoPor()));
        a.setImportadoEm(Instant.now());
        agendaAlocacaoRepository.save(a);
        return a.getId();
    }

    public MarcacaoValidacaoDto validarOuErro(CriarAgendaAlocacaoRequest req) {
        List<String> faltando = camposFaltando(req);
        if (faltando.isEmpty()) {
            return null;
        }
        List<AgendaCampoMetaDto> obrig = AgendaMarcacaoMeta.CAMPOS.stream()
                .filter(AgendaCampoMetaDto::obrigatorio)
                .toList();
        return new MarcacaoValidacaoDto(
                "Preencha todos os campos obrigatórios antes de gravar a marcação.",
                faltando,
                obrig
        );
    }

    private static String trim(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private List<String> camposFaltando(CriarAgendaAlocacaoRequest req) {
        List<String> f = new ArrayList<>();
        if (blank(req.recurso())) {
            f.add("recurso");
        }
        if (blank(req.cliente())) {
            f.add("cliente");
        }
        if (blank(req.local())) {
            f.add("local");
        }
        if (blank(req.sedeAgrosys())) {
            f.add("sedeAgrosys");
        }
        if (blank(req.status())) {
            f.add("status");
        }
        if (blank(req.passagem())) {
            f.add("passagem");
        }
        if (blank(req.aprovador())) {
            f.add("aprovador");
        }
        LocalDate di = FieldParsers.parseDate(req.dataInicio());
        LocalDate df = FieldParsers.parseDate(req.dataFinal());
        if (di == null) {
            f.add("dataInicio");
        }
        if (df == null && di == null) {
            f.add("dataFinal");
        }
        if (blank(req.atividade())) {
            f.add("atividade");
        }
        if (req.horas() == null) {
            f.add("horas");
        }
        if (blank(req.alocadoPor())) {
            f.add("alocadoPor");
        }
        return f;
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }

    public static String labelCampo(String id) {
        AgendaCampoMetaDto m = POR_ID.get(id);
        return m != null ? m.label() : id;
    }
}
