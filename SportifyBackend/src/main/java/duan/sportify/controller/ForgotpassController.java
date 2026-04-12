package duan.sportify.controller;

import java.util.Map;
import java.util.Random;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import duan.sportify.entities.Users;
import duan.sportify.service.MailerService;
import duan.sportify.service.UserService;
import duan.sportify.utils.mail_Contrain;
@RestController
@RequestMapping("api/user")
public class ForgotpassController {
    @Autowired
    MailerService mailer;
    @Autowired
    UserService userService;

    // Hàm random OTP 6 ký tự
    public static int generateRandomCode(int length) {
        Random random = new Random();
        int min = (int) Math.pow(10, length - 1);
        int max = (int) Math.pow(10, length) - 1;
        return random.nextInt(max - min + 1) + min;
    }

    int randomCode;
    String username;
    String email;

    // 1. Quên mật khẩu → gửi OTP
    @PostMapping("forgotpassword")
    public ResponseEntity<?> forgotpassword(@RequestBody Map<String, String> payload) {
        username = payload.get("username");
        email = payload.get("email");
        System.out.println("username: " + username);
        System.out.println("email: " + email);
        randomCode = generateRandomCode(6);

        String title = "Xác thực thay đổi mật khẩu";

        try {
            mailer.send(email, title, mail_Contrain.mailChangePass(randomCode, username));
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mã OTP đã được gửi qua email của bạn"
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Gửi mail thất bại" + ex.getMessage()
            ));
        }
    }

    // 2. Check OTP (body thay cho param)
    @PostMapping("/checkOTP")
    public ResponseEntity<?> checkOTP(@RequestBody Map<String, Integer> payload) {
        int OTPinput = payload.get("codeverification");
        if (OTPinput == randomCode) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OTP chính xác"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Mã OTP không đúng, vui lòng thử lại"
            ));
        }
    }

    // 3. Đổi mật khẩu (body thay cho param)
    @PostMapping("/changePassword")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> payload,
            @Valid Users user,
            BindingResult result) {

        String newpassword = payload.get("newpassword");
        String confirmpassword = payload.get("confirmpassword");

        Users userChange = userService.findById(username);
        if (userChange == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Tài khoản không tồn tại"
            ));
        }

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Dữ liệu không hợp lệ"
            ));
        }

        if (!newpassword.equals(confirmpassword)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Mật khẩu xác nhận không khớp"
            ));
        }

        user.setUsername(username);
        user.setPasswords(newpassword);
        user.setFirstname(userChange.getFirstname());
        user.setLastname(userChange.getLastname());
        user.setEmail(email);
        user.setPhone(userChange.getPhone());
        user.setAddress(userChange.getAddress());
        user.setImage(userChange.getImage());
        user.setGender(userChange.getGender());
        user.setStatus(userChange.getStatus());

        userService.update(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đổi mật khẩu thành công"
        ));
    }
}
