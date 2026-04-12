package duan.sportify.config;

import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình cho Flyway database migrations
 * Spring Boot sẽ tự động cấu hình Flyway với các thiết lập mặc định
 */
@Configuration
public class FlywayConfig {
    // Không cần cấu hình thêm, Spring Boot sẽ tự động khởi tạo và chạy Flyway
}