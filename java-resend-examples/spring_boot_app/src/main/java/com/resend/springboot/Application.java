package com.resend.springboot;

import com.resend.Resend;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {

    @Value("${RESEND_API_KEY}")
    private String apiKey;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public Resend resend() {
        return new Resend(apiKey);
    }
}
