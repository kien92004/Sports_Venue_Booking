package duan.sportify.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SimpleController {
    static Map<String, String> users = new ConcurrentHashMap<>();

    @GetMapping("/home")
    public Map<String, Object> home() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Chào mừng đến Simple Sports");
        return resp;
    }

    @GetMapping("/news")
    public Map<String, Object> news() {
        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> n1 = new HashMap<>();
        n1.put("id", 1);
        n1.put("title", "Giải bóng đá học đường sắp diễn ra");
        n1.put("date", LocalDateTime.now().toString());
        items.add(n1);
        Map<String, Object> n2 = new HashMap<>();
        n2.put("id", 2);
        n2.put("title", "Sân thể thao mới mở cửa");
        n2.put("date", LocalDateTime.now().minusDays(1).toString());
        items.add(n2);
        Map<String, Object> resp = new HashMap<>();
        resp.put("items", items);
        return resp;
    }

    @PostMapping("/auth/register")
    public Map<String, Object> register(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.getOrDefault("username", "");
        String password = (String) payload.getOrDefault("password", "");
        Map<String, Object> resp = new HashMap<>();
        if (username.isBlank() || password.isBlank()) {
            resp.put("success", false);
            resp.put("message", "Thiếu thông tin");
            return resp;
        }
        if (users.containsKey(username)) {
            resp.put("success", false);
            resp.put("message", "Tài khoản đã tồn tại");
            return resp;
        }
        users.put(username, password);
        resp.put("success", true);
        return resp;
    }

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.getOrDefault("username", "");
        String password = (String) payload.getOrDefault("password", "");
        Map<String, Object> resp = new HashMap<>();
        String stored = users.get(username);
        boolean ok = stored != null && stored.equals(password);
        resp.put("success", ok);
        if (!ok) {
            resp.put("message", "Sai tài khoản hoặc mật khẩu");
        }
        return resp;
    }
}
