package duan.sportify.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import duan.sportify.config.VNPayConfig;

@Service
public class VNPayService {
    @Autowired
    private VNPayConfig vnPayConfig;

    // Tạo Url Thanh toán VNPAY
    public String generatePaymentUrl(String inputMoney, String ipAddress, Integer voucherOfUserId, String username)
            throws Exception {
        int amount = (int) Double.parseDouble(inputMoney) * 100;
        String vnp_TxnRef = "FIELD_" + VNPayConfig.getRandomNumber(8);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VNPayConfig.vnp_Version);
        vnp_Params.put("vnp_Command", VNPayConfig.vnp_Command);
        vnp_Params.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_Returnurl());
        vnp_Params.put("vnp_IpAddr", ipAddress);
        vnp_Params.put("vnp_OrderType", "250000");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // build query
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        System.out.println("Generated VNPAY Payment URL: " + VNPayConfig.vnp_PayUrl + "?" + query.toString()
                + "&vnp_SecureHash=" + vnp_SecureHash);
        return VNPayConfig.vnp_PayUrl + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    // Tạo Url Tạo token VNPAY
    public String generateTokenUrl(String ipAddress, String appUserId, String cardType, String bankCode)
            throws Exception {
        String vnp_TxnRef = "TOKEN_" + VNPayConfig.getRandomNumber(8);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_version", "2.1.0");
        vnp_Params.put("vnp_command", "token_create");
        vnp_Params.put("vnp_tmn_code", VNPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_app_user_id", appUserId);
        vnp_Params.put("vnp_bank_code", bankCode);
        vnp_Params.put("vnp_locale", "vn");
        vnp_Params.put("vnp_card_type", cardType);
        vnp_Params.put("vnp_txn_ref", vnp_TxnRef);
        vnp_Params.put("vnp_txn_desc", "Tao token cho khach hang " + appUserId);
        vnp_Params.put("vnp_return_url", vnPayConfig.getVnp_ReturnurlToken());
        vnp_Params.put("vnp_cancel_url", vnPayConfig.getVnp_Cancelurl());
        vnp_Params.put("vnp_ip_addr", ipAddress);
        vnp_Params.put("vnp_create_date", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        // Sắp xếp theo thứ tự alphabet
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                if (itr.hasNext()) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        // Tạo mã checksum
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());

        // Trả về URL hoàn chỉnh (merchant redirect người dùng tới URL này)
        return "https://sandbox.vnpayment.vn/token_ui/create-token.html?" + query + "&vnp_secure_hash="
                + vnp_SecureHash;
    }

    // Thanh toan bằng token
    public String generatePaymentUrlByToken(String inputMoney, String ipAddress, String appUserId, String token,
            Integer voucherOfUserId)
            throws Exception {

        // Nhân 100 theo quy định của VNPAY
        int amount = (int) (Double.parseDouble(inputMoney) * 100);
        String vnp_TxnRef = "FIELD_" + VNPayConfig.getRandomNumber(8);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_version", VNPayConfig.vnp_Version);
        vnp_Params.put("vnp_command", "token_pay");
        vnp_Params.put("vnp_tmn_code", VNPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_txn_ref", vnp_TxnRef);
        vnp_Params.put("vnp_app_user_id", appUserId);
        vnp_Params.put("vnp_token", token);
        vnp_Params.put("vnp_amount", String.valueOf(amount));
        vnp_Params.put("vnp_curr_code", "VND");
        vnp_Params.put("vnp_txn_desc", "Thanh toan don hang " + vnp_TxnRef + " cho username " + appUserId
                + " voi voucher " + (voucherOfUserId != null ? voucherOfUserId : 0));
        vnp_Params.put("vnp_create_date", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        vnp_Params.put("vnp_ip_addr", ipAddress);
        vnp_Params.put("vnp_return_url", vnPayConfig.getVnp_Returnurl());
        vnp_Params.put("vnp_locale", "vi");

        // --- Tạo chuỗi hash & query ---
        // build query
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        return VNPayConfig.vnp_PayToken + "?" + query.toString() + "&vnp_secure_hash="
                + vnp_SecureHash;
    }

    // Hoàn tiền bằng VNPAY
    public String generateRefundUrl(String inputMoney, String ipAddress, String appUserId, String token,
            Integer bookingId) throws Exception {
        System.out.println("Generating refund URL...");
        System.err.println("Input Money: " + inputMoney + ", IP Address: " + ipAddress + ", App User ID: " + appUserId
                + ", Token: " + token);
        // Nhân 100 như quy định của VNPAY
        int amount = (int) (Double.parseDouble(inputMoney) * 100);
        String vnp_TxnRef = "REFUND_" + VNPayConfig.getRandomNumber(8);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_version", VNPayConfig.vnp_Version);
        vnp_Params.put("vnp_command", "token_pay");
        vnp_Params.put("vnp_tmn_code", VNPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_txn_ref", vnp_TxnRef);
        vnp_Params.put("vnp_app_user_id", appUserId);
        vnp_Params.put("vnp_token", token);
        vnp_Params.put("vnp_amount", String.valueOf(amount));
        vnp_Params.put("vnp_curr_code", "VND");
        vnp_Params.put("vnp_txn_desc", "Hoan tien cho san " + bookingId);
        vnp_Params.put("vnp_create_date", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        vnp_Params.put("vnp_ip_addr", ipAddress);
        vnp_Params.put("vnp_return_url", vnPayConfig.getVnp_Returnurl());
        vnp_Params.put("vnp_locale", "vi");

        // --- Tạo chuỗi hash & query ---
        // build query
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        return VNPayConfig.vnp_PayToken + "?" + query.toString() + "&vnp_secure_hash="
                + vnp_SecureHash;
    }

    // --------------------- THANH TOÁN GIỎ HÀNG BẰNG TOKEN---------------------
    // Thanh toán giỏ hàng bằng token
    public String generateCartPaymentUrlByToken(String inputMoney, String ipAddress, String appUserId, String token,
            Integer voucherOfUserId, String cartInfo) throws Exception {

        // Nhân 100 theo quy định của VNPAY
        int amount = (int) (Double.parseDouble(inputMoney) * 100);
        String vnp_TxnRef = "CART_" + VNPayConfig.getRandomNumber(8);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_version", VNPayConfig.vnp_Version);
        vnp_Params.put("vnp_command", "token_pay");
        vnp_Params.put("vnp_tmn_code", VNPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_txn_ref", vnp_TxnRef);
        vnp_Params.put("vnp_app_user_id", appUserId);
        vnp_Params.put("vnp_token", token);
        vnp_Params.put("vnp_amount", String.valueOf(amount));
        vnp_Params.put("vnp_curr_code", "VND");
        vnp_Params.put("vnp_txn_desc", cartInfo + " voi voucher " + (voucherOfUserId != null ? voucherOfUserId : 0));
        vnp_Params.put("vnp_create_date", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        vnp_Params.put("vnp_ip_addr", ipAddress);
        vnp_Params.put("vnp_return_url", vnPayConfig.getVnp_Returnurl());
        vnp_Params.put("vnp_locale", "vi");

        // --- Tạo chuỗi hash & query ---
        // build query
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        return VNPayConfig.vnp_PayToken + "?" + query.toString() + "&vnp_secure_hash="
                + vnp_SecureHash;
    }

    // Tạo URL thanh toán cho giỏ hàng
    public String generateCartPaymentUrl(String inputMoney, String ipAddress, Integer voucherOfUserId, String username,
            String cartInfo) throws Exception {
        int amount = (int) (Double.parseDouble(inputMoney) * 100);
        String vnp_TxnRef = "CART_" + VNPayConfig.getRandomNumber(8);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VNPayConfig.vnp_Version);
        vnp_Params.put("vnp_Command", VNPayConfig.vnp_Command);
        vnp_Params.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", cartInfo + " voi voucher " + (voucherOfUserId != null ? voucherOfUserId : 0));
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_Returnurl());
        vnp_Params.put("vnp_IpAddr", ipAddress);
        vnp_Params.put("vnp_OrderType", "billpayment");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // build query
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        return VNPayConfig.vnp_PayUrl + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
    }

}
