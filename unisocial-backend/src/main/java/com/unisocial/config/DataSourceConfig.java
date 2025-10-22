package com.unisocial.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.annotation.PostConstruct;

@Configuration
@Profile("prod")
public class DataSourceConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @PostConstruct
    public void configureDataSource() {
        // This will be called after properties are loaded
        // We'll let Spring Boot handle the DataSource creation
        System.out.println("Database URL: " + databaseUrl);
    }
}
