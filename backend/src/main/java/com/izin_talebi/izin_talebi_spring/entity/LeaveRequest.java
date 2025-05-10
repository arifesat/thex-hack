package com.izin_talebi.izin_talebi_spring.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Document(collection = "leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    private String id;

    @DBRef
    private User user;

    @NotBlank(message = "İzin nedeni boş olamaz")
    @Size(max = 500, message = "İzin nedeni en fazla 500 karakter olabilir")
    private String reason;

    @NotNull(message = "Başlangıç tarihi boş olamaz")
    private LocalDate startDate;

    @NotNull(message = "Bitiş tarihi boş olamaz")
    private LocalDate endDate;

    @NotBlank(message = "Durum boş olamaz")
    private String status; // "PENDING", "APPROVED", "REJECTED"
}
