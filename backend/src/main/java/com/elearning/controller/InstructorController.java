package com.elearning.controller;

import com.elearning.dto.CourseRequest;
import com.elearning.dto.CourseResponse;
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
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;

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
            response.put("phoneNumber", userData.getPhoneNumber());
            response.put("roles", userData.getRoles());
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<?> getCourseEnrolledStudents(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());
        
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        User instructor = userOpt.get();
        
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        
        if (!courseOpt.isPresent()) {
            return ResponseEntity.status(404).body("Course not found");
        }
        
        Course course = courseOpt.get();
        
        // Check if the instructor is the owner of this course
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to view students for this course");
        }
        
        // Get all enrollments for this course
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        
        // Map to student details to return
        List<Map<String, Object>> studentDetails = enrollments.stream()
            .map(enrollment -> {
                User student = enrollment.getStudent();
                Map<String, Object> details = new HashMap<>();
                details.put("id", student.getId());
                details.put("username", student.getUsername());
                details.put("email", student.getEmail());
                details.put("fullName", student.getFullName());
                details.put("phoneNumber", student.getPhoneNumber());
                details.put("enrolledAt", enrollment.getEnrolledAt());
                return details;
            })
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(studentDetails);
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long courseId,
            @RequestBody CourseRequest courseRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());
        
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        User instructor = userOpt.get();
        
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        
        if (!courseOpt.isPresent()) {
            return ResponseEntity.status(404).body("Course not found");
        }
        
        Course course = courseOpt.get();
        
        // Check if the instructor is the owner of this course
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to update this course");
        }
        
        // Update course details
        course.setTitle(courseRequest.getTitle());
        course.setDescription(courseRequest.getDescription());
        course.setImageUrl(courseRequest.getImageUrl());
        course.setCategory(courseRequest.getCategory());
        
        Course updatedCourse = courseRepository.save(course);
        
        CourseResponse response = new CourseResponse(
            updatedCourse.getId(),
            updatedCourse.getTitle(),
            updatedCourse.getDescription(),
            updatedCourse.getImageUrl(),
            updatedCourse.getCategory(),
            updatedCourse.getInstructor().getId(),
            updatedCourse.getInstructor().getFullName(),
            updatedCourse.getCreatedAt(),
            updatedCourse.getUpdatedAt()
        );
        
        return ResponseEntity.ok(response);
    }
}