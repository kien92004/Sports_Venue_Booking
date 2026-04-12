package duan.sportify.controller;

import duan.sportify.entities.PaymentMethod;
import duan.sportify.service.PaymentMethodService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@RequestMapping("api/user/payment-methods")
public class PaymentMethodController {
    @Autowired
    PaymentMethodService service;


    @GetMapping("/user/{username}")
    public List<PaymentMethod> getUserPaymentMethods(@PathVariable String username) {
        return service.getUserPaymentMethods(username);
    }

    @GetMapping("/{id}/user")
    public PaymentMethod getPaymentMethod(@PathVariable Long id) {
        return service.getPaymentMethod(id);
    }
        // --- Cập nhật thẻ mặc định ---
    @PutMapping("set-default/{id}")
    public void setDefault(@PathVariable Long id, @RequestParam String username) {
        System.out.println("username: " + username + ", id: " + id);
        service.setDefaultPaymentMethod(username, id);
    }
   

    // --- Xoá thẻ ---
    @DeleteMapping("/{id}")
    public void deletePaymentMethod(@PathVariable Long id, @RequestParam String username) {
        service.deletePaymentMethod(username, id);
    }


    // test
    
}

