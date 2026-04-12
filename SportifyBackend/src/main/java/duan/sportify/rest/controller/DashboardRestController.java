package duan.sportify.rest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.dao.BookingDAO;
import duan.sportify.dao.BookingDetailDAO;
import duan.sportify.dao.ContactDAO;
import duan.sportify.dao.EventDAO;
import duan.sportify.dao.FieldDAO;
import duan.sportify.dao.OrderDAO;
import duan.sportify.dao.ProductDAO;
import duan.sportify.dao.UserDAO;
import duan.sportify.entities.Contacts;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/rest/dashboard/")
public class DashboardRestController {
	@Autowired
	ProductDAO productDAO;
	@Autowired
	BookingDAO bookingDAO;
	@Autowired
	FieldDAO fieldDAO;
	@Autowired
	UserDAO userDAO;
	@Autowired
	OrderDAO orderDAO;
	@Autowired
	EventDAO eventDAO;
	@Autowired
	ContactDAO contactDAO;
	@Autowired
	BookingDetailDAO bookingDetailDAO;

	// API tổng hợp tất cả các thống kê
	@GetMapping("summary")
	public java.util.Map<String, Object> getDashboardSummary() {
		java.util.Map<String, Object> summary = new java.util.HashMap<>();
		summary.put("totalProduct", productDAO.count());
		summary.put("totalField", fieldDAO.count());
		summary.put("totalUser", userDAO.count());
		summary.put("totalOrderBooking", bookingDAO.sumOrderBooking());
		summary.put("barcharts_a", bookingDAO.getBookingPriceSummary());
		summary.put("barcharts_b", orderDAO.getOrderSumary());
		summary.put("linecharts_a", bookingDAO.countBookingOn6YearReturn());
		summary.put("linecharts_b", orderDAO.countOrderDuring6Years());
		summary.put("thisthatMonth", orderDAO.countThisMonthAndThatMonth());
		summary.put("sumRevenueOrder2Month", orderDAO.sumRevenueOrder2Month());
		summary.put("countBookingInDate", bookingDAO.countBookingInDate());
		summary.put("countFieldActiving", fieldDAO.countFieldActiving());
		summary.put("countOrderInDate", orderDAO.countOrderInDate());
		summary.put("countProductActive", productDAO.countProductActive());
		// Nếu có các API khác, bạn có thể bổ sung thêm ở đây
		return summary;
	}

	// API tổng hợp tất cả các dữ liệu còn lại
	@GetMapping("all-details")
	public java.util.Map<String, Object> getAllDetails() {
		java.util.Map<String, Object> details = new java.util.HashMap<>();
		details.put("thongkebookingtrongngay", bookingDAO.thongkebookingtrongngay());
		details.put("danhsach3contact", contactDAO.fill3ContactOnDate());
		details.put("demLienHeTrongNgay", contactDAO.demLienHeTrongNgay());
		details.put("tongSoPhieuDatSan2Thang", bookingDAO.tongSoPhieuDatSan2Thang());
		details.put("tongSoPhieuOrder2Thang", orderDAO.tongSoPhieuOrder2Thang());
		details.put("tongDoanhThuBooking2Month", bookingDAO.tongDoanhThuBooking2Month());
		details.put("doanhThuOrder2Month", orderDAO.doanhThuOrder2Month());
		details.put("top3SanDatNhieu", bookingDetailDAO.top3SanDatNhieu());
		details.put("top3SanPhamBanNhieu", orderDAO.top3SanPhamBanNhieu());
		details.put("top5UserDatSan", bookingDetailDAO.top5UserDatSan());
		details.put("top5UserOrder", orderDAO.top5UserOrder());
		details.put("thongKeOrderInDay", orderDAO.thongKeOrderInDay());
		return details;
	}

	// tổng sản phẩm
	@GetMapping("totalProduct")
	public long countProduct() {
		return productDAO.count();
	}

	// tổng sân
	@GetMapping("totalField")
	public long countField() {
		return fieldDAO.count();
	}

	// tổng người dùng
	@GetMapping("totalUser")
	public long countUser() {
		return userDAO.count();
	}

	// tổng phiếu đặt trong ngày
	@GetMapping("totalOrderBooking")
	public long sumOrderBooking() {
		return bookingDAO.sumOrderBooking();
	}

	// barcharts
	// cột a
	@GetMapping("barcharts_a")
	public List<Object[]> totalPriceOn6YearReturn() {
		return bookingDAO.getBookingPriceSummary();
	}

	// cột b
	@GetMapping("barcharts_b")
	public List<Object[]> totalOrderOn6YearReturn() {
		return orderDAO.getOrderSumary();
	}

	// linecharts
	// line a
	@GetMapping("linecharts_a")
	public List<Object[]> conutBookingOnDuring6Years() {
		return bookingDAO.countBookingOn6YearReturn();
	}

	// line b
	@GetMapping("linecharts_b")
	public List<Object[]> countOrderOnDuring6Years() {
		return orderDAO.countOrderDuring6Years();
	}

	// Tính tổng số phiếu trong tháng hiện tại và tháng trước cho bảng bookings và
	// orders
	@GetMapping("thisthatMonth")
	public List<Object[]> thisThatMonth() {
		return orderDAO.countThisMonthAndThatMonth();
	}

	// Tính tổng số doanh thu bán hàng tháng hiện tại và tháng trước cho bảng order
	@GetMapping("sumRevenueOrder2Month")
	public List<Object[]> sumRevenueOrder2Month() {
		return orderDAO.sumRevenueOrder2Month();
	}

	// đếm số hoa đơn trong ngày
	@GetMapping("countBookingInDate")
	public Integer countBookingInDate() {
		return bookingDAO.countBookingInDate();
	}

