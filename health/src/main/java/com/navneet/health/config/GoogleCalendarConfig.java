package com.navneet.health.config;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Collections;
import java.util.List;

@Configuration
public class GoogleCalendarConfig {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarConfig.class);

    @Value("${google.calendar.credentials.path:src/main/resources/credentials.json}")
    private String credentialsPath;

    @Value("${google.calendar.tokens.path:tokens}")
    private String tokensPath;

    private static final List<String> SCOPES =
            Collections.singletonList(CalendarScopes.CALENDAR);

    @Bean
    @ConditionalOnProperty(name = "google.calendar.enabled", havingValue = "true", matchIfMissing = true)
    public Calendar googleCalendarService() throws GeneralSecurityException, IOException {
        var httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        var jsonFactory = GsonFactory.getDefaultInstance();

        byte[] credBytes = loadCredentialsBytes();
        String jsonStr = new String(credBytes, StandardCharsets.UTF_8);

        // Check if this is a Service Account key
        if (jsonStr.contains("\"type\"") && jsonStr.contains("\"service_account\"")) {
            log.info("Initializing Google Calendar with Service Account credentials");
            GoogleCredential credential = GoogleCredential.fromStream(new ByteArrayInputStream(credBytes))
                    .createScoped(SCOPES);
            return new Calendar.Builder(httpTransport, jsonFactory, credential)
                    .setApplicationName("Healthcare App")
                    .build();
        }

        // Fallback to OAuth 2.0 flow
        log.info("Initializing Google Calendar with OAuth 2.0 client secrets");
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
                jsonFactory, new InputStreamReader(new ByteArrayInputStream(credBytes)));

        String resolvedTokensPath = tokensPath;
        String tokenBase64 = System.getenv("GOOGLE_CALENDAR_TOKEN");
        if (tokenBase64 != null && !tokenBase64.isBlank()) {
            Path tokenDir = Paths.get("/tmp/tokens");
            Files.createDirectories(tokenDir);
            byte[] tokenBytes = Base64.getDecoder().decode(tokenBase64.trim());
            Files.write(tokenDir.resolve("StoredCredential"), tokenBytes);
            resolvedTokensPath = "/tmp/tokens";
        }

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport, jsonFactory, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new File(resolvedTokensPath)))
                .setAccessType("offline")
                .build();

        Credential credential = flow.loadCredential("user");
        if (credential == null) {
            LocalServerReceiver receiver = new LocalServerReceiver.Builder()
                    .setPort(8888)
                    .build();
            credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
        }

        return new Calendar.Builder(httpTransport, jsonFactory, credential)
                .setApplicationName("Healthcare App")
                .build();
    }

    private byte[] loadCredentialsBytes() throws IOException {
        // 1. Environment variable with raw JSON
        String[] envVars = {
                "GOOGLE_SERVICE_ACCOUNT_JSON",
                "GOOGLE_CALENDAR_CREDENTIALS",
                "GOOGLE_CREDENTIALS_JSON"
        };
        for (String var : envVars) {
            String val = System.getenv(var);
            if (val != null && !val.isBlank()) {
                return val.getBytes(StandardCharsets.UTF_8);
            }
        }

        // 2. Base64 environment variable
        String envB64 = System.getenv("GOOGLE_CALENDAR_CREDENTIALS_BASE64");
        if (envB64 != null && !envB64.isBlank()) {
            return Base64.getDecoder().decode(envB64.trim());
        }

        // 3. Classpath: service-account.json
        var saClasspath = new org.springframework.core.io.ClassPathResource("service-account.json");
        if (saClasspath.exists()) {
            try (InputStream is = saClasspath.getInputStream()) {
                return is.readAllBytes();
            }
        }

        // 4. Classpath: credentials.json
        var cpClasspath = new org.springframework.core.io.ClassPathResource("credentials.json");
        if (cpClasspath.exists()) {
            try (InputStream is = cpClasspath.getInputStream()) {
                return is.readAllBytes();
            }
        }

        // 5. Configured file path
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            Path path = Paths.get(credentialsPath);
            if (Files.exists(path)) {
                return Files.readAllBytes(path);
            }
        }

        // 6. Common local fallback path
        Path saLocal = Paths.get("health/src/main/resources/service-account.json");
        if (Files.exists(saLocal)) {
            return Files.readAllBytes(saLocal);
        }

        throw new FileNotFoundException(
                "Google Calendar credentials missing. Set GOOGLE_SERVICE_ACCOUNT_JSON, "
                        + "place service-account.json in src/main/resources/, or set GOOGLE_CALENDAR_ENABLED=false");
    }
}
