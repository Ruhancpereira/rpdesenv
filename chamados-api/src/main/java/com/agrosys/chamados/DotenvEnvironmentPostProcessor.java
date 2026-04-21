package com.agrosys.chamados;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.Map;

/**
 * Regista variáveis do <code>.env</code> como {@link MapPropertySource} com máxima precedência, para que
 * <code>${ANTHROPIC_API_KEY}</code> no <code>application.yml</code> seja resolvido ao processar a configuração.
 * Ordem {@link Ordered#HIGHEST_PRECEDENCE}: corre antes de {@link org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor}.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, String> vars = DotenvSupport.carregarPrimeiroEnv();
        if (vars.isEmpty()) {
            return;
        }
        Map<String, Object> map = DotenvSupport.paraPropertySource(vars, environment);
        if (!map.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", map));
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
