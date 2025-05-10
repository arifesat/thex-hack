package com.izin_talebi.izin_talebi_spring.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "izinTalepleri")
public class IzinTalebi {
    @Id
    private String id;
    private Integer calisanId;
    private String requestTime;
    private String requestedDates;
    private String requestStatus;
    private String requestDesc;
} 