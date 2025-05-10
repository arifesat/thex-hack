package com.izin_talebi.izin_talebi_spring.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

//    @NotBlank(message = "Kullanıcı adı boş olamaz")
//    @Size(min = 3, max = 50, message = "Kullanıcı adı 3-50 karakter olmalı")
    private String username;

//    @NotBlank(message = "Şifre boş olamaz")
//    @Size(min = 6, message = "Şifre en az 6 karakter olmalı")
    private String password;

//    @NotBlank(message = "Rol boş olamaz")
    private String role; // "USER" veya "ADMIN"

    private List<LeaveRequest> leaveRequests;
}