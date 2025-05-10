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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );

            // Kullanıcıyı veritabanından al
            User user = userService.findByEmail(authRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

            // UserDetails nesnesini doğru şekilde oluştur
            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole()) // Eğer role bir String ise, bu şekilde kullanın
                    // .authorities(...) // Eğer GrantedAuthority listesi kullanıyorsanız
                    .build();

            // Token oluştur
            String token = jwtUtil.generateToken(userDetails);
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("E-posta veya şifre hatalı");
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
            return ResponseEntity.ok("Veritabanı bağlantısı başarılı. Toplam kullanıcı sayısı: " + userCount);
        } catch (Exception e) {
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