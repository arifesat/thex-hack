package com.izin_talebi.izin_talebi_spring.controller;

import com.izin_talebi.izin_talebi_spring.model.User;
import com.izin_talebi.izin_talebi_spring.service.UserService;
import com.izin_talebi.izin_talebi_spring.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // Kullanıcı girişi (JWT token döner)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid AuthRequest authRequest) {
        try {
            logger.debug("Login attempt for email: {}", authRequest.getEmail());
            logger.debug("Attempting to authenticate with password length: {}", authRequest.getPassword() != null ? authRequest.getPassword().length() : 0);
            
            // Kullanıcıyı veritabanından al ve kontrol et
            User user = userService.findByEmail(authRequest.getEmail())
                    .orElseThrow(() -> {
                        logger.error("User not found for email: {}", authRequest.getEmail());
                        return new RuntimeException("Kullanıcı bulunamadı");
                    });
            
            logger.debug("User found in database: {}", user.getAdSoyad());
            logger.debug("User role: {}", user.getRole());
            logger.debug("User enabled status: {}", user.isEnabled());

            // Authentication denemesi
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
            
            logger.debug("Authentication successful for user: {}", user.getEmail());

            // UserDetails nesnesini oluştur
            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole())
                    .build();

            // Token oluştur
            String token = jwtUtil.generateToken(userDetails);
            logger.debug("Token generated successfully for user: {}", user.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            logger.error("Authentication failed for email: {}", authRequest.getEmail(), e);
            logger.error("Authentication error details: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "E-posta veya şifre hatalı");
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error during login", e);
            logger.error("Error details: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Giriş işlemi sırasında bir hata oluştu");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Kullanıcı kaydı
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest registerRequest) {
        if (userService.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Bu e-posta adresi zaten kayıtlı.");
        }
        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(registerRequest.getPassword())
                .adSoyad(registerRequest.getAdSoyad())
                .pozisyon(registerRequest.getPozisyon())
                .calisanId(registerRequest.getCalisanId())
                .role(registerRequest.getRole() == null ? "USER" : registerRequest.getRole())
                .build();
        userService.registerUser(user);
        return ResponseEntity.ok("Kayıt başarılı!");
    }

    // Debug endpoint - sadece geliştirme aşamasında kullanın
    @GetMapping("/debug/user/{email}")
    public ResponseEntity<?> debugUser(@PathVariable String email) {
        return userService.findByEmail(email)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    // Test endpoint - veritabanı bağlantısını kontrol etmek için
    @GetMapping("/test/db")
    public ResponseEntity<?> testDatabase() {
        try {
            long userCount = userService.findAll().spliterator().getExactSizeIfKnown();
            logger.debug("Database connection successful. Total user count: {}", userCount);
            return ResponseEntity.ok("Veritabanı bağlantısı başarılı. Toplam kullanıcı sayısı: " + userCount);
        } catch (Exception e) {
            logger.error("Database connection error", e);
            return ResponseEntity.status(500).body("Veritabanı bağlantı hatası: " + e.getMessage());
        }
    }

    // DTO'lar
    public static class AuthRequest {
        private String email;
        private String password;
        // getter/setter
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        public AuthResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public static class RegisterRequest {
        private String email;
        private String password;
        private String adSoyad;
        private String pozisyon;
        //private String unvan;
        private Integer calisanId;
        private String role; // opsiyonel, default USER
        // getter/setter
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getAdSoyad() { return adSoyad; }
        public void setAdSoyad(String adSoyad) { this.adSoyad = adSoyad; }
        public String getPozisyon() { return pozisyon; }
        public void setPozisyon(String pozisyon) { this.pozisyon = pozisyon; }
        public Integer getCalisanId() { return calisanId; }
        public void setCalisanId(Integer calisanId) { this.calisanId = calisanId; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}