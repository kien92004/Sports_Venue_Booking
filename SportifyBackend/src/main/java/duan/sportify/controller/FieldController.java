package duan.sportify.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.DTO.FieldWithDistanceDTO;
import duan.sportify.entities.Bookings;
import duan.sportify.entities.FavoriteField;
import duan.sportify.entities.Field;
import duan.sportify.entities.FieldOwnerRegistration;
import duan.sportify.entities.Shifts;
import duan.sportify.entities.Sporttype;
import duan.sportify.entities.Users;
import duan.sportify.service.BookingDetailService;
import duan.sportify.service.BookingService;
import duan.sportify.service.FieldService;
import duan.sportify.service.ShiftService;
import duan.sportify.service.SportTypeService;
import duan.sportify.service.UserService;
import duan.sportify.service.VoucherService;
import duan.sportify.utils.BookingCalculator;

@SuppressWarnings("unused")
@RestController
@RequestMapping("api")
public class FieldController {
	@Autowired
	ShiftService shiftservice; // Service giờ chơi theo ca
	@Autowired
	FieldService fieldservice; // Service sân
	@Autowired
	SportTypeService sporttypeservice; // Service loại môn thể thao
	@Autowired
	UserService userService; // Service User
	@Autowired
	BookingService bookingservice; // Service booking
	@Autowired
	BookingDetailService bookingdetailservice; // Service bookingdetail
	@Autowired
	VoucherService voucherService; // Service mã giảm giá

	// Biến chứa ID kiểu sportype khi click vào chọn
	private String selectedSportTypeId; // Loại môn thể thao chọn để tìm kiếm
	private String dateselect; // Ngày được chọn
	String userlogin; // username người dùng đã đăng nhập
	String phone = null; // SĐT

	// Helper method to clean model data for serialization
	private Map<String, Object> cleanModelData(Model model) {
		Map<String, Object> result = new HashMap<>();
		Map<String, Object> modelMap = model.asMap();

		for (Map.Entry<String, Object> entry : modelMap.entrySet()) {
			String key = entry.getKey();
			Object value = entry.getValue();

			if (value instanceof List) {
				List<?> list = (List<?>) value;
				if (!list.isEmpty()) {
					Object firstItem = list.get(0);

					if (firstItem instanceof Sporttype) {
						List<Map<String, Object>> cleanList = new ArrayList<>();
						for (Object item : list) {
							Sporttype sporttype = (Sporttype) item;
							Map<String, Object> cleanItem = new HashMap<>();
							cleanItem.put("sporttypeid", sporttype.getSporttypeid());
							cleanItem.put("categoryname", sporttype.getCategoryname());
							cleanList.add(cleanItem);
						}
						result.put(key, cleanList);
						continue;
					}

					if (firstItem instanceof Field) {
						List<Map<String, Object>> cleanFields = new ArrayList<>();
						for (Object item : list) {
							if (item instanceof Field) {
								cleanFields.add(mapSingleField((Field) item));
							}
						}
						result.put(key, cleanFields);
						continue;
					}
				}
			}

			if (value instanceof Field) {
				result.put(key, mapSingleField((Field) value));
				continue;
			}

			result.put(key, value);
		}

		return result;
	}

	private Map<String, Object> mapSingleField(Field field) {
		Map<String, Object> fieldMap = new HashMap<>();
		fieldMap.put("fieldid", field.getFieldid());
		fieldMap.put("namefield", field.getNamefield());
		fieldMap.put("descriptionfield", field.getDescriptionfield());
		fieldMap.put("price", field.getPrice());
		fieldMap.put("image", field.getImage());
		fieldMap.put("address", field.getAddress());
		fieldMap.put("status", field.getStatus());
		fieldMap.put("sporttypeid", field.getSporttype() != null ? field.getSporttype().getSporttypeid() : null);
		fieldMap.put("latitude", field.getLatitude());
		fieldMap.put("longitude", field.getLongitude());

		if (field.getSporttype() != null) {
			Map<String, Object> sporttypeMap = new HashMap<>();
			sporttypeMap.put("sporttypeid", field.getSporttype().getSporttypeid());
			sporttypeMap.put("categoryname", field.getSporttype().getCategoryname());
			fieldMap.put("sporttype", sporttypeMap);
		} else {
			fieldMap.put("sporttype", null);
		}

		FieldOwnerRegistration owner = field.getOwner();
		if (owner != null) {
			Map<String, Object> ownerMap = new HashMap<>();
			ownerMap.put("ownerId", owner.getOwnerId());
			ownerMap.put("businessName", owner.getBusinessName());
			ownerMap.put("phone", owner.getPhone());
			ownerMap.put("address", owner.getAddress());
			ownerMap.put("status", owner.getStatus());
			fieldMap.put("owner", ownerMap);
		} else {
			fieldMap.put("owner", null);
		}

		return fieldMap;
	}

