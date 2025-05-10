package com.izin_talebi.izin_talebi_spring.config;

import com.izin_talebi.izin_talebi_spring.model.User;
import com.izin_talebi.izin_talebi_spring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Autowired
    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // Veritabanındaki tüm kullanıcıları listele
        System.out.println("Veritabanındaki çalışanlar:");
        userRepository.findAll().forEach(user -> {
            System.out.println("ID: " + user.getId());
            System.out.println("Çalışan ID: " + user.getCalisanId());
            System.out.println("Ad Soyad: " + user.getAdSoyad());
            System.out.println("E-posta: " + user.getEmail());
            System.out.println("Pozisyon: " + user.getPozisyon());
            System.out.println("Rol: " + user.getRole());
            System.out.println("------------------------");
        });

        // Mevcut kullanıcıları güncelle
        userRepository.findAll().forEach(user -> {
            // Eğer kullanıcının rolü yoksa varsayılan olarak USER rolü ata
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
            }
            
            // Kullanıcıyı güncelle
            userRepository.save(user);
            System.out.println("Kullanıcı güncellendi: " + user.getEmail());
        });
    }
} 