package com.izin_talebi.izin_talebi_spring.repository;

import com.izin_talebi.izin_talebi_spring.model.LeaveRequest;
import com.izin_talebi.izin_talebi_spring.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByUser(User user);
    List<LeaveRequest> findByStatus(String status);
}