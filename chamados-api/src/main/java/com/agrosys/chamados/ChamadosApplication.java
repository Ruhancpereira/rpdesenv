package com.agrosys.chamados;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChamadosApplication {

    public static void main(String[] args) {
        DotenvSupport.aplicarNoSystemAntesDoSpring(DotenvSupport.carregarPrimeiroEnv());
        SpringApplication.run(ChamadosApplication.class, args);
    }
}
