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
            
            String upperContent = content.toUpperCase();
            System.out.println(">>> Processing content: " + upperContent);
            
            // 1. Xử lý thanh toán cho Sân (FIELD_)
            if (upperContent.contains("FIELD")) {
                try {
                    // Hỗ trợ nhiều định dạng: FIELD_123, FIELD123, FIELD#123, FIELD #123
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("FIELD(?:_|\\s*#\\s*|\\s+)?(\\d+)");
                    java.util.regex.Matcher matcher = pattern.matcher(upperContent);
                    
                    if (matcher.find()) {
                        Integer bookingId = Integer.parseInt(matcher.group(1));
                        System.out.println(">>> Found FIELD bookingId: " + bookingId);
                        
                        Bookings booking = bookingService.findByBookingid(bookingId);
                        if (booking != null) {
                            if (!"Đã Thanh Toán".equals(booking.getBookingstatus())) {
                                booking.setBookingstatus("Đã Thanh Toán");
                                booking.setPaymentdate(new java.util.Date());
                                bookingService.update(booking);
                                System.out.println(">>> SUCCESS: Confirmed payment for booking FIELD_" + bookingId);
                                
                                // Gửi email thông báo
                                sendBookingSuccessEmail(booking, bookingId);
                            } else {
                                System.out.println(">>> INFO: Booking FIELD_" + bookingId + " was already paid.");
                            }
                        } else {
                            System.err.println(">>> ERROR: Booking not found for ID: " + bookingId);
                        }
                    }
                } catch (Exception e) {
                    System.err.println(">>> ERROR processing FIELD_ content: " + e.getMessage());
                }
            } 
            
            // 2. Xử lý thanh toán cho Giỏ hàng (CART_)
            // Kiểm tra các định dạng có thể có của mã đơn hàng
            String cartTarget = null;
            if (upperContent.contains("CART_")) cartTarget = "CART_";
            else if (upperContent.contains("CART#")) cartTarget = "CART#";
            else if (upperContent.contains("GIO HANG #")) cartTarget = "GIO HANG #";
            else if (upperContent.contains("DON HANG #")) cartTarget = "DON HANG #";

            if (cartTarget != null) {
                try {
                    // Tạo regex linh hoạt cho CART_123, CART123, CART#123, GIO HANG #123...
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                            "(?:CART(?:_|\\s*#\\s*|\\s+)?|GIO\\s*HANG\\s*#?\\s*|DON\\s*HANG\\s*#?\\s*)(\\d+)");
                    java.util.regex.Matcher matcher = pattern.matcher(upperContent);
                    
                    if (matcher.find()) {
                        Integer orderId = Integer.parseInt(matcher.group(1));
                        System.out.println(">>> Found CART orderId: " + orderId);
                        
                        Orders order = orderService.findById(orderId);
                        if (order != null) {
                            if (order.getPaymentstatus() == null || !order.getPaymentstatus()) {
                                order.setOrderstatus("Đã Thanh Toán");
                                order.setPaymentstatus(true);
                                order.setPaymentdate(new java.util.Date());
                                orderService.update(order);
                                System.out.println(">>> SUCCESS: Confirmed payment for order CART_" + orderId);
                                
                                // Gửi email thông báo
                                sendOrderSuccessEmail(order, orderId);
                            } else {
                                System.out.println(">>> INFO: Order CART_" + orderId + " was already paid.");
                            }
                        } else {
                            System.err.println(">>> ERROR: Order not found for ID: " + orderId);
                        }
                    }
                } catch (Exception e) {
                    System.err.println(">>> ERROR processing CART_ content: " + e.getMessage());
                }
            }
            
            // 3. Lưu log giao dịch vào DB
            savePaymentLog(payload, content);
            
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            System.err.println(">>> CRITICAL WEBHOOK ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private void sendBookingSuccessEmail(Bookings booking, Integer bookingId) {
        try {
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
        } catch (Exception e) {
            System.err.println(">>> ERROR sending booking email: " + e.getMessage());
        }
    }

    private void sendOrderSuccessEmail(Orders order, Integer orderId) {
        try {
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
        } catch (Exception e) {
            System.err.println(">>> ERROR sending order email: " + e.getMessage());
        }
    }

    private void savePaymentLog(Map<String, Object> payload, String content) {
        try {
            PaymentLog log = new PaymentLog();
            
            // Xử lý an toàn cho transaction ID (có thể là String hoặc Number)
            Object rawId = payload.get("id");
            if (rawId != null) {
                if (rawId instanceof Number) {
                    log.setTransactionId(((Number) rawId).longValue());
                } else {
                    try {
                        // Tránh lỗi nếu SePay gửi số dưới dạng chuỗi hoặc scientific notation
                        log.setTransactionId(Double.valueOf(rawId.toString()).longValue());
                    } catch (Exception e) {
                        System.err.println("Could not parse transaction ID: " + rawId);
                    }
                }
            }
            
            log.setGateway((String) payload.get("gateway"));
            log.setAccountNumber((String) payload.get("accountNumber"));
            log.setContent(content);
            
            Object amountObj = payload.get("transferAmount");
            if (amountObj != null) {
                log.setTransferAmount(Double.parseDouble(amountObj.toString()));
            }
            
            log.setReferenceCode((String) payload.get("referenceCode"));
            log.setAccountName((String) payload.get("accountName"));
            
            String dateStr = (String) payload.get("transactionDate");
            if (dateStr != null) {
                try {
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    log.setTransactionDate(sdf.parse(dateStr));
                } catch (Exception de) {
                    log.setTransactionDate(new java.util.Date());
                }
            } else {
                log.setTransactionDate(new java.util.Date());
            }
            
            paymentLogDAO.save(log);
        } catch (Exception le) {
            System.err.println(">>> ERROR saving PaymentLog: " + le.getMessage());
        }
    }
}
