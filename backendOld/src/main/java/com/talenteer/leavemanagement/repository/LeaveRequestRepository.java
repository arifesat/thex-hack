package com.talenteer.leavemanagement.repository;

import com.talenteer.leavemanagement.model.LeaveRequest;
import com.talenteer.leavemanagement.model.LeaveStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByUserId(String userId);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByUserIdAndStatus(String userId, LeaveStatus status);
} 