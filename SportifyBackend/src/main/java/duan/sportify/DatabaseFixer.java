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
            
            // Tạo bảng tournaments nếu chưa có
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS tournaments (" +
                "tournamentid INT AUTO_INCREMENT PRIMARY KEY, " +
                "tournamentname VARCHAR(100) NOT NULL, " +
                "sporttypeid VARCHAR(6), " +
                "startdate DATE, " +
                "enddate DATE, " +
                "description VARCHAR(2000), " +
                "image VARCHAR(255), " +
                "status VARCHAR(50), " +
                "teamcount INT " +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            // Tạo bảng team_registrations nếu chưa có
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS team_registrations (" +
                "registrationid INT AUTO_INCREMENT PRIMARY KEY, " +
                "tournamentid INT, " +
                "teamname VARCHAR(100) NOT NULL, " +
                "captainname VARCHAR(100), " +
                "phonenumber VARCHAR(20), " +
                "note VARCHAR(1000), " +
                "registrationdate DATETIME DEFAULT CURRENT_TIMESTAMP " +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            System.out.println("========== DATABASE FIX COMPLETED SUCCESSFULLY ==========");
        } catch (Exception e) {
            System.out.println("========== DATABASE FIX FAILED (might already be fixed): " + e.getMessage() + " ==========");
        }
    }
}
