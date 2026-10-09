package com.medicare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MedicareApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicareApplication.class, args);
        System.out.println("=================================================");
        System.out.println("  MediCare Spring Boot Backend Server Started!");
        System.out.println("  REST API Base URL: http://localhost:8080/api");
        System.out.println("=================================================");
    }
}
