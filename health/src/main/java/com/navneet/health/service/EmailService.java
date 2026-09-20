package com.navneet.health.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${brevo.api.key:}")
    private String apiKey;

    @Value("${brevo.from.email:}")
    private String fromEmail;

    @Value("${brevo.from.name:Healthcare App}")
    private String fromName;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendEmail(String toEmail,
                             String subject,
                             String body) {

        if (apiKey == null || apiKey.trim().isBlank()) {
            log.warn("Brevo email skipped: BREVO_API_KEY is not configured.");
            return false;
        }

        if (fromEmail == null || fromEmail.trim().isBlank()) {
            log.warn("Brevo email skipped: BREVO_FROM_EMAIL is not configured.");
            return false;
        }

        if (toEmail == null || toEmail.trim().isBlank()) {
            log.warn("Brevo email skipped: Recipient email is empty.");
            return false;
        }

        try {
            String trimmedKey = apiKey.trim();
            String trimmedFrom = fromEmail.trim();
            String trimmedFromName = (fromName != null && !fromName.trim().isBlank())
                    ? fromName.trim()
                    : "Healthcare App";
            String trimmedTo = toEmail.trim();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", trimmedKey);
            headers.set("accept", "application/json");

            String htmlContent = "<!DOCTYPE html>"
                    + "<html><head><meta charset=\"UTF-8\"></head>"
                    + "<body style=\"margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;\">"
                    + "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">"
                    + "<tr><td align=\"center\">"
                    + "<table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\">"
                    + "<tr><td style=\"background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 24px; text-align: center;\">"
                    + "<h1 style=\"color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;\">" + trimmedFromName + "</h1>"
                    + "</td></tr>"
                    + "<tr><td style=\"padding: 30px;\">"
                    + "<h2 style=\"color: #0f172a; margin-top: 0; font-size: 18px;\">" + subject + "</h2>"
                    + "<div style=\"background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; line-height: 1.6; white-space: pre-line;\">"
                    + body
                    + "</div>"
                    + "<p style=\"font-size: 12px; color: #94a3b8; margin: 24px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 16px;\">"
                    + "This is an automated notification from " + trimmedFromName + ". Please do not reply directly to this email."
                    + "</p>"
                    + "</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "</table>"
                    + "</body></html>";

            Map<String, Object> request = Map.of(
                    "sender", Map.of(
                            "name", trimmedFromName,
                            "email", trimmedFrom
                    ),
                    "to", List.of(
                            Map.of("email", trimmedTo)
                    ),
                    "subject", subject,
                    "htmlContent", htmlContent,
                    "textContent", body
            );

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(request, headers);

            log.info("Sending Brevo email to '{}' with subject '{}' from '{}'", trimmedTo, subject, trimmedFrom);

            restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    entity,
                    String.class
            );

            log.info("Brevo email sent successfully to '{}'", trimmedTo);
            return true;

        } catch (HttpStatusCodeException e) {
            log.error("Brevo API error (HTTP {}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("Brevo email sending failed to '{}': {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    public void sendBookingConfirmation(
            String toEmail,
            String patientName,
            String doctorName,
            String date,
            String time) {

        sendEmail(
                toEmail,
                "Appointment Confirmed",
                "Dear " + patientName + ",\n\n"
                        + "Your appointment with Dr. " + doctorName + " has been confirmed.\n\n"
                        + "Date: " + date + "\n"
                        + "Time: " + time + "\n\n"
                        + "Please arrive 10 minutes early."
        );
    }

    public void sendCancellationEmail(
            String toEmail,
            String patientName,
            String doctorName,
            String date,
            String time) {

        sendEmail(
                toEmail,
                "Appointment Cancelled",
                "Dear " + patientName + ",\n\n"
                        + "Your appointment with Dr. " + doctorName + " on " + date + " at " + time + " has been cancelled."
        );
    }

    public void sendReminderEmail(
            String toEmail,
            String patientName,
            String doctorName,
            String date,
            String time) {

        sendEmail(
                toEmail,
                "Appointment Reminder",
                "Dear " + patientName + ",\n\n"
                        + "Reminder for your upcoming appointment with Dr. " + doctorName + ":\n\n"
                        + "Date: " + date + "\n"
                        + "Time: " + time
        );
    }

    public void sendDoctorNotification(
            String toEmail,
            String doctorName,
            String patientName,
            String date,
            String time) {

        sendEmail(
                toEmail,
                "New Appointment Scheduled",
                "Hello Dr. " + doctorName + ",\n\n"
                        + patientName + " has booked an appointment with you.\n\n"
                        + "Date: " + date + "\n"
                        + "Time: " + time
        );
    }
}