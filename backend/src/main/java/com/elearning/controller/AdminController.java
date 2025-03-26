package com.elearning.controller;

import com.elearning.model.User;
import com.elearning.model.Role;
import com.elearning.model.Course;
import com.elearning.model.CourseStatus;
import com.elearning.repository.UserRepository;
import com.elearning.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            List<User> allUsers = userRepository.findAll();
            long totalStudents = allUsers.stream()
                    .filter(user -> user.getRoles().contains(Role.ROLE_STUDENT.name()))
                    .count();
            long totalInstructors = allUsers.stream()
                    .filter(user -> user.getRoles().contains(Role.ROLE_INSTRUCTOR.name()))
                    .count();
            long totalCourses = courseRepository.countByStatus(CourseStatus.APPROVED);
            long pendingCourses = courseRepository.countByStatus(CourseStatus.PENDING);

            Map<String, Long> stats = new HashMap<>();
            stats.put("totalStudents", totalStudents);
            stats.put("totalInstructors", totalInstructors);
            stats.put("totalCourses", totalCourses);
            stats.put("pendingCourses", pendingCourses);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching stats: " + e.getMessage());
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        try {
            List<User> students = userRepository.findAll().stream()
                    .filter(user -> user.getRoles().contains("ROLE_STUDENT"))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching students: " + e.getMessage());
        }
    }

    @GetMapping("/instructors")
    public ResponseEntity<?> getAllInstructors() {
        try {
            List<User> instructors = userRepository.findAll().stream()
                    .filter(user -> user.getRoles().contains("ROLE_INSTRUCTOR"))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(instructors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching instructors: " + e.getMessage());
        }
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<?> getStudentDetails(@PathVariable Long id) {
        try {
            User student = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (!student.getRoles().contains("ROLE_STUDENT")) {
                return ResponseEntity.badRequest().body("User is not a student");
            }

            return ResponseEntity.ok(student);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching student details: " + e.getMessage());
        }
    }

    @GetMapping("/instructor/{id}")
    public ResponseEntity<?> getInstructorDetails(@PathVariable Long id) {
        try {
            User instructor = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));

            if (!instructor.getRoles().contains("ROLE_INSTRUCTOR")) {
                return ResponseEntity.badRequest().body("User is not an instructor");
            }

            return ResponseEntity.ok(instructor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching instructor details: " + e.getMessage());
        }
    }

    @PutMapping("/student/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody User updatedStudent) {
        try {
            User student = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (!student.getRoles().contains("ROLE_STUDENT")) {
                return ResponseEntity.badRequest().body("User is not a student");
            }

            // Update student details
            student.setFullName(updatedStudent.getFullName());
            student.setEmail(updatedStudent.getEmail());
            student.setPhoneNumber(updatedStudent.getPhoneNumber());
            student.setUserType(updatedStudent.getUserType());

            User savedStudent = userRepository.save(student);
            return ResponseEntity.ok(savedStudent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating student: " + e.getMessage());
        }
    }

    @PutMapping("/instructor/{id}")
    public ResponseEntity<?> updateInstructor(@PathVariable Long id, @RequestBody User updatedInstructor) {
        try {
            User instructor = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));

            if (!instructor.getRoles().contains("ROLE_INSTRUCTOR")) {
                return ResponseEntity.badRequest().body("User is not an instructor");
            }

            // Update instructor details
            instructor.setFullName(updatedInstructor.getFullName());
            instructor.setEmail(updatedInstructor.getEmail());
            instructor.setPhoneNumber(updatedInstructor.getPhoneNumber());

            User savedInstructor = userRepository.save(instructor);
            return ResponseEntity.ok(savedInstructor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating instructor: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            User admin = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            if (!admin.getRoles().contains("ROLE_ADMIN")) {
                return ResponseEntity.badRequest().body("User is not an admin");
            }

            return ResponseEntity.ok(admin);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching admin profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody User updatedAdmin) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            User admin = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            if (!admin.getRoles().contains("ROLE_ADMIN")) {
                return ResponseEntity.badRequest().body("User is not an admin");
            }

            // Update admin details
            admin.setFullName(updatedAdmin.getFullName());
            admin.setEmail(updatedAdmin.getEmail());
            admin.setPhoneNumber(updatedAdmin.getPhoneNumber());

            User savedAdmin = userRepository.save(admin);
            return ResponseEntity.ok(savedAdmin);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating admin profile: " + e.getMessage());
        }
    }

    @GetMapping("/pending-courses")
    public ResponseEntity<?> getPendingCourses() {
        try {
            List<Course> pendingCourses = courseRepository.findByStatus(CourseStatus.PENDING);
            return ResponseEntity.ok(pendingCourses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching pending courses: " + e.getMessage());
        }
    }

    @PostMapping("/courses/{courseId}/approve")
    public ResponseEntity<?> approveCourse(@PathVariable Long courseId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            course.setStatus(CourseStatus.APPROVED);
            Course updatedCourse = courseRepository.save(course);

            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error approving course: " + e.getMessage());
        }
    }

    @PostMapping("/courses/{courseId}/reject")
    public ResponseEntity<?> rejectCourse(@PathVariable Long courseId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            course.setStatus(CourseStatus.REJECTED);
            Course updatedCourse = courseRepository.save(course);

            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error rejecting course: " + e.getMessage());
        }
    }
}