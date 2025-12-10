package com.example.demo.controller;

import com.example.demo.entity.Login;
import com.example.demo.entity.Staff;
import com.example.demo.repository.LoginRepository;
import com.example.demo.repository.StaffRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://127.0.0.1:3000",
        allowCredentials = "true"
)
public class AuthController {

    private final LoginRepository loginRepository;
    private final StaffRepository staffRepository;

    public AuthController(LoginRepository loginRepository,
                          StaffRepository staffRepository) {
        this.loginRepository = loginRepository;
        this.staffRepository = staffRepository;
    }

    // dto

    public static class LoginRequest {
        public String username;
        public String password;
        public String role;
    }

    public static class LoginResponse {
        public String username;
        public String role;          // admin or staff
        public Integer staffId;      // null for admins
        public String firstName;
        public String lastName;
        public String status;
    }

    // api auth and login

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        if (req == null ||
                req.username == null || req.username.isBlank() ||
                req.password == null || req.password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing username or password.");
        }

        String uname = req.username.trim().toLowerCase(Locale.ROOT);

        Optional<Login> loginOpt = loginRepository.findById(uname);
        if (loginOpt.isEmpty()) {
            // no such username
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");
        }

        Login login = loginOpt.get();

        // password check
        if (!login.getPassword().equals(req.password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");
        }

        String actualRole = (login.getRole() == null)
                ? "staff"
                : login.getRole().toLowerCase(Locale.ROOT);

        // wrong role check
        if (req.role != null && !req.role.isBlank()) {
            String requestedRole = req.role.trim().toLowerCase(Locale.ROOT);
            if (!requestedRole.equals(actualRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Not authorized for this role.");
            }
        }

        LoginResponse resp = new LoginResponse();
        resp.username = login.getUsername();
        resp.role = actualRole;

        //  attach staff info and set active
        if (!"admin".equals(actualRole)) {
            Optional<Staff> staffOpt = staffRepository.findByUsername(uname);
            if (staffOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Staff record not found.");
            }

            Staff staff = staffOpt.get();
            resp.staffId = staff.getId();
            resp.firstName = staff.getFirstName();
            resp.lastName = staff.getLastName();
            resp.status = staff.getStatus();

            // on login allowed ata  time
            if (!"active".equalsIgnoreCase(staff.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Staff member is inactive.");
            }
        }

        return ResponseEntity.ok(resp);
    }
}
