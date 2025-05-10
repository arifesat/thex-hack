package com.talenteer.leavemanagement.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "leave_requests")
public class LeaveRequest {
    @Id
    private String id;
    private String userId;
    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
    private LeaveStatus status;
    private String managerComment;
    private String openAiAnalysis;
    private Integer requestedDays;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public String getFormattedDateRange() {
        return String.format("%s-%s", 
            startDate.format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")),
            endDate.format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")));
    }
} 