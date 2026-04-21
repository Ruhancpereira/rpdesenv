package com.agrosys.chamados.service;

import com.agrosys.chamados.repo.ChamadoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OpcoesFiltroService {

    private final ChamadoRepository chamadoRepository;

    public OpcoesFiltroService(ChamadoRepository chamadoRepository) {
        this.chamadoRepository = chamadoRepository;
    }

    /**
     * Valores distintos atuais na base (atualizados a cada importação). Chaves = ids dos filtros (snake_case).
     */
    public Map<String, List<String>> opcoes() {
        Map<String, List<String>> m = new LinkedHashMap<>();
        m.put("tipo", strs(chamadoRepository.distinctTipo()));
        m.put("cliente", strs(chamadoRepository.distinctCliente()));
        m.put("consultor", strs(chamadoRepository.distinctConsultor()));
        m.put("gerente", strs(chamadoRepository.distinctGerente()));
        m.put("area_ini", strs(chamadoRepository.distinctAreaIni()));
        m.put("area_atend", strs(chamadoRepository.distinctAreaAtend()));
        m.put("tipo_cha", strs(chamadoRepository.distinctTipoCha()));
        m.put("bancada_atend", strs(chamadoRepository.distinctBancadaAtend()));
        m.put("user_suporte", strs(chamadoRepository.distinctUserSuporte()));
        m.put("sta_ativ", strs(chamadoRepository.distinctStaAtiv()));
        m.put("categoria", strs(chamadoRepository.distinctCategoria()));
        m.put("tipo_prob", strs(chamadoRepository.distinctTipoProb()));
        m.put("grupo", strs(chamadoRepository.distinctGrupo()));
        m.put("prioridade", dbls(chamadoRepository.distinctPrioridade()));
        m.put("tipo_prior", dbls(chamadoRepository.distinctTipoPrior()));
        m.put("area_mae", strs(chamadoRepository.distinctAreaMae()));
        m.put("nivel_atend", dbls(chamadoRepository.distinctNivelAtend()));
        m.put("motivo_ins", strs(chamadoRepository.distinctMotivoIns()));
        return m;
    }

    private static List<String> strs(List<String> list) {
        return list.stream().map(OpcoesFiltroService::fmtString).collect(Collectors.toList());
    }

    private static List<String> dbls(List<Double> list) {
        return list.stream().map(OpcoesFiltroService::fmtDouble).collect(Collectors.toList());
    }

    private static String fmtString(String s) {
        return s == null ? "" : s;
    }

    static String fmtDouble(Double d) {
        if (d == null) {
            return "";
        }
        return BigDecimal.valueOf(d).stripTrailingZeros().toPlainString();
    }
}