	// Tìm sân trống theo input: date, sportype, giờ chơi
	@PostMapping("sportify/field/search")
	public ResponseEntity<?> SreachData(@RequestParam("dateInput") String dateInput,
			@RequestParam("categorySelect") String categorySelect,
			@RequestParam("shiftSelect") int shiftSelect, Model model) {
		selectedSportTypeId = categorySelect; // môn thể thao được chọn ráng biến toàn cục
		// Lấy List sân thỏa mãn đầu vào người dùng tìm: date, môn thể thao, giờ chơi
		// theo ID ca
		List<Field> listsearch = fieldservice.findSearch(dateInput, categorySelect, shiftSelect); // List sân thỏa mãn
																									// giá trị truyền
																									// vào
		List<Shifts> shiftById = shiftservice.findShiftById(shiftSelect); // List này để lấy tên ca đổ lên thông báo
		List<Sporttype> sportypeById = sporttypeservice.findSporttypeById(categorySelect); // List này lấy tên môn thể
																							// thao đổ lên thông báo
		List<Shifts> shift = shiftservice.findAll(); // Gọi tất cả danh sách ca
		List<Sporttype> sporttypeListNotAll = sporttypeservice.findAll(); // Đổ môn thể thao không có Tất cả
		List<Sporttype> sporttypeList = sporttypeservice.findAll(); // Đổ tất cả môn thể thao
		Sporttype tatca = new Sporttype(); // Tạo đối tượng loại môn thể thao
		tatca.setCategoryname("Tất cả"); // Thêm Tất cả vào list đối tượng
		tatca.setSporttypeid("tatca"); // Có Id là tatca
		sporttypeList.add(tatca);
		// Sắp xếp danh sách loại môn thể thao theo: Tất cả đầu tiên => các môn khác
		Collections.sort(sporttypeList, new Comparator<Sporttype>() {
			@Override
			public int compare(Sporttype s1, Sporttype s2) {
				// Xác định logic sắp xếp
				if (s1.getCategoryname().equals("Tất cả")) {
					return -1; // Đẩy "Tất cả" lên đầu
				} else if (s2.getCategoryname().equals("Tất cả")) {
					return 1; // Đẩy "Tất cả" lên đầu
				} else {
					return s1.getCategoryname().compareTo(s2.getCategoryname());
				}
			}
		});
		// Hiển thị danh sách đã sắp xếp
		for (Sporttype sporttype : sporttypeList) {
			model.addAttribute("cates", sporttype);
		}
		// Format yyyy-mm-dd thành dd-mm-yyyy
		LocalDate date = LocalDate.parse(dateInput);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
		String formattedDate = date.format(formatter);
		// Thông báo kết quả tìm kiếm
		String nameshift = null; // Biến chứa tên ca
		for (int i = 0; i < shiftById.size(); i++) { // Lấy tên ca theo id ca nhập vào
			nameshift = shiftById.get(i).getNameshift();
		}
		String namesporttype = null; // Biến chứa tên môn thể thao
		for (int i = 0; i < sportypeById.size(); i++) { // Lấy tên môn thể thao theo id nhập vào
			namesporttype = sportypeById.get(i).getCategoryname();
		}
		String message = "Kết quả tìm kiếm sân trống: ";

		// Add các đối tượng vào model để qua giao diện hiển thị
		model.addAttribute("dateInput", dateInput); // Ngày nhập vào tìm kiếm
		model.addAttribute("namesporttype", namesporttype); // Tên môn thể thao
		model.addAttribute("nameshift", nameshift); // Tên ca
		model.addAttribute("formattedDate", formattedDate); // Ngày đã format thành dd-mm-yyyy
		model.addAttribute("thongbao", message); // Thông báo kết quả tìm kiếm
		model.addAttribute("cateNotAll", sporttypeListNotAll); // Môn thể thao không có Tất cả
		model.addAttribute("shift", shift); // Tất cả danh sách ca
		model.addAttribute("selectedSportTypeId", selectedSportTypeId); // ID Môn thể thao đã chọn tìm kiếm
		model.addAttribute("cates", sporttypeList); // Tất cả các môn thể thao
		model.addAttribute("fieldList", listsearch); // Danh sách sân thỏa mản khi tìm kiếm
		// Chuyển hướng đến trang sân
		return ResponseEntity.ok(cleanModelData(model));
	}

