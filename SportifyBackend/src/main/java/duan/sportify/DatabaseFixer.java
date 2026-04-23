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
            


            System.out.println("========== DATABASE FIX COMPLETED SUCCESSFULLY ==========");
        } catch (Exception e) {
            System.out.println("========== DATABASE FIX FAILED (might already be fixed): " + e.getMessage() + " ==========");
        }
    }
}
