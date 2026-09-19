package com.navneet.health.service;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Optional;

@Service
public class CalenderService {

    private final Optional<Calendar> googleCalendarService;

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
            return null;
        }
        try {
            ZonedDateTime start = ZonedDateTime.of(date, startTime, ZoneId.systemDefault());
            ZonedDateTime end = ZonedDateTime.of(date, endTime, ZoneId.systemDefault());

            Event event = new Event()
                    .setSummary(title)
                    .setDescription("Healthcare appointment");

            event.setStart(new EventDateTime()
                    .setDateTime(new DateTime(start.toInstant().toEpochMilli()))
                    .setTimeZone(ZoneId.systemDefault().getId()));

            event.setEnd(new EventDateTime()
                    .setDateTime(new DateTime(end.toInstant().toEpochMilli()))
                    .setTimeZone(ZoneId.systemDefault().getId()));

            event.setAttendees(Arrays.asList(
                    new EventAttendee().setEmail(patientEmail),
                    new EventAttendee().setEmail(doctorEmail)
            ));

            Event created = googleCalendarService.get().events()
                    .insert("primary", event)
                    .setSendUpdates("all")
                    .execute();

            return created.getId();

        } catch (Exception e) {
            System.err.println("Calendar event creation failed: " + e.getMessage());
            return null;
        }
    }

    public void deleteCalendarEvent(String eventId) {
        if (googleCalendarService.isEmpty()) {
            return;
        }
        try {
            googleCalendarService.get().events().delete("primary", eventId).execute();
        } catch (Exception e) {
            System.err.println("Calendar deletion failed: " + e.getMessage());
        }
    }
}