	@GetMapping("sportify/field")
	public ResponseEntity<?> viewField(Model model, HttpServletRequest request) {
		userlogin = (String) request.getSession().getAttribute("username"); // Kiểm tra xem có username đang đăng nhập

		selectedSportTypeId = "tatca"; // Giá trị được chọn mặc định môn thể thao là tất cả
		String sportTypeId = null; // Id loại môn thể thao ban đầu rỗng
		List<Shifts> shift = shiftservice.findAll(); // Gọi tất cả danh sách ca
		List<Field> fieldList = fieldservice.findAll(); // Gọi tất cả sân thể thao
		List<Field> activeFields = new ArrayList<>(); // Danh sách sân đang hoạt động
		List<Sporttype> sporttypeListNotAll = sporttypeservice.findAll(); // Đổ môn thể thao không có Tất cả
		List<Sporttype> sporttypeList = sporttypeservice.findAll(); // Gọi tất cả loại môn thể thao có trong hệ thống
		Sporttype tatca = new Sporttype(); // Tạo đối tượng loại môn thể thao
		tatca.setCategoryname("Tất cả"); // Thêm Tất Cả vào list loại môn thể thao
		tatca.setSporttypeid("tatca"); // Ráng Id sporttype Tất cả = tatca
		sporttypeList.add(tatca); // Add đối tượng tatca vô danh sách loại môn thể thao
		// Đổ dữ liệu sân trạng thái đang hoạt động
		for (int i = 0; i < fieldList.size(); i++) {
			if (fieldList.get(i).getStatus()) { // Kiểm tra nếu status == true
				activeFields.add(fieldList.get(i)); // Thêm sân có status == true vào danh sách activeFields
			}
		}
		// Sắp xếp danh sách loại môn thể thao theo: Tất cả đầu tiên => các môn khác
		Collections.sort(sporttypeList, new Comparator<Sporttype>() {
			@Override
			public int compare(Sporttype s1, Sporttype s2) {
				// Xác định logic sắp xếp
				if (s1.getCategoryname().equals("Tất cả")) {
					return -1; // Đẩy "Tất cả" lên đầu
				} else if (s2.getCategoryname().equals("Tất cả")) {
					return 1; // Đẩy "Tất cả" lên đầu
				} else {
					return s1.getCategoryname().compareTo(s2.getCategoryname());
				}
			}
		});
		// Hiển thị danh sách đã sắp xếp
		for (Sporttype sporttype : sporttypeList) {
			model.addAttribute("cates", sporttype);
		}
		// Add các đối tượng vào model để qua giao diện hiển thị
		model.addAttribute("cateNotAll", sporttypeListNotAll); // môn thể thao không có tất cả
		model.addAttribute("shift", shift); // Tất cả danh sách ca
		model.addAttribute("fieldList", activeFields); // Dách sách sân đang còn hoạt động
		model.addAttribute("selectedSportTypeId", selectedSportTypeId); // Danh mục môn thể thao được chọn
		model.addAttribute("cates", sporttypeList); // Category môn thể thao
		// Chuyển hướng đến trang sân
		return ResponseEntity.ok(cleanModelData(model));
	}

