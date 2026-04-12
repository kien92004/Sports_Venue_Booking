package duan.sportify.service.impl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import duan.sportify.service.AIService;

import java.util.*;

@Service
public class OpenAIServiceImpl implements AIService {

     @Value("${ai.provider:openai}")
    private String aiProvider; // openai | gemini

    @Value("${openai.api.key:}")
    private String openAiApiKey;

    @Value("${openai.api.model:gpt-3.5-turbo}")
    private String openAiModel;

    @Override
    public String chat(String message) {
        String apiKey = openAiApiKey;
        String model = openAiModel;
        if (apiKey == null || apiKey.isEmpty()) {
            return "⚠️ OPENAI_API_KEY chưa được cấu hình.";
        }

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("model", model);
        requestPayload.put("temperature", 0.7);
        requestPayload.put("messages", List.of(
            Map.of("role", "system", "content", "You are a helpful assistant for the Sportify website."),
            Map.of("role", "user", "content", message)
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Map> res = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                new HttpEntity<>(requestPayload, headers),
                Map.class
            );

            return extractFirstMessageContent(res.getBody());
        } catch (Exception ex) {
            return "❌ Lỗi gọi OpenAI: " + ex.getMessage();
        }
    }

    private String extractFirstMessageContent(Map body) {
        if (body == null) return null;
        var choices = (List<Map<String, Object>>) body.get("choices");
        if (choices == null || choices.isEmpty()) return null;
        var msg = (Map<String, Object>) choices.get(0).get("message");
        return msg != null ? (String) msg.get("content") : null;
    }
    @Override
    public Object data() {
        return null;
    }
}
