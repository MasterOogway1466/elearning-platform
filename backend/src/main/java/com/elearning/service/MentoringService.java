package com.elearning.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elearning.dto.MentoringSessionDTO;
import com.elearning.model.MentoringSession;
import com.elearning.repository.MentoringSessionRepository;

@Service
public class MentoringService {

    @Autowired
    private MentoringSessionRepository mentoringSessionRepository;

    // Admin methods
    public List<MentoringSessionDTO> getAllMentoringSessions() {
        List<MentoringSession> sessions = mentoringSessionRepository.findAll();
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long countAllSessions() {
        return mentoringSessionRepository.count();
    }

    // Helper methods
    private MentoringSessionDTO convertToDTO(MentoringSession session) {
        MentoringSessionDTO dto = new MentoringSessionDTO();
        dto.setId(session.getId());
        dto.setTopic(session.getTopic());
        dto.setDescription(session.getDescription());
        dto.setStatus(session.getStatus().name());
        dto.setSessionDate(session.getSessionDate());
        dto.setNotes(session.getNotes());

        // Handle timestamp fields safely using reflection
        try {
            // Check if the entity has these methods
            if (hasMethod(session.getClass(), "getCreatedAt")) {
                try {
                    java.lang.reflect.Method method = session.getClass().getMethod("getCreatedAt");
                    Object value = method.invoke(session);
                    if (value instanceof java.time.LocalDateTime) {
                        dto.setCreatedAt((java.time.LocalDateTime) value);
                    }
                } catch (Exception e) {
                    // Method invocation failed
                }
            }

            if (hasMethod(session.getClass(), "getUpdatedAt")) {
                try {
                    java.lang.reflect.Method method = session.getClass().getMethod("getUpdatedAt");
                    Object value = method.invoke(session);
                    if (value instanceof java.time.LocalDateTime) {
                        dto.setUpdatedAt((java.time.LocalDateTime) value);
                    }
                } catch (Exception e) {
                    // Method invocation failed
                }
            }
        } catch (Exception e) {
            // If methods don't exist, set current time as fallback
            dto.setCreatedAt(java.time.LocalDateTime.now());
            dto.setUpdatedAt(java.time.LocalDateTime.now());
        }

        // Set student name
        if (session.getStudent() != null) {
            dto.setStudentId(session.getStudent().getId());
            dto.setStudentName(session.getStudent().getFullName());
        }

        // Set instructor name
        if (session.getInstructor() != null) {
            dto.setInstructorId(session.getInstructor().getId());
            dto.setInstructorName(session.getInstructor().getFullName());
        }

        // Set course name
        if (session.getCourse() != null) {
            dto.setCourseId(session.getCourse().getId());
            dto.setCourseName(session.getCourse().getTitle());
        }

        return dto;
    }

    // Helper method to check if a method exists
    private boolean hasMethod(Class<?> clazz, String methodName) {
        try {
            return clazz.getMethod(methodName) != null;
        } catch (NoSuchMethodException e) {
            return false;
        }
    }
}