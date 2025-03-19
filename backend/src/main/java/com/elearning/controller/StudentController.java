package com.elearning.controller;

import com.elearning.dto.CourseResponse;
import com.elearning.dto.EnrollmentRequest;
import com.elearning.dto.MessageResponse;
import com.elearning.model.Course;
import com.elearning.model.Enrollment;
import com.elearning.model.User;
import com.elearning.repository.CourseRepository;
import com.elearning.repository.EnrollmentRepository;
import com.elearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAuthority('ROLE_STUDENT')")
public class StudentController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getStudentDashboard() {
        return ResponseEntity.ok(new MessageResponse("Student Dashboard Data"));
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getStudentCourses() {
        List<Course> allCourses = courseRepository.findAll();
        
        List<CourseResponse> courseResponses = allCourses.stream()
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
            
        return ResponseEntity.ok(courseResponses);
    }
    
    @GetMapping("/enrolled-courses")
    public ResponseEntity<?> getEnrolledCourses(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());
        
        if (userOpt.isPresent()) {
            User student = userOpt.get();
            List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
            
            List<CourseResponse> courseResponses = enrollments.stream()
                .map(enrollment -> {
                    Course course = enrollment.getCourse();
                    return new CourseResponse(
                        course.getId(),
                        course.getTitle(),
                        course.getDescription(),
                        course.getImageUrl(),
                        course.getCategory(),
                        course.getInstructor().getId(),
                        course.getInstructor().getFullName(),
                        course.getCreatedAt(),
                        course.getUpdatedAt()
                    );
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(courseResponses);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
    
    @PostMapping("/enroll")
    public ResponseEntity<?> enrollInCourse(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody EnrollmentRequest enrollmentRequest) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());
        
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        User student = userOpt.get();
        Long courseId = enrollmentRequest.getCourseId();
        
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        
        if (!courseOpt.isPresent()) {
            return ResponseEntity.status(404).body("Course not found");
        }
        
        Course course = courseOpt.get();
        
        // Check if already enrolled
        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            return ResponseEntity.badRequest().body(new MessageResponse("You are already enrolled in this course"));
        }
        
        // Create enrollment
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        
        enrollmentRepository.save(enrollment);
        
        return ResponseEntity.ok(new MessageResponse("Successfully enrolled in course: " + course.getTitle()));
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
            response.put("phoneNumber", userData.getPhoneNumber());
            response.put("roles", userData.getRoles());
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}