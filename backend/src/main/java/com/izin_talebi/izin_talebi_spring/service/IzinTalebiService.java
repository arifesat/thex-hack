package com.izin_talebi.izin_talebi_spring.service;

import com.izin_talebi.izin_talebi_spring.model.IzinTalebi;
import com.izin_talebi.izin_talebi_spring.model.User;
import com.izin_talebi.izin_talebi_spring.repository.IzinTalebiRepository;
import com.izin_talebi.izin_talebi_spring.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IzinTalebiService {

    private final IzinTalebiRepository izinTalebiRepository;
    private final UserRepository userRepository;

    @Autowired
    public IzinTalebiService(IzinTalebiRepository izinTalebiRepository, UserRepository userRepository) {
        this.izinTalebiRepository = izinTalebiRepository;
        this.userRepository = userRepository;
    }

    // İzin talebi oluştur
    @Transactional
    public IzinTalebi createIzinTalebi(IzinTalebi izinTalebi) {
        izinTalebi.setRequestStatus("Bekliyor");
        return izinTalebiRepository.save(izinTalebi);
    }

    // Tüm izin taleplerini getir
    public List<IzinTalebi> getAllIzinTalepleri() {
        return izinTalebiRepository.findAll();
    }

    // Çalışana ait izin taleplerini getir
    public List<IzinTalebi> getIzinTalepleriByCalisanId(Integer calisanId) {
        return izinTalebiRepository.findByCalisanId(calisanId);
    }

    // İzin talebini ID ile bul
    public Optional<IzinTalebi> getIzinTalebiById(String id) {
        return izinTalebiRepository.findById(id);
    }

    // İzin talebini onayla
    @Transactional
    public Optional<IzinTalebi> approveIzinTalebi(String id) {
        Optional<IzinTalebi> izinTalebiOpt = izinTalebiRepository.findById(id);
        izinTalebiOpt.ifPresent(iz -> {
            iz.setRequestStatus("Onaylandı");
            izinTalebiRepository.save(iz);
            
            // Çalışanın kalan izin günlerini güncelle
            userRepository.findByCalisanId(iz.getCalisanId()).ifPresent(user -> {
                // Tarih aralığından gün sayısını hesapla
                String[] dates = iz.getRequestedDates().split("-");
                // Basit bir hesaplama - gerçek uygulamada daha detaylı hesaplama yapılmalı
                int days = 5; // Örnek olarak 5 gün
                
                user.setUsedDays(user.getUsedDays() + days);
                user.setRemainingDays(user.getRemainingDays() - days);
                userRepository.save(user);
            });
        });
        return izinTalebiOpt;
    }

    // İzin talebini reddet
    @Transactional
    public Optional<IzinTalebi> rejectIzinTalebi(String id) {
        Optional<IzinTalebi> izinTalebiOpt = izinTalebiRepository.findById(id);
        izinTalebiOpt.ifPresent(iz -> {
            iz.setRequestStatus("Reddedildi");
            izinTalebiRepository.save(iz);
        });
        return izinTalebiOpt;
    }
} 