	// View Field theo môn thể thao - input vào là ID sportype
	@GetMapping("sportify/field/{cid}")
	public ResponseEntity<?> list(Model model, @PathVariable("cid") String cid) {
		selectedSportTypeId = cid; // Giá trị id sporttype khi người dùng chọn
		List<Shifts> shift = shiftservice.findAll(); // Lấy tất cả ca
		List<Field> fieldList = fieldservice.findAll(); // Lấy tất cả sân
		List<Field> activeFields = new ArrayList<>(); // Danh sách sân đang còn hoạt động
		List<Field> fieldListById = fieldservice.findBySporttypeId(cid); // Lấy sân theo Id môn thể thao
		List<Sporttype> sporttypeListNotAll = sporttypeservice.findAll(); // Đổ môn thể thao không có Tất cả
		List<Sporttype> sporttypeList = sporttypeservice.findAll(); // Lấy tất cả môn thể thao
		Sporttype tatca = new Sporttype(); // Tạo đối tượng loại môn thể thao
		tatca.setCategoryname("Tất cả"); // Thêm Tất Cả vào list loại môn thể thao
		sporttypeList.add(tatca); // Add đối tượng tatca vô danh sách loại môn thể thao
		tatca.setSporttypeid("tatca"); // Ráng Id sporttype Tất cả = tatca
		// Đổ dữ liệu sân trạng thái đang hoạt động
		for (int i = 0; i < fieldList.size(); i++) {
			if (fieldList.get(i).getStatus()) { // Kiểm tra nếu status == true
				activeFields.add(fieldList.get(i)); // Thêm sân có status == true vào danh sách activeFields
			}
		}
		// Sắp xếp danh sách loại môn thể thao theo: Tất cả đầu tiên => các môn khác
		Collections.sort(sporttypeList, new Comparator<Sporttype>() {
			@Override
			public int compare(Sporttype s1, Sporttype s2) {
				// Xác định logic sắp xếp
				if (s1.getCategoryname().equals("Tất cả")) {
					return -1; // Đẩy "Tất cả" lên đầu
				} else if (s2.getCategoryname().equals("Tất cả")) {
					return 1; // Đẩy "Tất cả" lên đầu
				} else {
					return s1.getCategoryname().compareTo(s2.getCategoryname());
				}
			}
		});
		// Hiển thị danh sách đã sắp xếp
		for (Sporttype sporttype : sporttypeList) {
			model.addAttribute("cates", sporttype);
		}
		// Nếu id sportype được chọn là tatca thì trả về tất cả sân
		if (cid.equalsIgnoreCase("tatca")) {
			model.addAttribute("fieldList", activeFields);
		} else { // Còn lại thì trả về các sân theo môn thể thao

			model.addAttribute("fieldList", fieldListById);
		}
		// Add các đối tượng vào model để qua giao diện hiển thị
		model.addAttribute("cateNotAll", sporttypeListNotAll); // môn thể thao không có tất cả
		model.addAttribute("shift", shift); // Tất cả các ca
		model.addAttribute("cates", sporttypeList); // Tất cả môn thể thao đổ lên category
		model.addAttribute("selectedSportTypeId", selectedSportTypeId); // Môn thể thao được chọn ở danh mục
		// Chuyển hướng trang giao diện sân
		return ResponseEntity.ok(cleanModelData(model));

	}

	// Chuyển hướng trang detail sân
	@GetMapping("sportify/field/detail/{idField}")
	public ResponseEntity<?> viewDetail(Model model, @PathVariable Integer idField, HttpServletRequest request) { // Lấy
																													// id
																													// sân
																													// về
		userlogin = (String) request.getSession().getAttribute("username"); // Kiểm tra xem có username đang đăng nhập
		List<Field> fieldListById = fieldservice.findFieldById(idField); // Đổ sân theo id lấy giao diện về.
		String nameSportype = fieldservice.findNameSporttypeById(idField); // Tên môn thể thao để hiện thị trong các sân
																			// liên quan ở Detail
		String idSporttype = fieldservice.findIdSporttypeById(idField); // Lấy id môn thể thao dựa vào sân đang chọn
																		// Detail
		List<Field> fieldListByIdSporttype = fieldservice.findBySporttypeIdlimit3(idSporttype); // Danh sách 3 sân liên
																								// quan đến môn thể thao
																								// đang xem.
		// Dữ liệu hiển thị trong trang Detail
		model.addAttribute("user", userlogin); // Người dùng đang xem
		model.addAttribute("fieldListByIdSporttype", fieldListByIdSporttype); // Sân liên quan
		model.addAttribute("nameSportype", nameSportype); // Tên môn thể thao
		model.addAttribute("fieldListById", fieldListById); // Thông tin sân đã chọn
		// Trả dữ liệu vào sân detail
		return ResponseEntity.ok(cleanModelData(model));
	}

