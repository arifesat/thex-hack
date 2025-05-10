package com.izin_talebi.izin_talebi_spring.repository;

import com.izin_talebi.izin_talebi_spring.model.IzinTalebi;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IzinTalebiRepository extends MongoRepository<IzinTalebi, String> {
    List<IzinTalebi> findByCalisanId(Integer calisanId);
    List<IzinTalebi> findByRequestStatus(String requestStatus);
} 