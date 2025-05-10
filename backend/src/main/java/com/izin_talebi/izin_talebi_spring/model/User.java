package com.izin_talebi.izin_talebi_spring.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "calisanlar")
public class User implements UserDetails {
    @Id
    private String id;
    private Integer calisanId;
    private String adSoyad;
    private String pozisyon;
    private Date iseBaslamaTarihi;
    private Integer kullanilanIzinGun;
    private Integer kalanIzinGun;
    private Date talepOlusturmaTarihi;
    private String talepEdilenIzinTarihleri;
    private String talepDurumu;
    private String talepAciklamasi;
    private String email;
    private String password;
    private String izinBaslangic;
    private String izinBitis;
    private String role = "USER";
    private boolean enabled = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return email; // Email'i username olarak kullan
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
} 