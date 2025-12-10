package com.example.demo.controller;

import com.example.demo.entity.Driver;
import com.example.demo.repository.DriverRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriverController {

    private final DriverRepository driverRepository;

    public DriverController(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    // dtos
    public static class DriverRequest {
        public String firstName;
        public String lastName;
        public String status; // "Active" / "Inactive"
    }

    public static class DriverResponse {
        public Integer id;
        public String firstName;
        public String lastName;
        public String status;
    }

    private DriverResponse toResponse(Driver d) {
        DriverResponse dto = new DriverResponse();
        dto.id = d.getId();
        dto.firstName = d.getFirstName();
        dto.lastName = d.getLastName();
        dto.status = d.getStatus();
        return dto;
    }

    // apis and driver
    @GetMapping
    public List<DriverResponse> listDrivers() {
        return driverRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // apis and driver
    @PostMapping
    public ResponseEntity<?> createDriver(@RequestBody DriverRequest req) {

        if (req == null ||
                req.firstName == null || req.firstName.isBlank() ||
                req.lastName == null  || req.lastName.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing first or last name.");
        }

        String firstName = req.firstName.trim();
        String lastName  = req.lastName.trim();

        // check duplicate name
        boolean exists = driverRepository
                .findByFirstNameIgnoreCaseAndLastNameIgnoreCase(firstName, lastName)
                .isPresent();

        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Driver already exists.");
        }

        String status = (req.status == null || req.status.isBlank())
                ? "Active"
                : req.status;

        Driver driver = new Driver();
        driver.setFirstName(firstName);
        driver.setLastName(lastName);
        driver.setStatus(status);
        driver = driverRepository.save(driver);

        DriverResponse resp = toResponse(driver);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }
}
