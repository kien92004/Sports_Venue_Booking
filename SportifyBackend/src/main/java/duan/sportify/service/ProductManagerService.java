package duan.sportify.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import duan.sportify.DTO.order.ProductManagerDTO;
import duan.sportify.DTO.order.SalesReportDTO;
import duan.sportify.dao.OrderDAO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductManagerService {

    private final OrderDAO orderDAO;

    /**
     * Format the input date string to yyyy-MM-dd format
     */

    private String formatDateString(String dateStr) {
        // If date is in dd/MM/yyyy format, convert to yyyy-MM-dd
        if (dateStr.contains("/")) {
            String[] parts = dateStr.split("/");
            if (parts.length == 3) {
                String day = parts[0].length() == 1 ? "0" + parts[0] : parts[0];
                String month = parts[1].length() == 1 ? "0" + parts[1] : parts[1];
                return parts[2] + "-" + month + "-" + day;
            }
        }
        return dateStr; // Return as is if already in yyyy-MM-dd format
    }

    /**
     * Format the input month string to yyyy-MM format
     */
    private String formatMonthString(String monthStr) {
        // If month is in MM/yyyy format, convert to yyyy-MM
        if (monthStr.contains("/")) {
            String[] parts = monthStr.split("/");
            if (parts.length == 2) {
                String month = parts[0].length() == 1 ? "0" + parts[0] : parts[0];
                return parts[1] + "-" + month;
            }
        }
        return monthStr; // Return as is if already in yyyy-MM format
    }

    /**
     * Get sales report for a specific date
     * 
     * @param dateStr Date in format yyyy-MM-dd or dd/MM/yyyy
     * @return SalesReportDTO containing product-wise sales and total sales for the
     *         day
     */
    public SalesReportDTO getSalesByDate(String dateStr) {
        String formattedDate = formatDateString(dateStr);
        List<ProductManagerDTO> productSales = new ArrayList<>();

        List<Object[]> results = orderDAO.getProductSalesByDate(formattedDate);
        for (Object[] result : results) {
            ProductManagerDTO dto = new ProductManagerDTO(
                    (Integer) result[0],
                    (String) result[1],
                    (String) result[2],
                    ((Number) result[3]).doubleValue(),
                    ((Number) result[4]).longValue());
            productSales.add(dto);
        }

        Long totalSales = orderDAO.getTotalSalesByDate(formattedDate);
        totalSales = totalSales == null ? 0L : totalSales;

        return new SalesReportDTO(productSales, totalSales, "day", formattedDate);
    }

    /**
     * Get sales report for a specific month
     * 
     * @param monthStr Month in format yyyy-MM or MM/yyyy
     * @return SalesReportDTO containing product-wise sales and total sales for the
     *         month
     */
    public SalesReportDTO getSalesByMonth(String monthStr) {
        String formattedMonth = formatMonthString(monthStr);
        List<ProductManagerDTO> productSales = new ArrayList<>();

        List<Object[]> results = orderDAO.getProductSalesByMonth(formattedMonth);
        for (Object[] result : results) {
            ProductManagerDTO dto = new ProductManagerDTO(
                    (Integer) result[0],
                    (String) result[1],
                    (String) result[2],
                    ((Number) result[3]).doubleValue(),
                    ((Number) result[4]).longValue());
            productSales.add(dto);
        }

        Long totalSales = orderDAO.getTotalSalesByMonth(formattedMonth);
        totalSales = totalSales == null ? 0L : totalSales;

        return new SalesReportDTO(productSales, totalSales, "month", formattedMonth);
    }
}
