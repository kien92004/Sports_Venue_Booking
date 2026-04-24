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
import duan.sportify.entities.PaymentLog;
import duan.sportify.dao.PaymentLogDAO;
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

    @Autowired
    private PaymentLogDAO paymentLogDAO;

    @PostMapping("/sepay")
    public ResponseEntity<?> handleSePayWebhook(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println(">>> SEPAY WEBHOOK RECEIVED: " + payload);
            String content = (String) payload.get("content");
            if (content == null) {
                System.out.println(">>> Webhook ignored: No content found.");
                return ResponseEntity.ok().build();
            }
            
            // Trích xuất mã đơn hàng từ nội dung chuyển khoản
            String upperContent = content.toUpperCase();
            System.out.println(">>> Processing content: " + upperContent);
            
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
            } else if (upperContent.contains("CART_") || upperContent.contains("CART#") || upperContent.contains("GIO HANG #") || upperContent.contains("DON HANG #")) {
                String target = "";
                if (upperContent.contains("CART_")) target = "CART_";
                else if (upperContent.contains("CART#")) target = "CART#";
                else if (upperContent.contains("GIO HANG #")) target = "GIO HANG #";
                else if (upperContent.contains("DON HANG #")) target = "DON HANG #";
                
                int startIndex = upperContent.indexOf(target) + target.length();
                int endIndex = startIndex;
                while (endIndex < upperContent.length() && Character.isDigit(upperContent.charAt(endIndex))) {
                    endIndex++;
                }
                if (startIndex < endIndex) {
                    Integer orderId = Integer.parseInt(upperContent.substring(startIndex, endIndex));
                    System.out.println(">>> Extracted orderId: " + orderId);
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
            
            // Lưu log giao dịch bất kể có khớp đơn hàng hay không
            try {
                PaymentLog log = new PaymentLog();
                log.setTransactionId(payload.get("id") != null ? Long.parseLong(payload.get("id").toString()) : null);
                log.setGateway((String) payload.get("gateway"));
                log.setAccountNumber((String) payload.get("accountNumber"));
                log.setContent(content);
                log.setTransferAmount(payload.get("transferAmount") != null ? Double.parseDouble(payload.get("transferAmount").toString()) : 0.0);
                log.setReferenceCode((String) payload.get("referenceCode"));
                log.setAccountName((String) payload.get("accountName"));
                
                // Parse date nếu có (SePay gửi yyyy-MM-dd HH:mm:ss)
                try {
                    String dateStr = (String) payload.get("transactionDate");
                    if (dateStr != null) {
                        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                        log.setTransactionDate(sdf.parse(dateStr));
                    }
                } catch (Exception de) {
                    log.setTransactionDate(new java.util.Date());
                }
                
                paymentLogDAO.save(log);
            } catch (Exception le) {
                System.err.println("Lỗi lưu PaymentLog: " + le.getMessage());
            }
            
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
