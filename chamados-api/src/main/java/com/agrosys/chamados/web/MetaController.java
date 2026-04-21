package com.agrosys.chamados.web;

import com.agrosys.chamados.service.OpcoesFiltroService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meta")
public class MetaController {

    private final OpcoesFiltroService opcoesFiltroService;

    public MetaController(OpcoesFiltroService opcoesFiltroService) {
        this.opcoesFiltroService = opcoesFiltroService;
    }

    @GetMapping("/colunas-filtro")
    public Map<String, List<Map<String, String>>> colunasFiltro() {
        List<Map<String, String>> cols = List.of(
                colLivre("chamado", "Número do chamado", "numero"),
                colLista("tipo", "Tipo", "texto"),
                colLista("cliente", "Cliente", "texto"),
                colLivre("logomarca", "Logomarca", "texto"),
                colLivre("num_ret", "Num. retorno", "numero"),
                colLista("consultor", "Consultor", "texto"),
                colLista("gerente", "Gerente", "texto"),
                colLista("area_ini", "Área inicial", "texto"),
                colLista("area_atend", "Área atendimento", "texto"),
                colLista("tipo_cha", "Tipo chamado", "texto"),
                colLista("bancada_atend", "Bancada", "texto"),
                colLivre("data_abre", "Data abertura", "data"),
                colLivre("hrs_orc", "Horas orçadas", "numero"),
                colLivre("hrs_efe", "Horas efetivas", "numero"),
                colLivre("cob_aprov", "Cobrança aprov.", "numero"),
                colLivre("dias", "Dias", "numero"),
                colLista("user_suporte", "Usuário suporte", "texto"),
                colLista("sta_ativ", "Status", "texto"),
                colLivre("nota", "Nota", "texto"),
                colLista("categoria", "Categoria", "texto"),
                colLista("tipo_prob", "Tipo problema", "texto"),
                colLivre("data_enc_agro", "Data enc. Agrosys", "data"),
                colLivre("data_enc_cli", "Data enc. cliente", "data"),
                colLivre("mes", "Mês", "texto"),
                colLivre("ano", "Ano", "texto"),
                colLivre("mes_num", "Mês (número)", "numero"),
                colLivre("data_enc_ativ", "Data enc. atividade", "data"),
                colLivre("cha_int", "Chamado int.", "texto"),
                colLista("grupo", "Grupo", "texto"),
                colLivre("user_cliente", "Usuário cliente", "texto"),
                colLivre("titulo", "Título", "texto"),
                colLivre("data_sla", "Data SLA", "data"),
                colLista("prioridade", "Prioridade", "numero"),
                colLista("tipo_prior", "Tipo prioridade", "numero"),
                colLivre("vlr_prior", "Valor prioridade", "numero"),
                colLivre("data_ult_ret", "Último retorno", "data"),
                colLista("area_mae", "Área mãe", "texto"),
                colLista("nivel_atend", "Nível atendimento", "numero"),
                colLivre("qttransf", "Qtd. transferências", "numero"),
                colLivre("hrsreal", "Horas reais", "numero"),
                colLista("motivo_ins", "Motivo insatisfação", "texto")
        );
        return Map.of("colunas", cols);
    }

    /** Valores distintos na base (atualizados automaticamente após cada importação). */
    @GetMapping("/opcoes-filtro")
    public Map<String, List<String>> opcoesFiltro() {
        return opcoesFiltroService.opcoes();
    }

    private static Map<String, String> colLista(String id, String label, String tipo) {
        return Map.of("id", id, "label", label, "tipo", tipo, "controle", "lista");
    }

    private static Map<String, String> colLivre(String id, String label, String tipo) {
        return Map.of("id", id, "label", label, "tipo", tipo, "controle", "livre");
    }
}
