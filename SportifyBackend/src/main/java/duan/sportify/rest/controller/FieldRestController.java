package duan.sportify.rest.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

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
import org.springframework.web.bind.annotation.RequestBody;
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

	@DeleteMapping("delete-multiple")
	public ResponseEntity<Map<String, Object>> deleteMultiple(@RequestBody List<Integer> ids) {
		int count = 0;
		for (Integer id : ids) {
			if (fieldDAO.existsById(id)) {
				fieldDAO.deleteBookingDetailsByFieldId(id);
				fieldDAO.deleteById(id);
				count++;
			}
		}
		return ResponseEntity.ok(Map.of(
				"success", true,
				"message", "Đã xóa thành công " + count + " sân"));
	}

	@PostMapping("import")
	public ResponseEntity<?> importFields(@RequestParam("file") MultipartFile file) {
		try (InputStream is = file.getInputStream()) {
			Workbook workbook = WorkbookFactory.create(is);
			Sheet sheet = workbook.getSheetAt(0);
			List<Field> fields = new ArrayList<>();
			DataFormatter formatter = new DataFormatter();
			
			// Lấy danh sách các mã môn thể thao hợp lệ để kiểm tra
			List<String> validSportTypes = entityManager.createQuery("SELECT s.sporttypeid FROM Sporttype s", String.class).getResultList();
			// Lấy danh sách owner id hợp lệ
			List<Long> validOwnerIds = entityManager.createQuery("SELECT o.ownerId FROM FieldOwnerRegistration o", Long.class).getResultList();

			// Bỏ qua dòng header (i = 0)
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null) continue;
				
				Field field = new Field();
				
				// 1. sporttypeid (cột 1)
				Cell cellSportType = row.getCell(1);
				if (cellSportType != null) {
					String sportTypeId = formatter.formatCellValue(cellSportType).trim().toUpperCase();
					if (!sportTypeId.isEmpty()) {
						if (!validSportTypes.contains(sportTypeId)) {
							return ResponseEntity.status(400).body("Lỗi tại dòng " + (i + 1) + ": Mã môn thể thao '" + sportTypeId + "' không tồn tại trong hệ thống.");
						}
						field.setSporttype(entityManager.getReference(Sporttype.class, sportTypeId));
					} else {
						return ResponseEntity.status(400).body("Lỗi tại dòng " + (i + 1) + ": Cột Mã môn thể thao không được để trống.");
					}
				} else {
					return ResponseEntity.status(400).body("Lỗi tại dòng " + (i + 1) + ": Cột Mã môn thể thao không được để trống.");
				}
				
				// 2. namefield (cột 2)
				Cell cellName = row.getCell(2);
				if (cellName != null) field.setNamefield(formatter.formatCellValue(cellName).trim());
				
				// 3. descriptionfield (cột 3)
				Cell cellDesc = row.getCell(3);
				if (cellDesc != null) field.setDescriptionfield(formatter.formatCellValue(cellDesc).trim());
				
				// 4. price (cột 4)
				Cell cellPrice = row.getCell(4);
				if (cellPrice != null) {
					try {
						field.setPrice(Double.parseDouble(formatter.formatCellValue(cellPrice).trim()));
					} catch(Exception ignored) {}
				}
				
				// 5. image (cột 5)
				Cell cellImage = row.getCell(5);
				if (cellImage != null) field.setImage(formatter.formatCellValue(cellImage).trim());
				
				// 6. address (cột 6)
				Cell cellAddress = row.getCell(6);
				if (cellAddress != null) field.setAddress(formatter.formatCellValue(cellAddress).trim());
				
				// 7. status (cột 7)
				Cell cellStatus = row.getCell(7);
				if (cellStatus != null) {
					String statusStr = formatter.formatCellValue(cellStatus).trim().toLowerCase();
					field.setStatus("1".equals(statusStr) || "true".equals(statusStr));
				} else {
					field.setStatus(true);
				}
				
				// 8. latitude (cột 8)
				Cell cellLat = row.getCell(8);
				if (cellLat != null) {
					try {
						field.setLatitude(Double.parseDouble(formatter.formatCellValue(cellLat).trim()));
					} catch(Exception ignored) {}
				}
				
				// 9. longitude (cột 9)
				Cell cellLng = row.getCell(9);
				if (cellLng != null) {
					try {
						field.setLongitude(Double.parseDouble(formatter.formatCellValue(cellLng).trim()));
					} catch(Exception ignored) {}
				}
				
				// 10. owner_id (cột 10)
				Cell cellOwner = row.getCell(10);
				if (cellOwner != null) {
					try {
						String ownerVal = formatter.formatCellValue(cellOwner).trim();
						if (!ownerVal.isEmpty()) {
							long ownerId = (long) Double.parseDouble(ownerVal);
							if (!validOwnerIds.contains(ownerId)) {
								return ResponseEntity.status(400).body("Lỗi tại dòng " + (i + 1) + ": Chủ sân ID '" + ownerId + "' không tồn tại.");
							}
							field.setOwner(entityManager.getReference(FieldOwnerRegistration.class, ownerId));
						}
					} catch(Exception ignored) {}
				}
				
				// 11. available_shifts (cột 11)
				Cell cellShifts = row.getCell(11);
				if (cellShifts != null) field.setAvailableShifts(formatter.formatCellValue(cellShifts).trim());
				
				// 12. end_date (cột 12)
				Cell cellEndDate = row.getCell(12);
				if (cellEndDate != null) field.setEndDate(formatter.formatCellValue(cellEndDate).trim());
				
				// 13. start_date (cột 13)
				Cell cellStartDate = row.getCell(13);
				if (cellStartDate != null) field.setStartDate(formatter.formatCellValue(cellStartDate).trim());
				
				// Đảm bảo không lỗi NotBlank
				if (field.getNamefield() == null || field.getNamefield().isEmpty()) field.setNamefield("Sân không tên");
				if (field.getAddress() == null || field.getAddress().isEmpty()) field.setAddress("Chưa có địa chỉ");
				if (field.getPrice() == null) field.setPrice(0.0);
				
				fields.add(field);
			}
			
			fieldDAO.saveAll(fields);
			return ResponseEntity.ok(Map.of("success", true, "message", "Đã import thành công " + fields.size() + " sân từ file Excel."));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("Lỗi khi import file: " + e.getMessage());
		}
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
