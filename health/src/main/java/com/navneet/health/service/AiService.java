package com.navneet.health.service;

import com.navneet.health.dto.groq.Choice;
import com.navneet.health.dto.groq.GroqRequest;
import com.navneet.health.dto.groq.GroqResponse;
import com.navneet.health.dto.groq.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    private final RestClient restClient =
            RestClient.builder().build();

    public String generatePreVisitSummary(String symptoms) {
        String prompt = """
                You are an experienced physician.

                Analyze these symptoms and provide:

                1. Urgency Level (Low/Medium/High)

                2. Chief Complaint

                3. Three questions the doctor should ask.

                Symptoms:

                """ + symptoms;

        return generate(
                prompt,
                "Pre-visit summary unavailable."
        );
    }

    public String generatePostVisitSummary(String doctorNotes) {
        String prompt = """
                You are a medical assistant.

                Convert these doctor's notes into
                patient-friendly language.

                Include:

                1. Diagnosis

                2. Medication Schedule

                3. Lifestyle Advice

                4. Follow-up Instructions

                Doctor Notes:

                """ + doctorNotes;

        return generate(
                prompt,
                "Post-visit summary unavailable."
        );
    }

    public String generate(String prompt, String fallback) {
        if (apiKey == null || apiKey.trim().isBlank()) {
            log.warn("Groq AI skipped: GROQ_API_KEY is not configured.");
            return fallback;
        }

        try {
            return callGroq(prompt);

        } catch (RestClientResponseException ex) {
            log.error("Groq API error [HTTP {}]: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return fallback;

        } catch (RestClientException ex) {
            log.error("Groq REST client error: {}", ex.getMessage(), ex);
            return fallback;

        } catch (Exception ex) {
            log.error("AI generation unexpected error: {}", ex.getMessage(), ex);
            return fallback;
        }
    }

    public String callGroq(String prompt) {
        String trimmedKey = apiKey != null ? apiKey.trim() : "";
        String trimmedModel = (model != null && !model.trim().isBlank()) ? model.trim() : "llama-3.3-70b-versatile";
        String trimmedUrl = (apiUrl != null && !apiUrl.trim().isBlank()) ? apiUrl.trim() : "https://api.groq.com/openai/v1/chat/completions";

        log.info("Calling Groq API at [{}] with model: [{}]", trimmedUrl, trimmedModel);

        GroqRequest request = new GroqRequest(
                trimmedModel,
                List.of(
                        new Message(
                                "user",
                                prompt
                        )
                ),
                1024
        );

        GroqResponse response =
                restClient.post()
                        .uri(trimmedUrl)
                        .header(
                                "Authorization",
                                "Bearer " + trimmedKey
                        )
                        .header(
                                "Content-Type",
                                "application/json"
                        )
                        .body(request)
                        .retrieve()
                        .body(GroqResponse.class);

        if (response == null
                || response.getChoices() == null
                || response.getChoices().isEmpty()) {

            throw new RuntimeException(
                    "No response received from Groq."
            );
        }

        Choice choice =
                response.getChoices().get(0);

        if (choice.getMessage() == null
                || choice.getMessage().getContent() == null) {

            throw new RuntimeException(
                    "Invalid response received from Groq."
            );
        }

        return choice.getMessage().getContent();
    }
}