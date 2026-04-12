package duan.sportify.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.dao.AuthorizedDAO;
import duan.sportify.dao.UserDAO;
import duan.sportify.entities.Authorized;
import duan.sportify.entities.Users;
import duan.sportify.service.AuthorizedService;
import duan.sportify.service.UserService;

@RestController
public class SecurityController {
	@Autowired
	UserService userService;

	@Autowired
	UserDAO userDAO;

	@Autowired
	AuthorizedDAO authorizedDAO;

	@Autowired
	private AuthorizedService authorizedService;

	List<Users> listUser = new ArrayList<>();

	@RequestMapping("api/sportify/user")
	public Map<String, Object> userForm() {
		listUser = userService.findAll();
		Map<String, Object> resp = new HashMap<>();
		resp.put("listUser", listUser);
		return resp;
	}

	@RequestMapping("api/sportify/signup")
	public Map<String, Object> signupForm() {
		Map<String, Object> resp = new HashMap<>();
		resp.put("message", "signup endpoint");
		return resp;
	}

	// @RequestMapping("login/success")
	// public Map<String, Object> loginSuccess(HttpSession session,
	// HttpServletRequest request,
	// HttpServletResponse response) {
	// Authentication authentication =
	// SecurityContextHolder.getContext().getAuthentication();
	// String username = authentication.getName();
	// session.setAttribute("username", username);
	// Map<String, Object> resp = new HashMap<>();
	// resp.put("success", true);
	// resp.put("username", username);
	// return resp;
	// }

	// @RequestMapping("login/error")
	// public Map<String, Object> loginError(@RequestParam(name = "error", required
	// = false) String error) {
	// Map<String, Object> resp = new HashMap<>();
	// resp.put("success", false);
	// resp.put("message", "Thông tin đăng nhập không hợp lệ hoặc tài khoản của bạn
	// đã bị khóa");
	// return resp;
	// }

	@RequestMapping("api/sportify/unauthoried")
	public Map<String, Object> unauthoried() {
		Map<String, Object> resp = new HashMap<>();
		resp.put("message", "Không có quyền truy xuất!");
		return resp;
	}

	@RequestMapping("api/user/logoff/success")
	public Map<String, Object> logoffSuccess(HttpSession session) {
		session.removeAttribute("username"); // Xóa Session người dùng đăng nhập
		Map<String, Object> resp = new HashMap<>();
		resp.put("message", "Bạn đã đăng xuất!");
		return resp;
	}

	@PostMapping("api/sportify/signup/process")
	public Map<String, Object> processSignup(@RequestBody Map<String, Object> payload) {
		Map<String, Object> resp = new HashMap<>();

		String username = (String) payload.get("username");
		String password = (String) payload.get("password");
		String firstname = (String) payload.get("firstname");
		String lastname = (String) payload.get("lastname");
		String email = (String) payload.get("email");
		String phone = (String) payload.get("phone");
		String address = (String) payload.get("address");
		Boolean gender = (Boolean) payload.get("gender");

		if (username == null || username.isBlank()) {
			resp.put("success", false);
			resp.put("message", "Username không được để trống");
			return resp;
		}

		if (userDAO.findAcc(username) != null) {
			resp.put("success", false);
			resp.put("message", "Tài khoản đã tồn tại !");
			return resp;
		}

		Users newUser = new Users();
		newUser.setUsername(username); // BẮT BUỘC có ID
		newUser.setPasswords(password);
		newUser.setFirstname(firstname);
		newUser.setLastname(lastname);
		newUser.setEmail(email);
		newUser.setPhone(phone);
		newUser.setAddress(address);
		newUser.setGender(gender != null && gender); // true/false
		newUser.setStatus(true); // hoặc set theo logic của bạn

		userDAO.save(newUser);

		Authorized newAuthorized = new Authorized();
		newAuthorized.setUsername(username);
		newAuthorized.setRoleid("R03");
		authorizedDAO.save(newAuthorized);

		resp.put("success", true);
		resp.put("message", "Đăng ký thành công");
		return resp;
	}

	@PostMapping("api/user/login")
	@ResponseBody
	public Map<String, Object> login(@RequestBody Map<String, String> payload, HttpSession session) {
		String username = payload.get("username");
		String password = payload.get("password");

		Map<String, Object> resp = new HashMap<>();

		// Tìm user
		Users user = userService.findByUsername(username);

		// Không tiết lộ user không tồn tại
		if (user == null) {
			resp.put("success", false);
			resp.put("message", "Sai tài khoản hoặc mật khẩu");
			return resp;
		}

		LocalDateTime now = LocalDateTime.now();

		// Nếu status = false -> tài khoản bị khóa (có thể do admin khóa tay hoặc do
		// login fail)
		if (Boolean.FALSE.equals(user.getStatus())) {
			// Nếu có lockedUntil và thời gian khóa đã hết -> tự mở khóa
			if (user.getLockedUntil() != null && user.getLockedUntil().isBefore(now)) {
				user.setStatus(true);
				user.setFailedAttempt(0);
				user.setLockedUntil(null);
				userDAO.save(user);
				// tiếp tục flow kiểm tra mật khẩu bên dưới
			} else {
				// Vẫn đang khóa
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy");

				String untilMsg = (user.getLockedUntil() != null)
						? user.getLockedUntil().format(formatter)
						: "đã bị khóa";
				resp.put("success", false);
				resp.put("message", "Tài khoản đang bị khóa đến: " + untilMsg);
				return resp;
			}
		}
		// pass
		if (!user.getPasswords().equals(password)) {
			int attempts = (user.getFailedAttempt() == null ? 0 : user.getFailedAttempt()) + 1;
			user.setFailedAttempt(attempts);

			// Nếu vượt quá giới hạn -> khóa và set status = false
			if (attempts >= 5) {
				user.setLockedUntil(now.plusMinutes(5));
				user.setStatus(false);
				userDAO.save(user);

				resp.put("success", false);
				resp.put("message", "Sai quá 5 lần. Tài khoản bị khóa 5 phút.");
				return resp;
			} else {
				userDAO.save(user);
				resp.put("success", false);
				resp.put("message", "Sai mật khẩu! Còn " + (5 - attempts) + " lần. ");
				return resp;
			}
		}

		// Nếu đến đây => mật khẩu đúng
		user.setFailedAttempt(0);
		user.setLockedUntil(null);
		user.setStatus(true); // đảm bảo status = true khi đăng nhập thành công
		userDAO.save(user);

		// Tạo session
		session.setAttribute("username", username);
		System.out.println("User " + username + " logged in.");

		resp.put("success", true);
		resp.put("username", username);
		return resp;
	}

	@GetMapping("api/user/rest/security/authentication")
	public Map<String, Object> getAuthentication(HttpSession session) {
		Map<String, Object> resp = new HashMap<>();
		String username = (String) session.getAttribute("username");
		System.out.println("username in session: " + username);
		if (username != null) {
			resp.put("loggedIn", true);
			resp.put("username", username);

			// Lấy roles từ AuthorizedService
			Authorized roles = authorizedService.findAllAuthorized(username);
			resp.put("roles", roles);
		} else {
			resp.put("loggedIn", false);
		}

		return resp;
	}

}
