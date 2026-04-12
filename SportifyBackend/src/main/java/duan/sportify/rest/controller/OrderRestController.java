package duan.sportify.rest.controller;

import java.sql.Date;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.dao.OrderDAO;
import duan.sportify.dao.VoucherDAO;
import duan.sportify.entities.Orders;
import duan.sportify.entities.Voucher;
import duan.sportify.service.OrderService;
import duan.sportify.service.VoucherService;

@RestController
@RequestMapping("/sportify/rest/orders")
public class OrderRestController {
	@Autowired
	OrderService orderService;
	@Autowired
	VoucherService voucherService;
	@Autowired
	VoucherDAO voucherDAO;
	@Autowired
	OrderDAO orderDAO;

	@PostMapping
	public Orders create(@RequestBody Orders orderData) {
		return orderService.create(orderData);
	}

	@GetMapping()
	public List<Orders> getOrderAll() {
		return orderService.findAll();
	}

	@GetMapping("cart/{id}")
	public Voucher getOne(@PathVariable("id") String id) {
		return (Voucher) voucherService.findByVoucherId(id);
	}

	@GetMapping("/search")
	public List<Orders> searchOrders(
			@RequestParam(name = "name", required = false, defaultValue = "") String name,
			@RequestParam(name = "date", required = false, defaultValue = "") String date,
			@RequestParam(name = "status", required = false, defaultValue = "") String status,
			@RequestParam(name = "payment", required = false, defaultValue = "") String payment) {

		// Nếu tất cả tham số đều rỗng, trả về tất cả
		if ((name == null || name.trim().isEmpty()) &&
				(date == null || date.trim().isEmpty()) &&
				(status == null || status.trim().isEmpty()) &&
				(payment == null || payment.trim().isEmpty())) {
			return orderService.findAll();
		}

		Date dateBook = null;
		if (date != null && !date.trim().isEmpty()) {
			try {
				dateBook = Date.valueOf(date);
			} catch (Exception e) {
				// Invalid date format, keep as null
				dateBook = null;
			}
		}

		Optional<Integer> paymentStatus = Optional.empty();
		if (payment != null && !payment.trim().isEmpty()) {
			try {
				paymentStatus = Optional.of(Integer.parseInt(payment));
			} catch (NumberFormatException e) {
				// Invalid payment format, keep as empty
				paymentStatus = Optional.empty();
			}
		}

		return orderDAO.findByConditions(
				name != null ? name.trim() : "",
				dateBook,
				status != null ? status.trim() : "",
				paymentStatus);
	}

	@PutMapping("/{id}")
	public Orders updateOrder(@PathVariable("id") Integer id, @RequestBody Orders orderData) {
		Orders existingOrder = orderService.findById(id);
		if (existingOrder != null) {
			// Cập nhật các trường cho phép
			if (orderData.getAddress() != null) {
				existingOrder.setAddress(orderData.getAddress());
			}
			if (orderData.getNote() != null) {
				existingOrder.setNote(orderData.getNote());
			}
			if (orderData.getOrderstatus() != null) {
				existingOrder.setOrderstatus(orderData.getOrderstatus());
			}
			if (orderData.getPaymentstatus() != null) {
				existingOrder.setPaymentstatus(orderData.getPaymentstatus());
			}
			return orderService.update(existingOrder);
		}
		return null;
	}

	@PostMapping("/confirm/{id}")
	public Orders confirmOrder(@PathVariable("id") Integer id) {
		Orders order = orderService.findById(id);
		if (order != null) {
			order.setOrderstatus("Đang Giao");
			return orderService.update(order);
		}
		return null;
	}

	@PostMapping("/cancel/{id}")
	public Orders cancelOrder(@PathVariable("id") Integer id) {
		Orders order = orderService.findById(id);
		if (order != null) {
			order.setOrderstatus("Hủy Đặt");
			return orderService.update(order);
		}
		return null;
	}

	@PostMapping("/deleteMultiple")
	@Transactional
	public ResponseEntity<?> deleteOrders(@RequestBody List<Integer> orderIds, HttpServletRequest request) {
		String username = (String) request.getSession().getAttribute("username");
		if (username == null) {
			return ResponseEntity.status(401).body(Collections.singletonMap("error", "Bạn chưa đăng nhập"));
		}

		if (orderIds == null || orderIds.isEmpty()) {
			return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Danh sách đơn hàng trống"));
		}

		List<Integer> validIds = orderDAO.findOrderIdsForUser(username, orderIds);
		if (validIds.isEmpty()) {
			return ResponseEntity.status(404)
					.body(Collections.singletonMap("error", "Không tìm thấy đơn hàng hợp lệ"));
		}

		orderDAO.deleteOrderDetailsByOrderIds(validIds);
		orderDAO.deleteAllByIdInBatch(validIds);

		return ResponseEntity.ok(Collections.singletonMap("deleted", validIds.size()));
	}
}
