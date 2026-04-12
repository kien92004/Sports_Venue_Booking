package duan.sportify.controller;

import java.util.List;
import java.time.LocalDate;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import duan.sportify.entities.VoucherOfUser;
import duan.sportify.service.VoucherOfUserService;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import duan.sportify.DTO.VoucherOfUserDTO;

@RestController
@RequestMapping("api/user/voucher-of-user")
public class VoucherOfUserController {
    @Autowired
    private VoucherOfUserService voucherOfUserService;

    @GetMapping()
    public List<VoucherOfUser> getVouchers(@RequestParam String username) {
        return voucherOfUserService.findByUsername(username);
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<VoucherOfUser>> getVouchersByUsername(@PathVariable String username) {
        return ResponseEntity.ok(voucherOfUserService.findByUsername(username));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addVoucher(@RequestBody VoucherOfUserDTO body) {
        try {
            LocalDate startDate = LocalDate.parse(body.getStartDate());
            LocalDate endDate = LocalDate.parse(body.getEndDate());

            VoucherOfUser result = voucherOfUserService.addOrUpdateVoucher(
                    body.getVoucherid(),
                    body.getUsername(),
                    body.getQuantity(),
                    startDate,
                    endDate);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        voucherOfUserService.delete(id);
        return ResponseEntity.ok().build(); 
    }
    
}
