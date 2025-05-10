package com.izin_talebi.izin_talebi_spring.controller;

import com.izin_talebi.izin_talebi_spring.model.IzinTalebi;
import com.izin_talebi.izin_talebi_spring.model.User;
import com.izin_talebi.izin_talebi_spring.service.IzinTalebiService;
import com.izin_talebi.izin_talebi_spring.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/izin-talepleri")
public class IzinTalebiController {

    private final IzinTalebiService izinTalebiService;
    private final UserService userService;

    @Autowired
    public IzinTalebiController(IzinTalebiService izinTalebiService, UserService userService) {
        this.izinTalebiService = izinTalebiService;
        this.userService = userService;
    }

    // İzin talebi oluştur
    @PostMapping
    @PreAuthorize("hasRole('Çalışan')")
    public ResponseEntity<?> createIzinTalebi(@RequestBody @Valid IzinTalebi izinTalebi,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        izinTalebi.setCalisanId(user.getCalisanId());
        IzinTalebi created = izinTalebiService.createIzinTalebi(izinTalebi);
        return ResponseEntity.ok(created);
    }

    // Kullanıcının kendi izin taleplerini listele
    @GetMapping
    public ResponseEntity<?> listIzinTalepleri(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        return ResponseEntity.ok(izinTalebiService.getIzinTalepleriByCalisanId(user.getCalisanId()));
    }

    // İzin talebini onayla (sadece admin)
    @PutMapping("/{id}/onayla")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> approveIzinTalebi(@PathVariable String id) {
        return izinTalebiService.approveIzinTalebi(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // İzin talebini reddet (sadece admin)
    @PutMapping("/{id}/reddet")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> rejectIzinTalebi(@PathVariable String id) {
        return izinTalebiService.rejectIzinTalebi(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 