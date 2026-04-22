package duan.sportify.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rest/db-check")
public class DbCheckController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/tables")
    public List<Map<String, Object>> checkTables() {
        return jdbcTemplate.queryForList("SHOW TABLES");
    }

    @GetMapping("/create-table")
    public String createTable() {
        try {
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
            return "Table tournaments created or already exists";
        } catch (Exception e) {
            return "Error creating table: " + e.getMessage();
        }
    }
}
