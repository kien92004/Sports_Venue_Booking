package duan.sportify.rest.controller;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.DTO.FieldOwnerRegistrationResponse;
import duan.sportify.dao.AuthorizedDAO;
import duan.sportify.dao.RoleDAO;
import duan.sportify.dao.UserDAO;
import duan.sportify.entities.Authorized;
import duan.sportify.entities.FieldOwnerRegistration;
import duan.sportify.entities.Roles;
import duan.sportify.entities.Users;
import duan.sportify.service.FieldOwnerRegistrationService;
import duan.sportify.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("api/admin/field-owner")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class FieldOwnerAdminController {

    private final FieldOwnerRegistrationService registrationService;
    private final UserDAO userDAO;
    private final AuthorizedDAO authorizedDAO;
    private final RoleDAO roleDAO;
    private final NotificationService notificationService;

    @GetMapping("/requests")
    public ResponseEntity<List<FieldOwnerRegistrationResponse>> getRequests(
            @RequestParam(name = "status", required = false) String status) {

        List<FieldOwnerRegistration> registrations;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            registrations = registrationService.findAll();
            registrations.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        } else {
            registrations = registrationService.findByStatus(status.toUpperCase());
        }

        List<FieldOwnerRegistrationResponse> response = registrations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/requests/{ownerId}/approve")
    @Transactional
    public ResponseEntity<Map<String, Object>> approveRequest(@PathVariable Long ownerId) {
        Optional<FieldOwnerRegistration> optionalRegistration = registrationService.findById(ownerId);
        if (optionalRegistration.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Không tìm thấy yêu cầu."));
        }

        FieldOwnerRegistration registration = optionalRegistration.get();
        if (!"PENDING".equalsIgnoreCase(registration.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Yêu cầu đã được xử lý trước đó."));
        }

        String username = Optional.ofNullable(registration.getUsername()).map(String::trim).orElse("");
        String password = Optional.ofNullable(registration.getOwnerPassword()).map(String::trim).orElse("");

        if (username.length() < 6 || username.length() > 15) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false,
                            "message", "Tên đăng nhập trong hồ sơ không hợp lệ (6-15 ký tự, không khoảng trắng)."));
        }

        if (password.length() < 6 || password.length() > 15) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false,
                            "message", "Mật khẩu trong hồ sơ không hợp lệ (6-15 ký tự)."));
        }

        if (username.contains(" ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false,
                            "message", "Tên đăng nhập không được chứa khoảng trắng."));
        }

        String normalizedPhone = normalizePhone(registration.getPhone());
        if (normalizedPhone == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false,
                            "message", "Số điện thoại trong hồ sơ không hợp lệ."));
        }

        String normalizedEmail = normalizeEmail(registration.getBusinessEmail());
        if (normalizedEmail == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false,
                            "message", "Email trong hồ sơ không hợp lệ."));
        }

        if (userDAO.findAcc(username) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Tên đăng nhập đã tồn tại trong hệ thống."));
        }

        ensureFieldOwnerRoleExists();

        registration.setUsername(username);
        registration.setOwnerPassword(password);
        registration.setPhone(normalizedPhone);
        registration.setBusinessEmail(normalizedEmail);
        Users newUser = buildUserFromRegistration(registration);
        try {
            userDAO.save(newUser);
        } catch (Exception ex) {
            log.error("Failed to create user for owner {}", username, ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false,
                            "message",
                            "Không thể tạo tài khoản người dùng từ hồ sơ. Vui lòng kiểm tra lại thông tin."));
        }

        Authorized authorized = new Authorized();
        authorized.setUsername(newUser.getUsername());
        authorized.setRoleid("R04");
        authorizedDAO.save(authorized);

        registration.setStatus("APPROVED");
        registration.setRejectReason(null);
        registration.setUpdatedAt(new Date());
        registrationService.save(registration);

        try {
            notificationService.addNotification(
                    newUser.getUsername(),
                    "Yêu cầu đăng ký chủ sân của bạn đã được phê duyệt. Vui lòng đăng nhập để quản lý sân.",
                    "success");
        } catch (Exception ex) {
            log.warn("Không thể tạo thông báo cho chủ sân {} sau khi duyệt", newUser.getUsername(), ex);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã duyệt yêu cầu thành công.",
                "username", newUser.getUsername()));
    }

    @PostMapping("/requests/{ownerId}/reject")
    @Transactional
    public ResponseEntity<Map<String, Object>> rejectRequest(
            @PathVariable Long ownerId,
            @RequestBody Map<String, String> payload) {

        Optional<FieldOwnerRegistration> optionalRegistration = registrationService.findById(ownerId);
        if (optionalRegistration.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Không tìm thấy yêu cầu."));
        }

        FieldOwnerRegistration registration = optionalRegistration.get();
        if (!"PENDING".equalsIgnoreCase(registration.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Yêu cầu đã được xử lý trước đó."));
        }

        String reason = payload.getOrDefault("reason", "Yêu cầu bị từ chối.").trim();
        if (reason.length() > 500) {
            reason = reason.substring(0, 500);
        }

        registration.setStatus("REJECTED");
        registration.setRejectReason(reason);
        registration.setUpdatedAt(new Date());
        registrationService.save(registration);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã từ chối yêu cầu."));
    }

    @DeleteMapping("/requests/{ownerId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteRequest(@PathVariable Long ownerId) {
        Optional<FieldOwnerRegistration> optionalRegistration = registrationService.findById(ownerId);
        if (optionalRegistration.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Không tìm thấy yêu cầu."));
        }

        registrationService.deleteById(ownerId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã xóa yêu cầu."));
    }

    private FieldOwnerRegistrationResponse toResponse(FieldOwnerRegistration registration) {
        return FieldOwnerRegistrationResponse.builder()
                .ownerId(registration.getOwnerId())
                .businessName(registration.getBusinessName())
                .businessEmail(registration.getBusinessEmail())
                .phone(registration.getPhone())
                .address(registration.getAddress())
                .idNumber(registration.getIdNumber())
                .idFrontUrl(registration.getIdFrontUrl())
                .idBackUrl(registration.getIdBackUrl())
                .businessLicenseUrl(registration.getBusinessLicenseUrl())
                .status(registration.getStatus())
                .rejectReason(registration.getRejectReason())
                .createdAt(registration.getCreatedAt())
                .updatedAt(registration.getUpdatedAt())
                .username(registration.getUsername())
                .build();
    }

    private Users buildUserFromRegistration(FieldOwnerRegistration registration) {
        Users user = new Users();
        user.setUsername(registration.getUsername());
        user.setPasswords(registration.getOwnerPassword());

        String[] names = deriveNames(registration.getBusinessName());
        user.setFirstname(names[0]);
        user.setLastname(names[1]);

        user.setPhone(registration.getPhone());
        user.setEmail(safeTrim(registration.getBusinessEmail(), 50));
        user.setAddress(safeTrim(registration.getAddress(), 100));
        user.setGender(Boolean.FALSE);
        user.setStatus(true);
        return user;
    }

    private String[] deriveNames(String businessName) {
        if (businessName == null) {
            return new String[] { "Chu", "San" };
        }
        String sanitized = businessName.replaceAll("[^\\p{L}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        if (sanitized.isEmpty()) {
            return new String[] { "Chu", "San" };
        }

        String[] parts = sanitized.split(" ");
        String first = safeTrim(parts[0], 50);
        String last;
        if (parts.length > 1) {
            last = safeTrim(sanitized.substring(parts[0].length()).trim(), 50);
        } else {
            last = "San";
        }

        if (last.isEmpty()) {
            last = "San";
        }

        return new String[] { first, last };
    }

    private String safeTrim(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) {
            return trimmed.substring(0, maxLength);
        }
        return trimmed;
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

    private void ensureFieldOwnerRoleExists() {
        Optional<Roles> roleOpt = roleDAO.findById("R04");
        if (roleOpt.isEmpty()) {
            Roles role = new Roles();
            role.setRoleid("R04");
            role.setRolename("Field Owner");
            roleDAO.save(role);
        }
    }
}