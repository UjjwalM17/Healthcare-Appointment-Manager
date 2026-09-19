package com.navneet.health.config;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
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

    @Value("${google.calendar.credentials.path}")
    private String credentialsPath;

    @Value("${google.calendar.tokens.path}")
    private String tokensPath;

    private static final List<String> SCOPES =
            Collections.singletonList(CalendarScopes.CALENDAR);

    @Bean
    @ConditionalOnProperty(name = "google.calendar.enabled", havingValue = "true", matchIfMissing = false)
    public Calendar googleCalendarService()
            throws GeneralSecurityException, IOException {

        var httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        var jsonFactory = GsonFactory.getDefaultInstance();

        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
                jsonFactory, new InputStreamReader(credentialsStream()));

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

    private InputStream credentialsStream() throws IOException {
        String envJson = System.getenv("GOOGLE_CALENDAR_CREDENTIALS");
        if (envJson != null && !envJson.isBlank()) {
            return new ByteArrayInputStream(envJson.getBytes(StandardCharsets.UTF_8));
        }
        String envB64 = System.getenv("GOOGLE_CALENDAR_CREDENTIALS_BASE64");
        if (envB64 != null && !envB64.isBlank()) {
            return new ByteArrayInputStream(Base64.getDecoder().decode(envB64.trim()));
        }
        var classpath = new org.springframework.core.io.ClassPathResource("credentials.json");
        if (classpath.exists()) {
            return classpath.getInputStream();
        }
        Path path = Paths.get(credentialsPath);
        if (Files.exists(path)) {
            return Files.newInputStream(path);
        }
        throw new FileNotFoundException(
                "Google Calendar credentials missing. Set GOOGLE_CALENDAR_CREDENTIALS, "
                        + "or set GOOGLE_CALENDAR_ENABLED=false");
    }
}
