package com.navneet.health.controller;

import com.navneet.health.entity.User;
import com.navneet.health.service.AiService;
import com.navneet.health.service.CalenderService;
import com.navneet.health.service.EmailService;
import com.navneet.health.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final EmailService emailService;
    private final AiService aiService;
    private final CalenderService calenderService;

    @GetMapping("/test-calendar")
    public ResponseEntity<?> testCalendar(@RequestParam(required = false) String calendarId) {
        var result = calenderService.testCalendarIntegration(calendarId);
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @GetMapping("/test-ai")
    public ResponseEntity<?> testAi(@RequestParam(defaultValue = "fever, severe headache, and tiredness for 2 days") String symptoms) {
        try {
            String summary = aiService.generatePreVisitSummary(symptoms);
            return ResponseEntity.ok(java.util.Map.of(
                    "success", !summary.equals("Pre-visit summary unavailable."),
                    "symptoms", symptoms,
                    "summary", summary
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String to) {
        try {
            boolean success = emailService.sendEmail(
                    to,
                    "Healthcare App - Test Email",
                    "Hello!\n\nThis is a test email to verify your Brevo email configuration.\nIf you received this, Brevo is working perfectly!"
            );
            if (success) {
                return ResponseEntity.ok(java.util.Map.of(
                        "success", true,
                        "message", "Test email sent successfully to " + to
                ));
            } else {
                return ResponseEntity.badRequest().body(java.util.Map.of(
                        "success", false,
                        "message", "Failed to send email. Check Render server logs for exact error details from Brevo."
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = userService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(java.util.Map.of("token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        return ResponseEntity.badRequest().body(message);
    }
}