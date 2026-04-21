package com.agrosys.chamados.assistant;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Definições de ferramentas partilhadas entre OpenAI e Anthropic (formatos diferentes na serialização).
 */
public final class AssistantToolDefinitions {

    public static final String SYSTEM_PROMPT =
            """
            És o assistente **Agrosys** dentro da aplicação web. Tens ferramentas para ler dados reais \
            (chamados, dashboards, agenda). Usa-as em vez de inventar números. \
            Responde em **português**. Sê **objetivo e curto**: prioriza números, listas ou uma frase; evita \
            prefácios, repetições e parágrafos longos quando uma tabela pequena ou bullet points chegam. \
            Para análises técnicas, usa tópicos curtos e indica limitações (ex.: dados do último import). \
            Para criar marcação na agenda, chama a ferramenta só quando o utilizador pedir e os campos estiverem \
            coerentes; se a validação falhar, explica o que falta em linguagem humana.""";

    private AssistantToolDefinitions() {}

    /** Esquema JSON comum (tipo "object" + properties) para input das ferramentas. */
    public static Map<String, Object> emptyInputSchema() {
        return Map.of("type", "object", "properties", Map.of());
    }

    public static Map<String, Object> marcacaoInputSchema() {
        Map<String, Object> marcProps = new LinkedHashMap<>();
        marcProps.put("recurso", Map.of("type", "string", "description", "Recurso alocado"));
        marcProps.put("cliente", Map.of("type", "string"));
        marcProps.put("local", Map.of("type", "string"));
        marcProps.put("sedeAgrosys", Map.of("type", "string"));
        marcProps.put("status", Map.of("type", "string"));
        marcProps.put("passagem", Map.of("type", "string"));
        marcProps.put("aprovador", Map.of("type", "string"));
        marcProps.put("dataInicio", Map.of("type", "string", "description", "yyyy-MM-dd ou dd/MM/yyyy"));
        marcProps.put("dataFinal", Map.of("type", "string", "description", "Opcional; se omitir, usa data início."));
        marcProps.put("atividade", Map.of("type", "string"));
        marcProps.put("horas", Map.of("type", "number"));
        marcProps.put("alocadoPor", Map.of("type", "string"));
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", marcProps);
        return schema;
    }

    /** Ferramentas no formato OpenAI Chat Completions (wrap "function"). */
    public static List<Map<String, Object>> openAiToolList() {
        Map<String, Object> empty = emptyInputSchema();
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(openAiFn("dashboard_estrategico", "KPIs e distribuições estratégicas dos chamados.", empty));
        list.add(openAiFn("dashboard_operacional", "Métricas operacionais dos chamados.", empty));
        list.add(openAiFn("dashboard_tatico", "Métricas táticas / volume temporal dos chamados.", empty));
        list.add(
                openAiFn(
                        "agenda_gantt",
                        "Alocações da agenda (recursos, datas, clientes). Pode vir truncado se for muito grande.",
                        empty
                )
        );
        list.add(openAiFn("agenda_dashboard", "Agregados da agenda (horas por recurso, cliente, status).", empty));
        list.add(openAiFn("agenda_opcoes_filtro", "Valores distintos por coluna na agenda importada.", empty));
        list.add(openAiFn("agenda_meta_marcacao", "Campos obrigatórios para criar uma linha de agenda.", empty));
        list.add(openAiFn("meta_chamados_colunas", "Metadados das colunas de filtro dos chamados.", empty));
        list.add(openAiFn("meta_chamados_opcoes", "Valores distintos por coluna nos chamados.", empty));
        list.add(
                openAiFn(
                        "chamados_amostra",
                        "Lista consolidada de chamados (sem filtro), mais recentes primeiro: total na base + até "
                                + "N linhas resumidas. Use para contagens/listagens; para KPIs agregados prefira "
                                + "dashboard_estrategico / operacional / tatico.",
                        empty
                )
        );
        list.add(
                openAiFn(
                        "agenda_criar_marcacao",
                        "Grava uma nova alocação na agenda. Só após o utilizador pedir explicitamente. "
                                + "Todos os campos obrigatórios devem estar preenchidos (ver agenda_meta_marcacao).",
                        marcacaoInputSchema()
                )
        );
        return list;
    }

    private static Map<String, Object> openAiFn(String name, String description, Map<String, Object> parameters) {
        return Map.of(
                "type", "function",
                "function",
                        Map.of(
                                "name", name,
                                "description", description,
                                "parameters", parameters
                        )
        );
    }

    /** Ferramentas no formato Anthropic Messages API (input_schema no topo). */
    public static List<Map<String, Object>> anthropicToolList() {
        Map<String, Object> empty = emptyInputSchema();
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(anthropicTool("dashboard_estrategico", "KPIs e distribuições estratégicas dos chamados.", empty));
        list.add(anthropicTool("dashboard_operacional", "Métricas operacionais dos chamados.", empty));
        list.add(anthropicTool("dashboard_tatico", "Métricas táticas / volume temporal dos chamados.", empty));
        list.add(
                anthropicTool(
                        "agenda_gantt",
                        "Alocações da agenda (recursos, datas, clientes). Pode vir truncado se for muito grande.",
                        empty
                )
        );
        list.add(anthropicTool("agenda_dashboard", "Agregados da agenda (horas por recurso, cliente, status).", empty));
        list.add(anthropicTool("agenda_opcoes_filtro", "Valores distintos por coluna na agenda importada.", empty));
        list.add(anthropicTool("agenda_meta_marcacao", "Campos obrigatórios para criar uma linha de agenda.", empty));
        list.add(anthropicTool("meta_chamados_colunas", "Metadados das colunas de filtro dos chamados.", empty));
        list.add(anthropicTool("meta_chamados_opcoes", "Valores distintos por coluna nos chamados.", empty));
        list.add(
                anthropicTool(
                        "chamados_amostra",
                        "Lista consolidada de chamados (sem filtro), mais recentes primeiro: total na base + até "
                                + "N linhas resumidas. Para KPIs agregados use dashboard_estrategico, "
                                + "dashboard_operacional ou dashboard_tatico.",
                        empty
                )
        );
        list.add(
                anthropicTool(
                        "agenda_criar_marcacao",
                        "Grava uma nova alocação na agenda. Só após o utilizador pedir explicitamente. "
                                + "Todos os campos obrigatórios devem estar preenchidos (ver agenda_meta_marcacao).",
                        marcacaoInputSchema()
                )
        );
        return list;
    }

    private static Map<String, Object> anthropicTool(String name, String description, Map<String, Object> inputSchema) {
        return Map.of(
                "name", name,
                "description", description,
                "input_schema", inputSchema
        );
    }

    /**
     * Declarações no formato Gemini ({@code functionDeclarations}): nome, descrição e JSON Schema dos parâmetros.
     */
    public static List<Map<String, Object>> geminiFunctionDeclarations() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> t : openAiToolList()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> fn = (Map<String, Object>) t.get("function");
            out.add(
                    Map.of(
                            "name", fn.get("name"),
                            "description", fn.get("description"),
                            "parameters", fn.get("parameters")
                    )
            );
        }
        return out;
    }
}
