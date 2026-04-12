package duan.sportify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import duan.sportify.entities.Authorized;
import duan.sportify.entities.Users;
import duan.sportify.service.AuthorizedService;
import duan.sportify.service.UserService;
import duan.sportify.service.UploadService;
import lombok.Getter;
import lombok.Setter;

import javax.servlet.http.HttpSession;

@RestController
public class ProfilesController {

    @Autowired
    UserService userService;
    @Autowired
    AuthorizedService authorizedService;
    @Autowired
    UploadService uploadService;

    @GetMapping("api/user/profile")
    public ResponseEntity<?> view(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body("Chưa đăng nhập");
        }

        Users profile = userService.findById(username);
        Authorized role = authorizedService.findAllAuthorized(username);
        String roleuserOnl;
        switch (role.getRoleid()) {
            case "R01" -> roleuserOnl = "Quản Trị Viên";
            case "R02" -> roleuserOnl = "Nhân viên nội bộ";
            default -> roleuserOnl = "Khách hàng";
        }

        return ResponseEntity.ok(new ProfileResponse(profile, roleuserOnl));
    }

    @PostMapping("api/user/profile/save-profile")
    public ResponseEntity<?> saveProfiles(
            HttpSession session,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile,
            @RequestParam("firstname") String firstname,
            @RequestParam("lastname") String lastname,
            @RequestParam("phone") String phone,
            @RequestParam("email") String email,
            @RequestParam("address") String address,
            @RequestParam("gender") String gender,
            @RequestParam(value = "newpassword", required = false) String newpassword,
            @RequestParam(value = "confirmpassword", required = false) String confirmpassword,
            @RequestParam(value = "passwords", required = false) String passwords) {
                System.out.println("Avatar file: " + avatarFile);
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body("Chưa đăng nhập");
        }

        Users updateUser = userService.findByUsername(username);
        if (updateUser == null) {
            return ResponseEntity.status(404).body("Không tìm thấy user");
        }

        // Cập nhật các field
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                String avatarUrl = uploadService.uploadImage(avatarFile, "avatars");
                updateUser.setImage(avatarUrl);
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Upload avatar thất bại: " + e.getMessage());
            }
        }

        updateUser.setFirstname(firstname);
        updateUser.setLastname(lastname);
        updateUser.setPhone(phone);
        updateUser.setEmail(email);
        updateUser.setAddress(address);
        updateUser.setGender(Boolean.parseBoolean(gender));

        if (newpassword != null && !newpassword.isEmpty() && newpassword.equals(confirmpassword)) {
            updateUser.setPasswords(newpassword);
        }

        // status giữ nguyên hoặc set nếu cần
        updateUser.setStatus(true);

        userService.update(updateUser);

        return ResponseEntity.ok("Cập nhật thông tin thành công!");
    }

    // DTO trả về JSON
    static class ProfileResponse {
        private Users profile;
        private String role;

        public ProfileResponse(Users profile, String role) {
            this.profile = profile;
            this.role = role;
        }

        public Users getProfile() {
            return profile;
        }

        public String getRole() {
            return role;
        }
    }

    @Getter
    @Setter
    static class ProfileRequest {
        private String avatarProfile;
        private String firstname;
        private String lastname;
        private String phone;
        private String email;
        private String passwords;
        private String address;
        private String gender;
        private String newpassword;
        private String confirmpassword;

    }

}
