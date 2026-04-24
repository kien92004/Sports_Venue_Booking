package duan.sportify.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import duan.sportify.DTO.PaymentResDTO;
import duan.sportify.DTO.PermanentPaymentRequest;
import duan.sportify.DTO.ShiftDTO;
import duan.sportify.config.appConfig;
import duan.sportify.entities.Bookingdetails;
import duan.sportify.entities.Bookings;
import duan.sportify.entities.CartItem;
import duan.sportify.entities.Orderdetails;
import duan.sportify.entities.Orders;
import duan.sportify.entities.PaymentMethod;
import duan.sportify.entities.Products;
import duan.sportify.entities.Users;
import duan.sportify.service.BookingDetailService;
import duan.sportify.service.BookingService;
import duan.sportify.service.OrderDetailService;
import duan.sportify.service.OrderService;
import duan.sportify.service.ProductService;
import duan.sportify.service.UserService;
import duan.sportify.service.VNPayService;
import duan.sportify.service.VoucherOfUserService;

@Controller
@RequestMapping("/")
public class PaymentVNPayController {
	private RestTemplate restTemplate = new RestTemplate();
	String ipAddress = null; // Ip máy
	String paymentUrl; // Url trả về
	@Autowired
	UserService userservice;
	@Autowired
	BookingService bookingservice;
	@Autowired
	BookingDetailService bookingdetailservice;
	@Autowired
	OrderService ordersService;
	@Autowired
	duan.sportify.service.CartService cartService; // Thêm dòng này
	@Autowired
	duan.sportify.service.PaymentMethodService paymentMethodService;
	@Autowired
	duan.sportify.Repository.CartItemRepository cartItemRepository;

	@Autowired
	appConfig appConfig;

	@Autowired
	private VoucherOfUserService voucherOfUserService;

	@Autowired
	private BookingService bookingService;

	@Autowired
	private VNPayService vnPayService;

	@Autowired
	private duan.sportify.service.FieldService fieldService;