	LocalTime time = null; // giờ bắt đầu
	// Chuyển hướng sang checkout booking

	@GetMapping("/user/field/booking/{idField}")
	public ResponseEntity<?> booking(
			@PathVariable("idField") Integer idField,
			@RequestParam("shiftid") Integer shiftId,
			@RequestParam("dateselect") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateselect,
			HttpServletRequest request) {
		String username = (String) request.getSession().getAttribute("username");
		if (username == null) {
			return ResponseEntity.status(401)
					.body(Collections.singletonMap("redirect", "/sportify/login"));
		}
		// Lấy thông tin user
		Users profile = userService.findByUsername(username);

		// Lấy danh sách ca theo shiftId
		List<Shifts> shiftList = shiftservice.findShiftById(shiftId);
		if (shiftList.isEmpty()) {
			return ResponseEntity.badRequest()
					.body(Collections.singletonMap("error", "Ca không tồn tại"));
		}

		LocalTime time = shiftList.get(0).getStarttime();
		String nameShift = shiftList.get(0).getNameshift();

		// Lấy thông tin sân
		List<Field> fieldListById = fieldservice.findFieldById(idField);
		if (fieldListById.isEmpty()) {
			return ResponseEntity.badRequest()
					.body(Collections.singletonMap("error", "Sân không tồn tại"));
		}

		double giasan = fieldListById.get(0).getPrice();
		String nameSportype = fieldservice.findNameSporttypeById(idField);

		// Tính phụ thu
		double phuthu = 0;
		LocalTime timeToCompare = LocalTime.of(17, 0);
		LocalTime timeToSix = LocalTime.of(6, 0);
		if (time.isAfter(timeToCompare) || time.isBefore(timeToSix)) {

		}
		double totalprice = giasan;

		// Trả về JSON
		return ResponseEntity.ok(Map.of(
				"user", profile,
				"nameShift", nameShift,
				"dateselect", dateselect,
				"fieldListById", fieldListById,
				"totalprice", totalprice));
	}

	// Kiểm tra giờ trống của sân trong Detail
	@PostMapping("sportify/field/detail/check")
	public ResponseEntity<?> searchShiftDefault(
			Model model,
			@RequestParam("fieldid") Integer fieldId,
			@RequestParam("dateInput") String date) {

		// Lấy thông tin sân
		List<Field> fieldListById = fieldservice.findFieldById(fieldId);
		if (fieldListById.isEmpty()) {
			return ResponseEntity.badRequest().body("Không tìm thấy sân");
		}

		// ✅ LẤY DANH SÁCH CA TRỐNG TỪ SERVICE
		List<Shifts> emptyShifts = shiftservice.findShiftDate(fieldId, date);

		// ✅ Nếu ngày chọn là hôm nay → lọc các ca chưa tới giờ
		LocalDate selectedDate = LocalDate.parse(date);
		LocalDate currentDate = LocalDate.now();
		LocalTime currentTime = LocalTime.now();

		if (selectedDate.equals(currentDate)) {
			emptyShifts = emptyShifts.stream()
					.filter(shift -> shift.getStarttime().isAfter(currentTime))
					.toList();
		}

		// Format ngày dd-MM-yyyy
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
		String formattedDate = selectedDate.format(formatter);

		// Đổ dữ liệu ra view
		model.addAttribute("shiftsNull", emptyShifts);
		model.addAttribute("date", date);
		model.addAttribute("formattedDate", formattedDate);
		model.addAttribute("fieldListById", fieldListById);

		return ResponseEntity.ok(cleanModelData(model));
	}

