package com.izin_talebi.izin_talebi_spring.repository;

import com.izin_talebi.izin_talebi_spring.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Spring'in otomatik olarak bean olarak tanımasını sağlar
public interface UserRepository extends MongoRepository<User, String> {
    // Kullanıcı adı ile kullanıcıyı bulmak için
    Optional<User> findByEmail(String email);

    // Eğer rol bazlı kullanıcılar istenirse (opsiyonel)
    // List<User> findByRole(String role);

    Optional<User> findByCalisanId(Integer calisanId);
}