	// Lấy IP người dùng từ Json API trả về
	public void ApiController(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	public static String getIpAddressFromJsonString(String jsonString) {
		try {
			JSONParser parser = new JSONParser();
			JSONObject jsonObject = (JSONObject) parser.parse(jsonString);
			return (String) jsonObject.get("ip");
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return null;
	}

	// Lấy IP từ HttpServletRequest với fallback
	private String getClientIpAddress(HttpServletRequest request) {
		String ip = request.getHeader("X-Forwarded-For");
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("Proxy-Client-IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("WL-Proxy-Client-IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("HTTP_CLIENT_IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("HTTP_X_FORWARDED_FOR");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr();
		}
		// Nếu vẫn là localhost hoặc IPv6 localhost, dùng IP mặc định
		if (ip != null && (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("127.0.0.1"))) {
			ip = "127.0.0.1";
		}
		return ip != null ? ip : "127.0.0.1";
	}

	// Lấy IP máy người dùng thông qua API (giữ lại cho các endpoint khác)
	@GetMapping("api/sportify/getIp")
	@ResponseBody
	public Map<String, String> getIpAddress() {
		String apiUrl = "https://api.ipify.org?format=json";
		Map<String, String> result = new HashMap<>();

		try {
			ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
			if (response.getStatusCode().is2xxSuccessful()) {
				String responseData = response.getBody();
				ipAddress = getIpAddressFromJsonString(responseData);
				result.put("ip", ipAddress);
			} else {
				result.put("ip", "127.0.0.1");
				result.put("error", "Không thể lấy dữ liệu từ API.");
			}
		} catch (Exception e) {
			System.err.println("Lỗi khi lấy IP từ API: " + e.getMessage());
			result.put("ip", "127.0.0.1");
			result.put("error", "Không thể kết nối đến API: " + e.getMessage());
		}
		return result;
	}

	// Các đối tượng cần thiết để trả về trạng thái thanh toán
	Map<String, String> vnp_Params = new HashMap<>();
	String userlogin = null;
	String phone = null;
	Users userOn = null;
	int bookingidNew = 0;
	Bookings savebooking;
	Bookingdetails savebookingdetail;
	@Autowired
	OrderDetailService orderDetailService;
	@Autowired
	ProductService productsService;

	Orders saveOrder;

	// Gọi API VNPay đặt sân hoặc thanh toán giỏ hàng
	// Field
	@PostMapping("api/user/getIp/create")
	public ResponseEntity<?> createPayment(
			@RequestBody PermanentPaymentRequest body,
			HttpServletRequest request) throws Exception {

		try {
			String clientIp = getClientIpAddress(request);
			String username = (String) request.getSession().getAttribute("username");

			if (username == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("message", "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục."));
			}

			String voucherStr = body.getVoucherOfUserId();
			Integer voucherOfUserId = (voucherStr != null && !voucherStr.isEmpty() && !"undefined".equals(voucherStr) && !"null".equals(voucherStr)) 
					? Integer.parseInt(voucherStr) : 0;

			if (body.getFieldid() == null || body.getShiftId() == null || body.getPlaydate() == null || body.getAmount() == null) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(Map.of("message", "Thiếu thông tin đặt sân (sân, ca, ngày hoặc số tiền)."));
			}

			// ================================
			// ✅ 1. CHECK TRÙNG LỊCH
			// ================================
			// Thời gian hết hạn cho các đơn "Chưa Thanh Toán" (15 phút)
			java.util.Date expiryTime = new java.util.Date(System.currentTimeMillis() - 15 * 60 * 1000);

			// 👉 CASE 1: PERMANENT BOOKING
			if (body.getShifts() != null && !body.getShifts().isEmpty()) {

				for (ShiftDTO shift : body.getShifts()) {

					boolean conflict = bookingService
							.existsOverlappingPermanentBooking(
									body.getFieldid(),
									shift.getShiftId(),
									shift.getDayOfWeek(),
									body.getStartDate(),
									body.getEndDate());

					// if (conflict) {
					// 	return ResponseEntity
					// 			.status(HttpStatus.CONFLICT) // 409
					// 			.body(
					// 					Map.of(
					// 							"message",
					// 							"Sân đã được người khác đặt, vui lòng chọn sân khác hoặc khung giờ khác."));
					// }
				}
			}
			// 👉 CASE 2: BOOKING THEO NGÀY (ONCE)
			else {

				boolean booked = bookingService.existsActiveBookingDetail(
						body.getFieldid(),
						body.getShiftId(),
						body.getPlaydate(),
						expiryTime);

				// if (booked) {
				// 	return ResponseEntity
				// 			.status(HttpStatus.CONFLICT) // 409
				// 			.body(
				// 					Map.of(
				// 							"message",
				// 							"Sân đã được người khác đặt, vui lòng chọn sân khác hoặc khung giờ khác."));
				// }
			}

			// ================================
			// ✅ 3. TẠO BOOKING VÀ TRẢ VỀ LINK QR
			// ================================

			Bookings createdBooking = null;
			if (body.getShifts() != null && !body.getShifts().isEmpty()) {
				createdBooking = bookingService.createBookingPermanent(
						username,
						body.getAmount(),
						body.getPhone(),
						body.getNote(),
						body.getShifts(),
						body.getFieldid(),
						body.getPricefield(),
						body.getStartDate(),
						body.getEndDate());
			} else {
				// Trước khi tạo booking mới, xóa các đơn "Chưa Thanh Toán" đã hết hạn cho sân/ca này
				bookingService.deleteExpiredBookingDetails(
						body.getFieldid(),
						body.getShiftId(),
						body.getPlaydate(),
						expiryTime);

				createdBooking = bookingService.createBooking(
						username,
						body.getAmount(),
						body.getPhone(),
						body.getNote(),
						body.getShiftId(),
						body.getFieldid(),
						body.getPlaydate(),
						body.getPricefield());
			}

			if (createdBooking != null) {
				createdBooking.setBookingstatus("Chưa Thanh Toán");
				bookingService.update(createdBooking);
			}

			String orderId = "FIELD_" + createdBooking.getBookingid();
			String description = "Thanh toan san FIELD_" + createdBooking.getBookingid();
			String paymentUrl = buildQrPageUrl(body.getAmount().toString(), orderId, description, voucherOfUserId);

			PaymentResDTO res = new PaymentResDTO();
			res.setStatus("Ok");
			res.setMessage("Successfully");
			res.setUrl(paymentUrl);
			return ResponseEntity.ok(res);

		} catch (Exception e) {
			e.printStackTrace();
			Throwable rootCause = e;
			while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
				rootCause = rootCause.getCause();
			}
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Lỗi CSDL: " + rootCause.getMessage(), "error", e.toString()));
		}
	}

