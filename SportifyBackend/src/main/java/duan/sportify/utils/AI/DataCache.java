package duan.sportify.utils.AI;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class DataCache {
    @Value("${backend.url}")
    private static String BACKEND_URL;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final ObjectMapper mapper = new ObjectMapper();

    private Map<String, Object> cachedData;
    private final Map<String, float[]> embeddingMap = new ConcurrentHashMap<>();

    // Thêm cache cho embedding theo id/text
    private final Map<String, float[]> embeddingCache = new ConcurrentHashMap<>();

    @Value("${gemini.api.key}")
    private String googleApiKey;

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=";

    private static final String LOCAL_API = BACKEND_URL + "/sportify/rest/ai/getAllData";

    /**
     * Gọi API Gemini để tạo embedding cho một đoạn text/json
     * Sử dụng cache để tránh gọi lại nếu đã có
     */
    private float[] getEmbedding(String text) {
        // Sử dụng text làm key cache (hoặc có thể dùng id nếu muốn)
        String cacheKey = String.valueOf(text.hashCode());
        if (embeddingCache.containsKey(cacheKey)) {
            return embeddingCache.get(cacheKey);
        }
        try {
            String url = GEMINI_BASE_URL + googleApiKey;

            Map<String, Object> requestBody = Map.of(
                    "model", "models/text-embedding-004",
                    "content", Map.of(
                            "parts", List.of(
                                    Map.of("text", text))));

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String body = mapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(url, entity, String.class);
            Map<String, Object> result = mapper.readValue(response, Map.class);

            Map<String, Object> embedding = (Map<String, Object>) result.get("embedding");
            if (embedding == null)
                throw new RuntimeException("Không tìm thấy embedding trong phản hồi");

            List<Double> values = (List<Double>) embedding.get("values");
            float[] vector = new float[values.size()];
            for (int i = 0; i < values.size(); i++) {
                vector[i] = values.get(i).floatValue();
            }
            // Lưu vào cache
            embeddingCache.put(cacheKey, vector);
            return vector;

        } catch (Exception e) {
            System.err.println("⚠️ Lỗi khi gọi Gemini API: " + e.getMessage());
            return new float[] { text.hashCode() % 1000, text.length() };
        }
    }

    /**
     * Gọi API getAllData và lưu vào cache + sinh embedding (song song)
     */
    public void loadDataFromApi() {
        try {
            System.out.println("🔄 Đang tải dữ liệu từ API nội bộ...");
            String json = restTemplate.getForObject(LOCAL_API, String.class);
            if (json == null)
                throw new RuntimeException("Không nhận được dữ liệu từ API!");

            Map<String, Object> apiData = mapper.readValue(json, Map.class);
            cachedData = apiData;

            // Tạo embedding cho từng danh mục song song
            ExecutorService executor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
            List<Future<?>> futures = new ArrayList<>();

            for (String key : List.of("fields", "events", "products", "favorites")) {
                List<Map<String, Object>> items = (List<Map<String, Object>>) apiData.get(key);
                if (items == null)
                    continue;

                for (Map<String, Object> item : items) {
                    futures.add(executor.submit(() -> {
                        try {
                            String itemJson = mapper.writeValueAsString(item);
                            String id = key + "_"
                                    + (item.get("fieldId") != null ? item.get("fieldId")
                                            : item.get("eventId") != null ? item.get("eventId")
                                                    : item.get("productId") != null ? item.get("productId")
                                                            : UUID.randomUUID());
                            embeddingMap.put(id, getEmbedding(itemJson));
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    }));
                }
            }
            // Chờ tất cả embedding hoàn thành
            for (Future<?> f : futures)
                f.get();
            executor.shutdown();

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ Lỗi khi load data từ API: " + e.getMessage());
        }
    }

    /**
     * Tìm đối tượng gần nhất theo vector cosine similarity
     */
    public String findNearest(String queryJson) {
        float[] queryVec = getEmbedding(queryJson);
        String nearestKey = null;
        double bestScore = Double.NEGATIVE_INFINITY;

        for (Map.Entry<String, float[]> entry : embeddingMap.entrySet()) {
            double score = cosineSimilarity(queryVec, entry.getValue());
            if (score > bestScore) {
                bestScore = score;
                nearestKey = entry.getKey();
            }
        }

        return nearestKey;
    }

    private double cosineSimilarity(float[] v1, float[] v2) {
        double dot = 0, norm1 = 0, norm2 = 0;
        for (int i = 0; i < Math.min(v1.length, v2.length); i++) {
            dot += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }
        return dot / (Math.sqrt(norm1) * Math.sqrt(norm2) + 1e-8);
    }

    public Map<String, Object> getCachedData() {
        if (cachedData == null) {
            synchronized (this) {
                if (cachedData == null) {
                    loadDataFromApi();
                }
            }
        }

        return cachedData;
    }
}
