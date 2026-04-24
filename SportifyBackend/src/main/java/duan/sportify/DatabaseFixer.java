package duan.sportify;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("========== STARTING AUTOMATIC DATABASE FIX ==========");
            // Mở rộng độ dài cột bookingstatus
            jdbcTemplate.execute("ALTER TABLE bookings MODIFY COLUMN bookingstatus VARCHAR(50) NOT NULL");
            // Tạo bảng payment_logs nếu chưa có
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS payment_logs (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "transaction_id BIGINT, " +
                "gateway VARCHAR(50), " +
                "transaction_date DATETIME, " +
                "account_number VARCHAR(50), " +
                "content VARCHAR(500), " +
                "transfer_amount DOUBLE, " +
                "reference_code VARCHAR(100), " +
                "account_name VARCHAR(100), " +
                "log_date DATETIME DEFAULT CURRENT_TIMESTAMP" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            System.out.println("========== DATABASE FIX COMPLETED SUCCESSFULLY ==========");
        } catch (Exception e) {
            System.out.println("========== DATABASE FIX FAILED (might already be fixed): " + e.getMessage() + " ==========");
        }
    }
}
