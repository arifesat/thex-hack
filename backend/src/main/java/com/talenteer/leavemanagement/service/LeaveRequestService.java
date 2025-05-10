package com.talenteer.leavemanagement.service;

import com.talenteer.leavemanagement.model.LeaveRequest;
import com.talenteer.leavemanagement.model.LeaveStatus;
import com.talenteer.leavemanagement.model.User;
import com.talenteer.leavemanagement.repository.LeaveRequestRepository;
import com.talenteer.leavemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final OpenAIService openAIService;

    @Transactional
    public LeaveRequest createLeaveRequest(LeaveRequest leaveRequest) {
        // Calculate requested days
        long days = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
        leaveRequest.setRequestedDays((int) days);

        // Check if user has enough leave days
        User user = userRepository.findById(leaveRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRemainingLeaveDays() < days) {
            throw new RuntimeException("Not enough leave days remaining");
        }

        leaveRequest.setStatus(LeaveStatus.PENDING);
        String analysis = openAIService.analyzeLeaveRequest(leaveRequest.getReason());
        leaveRequest.setOpenAiAnalysis(analysis);
        return leaveRequestRepository.save(leaveRequest);
    }

    @Transactional
    public LeaveRequest updateLeaveRequestStatus(String id, LeaveStatus status, String managerComment) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));
        
        User user = userRepository.findById(leaveRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If status is changing from PENDING to APPROVED, update user's leave balance
        if (leaveRequest.getStatus() == LeaveStatus.PENDING && status == LeaveStatus.APPROVED) {
            user.setUsedLeaveDays(user.getUsedLeaveDays() + leaveRequest.getRequestedDays());
            user.setRemainingLeaveDays(user.getRemainingLeaveDays() - leaveRequest.getRequestedDays());
            userRepository.save(user);
        }
        
        leaveRequest.setStatus(status);
        leaveRequest.setManagerComment(managerComment);
        return leaveRequestRepository.save(leaveRequest);
    }

    public List<LeaveRequest> getLeaveRequestsByUserId(String userId) {
        return leaveRequestRepository.findByUserId(userId);
    }

    public List<LeaveRequest> getLeaveRequestsByStatus(LeaveStatus status) {
        return leaveRequestRepository.findByStatus(status);
    }

    public LeaveRequest getLeaveRequestById(String id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));
    }
} 