package com.navneet.health.service;

import com.navneet.health.entity.*;
import com.navneet.health.repository.AppointmentRepository;
import com.navneet.health.repository.DoctorRepository;
import com.navneet.health.repository.PrescriptionRepository;
import com.navneet.health.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AiService aiService;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final EmailService emailService;
    private final CalenderService calenderService;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    public Prescription addPrescription(Long appointmentId, Prescription prescription) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        prescription.setAppointment(appointment);
        return prescriptionRepository.save(prescription);
    }
    @Transactional
    public Appointment bookAppointment(Appointment appointment) {
        Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        User patient = userRepository.findById(appointment.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        if (doctor.getLeaveDays().contains(appointment.getAppointmentDate())) {
            throw new RuntimeException("Doctor is on leave on this date");
        }

        boolean alreadyBooked = appointmentRepository
                .findByDoctorAndAppointmentDateAndAppointmentTimeAndStatusNot(
                        doctor,
                        appointment.getAppointmentDate(),
                        appointment.getAppointmentTime(),
                        AppointmentStatus.CANCELLED
                )
                .isPresent();

        if (alreadyBooked) {
            throw new RuntimeException("This slot is already booked");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment savedAppointment;
        try {
            savedAppointment = appointmentRepository.saveAndFlush(appointment);
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("This slot is already booked");
        }

        try {
            emailService.sendBookingConfirmation(
                    patient.getEmail(),
                    patient.getName(),
                    doctor.getUser().getName(),
                    savedAppointment.getAppointmentDate().toString(),
                    savedAppointment.getAppointmentTime().toString()
            );
        } catch (Exception e) {
            System.err.println("Patient confirmation email failed: " + e.getMessage());
        }

        try {
            emailService.sendDoctorNotification(
                    doctor.getUser().getEmail(),
                    doctor.getUser().getName(),
                    patient.getName(),
                    savedAppointment.getAppointmentDate().toString(),
                    savedAppointment.getAppointmentTime().toString()
            );
        } catch (Exception e) {
            System.err.println("Doctor notification email failed: " + e.getMessage());
        }

        try {
            String doctorName = doctor.getUser().getName();
            if (!doctorName.toLowerCase().startsWith("dr.") && !doctorName.toLowerCase().startsWith("dr ")) {
                doctorName = "Dr. " + doctorName;
            }

            String eventTitle = "Appointment: " + patient.getName() + " (" + patient.getEmail() + ") with " + doctorName;

            String eventDescription = "Healthcare Appointment Details:\n"
                    + "• Patient: " + patient.getName() + " (" + patient.getEmail() + ")\n"
                    + "• Doctor: " + doctorName + " (" + doctor.getUser().getEmail() + ")\n"
                    + "• Date: " + savedAppointment.getAppointmentDate() + "\n"
                    + "• Time: " + savedAppointment.getAppointmentTime() + "\n"
                    + (savedAppointment.getSymptoms() != null && !savedAppointment.getSymptoms().isBlank()
                        ? "• Symptoms: " + savedAppointment.getSymptoms() + "\n"
                        : "");

            String eventId = calenderService.createCalendarEvent(
                    patient.getEmail(),
                    doctor.getUser().getEmail(),
                    eventTitle,
                    eventDescription,
                    savedAppointment.getAppointmentDate(),
                    savedAppointment.getAppointmentTime(),
                    savedAppointment.getAppointmentTime()
                            .plusMinutes(doctor.getSlotDurationMinutes())
            );
            savedAppointment.setCalendarEventId(eventId);
            appointmentRepository.save(savedAppointment);
        } catch (Exception e) {
            System.err.println("Calendar event creation failed: " + e.getMessage());
        }
        // Generate AI pre-visit summary
//        try {
//            if (savedAppointment.getSymptoms() != null && !savedAppointment.getSymptoms().isEmpty()) {
//                String summary = aiService.generatePreVisitSummary(savedAppointment.getSymptoms());
//                savedAppointment.setPreVisitSummary(summary);
//                appointmentRepository.save(savedAppointment);
//            }
//        } catch (Exception e) {
//            System.err.println("AI pre-visit summary failed: " + e.getMessage());
//        }

        try {
            System.out.println("========== AI PRE-VISIT START ==========");

            System.out.println("Symptoms: " + savedAppointment.getSymptoms());

            if (savedAppointment.getSymptoms() != null
                    && !savedAppointment.getSymptoms().isEmpty()) {

                System.out.println("Calling Groq...");

                String summary = aiService.generatePreVisitSummary(
                        savedAppointment.getSymptoms()
                );

                System.out.println("Groq returned: " + summary);

                savedAppointment.setPreVisitSummary(summary);
                appointmentRepository.save(savedAppointment);

                System.out.println("AI summary saved successfully.");
            } else {
                System.out.println("NO SYMPTOMS PROVIDED.");
            }

            System.out.println("========== AI PRE-VISIT END ==========");

        } catch (Exception e) {
            System.err.println("AI pre-visit summary failed:");
            e.printStackTrace();
        }

        return appointmentRepository.findById(savedAppointment.getId()).orElse(savedAppointment);
    }

    public Appointment submitDoctorNotes(Long appointmentId, String notes) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setDoctorNotes(notes);

        // Generate AI post-visit summary
        try {
            String postSummary = aiService.generatePostVisitSummary(notes);
            appointment.setPostVisitSummary(postSummary);
        } catch (Exception e) {
            System.err.println("AI post-visit summary failed: " + e.getMessage());
        }

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsForDoctor(Long userId) {
        Doctor doctor = doctorRepository.findById(userId)
                .orElse(null);

        // userId is actually the user's id, find doctor by user id
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return doctorRepository.findByUser(user)
                .map(doc -> appointmentRepository.findByDoctorIdAndStatus(doc.getId(), AppointmentStatus.CONFIRMED))
                .orElse(List.of());
    }

    public Appointment cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment cancelledAppointment = appointmentRepository.save(appointment);

        try {
            emailService.sendCancellationEmail(
                    cancelledAppointment.getPatient().getEmail(),
                    cancelledAppointment.getPatient().getName(),
                    cancelledAppointment.getDoctor().getUser().getName(),
                    cancelledAppointment.getAppointmentDate().toString(),
                    cancelledAppointment.getAppointmentTime().toString()
            );
        } catch (Exception e) {
            System.err.println("Cancellation email failed: " + e.getMessage());
        }

        try {
            if (cancelledAppointment.getCalendarEventId() != null) {
                calenderService.deleteCalendarEvent(cancelledAppointment.getCalendarEventId());
            }
        } catch (Exception e) {
            System.err.println("Calendar deletion failed: " + e.getMessage());
        }

        return cancelledAppointment;
    }
}