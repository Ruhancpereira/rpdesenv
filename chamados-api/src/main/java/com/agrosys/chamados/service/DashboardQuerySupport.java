package com.agrosys.chamados.service;

import com.agrosys.chamados.domain.Chamado;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class DashboardQuerySupport {

    private static final Set<String> GROUP_ATTR = Set.of(
            "staAtiv",
            "areaAtend",
            "tipoCha",
            "mes",
            "consultor",
            "bancadaAtend",
            "areaIni",
            "gerente",
            "prioridade"
    );

    private final EntityManager em;

    public DashboardQuerySupport(EntityManager em) {
        this.em = em;
    }

    public List<LabelCount> groupBy(
            Specification<Chamado> spec,
            String attribute,
            boolean orderByCountDesc) {
        if (!GROUP_ATTR.contains(attribute)) {
            throw new IllegalArgumentException("Atributo de agrupamento não permitido: " + attribute);
        }
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Chamado> root = cq.from(Chamado.class);
        Predicate p = spec.toPredicate(root, cq, cb);
        cq.where(p != null ? p : cb.conjunction());
        var path = root.get(attribute);
        cq.multiselect(path, cb.count(root));
        cq.groupBy(path);
        if (orderByCountDesc) {
            cq.orderBy(cb.desc(cb.count(root)));
        } else {
            cq.orderBy(cb.asc(path));
        }
        List<Tuple> rows = em.createQuery(cq).getResultList();
        List<LabelCount> out = new ArrayList<>();
        for (Tuple t : rows) {
            Object key = t.get(0);
            Number cnt = (Number) t.get(1);
            long total = cnt != null ? cnt.longValue() : 0L;
            String lab = label(key, attribute);
            out.add(new LabelCount(lab, total));
        }
        return out;
    }

    private static String label(Object key, String attribute) {
        if (key == null) {
            return "(vazio)";
        }
        if (key instanceof Double d) {
            return OpcoesFiltroService.fmtDouble(d);
        }
        return String.valueOf(key);
    }

    public Double avgDiasByStatus(Specification<Chamado> spec, String status) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Double> cq = cb.createQuery(Double.class);
        Root<Chamado> root = cq.from(Chamado.class);
        Predicate statusEq = cb.equal(root.get("staAtiv"), status);
        Predicate s = spec.toPredicate(root, cq, cb);
        cq.select(cb.avg(root.get("dias")));
        cq.where(s != null ? cb.and(statusEq, s) : statusEq);
        Double r = em.createQuery(cq).getSingleResult();
        return r != null ? r : 0d;
    }

    public long countSlaEstourado(Specification<Chamado> spec) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<Chamado> root = cq.from(Chamado.class);
        Predicate base = cb.and(
                cb.isNotNull(root.get("dataSla")),
                cb.isNotNull(root.get("dataUltRet")),
                cb.greaterThan(root.get("dataUltRet"), root.get("dataSla"))
        );
        Predicate s = spec.toPredicate(root, cq, cb);
        cq.select(cb.count(root));
        cq.where(s != null ? cb.and(base, s) : base);
        Long n = em.createQuery(cq).getSingleResult();
        return n != null ? n : 0L;
    }

    public long countSlaDentroOuAberto(Specification<Chamado> spec) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<Chamado> root = cq.from(Chamado.class);
        Predicate base = cb.and(
                cb.isNotNull(root.get("dataSla")),
                cb.or(
                        cb.isNull(root.get("dataUltRet")),
                        cb.lessThanOrEqualTo(root.get("dataUltRet"), root.get("dataSla"))
                )
        );
        Predicate s = spec.toPredicate(root, cq, cb);
        cq.select(cb.count(root));
        cq.where(s != null ? cb.and(base, s) : base);
        Long n = em.createQuery(cq).getSingleResult();
        return n != null ? n : 0L;
    }

    public double avgQttransf(Specification<Chamado> spec) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Double> cq = cb.createQuery(Double.class);
        Root<Chamado> root = cq.from(Chamado.class);
        Predicate s = spec.toPredicate(root, cq, cb);
        cq.select(cb.avg(root.get("qttransf")));
        cq.where(s != null ? s : cb.conjunction());
        Double r = em.createQuery(cq).getSingleResult();
        return r != null ? r : 0d;
    }

    public long countComTransferencia(Specification<Chamado> spec) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<Chamado> root = cq.from(Chamado.class);
        Predicate base = cb.and(
                cb.isNotNull(root.get("qttransf")),
                cb.gt(root.get("qttransf"), 0)
        );
        Predicate s = spec.toPredicate(root, cq, cb);
        cq.select(cb.count(root));
        cq.where(s != null ? cb.and(base, s) : base);
        Long n = em.createQuery(cq).getSingleResult();
        return n != null ? n : 0L;
    }

    public record LabelCount(String label, long total) {}
}
