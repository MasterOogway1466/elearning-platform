package com.elearning.controller;

import com.elearning.dto.MessageResponse;
import com.elearning.model.User;
import com.elearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/instructor")
@PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
public class InstructorController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getInstructorDashboard() {
        return ResponseEntity.ok(new MessageResponse("Instructor Dashboard Data"));
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getInstructorCourses() {
        return ResponseEntity.ok(new MessageResponse("Instructor Courses"));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getInstructorStudents() {
        return ResponseEntity.ok(new MessageResponse("Instructor Students"));
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getInstructorAssignments() {
        return ResponseEntity.ok(new MessageResponse("Instructor Assignments"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getInstructorAnalytics() {
        return ResponseEntity.ok(new MessageResponse("Instructor Analytics"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<User> user = userRepository.findByUsername(userDetails.getUsername());

        if (user.isPresent()) {
            User userData = user.get();
            Map<String, Object> response = new HashMap<>();
            response.put("username", userData.getUsername());
            response.put("email", userData.getEmail());
            response.put("fullName", userData.getFullName());
            response.put("roles", userData.getRoles());
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}