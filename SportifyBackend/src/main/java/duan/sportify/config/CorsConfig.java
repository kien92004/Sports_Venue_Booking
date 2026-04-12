package duan.sportify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

        // Lấy từ application.properties hoặc biến môi trường
        @Value("${frontend.url}")
        private String FRONTEND_URL;

        @Override
        public void addCorsMappings(CorsRegistry registry) {

                // Endpoint cần credentials
                registry.addMapping("/api/user/**")
                                .allowedOrigins(FRONTEND_URL)
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowCredentials(true)
                                .allowedHeaders("*");

                // Endpoint public
                registry.addMapping("/api/sportify/**")
                                .allowedOrigins("*")
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*");

                registry.addMapping("/rest/**")
                                .allowedOrigins(FRONTEND_URL)
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*");

                registry.addMapping("/sportify/rest/**")
                                .allowedOrigins(FRONTEND_URL)
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*");

        }
}