	// cart
	@PostMapping("api/user/cart/payment")
	public ResponseEntity<PaymentResDTO> createCartPayment(
			@RequestParam("cartid") int cartid,
			@RequestParam("totalPrice") Double totalPrice,
			@RequestParam("phone") String phone,
			@RequestParam("productid") String cartItemIds,
			@RequestParam("quantity") String quantities,
			@RequestParam(value = "cardId", required = false) String cardId,
			@RequestParam(value = "voucherOfUserId", required = false, defaultValue = "0") Integer voucherOfUserId,
			HttpServletRequest request) throws Throwable {

		System.out.println("voucherOfUserId: " + voucherOfUserId);
		// Lấy thông tin user
		String userlogin = (String) request.getSession().getAttribute("username");
		if (userlogin == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new PaymentResDTO("Error", "Bạn chưa đăng nhập.", null, null));
		}
		Users user = userservice.findByUsername(userlogin);
		Date currentDate = new Date();

		// Tạo đơn hàng (Orders)
		Orders newOrder = new Orders();
		newOrder.setUsername(userlogin);
		newOrder.setCreatedate(currentDate);
		newOrder.setTotalprice(totalPrice);
		newOrder.setOrderstatus("Chưa Thanh Toán");
		newOrder.setPaymentstatus(false);
		newOrder.setAddress(user != null ? user.getAddress() : "");

		// Lưu đơn hàng vào DB và giữ lại để cập nhật sau khi thanh toán thành công
		saveOrder = ordersService.create(newOrder);
		
		// Cập nhật lại note với ID đơn hàng thực tế
		saveOrder.setNote("Thanh toán đơn hàng #" + saveOrder.getOrderid());
		ordersService.update(saveOrder);

		// Tạo chi tiết đơn hàng (Orderdetails) từ giỏ hàng
		String[] cartItemIdArray = cartItemIds.split(",");
		String[] quantityArray = quantities.split(",");
		for (int i = 0; i < cartItemIdArray.length; i++) {
			Integer cartItemId = Integer.parseInt(cartItemIdArray[i].trim());
			int quantity = Integer.parseInt(quantityArray[i].trim());

			// Lấy thông tin CartItem từ ID
			CartItem cartItem = cartItemRepository.findById(cartItemId).orElse(null);

			// Kiểm tra xem CartItem có tồn tại không
			if (cartItem == null) {
				System.err.println("Không tìm thấy CartItem với ID: " + cartItemId);
				continue; // Bỏ qua CartItem không tồn tại
			}

			// Lấy product từ CartItem
			Products product = cartItem.getProduct();
			if (product == null) {
				System.err.println("Không tìm thấy sản phẩm trong CartItem ID: " + cartItemId);
				continue;
			}

			Orderdetails detail = new Orderdetails();
			detail.setOrders(saveOrder);
			detail.setProducts(product);
			detail.setQuantity(Double.valueOf(quantity));
			detail.setPrice(
					cartItem.getPrice() - (cartItem.getDiscountprice() != null ? cartItem.getDiscountprice() : 0));
			orderDetailService.create(detail);
		}
		System.out.println("Username: " + saveOrder.getUsername());

		String orderId = "CART_" + saveOrder.getOrderid();
		String cartInfo = "Thanh toan gio hang CART_" + saveOrder.getOrderid();
		String paymentUrl = buildQrPageUrl(totalPrice.toString(), orderId, cartInfo, voucherOfUserId);

		PaymentResDTO paymentResDTO = new PaymentResDTO();
		paymentResDTO.setStatus("Ok");
		paymentResDTO.setMessage("Successfully");
		paymentResDTO.setUrl(paymentUrl);