	// Lịch sử đặt sân
	@GetMapping("user/field/profile/historybooking")
	public ResponseEntity<?> viewHistoryField(Model model, HttpServletRequest request) {

		userlogin = (String) request.getSession().getAttribute("username");
		if (userlogin == null) {
			return ResponseEntity.status(401)
					.body(Collections.singletonMap("error", "Bạn chưa đăng nhập"));
		}
		List<Object[]> listbookingRaw = bookingservice.getBookingInfoByUsername(userlogin);
		List<Map<String, Object>> listbooking = new ArrayList<>();

		for (Object[] row : listbookingRaw) {
			Map<String, Object> bookingMap = new HashMap<>();
			bookingMap.put("bookingId", row[0]);
			bookingMap.put("bookingDate", row[1]);
			bookingMap.put("bookingPrice", row[2]);
			bookingMap.put("note", row[3]);
			bookingMap.put("bookingStatus", row[4]);
			bookingMap.put("fieldName", row[5]);
			bookingMap.put("fieldImage", row[6]);
			bookingMap.put("startDate", row[7]); // permanent start date hoặc null
			bookingMap.put("endDate", row[8]); // permanent end date hoặc null
			bookingMap.put("dayOfWeeks", row[9]); // dayOfWeek list như "11,14" hoặc null
			bookingMap.put("shiftIds", row[10]); // shiftId list như "4,5" hoặc null
			bookingMap.put("fieldIds", row[11]); // fieldId list như "2,2" hoặc null
			bookingMap.put("bookingType", row[12]); // "PERMANENT" hoặc "ONCE"

			listbooking.add(bookingMap);
		}

		model.addAttribute("listbooking", listbooking);

		return ResponseEntity.ok(cleanModelData(model));
	}

	@GetMapping("user/field/profile/historybooking/detail")
	public ResponseEntity<?> viewDetail(Model model,
			@RequestParam("bookingId") Integer bookingId,
			@RequestParam("bookingPrice") double bookingPrice,
			HttpServletRequest request) {

		double giamgia = 0.0;
		double phuthu = 0.0;
		double tiencoc = 0.0;
		double tamtinh = 0.0;
		double conlai = 0.0;
		double soluongDat = 0.0;
		double price = 0.0;

		// =========================
		// Lấy booking từ bookingId
		Bookings booking = bookingservice.findByBookingid(bookingId);

		// 1️⃣ Lấy chi tiết booking 1 lần
		// =========================
		List<Object[]> listBookingOnce = bookingservice.getBookingInfoByBookingDetail(bookingId);

		if (!listBookingOnce.isEmpty()) {
			Object[] bookingOnce = listBookingOnce.get(0);
			Double priceBookOnce = (Double) bookingOnce[5];
			price = priceBookOnce * 1;
		}
		// 2️⃣ Lấy chi tiết permanent booking
		// =========================
		List<Object[]> permanentDetails = bookingservice.getPermanentBookingByBookingId(bookingId);
		// Gộp permanent shift theo bookingId + startDate + endDate + fieldId
		List<Map<String, Object>> permanentGrouped = new ArrayList<>();
		Map<String, Map<String, Object>> groupedMap = new LinkedHashMap<>();

		for (Object[] row : permanentDetails) {
			if (row == null || row.length < 8)
				continue;
			Integer bookingIdPermanent = parseToInteger(row[0]);
			LocalDate startDate = row[1] instanceof java.sql.Date ? ((java.sql.Date) row[1]).toLocalDate() : null;
			LocalDate endDate = row[2] instanceof java.sql.Date ? ((java.sql.Date) row[2]).toLocalDate() : null;
			Integer shiftId = parseToInteger(row[3]);
			Integer dayOfWeek = parseToInteger(row[4]);
			Integer fieldId = parseToInteger(row[5]);
			String fieldName = row[6] != null ? row[6].toString() : "";
			String fieldImage = row[7] != null ? row[7].toString() : "";
			Field field = fieldservice.findById(fieldId);

			// Tạo key duy nhất để gộp
			String key = bookingIdPermanent + "-" + startDate + "-" + endDate + "-" + fieldId;
			Map<String, Object> group = groupedMap.get(key);
			if (group == null) {
				group = new HashMap<>();
				group.put("bookingType", "PERMANENT");
				group.put("startDate", startDate);
				group.put("endDate", endDate);
				group.put("fieldId", fieldId);
				group.put("fieldName", fieldName);
				group.put("fieldImage", fieldImage);
				group.put("bookingId", bookingIdPermanent);
				group.put("shifts", new ArrayList<Map<String, Object>>());
				groupedMap.put(key, group);
			}

			// Thêm shift vào shifts
			Map<String, Object> shiftInfo = new HashMap<>();
			shiftInfo.put("shiftId", shiftId);
			shiftInfo.put("dayOfWeek", dayOfWeek);

			@SuppressWarnings("unchecked")
			List<Map<String, Object>> shifts = (List<Map<String, Object>>) group.get("shifts");
			shifts.add(shiftInfo);

			List<Integer> dayOfWeeks = shifts.stream()
					.map(shift -> (Integer) shift.get("dayOfWeek"))
					.toList();

			int totalDay = BookingCalculator.countTotalBookings(startDate, endDate, dayOfWeeks);
			price = BookingCalculator.calculateTotalPrice(startDate, endDate, dayOfWeeks, field.getPrice());
		}

		// Flatten groupedMap sang permanentGrouped list
		permanentGrouped.addAll(groupedMap.values());

		conlai = price - booking.getBookingprice();
		// =========================
		// 5️⃣ Đổ dữ liệu lên model
		// =========================
		model.addAttribute("conlai", conlai);
		model.addAttribute("thanhtien", price);
		model.addAttribute("phuthu", phuthu);
		model.addAttribute("giamgia", giamgia);
		model.addAttribute("tamtinh", price);
		model.addAttribute("tiencoc", booking.getBookingprice());
		model.addAttribute("listBookingOnce", listBookingOnce);
		model.addAttribute("listBookingPermanent", permanentGrouped);

		return ResponseEntity.ok(cleanModelData(model));
	}

