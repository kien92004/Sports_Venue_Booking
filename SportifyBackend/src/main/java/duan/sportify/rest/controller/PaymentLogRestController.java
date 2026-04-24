package duan.sportify.rest.controller;

import duan.sportify.dao.PaymentLogDAO;
import duan.sportify.entities.PaymentLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/rest/payment-logs")
public class PaymentLogRestController {

    @Autowired
    private PaymentLogDAO paymentLogDAO;

    @GetMapping
    public ResponseEntity<List<PaymentLog>> getAll() {
        return ResponseEntity.ok(paymentLogDAO.findAllOrderByDateDesc());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        paymentLogDAO.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
