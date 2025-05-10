package com.izin_talebi.izin_talebi_spring.service;

import com.izin_talebi.izin_talebi_spring.model.LeaveRequest;
import com.izin_talebi.izin_talebi_spring.model.User;
import com.izin_talebi.izin_talebi_spring.repository.LeaveRequestRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;

    @Autowired
    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
    }

    // İzin talebi oluştur
    @Transactional
    public LeaveRequest createLeaveRequest(User user, LeaveRequest leaveRequest) {
        leaveRequest.setUser(user);
        leaveRequest.setStatus("PENDING");
        return leaveRequestRepository.save(leaveRequest);
    }

    // Tüm izin taleplerini getir
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    // Kullanıcıya ait izin taleplerini getir
    public List<LeaveRequest> getLeaveRequestsByUser(User user) {
        return leaveRequestRepository.findByUser(user);
    }

    // İzin talebini ID ile bul
    public Optional<LeaveRequest> getLeaveRequestById(String id) {
        return leaveRequestRepository.findById(id);
    }

    // İzin talebini onayla
    @Transactional
    public Optional<LeaveRequest> approveLeaveRequest(String id) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestRepository.findById(id);
        leaveRequestOpt.ifPresent(lr -> {
            lr.setStatus("APPROVED");
            leaveRequestRepository.save(lr);
        });
        return leaveRequestOpt;
    }

    // İzin talebini reddet
    @Transactional
    public Optional<LeaveRequest> rejectLeaveRequest(String id) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestRepository.findById(id);
        leaveRequestOpt.ifPresent(lr -> {
            lr.setStatus("REJECTED");
            leaveRequestRepository.save(lr);
        });
        return leaveRequestOpt;
    }

    // Belirli bir durumdaki izin taleplerini getir (opsiyonel)
    public List<LeaveRequest> getLeaveRequestsByStatus(String status) {
        return leaveRequestRepository.findByStatus(status);
    }
}