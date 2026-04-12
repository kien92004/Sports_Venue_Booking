package duan.sportify.rest.controller;

import java.util.List;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import duan.sportify.GlobalExceptionHandler;
import duan.sportify.dao.AuthorizedDAO;
import duan.sportify.dao.UserDAO;
import duan.sportify.entities.Users;
import duan.sportify.service.UploadService;
import duan.sportify.utils.ErrorResponse;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("api/rest/accounts/")
public class AccountRestController {
	@Autowired
	MessageSource messagesource;
	@Autowired
	UserDAO userDAO;
	@Autowired
	AuthorizedDAO authorizedDAO;
	@Autowired
	UploadService uploadService;

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
		return GlobalExceptionHandler.handleValidationException(ex);
	}

	@GetMapping("getAll")
	public ResponseEntity<List<Users>> getAll(Model model) {
		return ResponseEntity.ok(userDAO.findAll());
	}

	@GetMapping("get/{id}")
	public ResponseEntity<Users> getOne(@PathVariable("id") String id) {
		if (!userDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(userDAO.findById(id).get());
	}

	@PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> create(
			@ModelAttribute Users user,
			@RequestParam(value = "avatarFile", required = false) MultipartFile avatarFile) {

		// Kiểm tra username đã tồn tại
		if (user.getUsername() != null && userDAO.existsById(user.getUsername())) {
			return ResponseEntity.badRequest().body("Username đã tồn tại");
		}

		// Upload avatar nếu có
		if (avatarFile != null && !avatarFile.isEmpty()) {
			try {
				// Upload ảnh lên Cloudinary
				String avatarUrl = uploadService.uploadImage(avatarFile, "avatarz");
				user.setImage(avatarUrl);
			} catch (Exception e) {
				return ResponseEntity.status(500).body("Upload avatar thất bại: " + e.getMessage());
			}
		}

		// Lưu user vào DB
		userDAO.save(user);

		return ResponseEntity.ok(user);
	}

	@PutMapping("update/{username}")
	public ResponseEntity<Users> update(@PathVariable("username") String username, @Valid @RequestBody Users user) {
		if (!userDAO.existsById(username)) {
			return ResponseEntity.notFound().build();
		}
		userDAO.save(user);
		return ResponseEntity.ok(user);
	}

	@DeleteMapping("delete/{username}")
	public ResponseEntity<Void> delete(@PathVariable("username") String username) {
		if (!userDAO.existsById(username)) {
			return ResponseEntity.notFound().build();
		}
		authorizedDAO.deleteByUsername(username);
		userDAO.deleteById(username);
		return ResponseEntity.ok().build();
	}

	@GetMapping("search")
	public ResponseEntity<List<Users>> search(@RequestParam("user") String user,
			@RequestParam("keyword") String keyword,
			@RequestParam("status") Optional<Integer> status,
			@RequestParam("role") String role) {
		return ResponseEntity.ok(userDAO.searchUserAdmin(user, keyword, status, role));
	}
}
