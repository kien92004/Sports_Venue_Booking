package duan.sportify.controller;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.dao.OrderDAO;
import duan.sportify.dao.VoucherDAO;
import duan.sportify.entities.Orderdetails;
import duan.sportify.entities.Orders;
import duan.sportify.entities.Voucher;
import duan.sportify.entities.VoucherOfUser;
import duan.sportify.Repository.VoucherOfUserRepository;
import duan.sportify.service.OrderDetailService;
import duan.sportify.service.OrderService;
import duan.sportify.service.UserService;
import duan.sportify.service.VoucherService;

@RestController
@RequestMapping("api/user")
public class OrderController {
	@Autowired
	OrderService orderService;
	@Autowired
	OrderDAO orderDAO;
	@Autowired
	VoucherDAO voucherDAO;
	@Autowired
	VoucherService voucherService;
	@Autowired
	VoucherOfUserRepository voucherOfUserRepository;
	@Autowired
	OrderDetailService orderDetailService;
	@Autowired
	UserService userService;

	String userlogin = null;

	@GetMapping("/order/checkout")
	public ResponseEntity<?> checkOutCart(HttpServletRequest request) {
		String username = (String) request.getSession().getAttribute("username");
		if (username == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("success", false, "message", "User not logged in"));
		}
		return ResponseEntity.ok(Map.of(
				"success", true,
				"user", userService.findById(username)));
	}

	@GetMapping("/order/historyList")
	public ResponseEntity<?> list(HttpServletRequest request,
			@RequestParam(name = "page", defaultValue = "0") int page,
			@RequestParam(name = "size", defaultValue = "5") int size) {
		String username = (String) request.getSession().getAttribute("username");
		if (username == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("success", false, "message", "User not logged in"));
		}

		int safePage = Math.max(page, 0);
		int safeSize = Math.min(Math.max(size, 1), 20);
		Page<Orders> orderPage = orderDAO.findByUsernameOrderByCreatedateDescOrderidDesc(
				username,
				PageRequest.of(safePage, safeSize));

		return ResponseEntity.ok(Map.of(
				"success", true,
				"orders", orderPage.getContent(),
				"page", orderPage.getNumber(),
				"size", orderPage.getSize(),
				"totalPages", orderPage.getTotalPages(),
				"totalElements", orderPage.getTotalElements()));
	}

	@GetMapping("/order/historyList/detail/{id}")
	public ResponseEntity<?> detail(@PathVariable("id") Integer id) {
		List<Orderdetails> orderdetails = orderDetailService.findByOrderId(id);
		if (orderdetails == null || orderdetails.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("success", false, "message", "Order not found"));
		}
		return ResponseEntity.ok(Map.of(
				"success", true,
				"order", orderdetails));
	}

	@DeleteMapping("/order/cancelOrder/{id}")
	@Transactional
	public ResponseEntity<?> cancelOrder(@PathVariable Integer id, HttpServletRequest request) {
		String username = (String) request.getSession().getAttribute("username");
		if (username == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("success", false, "message", "User not logged in"));
		}

		List<Integer> validIds = orderDAO.findOrderIdsForUser(username, List.of(id));
		if (validIds.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("success", false, "message", "Order not found"));
		}

		Orders updateOrder = orderService.findById(id);
		if (updateOrder == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("success", false, "message", "Order not found"));
		}
		orderDAO.deleteOrderDetailsByOrderIds(validIds);
		orderDAO.deleteAllByIdInBatch(validIds);
		return ResponseEntity.ok(Map.of("success", true, "message", "Order canceled"));
	}

	@PostMapping("/order/historyList/deleteMultiple")
	@Transactional
	public ResponseEntity<?> deleteMultipleHistoryOrders(@RequestBody List<Integer> orderIds, HttpServletRequest request) {
		String username = (String) request.getSession().getAttribute("username");
		if (username == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("success", false, "message", "User not logged in"));
		}
		if (orderIds == null || orderIds.isEmpty()) {
			return ResponseEntity.badRequest()
					.body(Map.of("success", false, "message", "Danh sách đơn hàng trống"));
		}

		List<Integer> validIds = orderDAO.findOrderIdsForUser(username, new ArrayList<>(orderIds));
		if (validIds.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("success", false, "message", "Không tìm thấy đơn hàng hợp lệ"));
		}

		orderDAO.deleteOrderDetailsByOrderIds(validIds);
		orderDAO.deleteAllByIdInBatch(validIds);
		return ResponseEntity.ok(Map.of("success", true, "deleted", validIds.size()));
	}

	@PostMapping("/order/cart/voucher")
	public ResponseEntity<?> cartVoucher(
			@RequestParam(required = false) String voucherId,
			@RequestParam(required = false) Long voucherOfUserId,
			HttpServletRequest request) {
		if ((voucherId == null || voucherId.isBlank()) && voucherOfUserId == null) {
			return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"message", "voucherId or voucherOfUserId is required"));
		}

		// Prefer validating by voucherOfUserId (the voucher user actually owns)
		if (voucherOfUserId != null) {
			String username = (String) request.getSession().getAttribute("username");
			if (username == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("success", false, "message", "User not logged in"));
			}

			VoucherOfUser vou = voucherOfUserRepository.findById(voucherOfUserId).orElse(null);
			if (vou == null) {
				return ResponseEntity.ok(Map.of(
						"success", false,
						"discountPercent", 0,
						"voucherMsg", "Không tìm thấy voucher của user"));
			}
			if (vou.getUsername() == null || !vou.getUsername().equals(username)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("success", false, "message", "Forbidden"));
			}

			ZoneId vnZone = ZoneId.of("Asia/Ho_Chi_Minh");
			LocalDate currentDate = LocalDate.now(vnZone);
			boolean isValidDate = (vou.getStartDate() == null || !vou.getStartDate().isAfter(currentDate))
					&& (vou.getEndDate() == null || !vou.getEndDate().isBefore(currentDate));
			boolean hasQuantity = vou.getQuantity() != null && vou.getQuantity() > 0;

			Integer discountPercent = vou.getVoucherid() != null ? vou.getVoucherid().getDiscountpercent() : null;
			if (!hasQuantity) {
				return ResponseEntity.ok(Map.of(
						"success", false,
						"discountPercent", 0,
						"voucherMsg", "Voucher đã hết lượt sử dụng"));
			}
			if (!isValidDate) {
				return ResponseEntity.ok(Map.of(
						"success", false,
						"discountPercent", 0,
						"voucherMsg", "Voucher đã hết hạn sử dụng"));
			}
			if (discountPercent == null || discountPercent <= 0) {
				return ResponseEntity.ok(Map.of(
						"success", false,
						"discountPercent", 0,
						"voucherMsg", "Voucher không hợp lệ"));
			}

			return ResponseEntity.ok(Map.of(
					"success", true,
					"voucherOfUserId", voucherOfUserId,
					"voucherId", vou.getVoucherid() != null ? vou.getVoucherid().getVoucherid() : null,
					"discountPercent", discountPercent,
					"voucherMsg", "Voucher hợp lệ!"));
		}

		// Backward-compatible: validate by voucherId using DB CURDATE()
		if (voucherId == null || voucherId.isBlank()) {
			return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"message", "voucherId is required"));
		}

		Voucher voucher = voucherDAO.findByVoucherId(voucherId);

		if (voucher == null) {
			return ResponseEntity.ok(Map.of(
					"success", false,
					"message", "Không tìm thấy voucher '" + voucherId + "'"));
		}

		// Validate using DB CURDATE() to avoid JVM timezone shifting issues with DATE columns.
		Integer discount = voucherDAO.findActiveDiscountPercent(voucherId);
		if (discount == null || discount <= 0) {
			return ResponseEntity.ok(Map.of(
					"success", false,
					"discountPercent", 0,
					"voucherMsg", "Voucher '" + voucherId + "' đã hết hạn sử dụng"));
		}

		// Nếu hợp lệ
		return ResponseEntity.ok(Map.of(
				"success", true,
				"voucherId", voucherId,
				"discountPercent", discount,
				"voucherMsg", "Voucher hợp lệ!"));
	}

	// Đếm số đơn đặt của user trong hôm nay
	@GetMapping("order/count-today")
	public ResponseEntity<?> countUserBookingsToday(HttpServletRequest request) {
		String username = (String) request.getSession().getAttribute("username");
		if (username == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("success", false, "message", "User not logged in"));
		}
		int count = (orderService.countUserBookingsToday(username));
		return ResponseEntity.ok(Map.of("success", true, "count", count));
	}
}
