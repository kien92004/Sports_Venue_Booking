package duan.sportify.utils.AI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import duan.sportify.service.AIService;
import duan.sportify.service.impl.GeminiServiceImpl;
import duan.sportify.service.impl.OpenAIServiceImpl;
import duan.sportify.service.impl.AdminGeminiServiceImpl;

/**
 * AIServiceFactory - Factory để lựa chọn AI service provider
 * 
 * Mặc định: Gemini (Vertex AI)
 * Alternative: OpenAI (nếu cần)
 * Admin: AdminGeminiServiceImpl (cho admin dashboard)
 */
@Component
public class AIServiceFactory {
    @Autowired
    private OpenAIServiceImpl openAIService;
    
    @Autowired
    private GeminiServiceImpl geminiService;
    
    @Autowired
    private AdminGeminiServiceImpl adminGeminiService;

    public AIService getService(String provider) {
        // Default: Gemini (Vertex AI)
        if ("openai".equalsIgnoreCase(provider)) {
            return openAIService;
        }
        // Mặc định hoặc "gemini" hoặc "vertex" đều trả về GeminiServiceImpl (Vertex AI)
        return geminiService;
    }
    
    /**
     * Lấy AI Service cho Admin
     */
    public AIService getAdminService(String provider) {
        // Admin luôn dùng AdminGeminiServiceImpl
        return adminGeminiService;
    }
}
