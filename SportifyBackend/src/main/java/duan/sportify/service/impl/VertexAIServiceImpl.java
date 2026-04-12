// package duan.sportify.service.impl;

// import com.google.cloud.aiplatform.v1.EndpointName;
// import com.google.cloud.aiplatform.v1.PredictRequest;
// import com.google.cloud.aiplatform.v1.PredictResponse;
// import com.google.cloud.aiplatform.v1.PredictionServiceClient;
// import com.google.cloud.aiplatform.v1.PredictionServiceSettings;
// import com.google.protobuf.Value;
// import com.google.protobuf.util.JsonFormat;
// import duan.sportify.service.AIService;
// import org.springframework.stereotype.Service;

// import java.util.*;

// /**
//  * GeminiServiceImpl - Sử dụng Google Cloud Vertex AI
//  * Service này kết nối với Vertex AI để sử dụng các model Gemini (gemini-2.0-flash-exp, gemini-2.5-pro)
//  * Thay thế cho Gemini REST API cũ để tăng tính bảo mật và tích hợp với Google Cloud
//  */
// @Service
// public class GeminiServiceImpl implements AIService {

//     @org.springframework.beans.factory.annotation.Value("${vertex.ai.project.id:}")
//     private String projectId;

//     @org.springframework.beans.factory.annotation.Value("${vertex.ai.location:us-central1}")
//     private String location;

//     @org.springframework.beans.factory.annotation.Value("${vertex.ai.model:gemini-2.0-flash-exp}")
//     private String modelName;

//     @org.springframework.beans.factory.annotation.Value("${vertex.ai.endpoint:}")
//     private String endpoint; // Optional: custom endpoint

//     @Override
//     public String chat(String message) {
//         if (projectId == null || projectId.isEmpty()) {
//             return "⚠️ VERTEX_AI_PROJECT_ID chưa được cấu hình.";
//         }

//         try {
//             // Tạo settings cho PredictionServiceClient
//             PredictionServiceSettings.Builder settingsBuilder = 
//                 PredictionServiceSettings.newBuilder();
            
//             // Nếu có custom endpoint, sử dụng nó
//             if (endpoint != null && !endpoint.isEmpty()) {
//                 settingsBuilder.setEndpoint(endpoint);
//             }

//             // Tạo client
//             try (PredictionServiceClient client = 
//                     PredictionServiceClient.create(settingsBuilder.build())) {

//                 // Tạo endpoint name
//                 String endpointPath = String.format(
//                     "projects/%s/locations/%s/publishers/google/models/%s",
//                     projectId, location, modelName
//                 );

//                 EndpointName endpointName = EndpointName.parse(endpointPath);

//                 // Tạo request payload theo format của Vertex AI
//                 Map<String, Object> instanceMap = new HashMap<>();
                
//                 // Tạo content structure
//                 List<Map<String, Object>> contentsList = new ArrayList<>();
//                 Map<String, Object> contentMap = new HashMap<>();
//                 contentMap.put("role", "user");
                
//                 List<Map<String, String>> partsList = new ArrayList<>();
//                 Map<String, String> partMap = new HashMap<>();
//                 partMap.put("text", message);
//                 partsList.add(partMap);
                
//                 contentMap.put("parts", partsList);
//                 contentsList.add(contentMap);
                
//                 instanceMap.put("contents", contentsList);

//                 // Thêm generation config
//                 Map<String, Object> generationConfig = new HashMap<>();
//                 generationConfig.put("temperature", 0.7);
//                 generationConfig.put("maxOutputTokens", 8192);
//                 generationConfig.put("topP", 0.95);
//                 instanceMap.put("generation_config", generationConfig);

//                 // Convert map to protobuf Value
//                 String jsonString = new com.google.gson.Gson().toJson(instanceMap);
//                 Value.Builder instanceBuilder = Value.newBuilder();
//                 JsonFormat.parser().merge(jsonString, instanceBuilder);
//                 Value instance = instanceBuilder.build();

//                 // Tạo predict request
//                 PredictRequest.Builder requestBuilder = PredictRequest.newBuilder()
//                     .setEndpoint(endpointName.toString())
//                     .addInstances(instance);

//                 // Gọi API
//                 PredictResponse response = client.predict(requestBuilder.build());

//                 // Extract response
//                 if (response.getPredictionsCount() > 0) {
//                     String responseJson = JsonFormat.printer().print(response.getPredictions(0));
//                     return extractTextFromVertexAIResponse(responseJson);
//                 }

//                 return "❌ Không nhận được phản hồi từ Vertex AI.";
//             }
//         } catch (Exception ex) {
//             ex.printStackTrace();
//             return "❌ Lỗi gọi Vertex AI: " + ex.getMessage();
//         }
//     }

//     /**
//      * Extract text from Vertex AI response JSON
//      */
//     private String extractTextFromVertexAIResponse(String responseJson) {
//         try {
//             com.google.gson.JsonObject jsonObject = 
//                 com.google.gson.JsonParser.parseString(responseJson).getAsJsonObject();

//             // Navigate through the response structure
//             if (jsonObject.has("candidates")) {
//                 com.google.gson.JsonArray candidates = jsonObject.getAsJsonArray("candidates");
//                 if (candidates.size() > 0) {
//                     com.google.gson.JsonObject firstCandidate = candidates.get(0).getAsJsonObject();
                    
//                     if (firstCandidate.has("content")) {
//                         com.google.gson.JsonObject content = firstCandidate.getAsJsonObject("content");
                        
//                         if (content.has("parts")) {
//                             com.google.gson.JsonArray parts = content.getAsJsonArray("parts");
//                             if (parts.size() > 0) {
//                                 com.google.gson.JsonObject firstPart = parts.get(0).getAsJsonObject();
//                                 if (firstPart.has("text")) {
//                                     return firstPart.get("text").getAsString();
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }

//             return "❌ Không thể parse response từ Vertex AI.";
//         } catch (Exception ex) {
//             return "❌ Lỗi parse response: " + ex.getMessage();
//         }
//     }

//     @Override
//     public Object data() {
//         return new Object();
//     }
// }
