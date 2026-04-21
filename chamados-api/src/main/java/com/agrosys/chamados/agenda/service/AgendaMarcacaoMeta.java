package com.agrosys.chamados.agenda.service;

import com.agrosys.chamados.agenda.web.dto.AgendaCampoMetaDto;

import java.util.List;

/**
 * Fonte única: colunas alinhadas ao {@link com.agrosys.chamados.agenda.service.AgendaImportService}.
 * Ajuste {@code obrigatorio} aqui se a regra de negócio relaxar (ex.: passagem opcional).
 */
public final class AgendaMarcacaoMeta {

    private AgendaMarcacaoMeta() {}

    public static final List<AgendaCampoMetaDto> CAMPOS = List.of(
            campo("recurso", "Recurso", "texto", true, "Quem será alocado (consultor, veículo, etc.)."),
            campo("cliente", "Cliente", "texto", true, "Cliente ou projeto."),
            campo("local", "Local", "texto", true, "Local da agenda (coluna local na planilha)."),
            campo("sedeAgrosys", "Sede Agrosys", "texto", true, "Sede / unidade."),
            campo("status", "Status", "texto", true, "Ex.: planejado, confirmado."),
            campo("passagem", "Passagem", "texto", true, "Informação de passagem (coluna passagem)."),
            campo("aprovador", "Aprovador", "texto", true, "Quem aprovou ou responsável pela aprovação."),
            campo("dataInicio", "Data início", "data", true, "Início do período (yyyy-MM-dd ou dd/MM/yyyy)."),
            campo("dataFinal", "Data final", "data", false, "Fim do período; se omitir, repete a data de início."),
            campo("atividade", "Atividade", "texto", true, "Descrição da atividade."),
            campo("horas", "Horas", "numero", true, "Carga horária (use 0 se não aplicável)."),
            campo("alocadoPor", "Alocado por", "texto", true, "Quem registrou a alocação.")
    );

    private static AgendaCampoMetaDto campo(
            String id, String label, String tipo, boolean obrigatorio, String descricao
    ) {
        return new AgendaCampoMetaDto(id, label, tipo, obrigatorio, descricao);
    }
}
