package duan.sportify.rest.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hibernate.Hibernate;
//import javax.validation.Valid;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import duan.sportify.GlobalExceptionHandler;
import duan.sportify.dao.FieldDAO;
import duan.sportify.dao.FieldOwnerRegistrationDAO;
import duan.sportify.entities.Field;
import duan.sportify.entities.FieldOwnerRegistration;
import duan.sportify.entities.Sporttype;
import duan.sportify.service.UploadService;
import duan.sportify.utils.ErrorResponse;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("rest/fields/")
public class FieldRestController {
	@Autowired
	MessageSource messagesource;
	@Autowired
	FieldDAO fieldDAO;
	@Autowired
	FieldOwnerRegistrationDAO fieldOwnerDAO;

	@PersistenceContext
	private EntityManager entityManager;
	@Autowired
	UploadService uploadService;

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
		return GlobalExceptionHandler.handleValidationException(ex);
	}

	@GetMapping("getAll")
	public ResponseEntity<List<Field>> getAll(Model model,
			@RequestParam(value = "ownerUsername", required = false) String ownerUsername) {
		if (ownerUsername != null && !ownerUsername.isEmpty()) {
			List<Field> fields = fieldDAO.findByOwnerUsername(ownerUsername);
			// Initialize owner proxy để serialization JSON có đầy đủ dữ liệu
			fields.forEach(field -> initializeAssociations(field));
			return ResponseEntity.ok(fields);
		}
		List<Field> fields = fieldDAO.findAll();
		// Initialize owner proxy để serialization JSON có đầy đủ dữ liệu
		fields.forEach(field -> initializeAssociations(field));
		return ResponseEntity.ok(fields);
	}

	@GetMapping("getAllActive")
	public ResponseEntity<List<Field>> getAllActive(Model model) {
		List<Field> fields = fieldDAO.findAllActive();
		// Initialize owner proxy để serialization JSON có đầy đủ dữ liệu
		fields.forEach(field -> initializeAssociations(field));
		return ResponseEntity.ok(fields);
	}

	@GetMapping("get/{id}")
	public ResponseEntity<Field> getOne(@PathVariable("id") Integer id) {
		if (!fieldDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		Field field = fieldDAO.findById(id).get();
		// Initialize owner proxy
		initializeAssociations(field);
		return ResponseEntity.ok(field);
	}

	private void initializeAssociations(Field field) {
		if (field == null) {
			return;
		}
		if (field.getOwner() != null) {
			Hibernate.initialize(field.getOwner());
		}
		if (field.getSporttype() != null) {
			Hibernate.initialize(field.getSporttype());
		}
	}

	@PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> create(
			@RequestParam("sporttypeid") String sporttypeid,
			@ModelAttribute Field field,
			@RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
			@RequestParam(value = "username", required = false) String username,
			HttpServletRequest request,
			HttpSession session) throws IOException {

		// ánh xạ sporttype từ id
		field.setSporttype(entityManager.getReference(Sporttype.class, sporttypeid));

		if (field.getFieldid() != null && fieldDAO.existsById(field.getFieldid())) {
			return ResponseEntity.badRequest().body("Field đã tồn tại");
		}

		// Set owner từ username parameter hoặc session
		if (username == null) {
			username = (String) session.getAttribute("username");
		}

		if (username != null) {
			FieldOwnerRegistration owner = fieldOwnerDAO.findByUsername(username);
			if (owner != null) {
				field.setOwner(owner);
				System.out
						.println("Set owner cho sân: " + owner.getBusinessName() + " (ID: " + owner.getOwnerId() + ")");
			} else {
				System.out.println("Không tìm thấy FieldOwnerRegistration cho username: " + username);
			}
		} else {
			System.out.println("Username không được cung cấp");
		}

		// Nếu address chưa được cung cấp hoặc là rỗng, tự động lấy từ request
		if (field.getAddress() == null || field.getAddress().trim().isEmpty()) {
			String clientIP = getClientIP(request);
			field.setAddress("Địa chỉ sân (IP: " + clientIP + ")");
			System.out.println("Tự động set địa chỉ cho sân mới: " + field.getAddress());
		}

		// Upload avatar nếu có
		if (imageFile != null && !imageFile.isEmpty()) {
			try {
				// Upload ảnh lên Cloudinary
				String imageUrl = uploadService.uploadImage(imageFile, "field_images");
				System.out.println("Uploaded image URL: " + imageUrl);
				field.setImage(imageUrl);
			} catch (Exception e) {
				return ResponseEntity.status(500).body("Upload avatar thất bại: " + e.getMessage());
			}
		}
		Field savedField = fieldDAO.save(field);
		// Trả về entity vừa lưu
		return ResponseEntity.ok(savedField);
	}

	// Helper method để lấy Client IP từ request
	private String getClientIP(HttpServletRequest request) {
		String xForwardedFor = request.getHeader("X-Forwarded-For");
		if (xForwardedFor == null || xForwardedFor.isEmpty() || "unknown".equalsIgnoreCase(xForwardedFor)) {
			xForwardedFor = request.getHeader("Proxy-Client-IP");
		}
		if (xForwardedFor == null || xForwardedFor.isEmpty() || "unknown".equalsIgnoreCase(xForwardedFor)) {
			xForwardedFor = request.getHeader("WL-Proxy-Client-IP");
		}
		if (xForwardedFor == null || xForwardedFor.isEmpty() || "unknown".equalsIgnoreCase(xForwardedFor)) {
			xForwardedFor = request.getHeader("HTTP_CLIENT_IP");
		}
		if (xForwardedFor == null || xForwardedFor.isEmpty() || "unknown".equalsIgnoreCase(xForwardedFor)) {
			xForwardedFor = request.getHeader("HTTP_X_FORWARDED_FOR");
		}
		if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
			return xForwardedFor.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}

	@PutMapping(value = "update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> update(
			@PathVariable("id") Integer id,
			@RequestPart("field") Field field,
			@RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

		if (!fieldDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}

		// Upload avatar nếu có
		if (imageFile != null && !imageFile.isEmpty()) {
			try {
				// Upload ảnh lên Cloudinary
				String imageUrl = uploadService.uploadImage(imageFile, "field_images");
				System.out.println("Updated image URL: " + imageUrl);
				field.setImage(imageUrl);
			} catch (Exception e) {
				return ResponseEntity.status(500).body("Upload avatar thất bại: " + e.getMessage());
			}
		}

		Field savedField = fieldDAO.save(field);
		return ResponseEntity.ok(savedField);
	}

	@DeleteMapping("delete/{id}")
	public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Integer id) {
		if (!fieldDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		fieldDAO.deleteBookingDetailsByFieldId(id);
		fieldDAO.deleteById(id);
		return ResponseEntity.ok(Map.of(
				"success", true,
				"message", "Field deleted successfully"));
	}

	// search team in admin
	@GetMapping("search")
	public ResponseEntity<List<Field>> search(
			@RequestParam("namefield") Optional<String> namefield,
			@RequestParam("sporttypeid") Optional<String> sporttypeid,
			@RequestParam("status") Optional<Integer> status) {
		return ResponseEntity.ok(fieldDAO.searchFieldAdmin(namefield, sporttypeid, status));
	}
}
