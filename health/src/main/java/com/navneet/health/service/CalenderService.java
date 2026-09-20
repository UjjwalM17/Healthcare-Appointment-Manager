package com.navneet.health.service;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Optional;

@Service
public class CalenderService {

    private static final Logger log = LoggerFactory.getLogger(CalenderService.class);

    private final Optional<Calendar> googleCalendarService;

    @Value("${google.calendar.id:primary}")
    private String configuredCalendarId;

    @Autowired
    public CalenderService(Optional<Calendar> googleCalendarService) {
        this.googleCalendarService = googleCalendarService;
    }

    public String createCalendarEvent(String patientEmail,
                                      String doctorEmail,
                                      String title,
                                      LocalDate date,
                                      LocalTime startTime,
                                      LocalTime endTime) {
        if (googleCalendarService.isEmpty()) {
            log.warn("Google Calendar service is not enabled or not initialized.");
            return null;
        }
        try {
            ZonedDateTime start = ZonedDateTime.of(date, startTime, ZoneId.systemDefault());
            ZonedDateTime end = ZonedDateTime.of(date, endTime, ZoneId.systemDefault());

            Event event = new Event()
                    .setSummary(title)
                    .setDescription("Healthcare appointment between " + patientEmail + " and " + doctorEmail);

            event.setStart(new EventDateTime()
                    .setDateTime(new DateTime(start.toInstant().toEpochMilli()))
                    .setTimeZone(ZoneId.systemDefault().getId()));

            event.setEnd(new EventDateTime()
                    .setDateTime(new DateTime(end.toInstant().toEpochMilli()))
                    .setTimeZone(ZoneId.systemDefault().getId()));

            if (patientEmail != null && doctorEmail != null) {
                event.setAttendees(Arrays.asList(
                        new EventAttendee().setEmail(patientEmail),
                        new EventAttendee().setEmail(doctorEmail)
                ));
            }

            String targetCalendarId = (configuredCalendarId != null && !configuredCalendarId.isBlank())
                    ? configuredCalendarId.trim()
                    : "primary";

            log.info("Creating Google Calendar event in calendar '{}' for patient {} and doctor {}",
                    targetCalendarId, patientEmail, doctorEmail);

            // Attempt 1: Insert with sendUpdates=all (sends email invitations if supported)
            try {
                Event created = googleCalendarService.get().events()
                        .insert(targetCalendarId, event)
                        .setSendUpdates("all")
                        .execute();
                log.info("Google Calendar event created successfully with ID: {}", created.getId());
                return created.getId();
            } catch (Exception sendUpdateEx) {
                log.warn("Failed to insert event with sendUpdates=all ({}), retrying without sendUpdates...",
                        sendUpdateEx.getMessage());

                // Attempt 2: Insert without sendUpdates
                try {
                    Event created = googleCalendarService.get().events()
                            .insert(targetCalendarId, event)
                            .execute();
                    log.info("Google Calendar event created successfully (without sendUpdates) with ID: {}", created.getId());
                    return created.getId();
                } catch (Exception attendeeEx) {
                    log.warn("Failed to insert event with attendees ({}), retrying without attendees...",
                            attendeeEx.getMessage());

                    // Attempt 3: Insert without attendees (for standard service accounts without domain delegation)
                    event.setAttendees(null);
                    Event created = googleCalendarService.get().events()
                            .insert(targetCalendarId, event)
                            .execute();
                    log.info("Google Calendar event created successfully (without attendees) with ID: {}", created.getId());
                    return created.getId();
                }
            }

        } catch (Exception e) {
            log.error("Calendar event creation failed completely: {}", e.getMessage(), e);
            return null;
        }
    }

    public void deleteCalendarEvent(String eventId) {
        if (googleCalendarService.isEmpty() || eventId == null || eventId.isBlank()) {
            return;
        }
        try {
            String targetCalendarId = (configuredCalendarId != null && !configuredCalendarId.isBlank())
                    ? configuredCalendarId.trim()
                    : "primary";
            googleCalendarService.get().events().delete(targetCalendarId, eventId).execute();
            log.info("Google Calendar event {} deleted from calendar {}", eventId, targetCalendarId);
        } catch (Exception e) {
            log.error("Calendar deletion failed for event ID {}: {}", eventId, e.getMessage(), e);
        }
    }

    public java.util.Map<String, Object> testCalendarIntegration(String customCalendarId) {
        if (googleCalendarService.isEmpty()) {
            return java.util.Map.of("success", false, "error", "Google Calendar service bean is not initialized.");
        }

        String targetCalendarId = (customCalendarId != null && !customCalendarId.isBlank())
                ? customCalendarId.trim()
                : ((configuredCalendarId != null && !configuredCalendarId.isBlank()) ? configuredCalendarId.trim() : "primary");

        log.info("Testing Google Calendar integration with targetCalendarId: '{}'", targetCalendarId);

        try {
            // 1. Check calendar metadata and permissions
            var calendarMeta = googleCalendarService.get().calendars().get(targetCalendarId).execute();
            log.info("Calendar verified: summary='{}', timeZone='{}'", calendarMeta.getSummary(), calendarMeta.getTimeZone());

            // 2. Create a test event for today
            ZonedDateTime now = ZonedDateTime.now(ZoneId.systemDefault());
            ZonedDateTime start = now.plusHours(1);
            ZonedDateTime end = start.plusMinutes(30);

            Event event = new Event()
                    .setSummary("Healthcare App Test Appointment")
                    .setDescription("Verification appointment created by Healthcare App.");

            event.setStart(new EventDateTime()
                    .setDateTime(new DateTime(start.toInstant().toEpochMilli()))
                    .setTimeZone(ZoneId.systemDefault().getId()));

            event.setEnd(new EventDateTime()
                    .setDateTime(new DateTime(end.toInstant().toEpochMilli()))
                    .setTimeZone(ZoneId.systemDefault().getId()));

            Event created = googleCalendarService.get().events()
                    .insert(targetCalendarId, event)
                    .execute();

            log.info("Test calendar event created successfully! ID: {}, Link: {}", created.getId(), created.getHtmlLink());

            return java.util.Map.of(
                    "success", true,
                    "targetCalendarId", targetCalendarId,
                    "calendarSummary", calendarMeta.getSummary() != null ? calendarMeta.getSummary() : "",
                    "eventId", created.getId(),
                    "htmlLink", created.getHtmlLink() != null ? created.getHtmlLink() : "",
                    "time", start.toString()
            );

        } catch (Exception e) {
            log.error("Calendar test failed for calendar '{}': {}", targetCalendarId, e.getMessage(), e);
            return java.util.Map.of(
                    "success", false,
                    "targetCalendarId", targetCalendarId,
                    "error", e.getMessage() != null ? e.getMessage() : e.toString()
            );
        }
    }
}