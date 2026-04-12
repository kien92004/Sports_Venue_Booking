package duan.sportify.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.service.VoucherService;
import duan.sportify.entities.Voucher;

@RestController
@RequestMapping("api/user")
public class VoucherController {
    @Autowired
    VoucherService voucherService;
    @GetMapping("discount/apply")
    public Map<String, Integer> applyVoucher(@RequestParam String code) {
        Optional<Voucher> voucher = voucherService.findById(code);
        if (voucher.isPresent()) {
            return Map.of("voucher", voucher.get().getDiscountpercent());

        } else {
            return Map.of("error", 0);
        }
    }
    
}
