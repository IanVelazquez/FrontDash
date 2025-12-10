package com.example.demo.controller;

import com.example.demo.entity.Login;
import com.example.demo.entity.Staff;
import com.example.demo.repository.LoginRepository;
import com.example.demo.repository.StaffRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(
        origins = "http://127.0.0.1:3000",
        allowCredentials = "true"
)
public class StaffController {

    private final StaffRepository staffRepository;
    private final LoginRepository loginRepository;

    public StaffController(StaffRepository staffRepository, LoginRepository loginRepository) {
        this.staffRepository = staffRepository;
        this.loginRepository = loginRepository;
    }

    // staff dtos

    public static class StaffCreateRequest {
        public String firstName;
        public String lastName;
        public String email;
    }

    public static class StaffResponse {
        public Integer id;
        public String firstName;
        public String lastName;
        public String username;
        public String email;
        public String status;
    }

    private StaffResponse toResponse(Staff s) {
        StaffResponse r = new StaffResponse();
        r.id = s.getId();
        r.firstName = s.getFirstName();
        r.lastName = s.getLastName();
        r.username = s.getUsername();
        r.email = s.getEmail();
        r.status = s.getStatus();
        return r;
    }

    // get all staff

    @GetMapping
    public List<StaffResponse> listStaff() {
        return staffRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // create new staff + login

    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody StaffCreateRequest req) {
        try {
            if (req == null
                    || req.firstName == null || req.firstName.isBlank()
                    || req.lastName == null || req.lastName.isBlank()
                    || req.email == null || req.email.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Missing firstName, lastName, or email.");
            }

            String firstName = req.firstName.trim();
            String lastName = req.lastName.trim();
            String email = req.email.trim();

            // check last name
            if (!Pattern.compile("^[A-Za-z]{2,}$").matcher(lastName).matches()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Last name must have at least two letters (A–Z).");
            }

            // basic email check
            if (!email.contains("@") || !email.contains(".")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Email looks invalid.");
            }

            // build username base from last name
            String base = lastName.toLowerCase(Locale.ROOT).replaceAll("[^a-z]", "");
            if (base.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Could not derive username base from last name.");
            }

            String username = generateUniqueUsername(base);
            if (username == null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Could not generate a unique username.");
            }

            // make staff row
            Staff staff = new Staff();
            staff.setFirstName(firstName);
            staff.setLastName(lastName);
            staff.setEmail(email);
            staff.setUsername(username);
            staff.setStatus("Active");

            Staff saved = staffRepository.save(staff);

            // make login row
            Login login = new Login();
            login.setUsername(username);
            login.setPassword("Abcd123!");   // default password
            login.setRole("staff");
            login.setLoginCount(0);
            login.setMustChangePw(true);
            login.setLastLogin((LocalDateTime) null);

            loginRepository.save(login);

            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating staff: " + ex.getMessage());
        }
    }

    // change password stuff

    public static class ChangePasswordRequest {
        public String oldPassword;
        public String newPassword;
    }

    @PostMapping("/{username}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable String username,
            @RequestBody ChangePasswordRequest req) {

        if (req == null || req.oldPassword == null || req.newPassword == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing oldPassword or newPassword.");
        }

        Optional<Login> loginOpt = loginRepository.findById(username);
        if (loginOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        Login login = loginOpt.get();

        // check old password
        if (!login.getPassword().equals(req.oldPassword)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Old password incorrect.");
        }

        // quick new password rule
        if (req.newPassword.length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("New password must be at least 6 characters.");
        }

        // save new password
        login.setPassword(req.newPassword);
        login.setMustChangePw(false);
        loginRepository.save(login);

        return ResponseEntity.ok("Password updated.");
    }

    // username helper

    private String generateUniqueUsername(String base) {

        // random tries first
        for (int i = 0; i < 20; i++) {
            int n = (int) (Math.random() * 100);
            String candidate = base + String.format("%02d", n);
            if (!loginRepository.existsById(candidate)) return candidate;
        }

        // fallback loop if random fails
        for (int i = 0; i < 100; i++) {
            String candidate = base + String.format("%02d", i);
            if (!loginRepository.existsById(candidate)) return candidate;
        }

        return null;
    }
}
