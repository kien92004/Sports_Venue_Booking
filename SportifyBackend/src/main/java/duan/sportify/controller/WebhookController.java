package duan.sportify.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.entities.Bookings;
import duan.sportify.entities.Orders;
import duan.sportify.entities.Users;
import duan.sportify.service.BookingService;
import duan.sportify.service.OrderService;
import duan.sportify.service.MailerService;
import duan.sportify.service.UserService;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private MailerService mailerService;

    @PostMapping("/sepay")
    public ResponseEntity<?> handleSePayWebhook(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("Received Webhook: " + payload);
            String content = (String) payload.get("content");
            if (content == null) {
                return ResponseEntity.ok().build();
            }
            
            // Trích xuất mã đơn hàng từ nội dung chuyển khoản
            String upperContent = content.toUpperCase();
            
            if (upperContent.contains("FIELD_")) {
                int startIndex = upperContent.indexOf("FIELD_") + 6;
                int endIndex = startIndex;
                while (endIndex < upperContent.length() && Character.isDigit(upperContent.charAt(endIndex))) {
                    endIndex++;
                }
                if (startIndex < endIndex) {
                    Integer bookingId = Integer.parseInt(upperContent.substring(startIndex, endIndex));
                    Bookings booking = bookingService.findByBookingid(bookingId);
                    
                    if (booking != null && !"Đã Thanh Toán".equals(booking.getBookingstatus())) {
                        booking.setBookingstatus("Đã Thanh Toán");
                        booking.setPaymentdate(new java.util.Date());
                        bookingService.update(booking);
                        System.out.println("Xác nhận thanh toán thành công cho sân: " + bookingId);
                        
                        // Gửi email
                        Users user = userService.findByUsername(booking.getUsername());
                        if (user != null && user.getEmail() != null) {
                            String subject = "Sportify - Xác nhận thanh toán sân thành công";
                            String body = "Xin chào " + user.getFirstname() + " " + user.getLastname() + ",\n\n" +
                                        "Cảm ơn bạn đã đặt sân tại Sportify.\n" +
                                        "Chúng tôi đã nhận được khoản thanh toán cho mã đặt sân: FIELD_" + bookingId + ".\n" +
                                        "Chúc bạn có một buổi chơi thể thao vui vẻ!\n\n" +
                                        "Trân trọng,\nĐội ngũ Sportify.";
                            mailerService.queue(user.getEmail(), subject, body);
                        }
                    }
                }
            } else if (upperContent.contains("CART_")) {
                int startIndex = upperContent.indexOf("CART_") + 5;
                int endIndex = startIndex;
                while (endIndex < upperContent.length() && Character.isDigit(upperContent.charAt(endIndex))) {
                    endIndex++;
                }
                if (startIndex < endIndex) {
                    Integer orderId = Integer.parseInt(upperContent.substring(startIndex, endIndex));
                    Orders order = orderService.findById(orderId);
                    
                    if (order != null && !order.getPaymentstatus()) {
                        order.setOrderstatus("Đã Thanh Toán");
                        order.setPaymentstatus(true);
                        order.setPaymentdate(new java.util.Date());
                        orderService.update(order);
                        System.out.println("Xác nhận thanh toán thành công cho giỏ hàng: " + orderId);
                        
                        // Gửi email
                        Users user = userService.findByUsername(order.getUsername());
                        if (user != null && user.getEmail() != null) {
                            String subject = "Sportify - Xác nhận thanh toán đơn hàng thành công";
                            String body = "Xin chào " + user.getFirstname() + " " + user.getLastname() + ",\n\n" +
                                        "Cảm ơn bạn đã mua sắm tại Sportify.\n" +
                                        "Chúng tôi đã nhận được khoản thanh toán cho mã đơn hàng: CART_" + orderId + ".\n" +
                                        "Chúng tôi sẽ chuẩn bị hàng và giao cho bạn trong thời gian sớm nhất.\n\n" +
                                        "Trân trọng,\nĐội ngũ Sportify.";
                            mailerService.queue(user.getEmail(), subject, body);
                        }
                    }
                }
            }
            
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