		return ResponseEntity.ok(paymentResDTO);
	}

	private String buildQrPageUrl(String amount, String orderId, String description, Integer voucherOfUserId) {
		String frontendUrl = appConfig.getFrontendUrl();
		return frontendUrl + "/sportify/qr-payment?amount=" + amount 
				+ "&orderId=" + orderId 
				+ "&voucher=" + (voucherOfUserId != null ? voucherOfUserId : 0)
				+ "&desc=" + description.replaceAll(" ", "%20");
	}

	// Refund

	@GetMapping("api/user/payment/status")
	public ResponseEntity<?> checkPaymentStatus(@RequestParam("orderId") String orderId) {
		boolean isPaid = false;
		if (orderId != null) {
			if (orderId.startsWith("FIELD_")) {
				try {
					Integer bookingId = Integer.parseInt(orderId.substring(6));
					Bookings booking = bookingService.findByBookingid(bookingId);
					if (booking != null && "Đã Thanh Toán".equals(booking.getBookingstatus())) {
						isPaid = true;
					}
				} catch (Exception e) {}
			} else if (orderId.startsWith("CART_")) {
				try {
					Integer cartOrderId = Integer.parseInt(orderId.substring(5));
					Orders order = ordersService.findById(cartOrderId);
					if (order != null && order.getPaymentstatus() != null && order.getPaymentstatus()) {
						isPaid = true;
					}
				} catch (Exception e) {}
			}
		}
		return ResponseEntity.ok(Collections.singletonMap("isPaid", isPaid));
	}

	@PostMapping("/api/user/payment/refund")
	public ResponseEntity<PaymentResDTO> PaymentRefund(@RequestBody PermanentPaymentRequest body,
			HttpServletRequest request) {
		ipAddress = getIpAddress().get("ip");
		String username = (String) request.getSession().getAttribute("username");
		try {
			Long cardId = Long.parseLong(body.getCardId());
			String token = paymentMethodService.getPaymentMethod(cardId).getToken();
			System.out.println("body: " + token);
			// chuyển sang trang thanh toán
			String paymentUrl = vnPayService.generateRefundUrl(body.getAmount().toString(), ipAddress,
					username, token, body.getBookingId());
			return ResponseEntity.ok(new PaymentResDTO("Ok", "Successfully", paymentUrl, null));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new PaymentResDTO("Error", "Error generating refund URL", null, null));
		}

	}

	// Xử lý kết quả thanh toán duy nhất một endpoint
	@GetMapping("api/user/payment/checkoutResult")
	public RedirectView paymentCheckoutResult(HttpServletRequest request) {
		System.out.println("VNPAY RETURN: " + request.getQueryString());
		// user
		String txnRef = request.getParameter("vnp_TxnRef");
		String messeage = request.getParameter("vnp_txn_desc") != null ? request.getParameter("vnp_txn_desc")
				: request.getParameter("vnp_OrderInfo");

		// username and voucher
		String voucherOfUserId = null;
		if (messeage != null && messeage.contains("voi voucher ")) {
			String[] parts = messeage.split("voi voucher ");
			if (parts.length > 1) {
				voucherOfUserId = parts[1];
			}
		}
		Long voucherOfUserIdInt = voucherOfUserId != null && !voucherOfUserId.isEmpty()
				? Long.parseLong(voucherOfUserId)
				: null;
		txnRef = txnRef != null ? txnRef : request.getParameter("vnp_txn_ref");
		Map<String, String> fields = new HashMap<>();
		for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
			String fieldName = params.nextElement();
			String fieldValue = request.getParameter(fieldName);
			if ((fieldValue != null) && (fieldValue.length() > 0)) {
				fields.put(fieldName, fieldValue);
			}
		}

		String transactionStatus;
		double amountInVND = 0;
		String fieldOwnerUsername = null;
		try {
			amountInVND = Double.parseDouble(
					fields.getOrDefault("vnp_Amount", fields.getOrDefault("vnp_amount", "0"))) / 100.0;
		} catch (NumberFormatException e) {
			System.err.println("Invalid vnp_Amount");
		}

		String redirectUrl = appConfig.getFrontendUrl();

		if (txnRef != null && txnRef.startsWith("FIELD_")) {
			// Xử lý đơn sân
			if ("00".equals(request.getParameter("vnp_TransactionStatus"))
					|| "00".equals(request.getParameter("vnp_transaction_status"))) {
				transactionStatus = "success";
				try {
					// Lấy thông tin booking từ session và tạo booking khi thanh toán thành công
					PermanentPaymentRequest pendingBookingData = (PermanentPaymentRequest) request.getSession()
							.getAttribute("pendingBookingData");
					String pendingUsername = (String) request.getSession().getAttribute("pendingUsername");

					System.out.println("Processing successful payment for user: " + pendingUsername);
					System.out.println("Pending booking data: " + (pendingBookingData != null ? "Found" : "NULL"));

					if (pendingBookingData != null && pendingUsername != null) {
						Bookings createdBooking = null;

						if (pendingBookingData.getShifts() != null && !pendingBookingData.getShifts().isEmpty()) {
							System.out.println("Creating permanent booking...");
							createdBooking = bookingService.createBookingPermanent(
									pendingUsername,
									pendingBookingData.getAmount(),
									pendingBookingData.getPhone(),
									pendingBookingData.getNote(),
									pendingBookingData.getShifts(),
									pendingBookingData.getFieldid(),
									pendingBookingData.getPricefield(),
									pendingBookingData.getStartDate(),
									pendingBookingData.getEndDate());
						} else {
							System.out.println("Creating once booking...");
							createdBooking = bookingService.createBooking(
									pendingUsername,
									pendingBookingData.getAmount(),
									pendingBookingData.getPhone(),
									pendingBookingData.getNote(),
									pendingBookingData.getShiftId(),
									pendingBookingData.getFieldid(),
									pendingBookingData.getPlaydate(),
									pendingBookingData.getPricefield());
						}

						if (createdBooking != null) {
							System.out
									.println("Booking created successfully with ID: " + createdBooking.getBookingid());
						} else {
							System.err.println("Failed to create booking - returned null");
						}

						// Xóa dữ liệu tạm thời khỏi session
						request.getSession().removeAttribute("pendingBookingData");
						request.getSession().removeAttribute("pendingUsername");
					} else {
						System.err.println("Missing booking data or username in session");
						System.err.println("pendingBookingData: " + pendingBookingData);
						System.err.println("pendingUsername: " + pendingUsername);
					}

					// Xử lý voucher
					if (voucherOfUserIdInt != null && voucherOfUserIdInt != 0) {
						System.out.println("Using voucher ID: " + voucherOfUserIdInt);
						voucherOfUserService.usedVoucher(voucherOfUserIdInt);
					}
				} catch (Exception e) {
					System.err.println("Error creating booking after successful payment: " + e.getMessage());
					e.printStackTrace();
					// Still continue with the redirect even if booking creation fails
				}
			} else {
				transactionStatus = "fail";
				// Xóa dữ liệu tạm thời khỏi session nếu thanh toán thất bại
				request.getSession().removeAttribute("pendingBookingData");
				request.getSession().removeAttribute("pendingUsername");
			}

			// Lấy field owner từ session
			Integer bookingFieldId = (Integer) request.getSession().getAttribute("bookingFieldId");
			if (bookingFieldId != null) {
				try {
					duan.sportify.entities.Field field = fieldService.findById(bookingFieldId);
					if (field != null && field.getOwner() != null) {
						fieldOwnerUsername = field.getOwner().getUsername();
					}
				} catch (Exception e) {
					System.err.println("Error getting field owner: " + e.getMessage());
				}
			}

			String ownerParam = fieldOwnerUsername != null
					? "&owner=" + URLEncoder.encode(fieldOwnerUsername, StandardCharsets.UTF_8)
					: "";
			redirectUrl += "/payment-result?field=true&orderId=" + txnRef
					+ "&status=" + transactionStatus
					+ "&amount=" + amountInVND
					+ ownerParam;
		} else if (txnRef != null && txnRef.startsWith("CART_")) {
			// Xử lý giỏ hàng
			if ("00".equals(request.getParameter("vnp_TransactionStatus"))
					|| "00".equals(request.getParameter("vnp_transaction_status"))) {
				transactionStatus = "success";
				if (saveOrder != null) {
					saveOrder.setOrderstatus("Đã Thanh Toán");
					saveOrder.setPaymentstatus(true);
					if (voucherOfUserIdInt != null) {
						voucherOfUserService.usedVoucher(voucherOfUserIdInt);
					}
					ordersService.update(saveOrder);
					String usernameOrder = saveOrder.getUsername();
					if (usernameOrder != null && !usernameOrder.isEmpty()) {
						cartService.removeAllFromCart(usernameOrder);
					}
				}
			} else {
				transactionStatus = "fail";
			}
			redirectUrl += "/payment-result?cart=true&orderId=" + txnRef
					+ "&status=" + transactionStatus
					+ "&amount=" + amountInVND;
		} else if (txnRef != null && txnRef.startsWith("REFUND_")) {
			// Xử lý hoàn tiền
			if ("00".equals(request.getParameter("vnp_TransactionStatus"))
					|| "00".equals(request.getParameter("vnp_transaction_status"))) {
				transactionStatus = "success";
				// Xử lý hoàn tiền
				Integer bookingId = null;
				if (messeage != null && messeage.contains("Hoan tien cho san ")) {
					try {
						bookingId = Integer.parseInt(messeage.split("Hoan tien cho san ")[1]);
					} catch (NumberFormatException e) {
						System.err.println("Error parsing booking ID from message: " + messeage);
					}
				}
				if (bookingId != null) {
					Bookings booking = bookingservice.findByBookingid(bookingId);
					booking.setRefund(true);
					bookingservice.update(booking);

					// Lấy field owner từ booking
					try {
						// Tìm field từ booking details
						duan.sportify.entities.Field field = null;
						if (booking.getListOfBookingdetails() != null && !booking.getListOfBookingdetails().isEmpty()) {
							field = booking.getListOfBookingdetails().get(0).getField();
						} else if (booking.getListOfPermanentBookings() != null
								&& !booking.getListOfPermanentBookings().isEmpty()) {
							field = booking.getListOfPermanentBookings().get(0).getField();
						}

						if (field != null && field.getOwner() != null) {
							fieldOwnerUsername = field.getOwner().getUsername();
						}
					} catch (Exception e) {
						System.err.println("Error getting field owner for refund: " + e.getMessage());
					}
				}
			} else {
				transactionStatus = "fail";
			}
			String refundOwnerParam = fieldOwnerUsername != null
					? "&owner=" + URLEncoder.encode(fieldOwnerUsername, StandardCharsets.UTF_8)
					: "";
			redirectUrl += "/payment-result?refund=true&refundId=" + (txnRef != null ? txnRef : "")
					+ "&status=" + transactionStatus
					+ "&amount=" + amountInVND
					+ refundOwnerParam;
		} else {
			// fallback nếu không xác định được loại đơn
			redirectUrl += "/payment-result?orderId=" + (txnRef != null ? txnRef : "")
					+ "&status=fail"
					+ "&amount=" + amountInVND;
		}
		return new RedirectView(redirectUrl);
	}

	// Tạo token thanh toán lưu thẻ
	@PostMapping("api/user/generate-token")
	public ResponseEntity<?> generateToken(
			HttpServletRequest request,
			@RequestParam String username,
			@RequestParam String cardType,
			@RequestParam String bankCode) {

		String ipAddress = getIpAddress().get("ip");
		try {
			String tokenUrl = vnPayService.generateTokenUrl(ipAddress, username, cardType, bankCode);
			return ResponseEntity.ok(Collections.singletonMap("url", tokenUrl));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating token");
		}
	}

	// xử lí dữ liệu token
	@GetMapping("api/user/token-payment")
	public RedirectView tokenPayment(HttpServletRequest request) {
		String vnp_Token = request.getParameter("vnp_token");
		String vnp_AppUserId = request.getParameter("vnp_app_user_id");
		String vnp_TxnRef = request.getParameter("vnp_txn_ref");
		String vnp_CardNumber = request.getParameter("vnp_card_number");
		String vnp_CardType = request.getParameter("vnp_card_type");
		String vnp_BankCode = request.getParameter("vnp_bank_code");
		String vnp_TransactionStatus = request.getParameter("vnp_transaction_status");
		String vnp_PayDate = request.getParameter("vnp_pay_date");

		PaymentMethod paymentMethod = new PaymentMethod();
		paymentMethod.setToken(vnp_Token);
		paymentMethod.setUsername(vnp_AppUserId);
		paymentMethod.setCardNumber(vnp_CardNumber);
		paymentMethod.setCardType(vnp_CardType);
		paymentMethod.setBankCode(vnp_BankCode);
		paymentMethod.setCreatedAt(
				LocalDate.parse(vnp_PayDate.substring(0, 8), DateTimeFormatter.ofPattern("yyyyMMdd")));

		paymentMethodService.addPaymentMethod(paymentMethod);
		String status = null;
		if (vnp_TransactionStatus.equals("00")) {
			status = "success";

		} else {
			status = "fail";
		}
		String redirectUrl = appConfig.getFrontendUrl() + "/payment-methods?" + "&status=" + status + "&vnp_TxnRef="
				+ vnp_TxnRef + "&vnp_CardType=" + vnp_CardType + "&vnp_BankCode=" + vnp_BankCode + "&vnp_CardNumber="
				+ vnp_CardNumber;
		System.out.println("redirectUrl: " + redirectUrl);
		return new RedirectView(redirectUrl);
	}

}