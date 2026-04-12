package duan.sportify.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import duan.sportify.dao.UserDAO;
import duan.sportify.entities.FieldOwnerRegistration;
import duan.sportify.service.UploadService;
import duan.sportify.service.FieldOwnerRegistrationService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/sportify/field-owner")
@CrossOrigin(origins = "*")
@Slf4j
public class FieldOwnerRegistrationController {

    private final FieldOwnerRegistrationService registrationService;
    private final UploadService uploadService;
    private final UserDAO userDAO;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<Map<String, Object>> registerFieldOwner(
            @RequestParam("applicantName") String applicantName,
            @RequestParam("phone") String phone,
            @RequestParam("email") String email,
            @RequestParam("contactAddress") String contactAddress,
            @RequestParam(value = "idNumber", required = false) String idNumber,
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("idCardFront") MultipartFile idCardFront,
            @RequestParam("idCardBack") MultipartFile idCardBack,
            @RequestParam(value = "businessLicense", required = false) MultipartFile businessLicense) {

        Map<String, Object> response = new HashMap<>();

        if (applicantName == null || applicantName.isBlank()) {
            response.put("success", false);
            response.put("message", "Họ tên hoặc tên đơn vị không được để trống.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (phone == null || phone.isBlank()) {
            response.put("success", false);
            response.put("message", "Số điện thoại không được để trống.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (email == null || email.isBlank()) {
            response.put("success", false);
            response.put("message", "Email không được để trống.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (contactAddress == null || contactAddress.isBlank()) {
            response.put("success", false);
            response.put("message", "Địa chỉ liên hệ không được để trống.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (idCardFront == null || idCardFront.isEmpty() || idCardBack == null || idCardBack.isEmpty()) {
            response.put("success", false);
            response.put("message", "Vui lòng tải lên đầy đủ hình ảnh CCCD/CMND.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (username == null || username.isBlank()) {
            response.put("success", false);
            response.put("message", "Vui lòng nhập tên đăng nhập dành cho chủ sân.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (password == null || password.isBlank()) {
            response.put("success", false);
            response.put("message", "Vui lòng nhập mật khẩu cho tài khoản chủ sân.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String trimmedUsername = username.trim();
        String trimmedPassword = password.trim();

        String normalizedPhone = normalizePhone(phone);
        if (normalizedPhone == null) {
            response.put("success", false);
            response.put("message", "Số điện thoại không hợp lệ. Vui lòng nhập dạng 0xxxxxxxxx hoặc +84xxxxxxxx.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) {
            response.put("success", false);
            response.put("message", "Email không hợp lệ. Vui lòng kiểm tra lại.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (registrationService.existsByUsername(trimmedUsername)) {
            response.put("success", false);
            response.put("message", "Tên đăng nhập này đã được gửi yêu cầu trước đó. Vui lòng chọn tên khác.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        if (trimmedUsername.length() < 6 || trimmedUsername.length() > 15) {
            response.put("success", false);
            response.put("message", "Tên đăng nhập phải từ 6 đến 15 ký tự.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (trimmedPassword.length() < 6 || trimmedPassword.length() > 15) {
            response.put("success", false);
            response.put("message", "Mật khẩu phải từ 6 đến 15 ký tự.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (trimmedUsername.contains(" ")) {
            response.put("success", false);
            response.put("message", "Tên đăng nhập không được chứa khoảng trắng.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (userDAO.findAcc(trimmedUsername) != null) {
            response.put("success", false);
            response.put("message", "Tên đăng nhập đã tồn tại trong hệ thống. Vui lòng chọn tên khác.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        try {
            FieldOwnerRegistration registration = new FieldOwnerRegistration();
            registration.setBusinessName(applicantName.trim());
            registration.setPhone(normalizedPhone);
            registration.setBusinessEmail(normalizedEmail);
            registration.setAddress(contactAddress.trim());
            registration.setIdNumber(idNumber != null ? idNumber.trim() : null);
            registration.setUsername(trimmedUsername);
            registration.setOwnerPassword(trimmedPassword);

            String idFrontPath = uploadService.uploadImage(idCardFront, "owner/idcard");
            registration.setIdFrontUrl(idFrontPath);

            String idBackPath = uploadService.uploadImage(idCardBack, "owner/idcard");
            registration.setIdBackUrl(idBackPath);

            if (businessLicense != null && !businessLicense.isEmpty()) {
                String licensePath = uploadService.uploadImage(businessLicense, "owner/license");
                registration.setBusinessLicenseUrl(licensePath);
            }

            registration.setStatus("PENDING");
            registration.setRejectReason(null);
            registration.setCreatedAt(new Date());
            registration.setUpdatedAt(new Date());

            FieldOwnerRegistration savedRegistration = registrationService.save(registration);

            response.put("success", true);
            response.put("message", "Đã gửi yêu cầu đăng ký chủ sân. Vui lòng chờ quản trị viên xét duyệt.");
            response.put("ownerId", savedRegistration.getOwnerId());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Failed to process owner registration", ex);
            response.put("success", false);
            response.put("message", "Không thể xử lý yêu cầu. Vui lòng thử lại.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private String normalizePhone(String rawPhone) {
        if (rawPhone == null) {
            return null;
        }

        String trimmed = rawPhone.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        String digits = trimmed.replaceAll("[^0-9]", "");

        if (trimmed.startsWith("+84")) {
            if (digits.length() <= 2) {
                return null;
            }
            digits = digits.substring(2);
            if (digits.length() < 9 || digits.length() > 10) {
                return null;
            }
            return "0" + digits;
        }

        if (!digits.startsWith("0")) {
            digits = "0" + digits;
        }

        if (digits.length() < 10 || digits.length() > 11) {
            return null;
        }

        return digits;
    }

    private String normalizeEmail(String rawEmail) {
        if (rawEmail == null) {
            return null;
        }

        String trimmed = rawEmail.trim();
        if (trimmed.length() > 50) {
            trimmed = trimmed.substring(0, 50);
        }

        if (trimmed.isEmpty()) {
            return null;
        }

        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (!trimmed.matches(emailRegex)) {
            return null;
        }

        return trimmed.toLowerCase();
    }
}