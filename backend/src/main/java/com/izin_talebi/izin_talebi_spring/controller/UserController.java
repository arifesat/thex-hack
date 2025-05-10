package com.izin_talebi.izin_talebi_spring.controller;

import com.izin_talebi.izin_talebi_spring.model.User;
import com.izin_talebi.izin_talebi_spring.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{calisanId}")
    public ResponseEntity<?> getUserByCalisanId(@PathVariable Integer calisanId) {
        return userService.findByCalisanId(calisanId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 