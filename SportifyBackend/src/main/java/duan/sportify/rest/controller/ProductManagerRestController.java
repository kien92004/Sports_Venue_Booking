package duan.sportify.rest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.DTO.order.SalesReportDTO;
import duan.sportify.service.ProductManagerService;
import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequestMapping("/sportify/rest/sales")
@RequiredArgsConstructor
public class ProductManagerRestController {

    private final ProductManagerService productSalesService;
    
    /**
     * Get product sales by date
     * @param date Date in format yyyy-MM-dd or dd/MM/yyyy (example: 2023-10-20 or 20/10/2023)
     * @return Sales report for the given date
     */
    @GetMapping("/by-date")
    public ResponseEntity<SalesReportDTO> getSalesByDate(@RequestParam String date) {
        return ResponseEntity.ok(productSalesService.getSalesByDate(date));
    }
    
    /**
     * Get product sales by month
     * @param month Month in format yyyy-MM or MM/yyyy (example: 2023-10 or 10/2023)
     * @return Sales report for the given month
     */
    @GetMapping("/by-month")
    public ResponseEntity<SalesReportDTO> getSalesByMonth(@RequestParam String month) {
        return ResponseEntity.ok(productSalesService.getSalesByMonth(month));
    }
}