	// đếm sân dang hoạt động
	@GetMapping("countFieldActiving")
	public Integer countFieldActiving() {
		return fieldDAO.countFieldActiving();
	}

	// đếm phiếu dặt trong ngày
	@GetMapping("countOrderInDate")
	public Integer countOrderInDate() {
		return orderDAO.countOrderInDate();
	}

	// đếm sản phẩm đang bày bán
	@GetMapping("countProductActive")
	public Integer countProductActive() {
		return productDAO.countProductActive();
	}

	// thong ke booking trong ngay
	@GetMapping("thongkebookingtrongngay")
	public List<Object[]> thongkebookingtrongngay() {
		return bookingDAO.thongkebookingtrongngay();
	}

	// lấy danh sach 3 con tac trongg ngay
	@GetMapping("danhsach3contact")
	public List<Contacts> danhsach3contact() {
		return contactDAO.fill3ContactOnDate();
	}

	// dem liên hệ trong ngày
	@GetMapping("demLienHeTrongNgay")
	public int demLienHeTrongNgay() {
		return contactDAO.demLienHeTrongNgay();
	}

	// dem tổng số phiếu dat san tháng này vs thang trước
	@GetMapping("tongSoPhieuDatSan2Thang")
	public List<Object[]> tongSoPhieuDatSan2Thang() {
		return bookingDAO.tongSoPhieuDatSan2Thang();
	}

	// dem tổng số phiếu order tháng này vs thang trước
	@GetMapping("tongSoPhieuOrder2Thang")
	public List<Object[]> tongSoPhieuOrder2Thang() {
		return orderDAO.tongSoPhieuOrder2Thang();
	}

	// dem tổng dat san doanh thu tháng này vs thang trước
	@GetMapping("tongDoanhThuBooking2Month")
	public List<Object[]> tongDoanhThuBooking2Month() {
		return bookingDAO.tongDoanhThuBooking2Month();
	}

	// tổng doanh thu ban hang tháng này vs thang trước
	@GetMapping("doanhThuOrder2Month")
	public List<Object[]> doanhThuOrder2Month() {
		return orderDAO.doanhThuOrder2Month();
	}

	// top 3 san dat nhiều nhất
	@GetMapping("top3SanDatNhieu")
	public List<Object[]> top3SanDatNhieu() {
		return bookingDetailDAO.top3SanDatNhieu();
	}

	// top san pham ban nhieu nhat
	@GetMapping("top3SanPhamBanNhieu")
	public List<Object[]> top3SanPhamBanNhieu() {
		return orderDAO.top3SanPhamBanNhieu();
	}
	// top 5 user dat san nhiều nhat

	@GetMapping("top5UserDatSan")
	public List<Object[]> top5UserDatSan() {
		return bookingDetailDAO.top5UserDatSan();
	}

	// top 5 user mua hang nhieu nhat
	@GetMapping("top5UserOrder")
	public List<Object[]> top5UserOrder() {
		return orderDAO.top5UserOrder();
	}

	// thong ke order trong ngay thongKeOrderInDay
	@GetMapping("thongKeOrderInDay")
	public List<Object[]> thongKeOrderInDay() {
		return orderDAO.thongKeOrderInDay();
	}

	// ============= OWNER ENDPOINTS =============

	// API tổng hợp tất cả các thống kê cho owner
	@GetMapping("summary/owner")
	public java.util.Map<String, Object> getDashboardSummaryByOwner(
			@RequestParam String ownerUsername) {
		java.util.Map<String, Object> summary = new java.util.HashMap<>();
		summary.put("totalProduct", productDAO.count()); // TODO: filter by owner if needed
		summary.put("totalField", fieldDAO.findByOwnerUsername(ownerUsername).size());
		summary.put("totalUser", userDAO.count());
		summary.put("totalOrderBooking", bookingDAO.sumOrderBooking());
		summary.put("countBookingInDate", bookingDAO.countBookingInDate());
		summary.put("countFieldActiving", fieldDAO.countFieldActiving());
		summary.put("countOrderInDate", orderDAO.countOrderInDate());
		summary.put("countProductActive", productDAO.countProductActive());
		return summary;
	}

	// API tổng hợp tất cả các dữ liệu còn lại cho owner
	@GetMapping("all-details/owner")
	public java.util.Map<String, Object> getAllDetailsByOwner(
			@RequestParam String ownerUsername) {
		java.util.Map<String, Object> details = new java.util.HashMap<>();
		details.put("thongkebookingtrongngay", bookingDAO.countFieldsBookedToday(ownerUsername));
		details.put("danhsach3contact", contactDAO.fill3ContactOnDate());
		details.put("demLienHeTrongNgay", contactDAO.demLienHeTrongNgay());
		details.put("tongSoPhieuDatSan2Thang", bookingDAO.tongSoPhieuDatSan2Thang());
		details.put("tongSoPhieuOrder2Thang", orderDAO.tongSoPhieuOrder2Thang());
		details.put("tongDoanhThuBooking2Month", bookingDAO.tongDoanhThuBooking2Month());
		details.put("doanhThuOrder2Month", orderDAO.doanhThuOrder2Month());
		details.put("top3SanDatNhieu", bookingDAO.getTop3FieldsBookedToday(ownerUsername));
		details.put("top3SanPhamBanNhieu", orderDAO.top3SanPhamBanNhieu());
		details.put("top5UserDatSan", bookingDetailDAO.top5UserDatSan());
		details.put("top5UserOrder", orderDAO.top5UserOrder());
		details.put("thongKeOrderInDay", orderDAO.thongKeOrderInDay());
		return details;
	}
}
