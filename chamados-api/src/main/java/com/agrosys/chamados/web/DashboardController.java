package com.agrosys.chamados.web;

import com.agrosys.chamados.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/estrategico")
    public Map<String, Object> estrategico(@RequestParam Map<String, String> allParams) {
        return dashboardService.estrategico(sanearParams(allParams));
    }

    @GetMapping("/operacional")
    public Map<String, Object> operacional(@RequestParam Map<String, String> allParams) {
        return dashboardService.operacional(sanearParams(allParams));
    }

    @GetMapping("/tatico")
    public Map<String, Object> tatico(@RequestParam Map<String, String> allParams) {
        return dashboardService.tatico(sanearParams(allParams));
    }

    private static Map<String, String> sanearParams(Map<String, String> allParams) {
        Map<String, String> m = new HashMap<>(allParams);
        m.remove("page");
        m.remove("size");
        m.remove("sort");
        m.remove("direction");
        return m;
    }
}