	// =========================
	// Helper methods
	// =========================
	private Integer parseToInteger(Object obj) {
		if (obj == null)
			return null;
		if (obj instanceof Number)
			return ((Number) obj).intValue();
		try {
			return Integer.parseInt(obj.toString());
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private Double parseToDouble(Object obj) {
		if (obj == null)
			return 0.0;
		if (obj instanceof Number)
			return ((Number) obj).doubleValue();
		try {
			return Double.parseDouble(obj.toString());
		} catch (NumberFormatException e) {
			return 0.0;
		}
	}

	@GetMapping("user/favorite")
	public ResponseEntity<?> getAllFavoriteFields(HttpServletRequest request) {

		// Lấy username người dùng đã đăng nhập
		String userlogin = (String) request.getSession().getAttribute("username");
		// user
		List<FavoriteField> favoriteFields = fieldservice.findFavoriteByUsername(userlogin);

		// ép load thủ công để tránh Lazy proxy
		favoriteFields.forEach(f -> {
			f.getUsername();
			f.getField().getFieldid();
		});

		return ResponseEntity.ok(favoriteFields);
	}

	@GetMapping("user/favorite/check")
	public Object checkFavoriteField(@RequestParam Integer fieldId, HttpServletRequest request) {
		// Lấy username người dùng đã đăng nhập
		String username = (String) request.getSession().getAttribute("username");
		boolean isFavorite = fieldservice.checkFavoriteField(username, fieldId);
		return ResponseEntity.ok(Collections.singletonMap("isFavorite", isFavorite));
	}

	// favorite
	@PostMapping("user/favorite/{fieldId}")
	public ResponseEntity<?> getFavoriteFields(@PathVariable Integer fieldId, HttpServletRequest request) {
		// user
		String userlogin = (String) request.getSession().getAttribute("username");
		System.out.println("usernameLogin" + userlogin);

		fieldservice.addFavoriteField(userlogin, fieldId);
		return ResponseEntity.ok().body(Collections.singletonMap("message", "Thêm sân yêu thích thành công"));
	}

	@DeleteMapping("user/favorite/{fieldId}")
	public ResponseEntity<?> removeFavoriteField(@PathVariable Integer fieldId, HttpServletRequest request) {
		String userlogin = (String) request.getSession().getAttribute("username");
		// user
		fieldservice.removeFavoriteField(userlogin, fieldId);
		return ResponseEntity.ok().body(Collections.singletonMap("message", "Xóa sân yêu thích thành công"));
	}

	// API tìm sân gần nhất dựa trên tọa độ người dùng
	@GetMapping("sportify/field/nearest")
	public ResponseEntity<?> findNearestFields(
			@RequestParam Double latitude,
			@RequestParam Double longitude,
			@RequestParam(required = false, defaultValue = "tatca") String categorySelect,
			@RequestParam(required = false, defaultValue = "10") Integer limit,
			@RequestParam(required = false, defaultValue = "7") Integer maxDistance,
			Model model) {

		// Kiểm tra và đảm bảo tọa độ hợp lệ cho Việt Nam
		if (latitude < 8 || latitude > 23 || longitude < 102 || longitude > 109) {
			System.out.println("CẢNH BÁO: Tọa độ không nằm trong Việt Nam. Đang điều chỉnh...");
			latitude = 21.0285; // Tọa độ mặc định Hà Nội
			longitude = 105.8542;
		}

		System.out.println("Đang tìm sân gần nhất với tọa độ: " + latitude + ", " + longitude +
				", loại sân: " + categorySelect + ", khoảng cách tối đa: " + maxDistance + "km");

		// Lấy các sân gần nhất - Truyền thêm maxDistance vào để lọc
		List<FieldWithDistanceDTO> nearestFieldsWithDistance = fieldservice.findNearestFields(latitude, longitude,
				categorySelect, limit, maxDistance != null ? maxDistance.doubleValue() : null);

		// Trích xuất danh sách Field từ DTO để sử dụng trong các phương thức hiện tại
		List<Field> nearestFields = new ArrayList<>();
		for (FieldWithDistanceDTO dto : nearestFieldsWithDistance) {
			nearestFields.add(dto.getField());
		}

		// Thêm các thông tin khác cần thiết cho view (tương tự như viewField)
		selectedSportTypeId = categorySelect;
		List<Shifts> shift = shiftservice.findAll();
		List<Sporttype> sporttypeListNotAll = sporttypeservice.findAll();
		List<Sporttype> sporttypeList = sporttypeservice.findAll();
		Sporttype tatca = new Sporttype();
		tatca.setCategoryname("Tất cả");
		tatca.setSporttypeid("tatca");
		sporttypeList.add(tatca);

		// Sắp xếp danh sách loại môn thể thao theo: Tất cả đầu tiên => các môn khác
		Collections.sort(sporttypeList, new Comparator<Sporttype>() {
			@Override
			public int compare(Sporttype s1, Sporttype s2) {
				// Xác định logic sắp xếp
				if (s1.getCategoryname().equals("Tất cả")) {
					return -1; // Đẩy "Tất cả" lên đầu
				} else if (s2.getCategoryname().equals("Tất cả")) {
					return 1; // Đẩy "Tất cả" lên đầu
				} else {
					return s1.getCategoryname().compareTo(s2.getCategoryname());
				}
			}
		});

		// Tạo map khoảng cách cho các field để hiển thị
		Map<Integer, String> fieldDistances = new HashMap<>();
		for (FieldWithDistanceDTO dto : nearestFieldsWithDistance) {
			fieldDistances.put(dto.getField().getFieldid(), dto.getFormattedDistance());
		}

		// Add các đối tượng vào model để qua giao diện hiển thị
		model.addAttribute("cateNotAll", sporttypeListNotAll);
		model.addAttribute("shift", shift);
		model.addAttribute("fieldList", nearestFields);
		model.addAttribute("fieldDistances", fieldDistances);
		model.addAttribute("selectedSportTypeId", selectedSportTypeId);
		model.addAttribute("cates", sporttypeList);
		model.addAttribute("userLatitude", latitude);
		model.addAttribute("userLongitude", longitude);
		model.addAttribute("isNearestSearch", true);

		return ResponseEntity.ok(cleanModelData(model));
	}

	// API lấy số lượng đặt sân của người dùng trong ngày hôm nay
	@GetMapping("user/field/booking/count")
	public ResponseEntity<?> getTodayBookingCount(HttpServletRequest request) {
		String username = (String) request.getSession().getAttribute("username");
		if (username == null) {
			return ResponseEntity.status(401)
					.body(Collections.singletonMap("error", "Bạn chưa đăng nhập"));
		}
		int bookingCount = bookingservice.countUserBookingsToday(username);
		return ResponseEntity.ok(Collections.singletonMap("bookingCount", bookingCount));
	}

}
