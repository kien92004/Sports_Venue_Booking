package duan.sportify.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import duan.sportify.DTO.booking.FieldManagerDetailDTO;
import duan.sportify.DTO.booking.FieldTotalBookingsDTO;
import duan.sportify.dao.BookingDetailDAO;
import duan.sportify.dao.FieldDAO;
import duan.sportify.entities.Field;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FieldManagerService {
    @Autowired
    private final BookingDetailDAO bookingRepo;
    @Autowired
    private FieldDAO fieldDAO;

    // private BookingDetailDAO permanentRepo;

    // // Helper method to convert java.util.Date to LocalDate
    // private LocalDate convertToLocalDate(Date dateToConvert) {
    // return dateToConvert.toInstant()
    // .atZone(ZoneId.systemDefault())
    // .toLocalDate();
    // }

    // Helper method to convert string date to proper format
    private String formatDateString(String date) {
        // Assuming input is in format "yyyy-MM-dd" or "dd/MM/yyyy"
        if (date.contains("/")) {
            String[] parts = date.split("/");
            if (parts.length == 3) {
                return parts[2] + "-" + (parts[1].length() == 1 ? "0" + parts[1] : parts[1]) + "-" +
                        (parts[0].length() == 1 ? "0" + parts[0] : parts[0]);
            }
        }
        return date; // Return as is if already in correct format
    }

    /**
     * Get all fields that are active on a specific date with their booking counts
     * 
     * @param date          Format: yyyy-MM-dd or dd/MM/yyyy
     * @param ownerUsername Filter by field owner username (optional)
     * @return List of field usage details including all fields (even those with
     *         zero bookings)
     */
    public List<FieldManagerDetailDTO> getActiveFieldsByDate(String date, String ownerUsername) {
        String formattedDate = formatDateString(date);
        System.out.println("Formatted Date: " + formattedDate);
        List<Object[]> activeFields = bookingRepo.findActiveFieldsByDate(formattedDate);

        // If ownerUsername is provided, get only fields owned by that user
        List<Integer> ownerFieldIds = new ArrayList<>();
        if (ownerUsername != null && !ownerUsername.isEmpty()) {
            List<Field> ownerFields = fieldDAO.findByOwnerUsername(ownerUsername);
            for (Field field : ownerFields) {
                ownerFieldIds.add(field.getFieldid());
            }
        }

        List<FieldManagerDetailDTO> result = new ArrayList<>();
        for (Object[] field : activeFields) {
            try {
                Integer fieldId = (Integer) field[0];

                // Filter by owner if ownerUsername is provided
                if (ownerUsername != null && !ownerUsername.isEmpty() && !ownerFieldIds.contains(fieldId)) {
                    continue;
                }

                String fieldName = (String) field[1];
                String fieldImage = (String) field[2];
                Double fieldPrice = ((Number) field[3]).doubleValue();
                Long oneTimeBookings = ((Number) field[4]).longValue();
                Long permanentBookings = ((Number) field[5]).longValue();
                Long totalBookings = ((Number) field[6]).longValue();
                Long totalRevenue = ((Number) field[7]).longValue();
                if (totalBookings > 0) {
                    result.add(new FieldManagerDetailDTO(fieldId, fieldName, fieldImage, fieldPrice, oneTimeBookings,
                            permanentBookings,
                            totalBookings, totalRevenue));
                }
            } catch (Exception e) {
                System.out.println("Error processing field: " + Arrays.toString(field));
                e.printStackTrace();
            }
        }
        return result;
    }

    public List<FieldManagerDetailDTO> getListfieldsAction(String date, String ownerUsername) {

        // 1. Lấy tất cả sân
        List<Field> allFields = fieldDAO.findAll();

        // Nếu ownerUsername được truyền thì chỉ giữ sân thuộc owner đó
        List<Integer> ownerFieldIds = new ArrayList<>();
        if (ownerUsername != null && !ownerUsername.isEmpty()) {
            List<Field> ownerFields = fieldDAO.findByOwnerUsername(ownerUsername);
            for (Field field : ownerFields) {
                ownerFieldIds.add(field.getFieldid());
            }
        }

        // 2. Lấy dữ liệu booking theo ngày
        List<Object[]> bookingData = bookingRepo.getListfieldsAction(date);

        // 3. Mapping booking result -> Map<fieldId, DTO>
        Map<Integer, FieldManagerDetailDTO> bookingMap = new HashMap<>();

        for (Object[] row : bookingData) {

            int fieldId = ((Number) row[0]).intValue();

            // Nếu có filter theo owner → bỏ qua field không thuộc owner
            if (!ownerFieldIds.isEmpty() && !ownerFieldIds.contains(fieldId)) {
                continue;
            }

            FieldManagerDetailDTO dto = new FieldManagerDetailDTO();
            dto.setFieldId(fieldId);
            dto.setFieldName((String) row[1]);
            dto.setFieldImage((String) row[2]);
            dto.setFieldPrice(((Number) row[3]).doubleValue());
            dto.setOneTimeBookings(((Number) row[4]).longValue());
            dto.setPermanentBookings(((Number) row[5]).longValue());
            dto.setTotalBookings(((Number) row[6]).longValue());
            dto.setTotalRevenue(((Number) row[7]).longValue());

            // ❗ Quan trọng: phải put vào map
            bookingMap.put(fieldId, dto);
        }

        // 4. Tạo danh sách trả về (full sân + booking nếu có)
        List<FieldManagerDetailDTO> result = new ArrayList<>();

        for (Field f : allFields) {

            // Nếu filter owner → bỏ sân không liên quan
            if (!ownerFieldIds.isEmpty() && !ownerFieldIds.contains(f.getFieldid())) {
                continue;
            }

            if (bookingMap.containsKey(f.getFieldid())) {

                // Có dữ liệu booking
                result.add(bookingMap.get(f.getFieldid()));

            } else {

                // Không có booking → tạo DTO 0
                FieldManagerDetailDTO dto = new FieldManagerDetailDTO();
                dto.setFieldId(f.getFieldid());
                dto.setFieldName(f.getNamefield());
                dto.setFieldImage(f.getImage());
                dto.setFieldPrice(f.getPrice());

                dto.setOneTimeBookings(0L);
                dto.setPermanentBookings(0L);
                dto.setTotalBookings(0L);
                dto.setTotalRevenue(0L);

                result.add(dto);
            }
        }

        return result;
    }

    /**
     * Get all fields that are active during a specific month with their booking
     * counts
     * 
     * @param yearMonth     Format: yyyy-MM or MM/yyyy
     * @param ownerUsername Filter by field owner username (optional)
     * @return List of field usage details including all fields (even those with
     *         zero bookings)
     */
    public List<FieldManagerDetailDTO> getActiveFieldsByMonth(String yearMonth, String ownerUsername) {
        // Convert MM/yyyy to yyyy-MM if needed
        String formattedYearMonth = yearMonth;
        if (yearMonth.contains("/")) {
            String[] parts = yearMonth.split("/");
            if (parts.length == 2) {
                formattedYearMonth = parts[1] + "-" + (parts[0].length() == 1 ? "0" + parts[0] : parts[0]);
            }
        }

        List<Object[]> activeFields = bookingRepo.findActiveFieldsByMonth(formattedYearMonth);

        // If ownerUsername is provided, get only fields owned by that user
        List<Integer> ownerFieldIds = new ArrayList<>();
        if (ownerUsername != null && !ownerUsername.isEmpty()) {
            List<Field> ownerFields = fieldDAO.findByOwnerUsername(ownerUsername);
            for (Field field : ownerFields) {
                ownerFieldIds.add(field.getFieldid());
            }
        }

        List<FieldManagerDetailDTO> result = new ArrayList<>();
        for (Object[] field : activeFields) {
            Integer fieldId = (Integer) field[0];

            // Filter by owner if ownerUsername is provided
            if (ownerUsername != null && !ownerUsername.isEmpty() && !ownerFieldIds.contains(fieldId)) {
                continue;
            }

            String fieldName = (String) field[1];
            String fieldImage = (String) field[2];
            Double fieldPrice = ((Number) field[3]).doubleValue();
            Long oneTimeBookings = ((Number) field[4]).longValue();
            Long permanentBookings = ((Number) field[5]).longValue();
            Long totalBookings = ((Number) field[6]).longValue();
            Long totalRevenue = ((Number) field[7]).longValue();

            if (totalBookings > 0) {
                result.add(
                        new FieldManagerDetailDTO(fieldId, fieldName, fieldImage, fieldPrice, oneTimeBookings,
                                permanentBookings,
                                totalBookings, totalRevenue));
            }
        }
        return result;
    }

    public List<FieldTotalBookingsDTO> getFieldsBookingLast7_3_1Days(String ownerUsername) {

        List<Object[]> fields = bookingRepo.findFieldTotalBookingsLast7_3_1Days();

        // Lọc theo owner nếu cần
        List<Integer> ownerFieldIds = new ArrayList<>();
        if (ownerUsername != null && !ownerUsername.isEmpty()) {
            List<Field> ownerFields = fieldDAO.findByOwnerUsername(ownerUsername);
            for (Field field : ownerFields) {
                ownerFieldIds.add(field.getFieldid());
            }
        }

        List<FieldTotalBookingsDTO> result = new ArrayList<>();
        for (Object[] field : fields) {
            Integer fieldId = (Integer) field[0];

            if (ownerUsername != null && !ownerUsername.isEmpty() && !ownerFieldIds.contains(fieldId)) {
                continue;
            }

            String fieldName = (String) field[1];
            String fieldImage = (String) field[2];
            Long total7Day = ((Number) field[3]).longValue();
            Long total3Day = ((Number) field[4]).longValue();
            Long total1Day = ((Number) field[5]).longValue();

            // Nếu muốn chỉ lấy field có lượt đặt > 0 (có thể bỏ nếu muốn full list)
            if (total7Day > 0 || total3Day > 0 || total1Day > 0) {
                result.add(new FieldTotalBookingsDTO(fieldId, fieldName, fieldImage, total7Day, total3Day, total1Day));
            }
        }

        return result;
    }

}
