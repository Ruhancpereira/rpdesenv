package com.agrosys.chamados.service;

import com.agrosys.chamados.domain.Chamado;
import com.agrosys.chamados.util.FieldParsers;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Campos com opções na planilha: igualdade (case-insensitive). Demais textos: LIKE. Números/datas: igualdade.
 */
public final class ChamadoSpecifications {

    private ChamadoSpecifications() {}

    public static Specification<Chamado> fromParams(Map<String, String> rawParams) {
        Map<String, String> params = FilterKeys.normalize(rawParams);
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            eqLong(ps, cb, root, "numeroChamado", params.get("chamado"));
            eqStringCi(ps, cb, root, "tipo", params.get("tipo"));
            eqStringCi(ps, cb, root, "cliente", params.get("cliente"));
            contains(ps, cb, root, "logomarca", params.get("logomarca"));
            eqDouble(ps, cb, root, "numRet", params.get("num_ret"));
            eqStringCi(ps, cb, root, "consultor", params.get("consultor"));
            eqStringCi(ps, cb, root, "gerente", params.get("gerente"));
            eqStringCi(ps, cb, root, "areaIni", params.get("area_ini"));
            eqStringCi(ps, cb, root, "areaAtend", params.get("area_atend"));
            eqStringCi(ps, cb, root, "tipoCha", params.get("tipo_cha"));
            eqStringCi(ps, cb, root, "bancadaAtend", params.get("bancada_atend"));
            eqDate(ps, cb, root, "dataAbre", params.get("data_abre"));
            eqDouble(ps, cb, root, "hrsOrc", params.get("hrs_orc"));
            eqDouble(ps, cb, root, "hrsEfe", params.get("hrs_efe"));
            eqDouble(ps, cb, root, "cobAprov", params.get("cob_aprov"));
            eqDouble(ps, cb, root, "dias", params.get("dias"));
            eqStringCi(ps, cb, root, "userSuporte", params.get("user_suporte"));
            eqStringCi(ps, cb, root, "staAtiv", params.get("sta_ativ"));
            contains(ps, cb, root, "nota", params.get("nota"));
            eqStringCi(ps, cb, root, "categoria", params.get("categoria"));
            eqStringCi(ps, cb, root, "tipoProb", params.get("tipo_prob"));
            eqDate(ps, cb, root, "dataEncAgro", params.get("data_enc_agro"));
            eqDate(ps, cb, root, "dataEncCli", params.get("data_enc_cli"));
            contains(ps, cb, root, "mes", params.get("mes"));
            contains(ps, cb, root, "ano", params.get("ano"));
            eqDouble(ps, cb, root, "mesNum", params.get("mes_num"));
            eqDate(ps, cb, root, "dataEncAtiv", params.get("data_enc_ativ"));
            contains(ps, cb, root, "chaInt", params.get("cha_int"));
            eqStringCi(ps, cb, root, "grupo", params.get("grupo"));
            contains(ps, cb, root, "userCliente", params.get("user_cliente"));
            contains(ps, cb, root, "titulo", params.get("titulo"));
            eqDate(ps, cb, root, "dataSla", params.get("data_sla"));
            eqDouble(ps, cb, root, "prioridade", params.get("prioridade"));
            eqDouble(ps, cb, root, "tipoPrior", params.get("tipo_prior"));
            eqDouble(ps, cb, root, "vlrPrior", params.get("vlr_prior"));
            eqDate(ps, cb, root, "dataUltRet", params.get("data_ult_ret"));
            eqStringCi(ps, cb, root, "areaMae", params.get("area_mae"));
            eqDouble(ps, cb, root, "nivelAtend", params.get("nivel_atend"));
            eqDouble(ps, cb, root, "qttransf", params.get("qttransf"));
            eqDouble(ps, cb, root, "hrsreal", params.get("hrsreal"));
            eqStringCi(ps, cb, root, "motivoIns", params.get("motivo_ins"));
            if (ps.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(ps.toArray(Predicate[]::new));
        };
    }

    private static void eqStringCi(
            List<Predicate> ps,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            jakarta.persistence.criteria.Root<Chamado> root,
            String attr,
            String v) {
        if (v == null || v.isBlank()) {
            return;
        }
        ps.add(cb.equal(cb.lower(root.get(attr)), v.toLowerCase().trim()));
    }

    private static void contains(
            List<Predicate> ps,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            jakarta.persistence.criteria.Root<Chamado> root,
            String attr,
            String v) {
        if (v == null || v.isBlank()) {
            return;
        }
        ps.add(cb.like(cb.lower(root.get(attr)), "%" + v.toLowerCase().trim() + "%"));
    }

    private static void eqLong(
            List<Predicate> ps,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            jakarta.persistence.criteria.Root<Chamado> root,
            String attr,
            String v) {
        if (v == null || v.isBlank()) {
            return;
        }
        Long n = FieldParsers.parseLong(v);
        if (n != null) {
            ps.add(cb.equal(root.get(attr), n));
        }
    }

    private static void eqDouble(
            List<Predicate> ps,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            jakarta.persistence.criteria.Root<Chamado> root,
            String attr,
            String v) {
        if (v == null || v.isBlank()) {
            return;
        }
        Double n = FieldParsers.parseDouble(v);
        if (n != null) {
            ps.add(cb.equal(root.get(attr), n));
        }
    }

    private static void eqDate(
            List<Predicate> ps,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            jakarta.persistence.criteria.Root<Chamado> root,
            String attr,
            String v) {
        if (v == null || v.isBlank()) {
            return;
        }
        LocalDate d = FieldParsers.parseDate(v);
        if (d != null) {
            ps.add(cb.equal(root.get(attr), d));
        }
    }
}
