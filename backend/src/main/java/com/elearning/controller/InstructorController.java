package com.elearning.controller;

import com.elearning.dto.CourseRequest;
import com.elearning.dto.CourseResponse;
import com.elearning.dto.MessageResponse;
import com.elearning.model.Course;
import com.elearning.model.User;
import com.elearning.repository.CourseRepository;
import com.elearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    
    @Autowired
    private CourseRepository courseRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getInstructorDashboard() {
        return ResponseEntity.ok(new MessageResponse("Instructor Dashboard Data"));
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getInstructorCourses(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            List<Course> courses = courseRepository.findByInstructor(user);
            
            List<CourseResponse> response = courses.stream()
                .map(course -> new CourseResponse(
                    course.getId(),
                    course.getTitle(),
                    course.getDescription(),
                    course.getImageUrl(),
                    course.getCategory(),
                    course.getInstructor().getId(),
                    course.getInstructor().getFullName(),
                    course.getCreatedAt(),
                    course.getUpdatedAt()
                ))
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
    
    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CourseRequest courseRequest) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            Course newCourse = new Course();
            newCourse.setTitle(courseRequest.getTitle());
            newCourse.setDescription(courseRequest.getDescription());
            newCourse.setImageUrl(courseRequest.getImageUrl());
            newCourse.setCategory(courseRequest.getCategory());
            newCourse.setInstructor(user);
            
            Course savedCourse = courseRepository.save(newCourse);
            
            CourseResponse response = new CourseResponse(
                savedCourse.getId(),
                savedCourse.getTitle(),
                savedCourse.getDescription(),
                savedCourse.getImageUrl(),
                savedCourse.getCategory(),
                savedCourse.getInstructor().getId(),
                savedCourse.getInstructor().getFullName(),
                savedCourse.getCreatedAt(),
                savedCourse.getUpdatedAt()
            );
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
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