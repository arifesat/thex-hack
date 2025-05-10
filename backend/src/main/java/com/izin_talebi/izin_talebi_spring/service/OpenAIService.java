package com.izin_talebi.izin_talebi_spring.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class OpenAIService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String API_KEY_PATH = "openai_api_key.txt";
    private String openaiApiKey;

    public OpenAIService() {
        try {
            openaiApiKey = Files.readString(Paths.get(API_KEY_PATH)).trim();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read OpenAI API key from file", e);
        }
    }

    public String analyzeText(String text) {
        // Basit bir örnek: OpenAI Chat API'ye POST isteği atar
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", text);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", new Object[]{message});
        requestBody.put("max_tokens", 100);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_API_URL, entity, Map.class);
            // OpenAI yanıtını işleyin (örnek olarak ilk cevabı döndürür)
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                Object[] choices = ((java.util.List<Object>) responseBody.get("choices")).toArray();
                if (choices.length > 0) {
                    Map<String, Object> choice = (Map<String, Object>) choices[0];
                    Map<String, Object> messageResp = (Map<String, Object>) choice.get("message");
                    return (String) messageResp.get("content");
                }
            }
            return "OpenAI'dan yanıt alınamadı.";
        } catch (Exception e) {
            return "OpenAI API hatası: " + e.getMessage();
        }
    }
}