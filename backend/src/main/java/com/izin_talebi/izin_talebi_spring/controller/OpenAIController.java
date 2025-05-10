package com.izin_talebi.izin_talebi_spring.controller;

import com.izin_talebi.izin_talebi_spring.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/openai")
public class OpenAIController {

    private final OpenAIService openAIService;

    @Autowired
    public OpenAIController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    // İzin talebi metnini analiz et
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeText(@RequestBody String text) {
        String result = openAIService.analyzeText(text);
        return ResponseEntity.ok(result);
    }
}