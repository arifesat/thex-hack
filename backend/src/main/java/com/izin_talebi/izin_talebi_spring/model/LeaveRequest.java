package com.izin_talebi.izin_talebi_spring.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDate;

@Data
@Document(collection = "leave_requests")
public class LeaveRequest {
    @Id
    private String id;
    
    @DBRef
    private User user;
    
    private LocalDate startDate;
    private LocalDate endDate;
    private String type; // YILLIK, MAZERET, HASTALIK vs.
    private String status; // BEKLEMEDE, ONAYLANDI, REDDEDILDI
    private String description;
    private LocalDate createdAt;
    private LocalDate updatedAt;
} 