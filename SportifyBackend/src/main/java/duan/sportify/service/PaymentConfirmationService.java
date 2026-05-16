package duan.sportify.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import duan.sportify.entities.Bookings;
import duan.sportify.entities.Orders;

@Service
public class PaymentConfirmationService {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private OrderService orderService;

    /**
     * Xác nhận thanh toán đặt sân sau VietQR/SePay.
     * Đặt cọc thành công → "Đã Cọc".
     */
    @Transactional
    public boolean confirmFieldPayment(Integer bookingId, Double paidAmount) {
        if (bookingId == null) {
            return false;
        }
        Bookings booking = bookingService.findByBookingid(bookingId);
        if (booking == null) {
            return false;
        }

        String status = booking.getBookingstatus();
        if ("Hoàn Thành".equals(status) || "Hủy Đặt".equals(status)) {
            return false;
        }
        if ("Đã Cọc".equals(status) || "Đã Thanh Toán".equals(status)) {
            if (booking.getPaymentdate() == null) {
                booking.setPaymentdate(new Date());
                bookingService.update(booking);
            }
            return false;
        }

        booking.setBookingstatus("Đã Cọc");
        booking.setPaymentdate(new Date());
        bookingService.update(booking);
        System.out.println(">>> PaymentConfirmation: FIELD_" + bookingId + " -> Đã Cọc"
                + (paidAmount != null ? " (paid=" + paidAmount + ")" : ""));
        return true;
    }

    @Transactional
    public boolean confirmCartPayment(Integer orderId) {
        if (orderId == null) {
            return false;
        }
        Orders order = orderService.findById(orderId);
        if (order == null) {
            return false;
        }
        if (Boolean.TRUE.equals(order.getPaymentstatus()) || "Đã Thanh Toán".equals(order.getOrderstatus())) {
            if (order.getPaymentdate() == null) {
                order.setPaymentdate(new Date());
                orderService.update(order);
            }
            return false;
        }

        order.setOrderstatus("Đã Thanh Toán");
        order.setPaymentstatus(true);
        order.setPaymentdate(new Date());
        orderService.update(order);
        System.out.println(">>> PaymentConfirmation: CART_" + orderId + " -> Đã Thanh Toán");
        return true;
    }
}
