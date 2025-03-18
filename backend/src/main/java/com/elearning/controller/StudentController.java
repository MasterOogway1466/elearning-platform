package com.elearning.controller;

import com.elearning.dto.MessageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAuthority('ROLE_STUDENT')")
public class StudentController {

    @GetMapping("/dashboard")
    public ResponseEntity<?> getStudentDashboard() {
        return ResponseEntity.ok(new MessageResponse("Student Dashboard Data"));
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getStudentCourses() {
        return ResponseEntity.ok(new MessageResponse("Student Courses"));
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getStudentAssignments() {
        return ResponseEntity.ok(new MessageResponse("Student Assignments"));
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getStudentProgress() {
        return ResponseEntity.ok(new MessageResponse("Student Progress"));
    }

    @GetMapping("/certificates")
    public ResponseEntity<?> getStudentCertificates() {
        return ResponseEntity.ok(new MessageResponse("Student Certificates"));
    }
}