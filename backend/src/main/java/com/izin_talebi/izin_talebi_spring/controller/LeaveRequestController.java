package com.izin_talebi.izin_talebi_spring.controller;

import com.izin_talebi.izin_talebi_spring.model.LeaveRequest;
import com.izin_talebi.izin_talebi_spring.model.User;
import com.izin_talebi.izin_talebi_spring.service.LeaveRequestService;
import com.izin_talebi.izin_talebi_spring.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final UserService userService;

    @Autowired
    public LeaveRequestController(LeaveRequestService leaveRequestService, UserService userService) {
        this.leaveRequestService = leaveRequestService;
        this.userService = userService;
    }

    // Kullanıcı izin talebi oluşturur
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createLeaveRequest(@RequestBody @Valid LeaveRequest request,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userService.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Kullanıcı bulunamadı");
        }
        LeaveRequest created = leaveRequestService.createLeaveRequest(userOpt.get(), request);
        return ResponseEntity.ok(created);
    }

    // Tüm izin taleplerini listele (admin veya user kendi taleplerini görebilir)
    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> listLeaveRequests(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userService.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Kullanıcı bulunamadı");
        }
        User user = userOpt.get();
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
        } else {
            return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByUser(user));
        }
    }

    // İzin talebini onayla (sadece admin)
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveLeaveRequest(@PathVariable String id) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestService.approveLeaveRequest(id);
        return leaveRequestOpt
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // İzin talebini reddet (sadece admin)
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectLeaveRequest(@PathVariable String id) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestService.rejectLeaveRequest(id);
        return leaveRequestOpt
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}