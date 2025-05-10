package com.talenteer.leavemanagement.controller;

import com.talenteer.leavemanagement.model.LeaveRequest;
import com.talenteer.leavemanagement.model.LeaveStatus;
import com.talenteer.leavemanagement.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping
    public ResponseEntity<LeaveRequest> createLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        return ResponseEntity.ok(leaveRequestService.createLeaveRequest(leaveRequest));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<LeaveRequest> updateLeaveRequestStatus(
            @PathVariable String id,
            @RequestParam LeaveStatus status,
            @RequestParam(required = false) String managerComment) {
        return ResponseEntity.ok(leaveRequestService.updateLeaveRequestStatus(id, status, managerComment));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByUserId(userId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByStatus(@PathVariable LeaveStatus status) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable String id) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestById(id));
    }
} 