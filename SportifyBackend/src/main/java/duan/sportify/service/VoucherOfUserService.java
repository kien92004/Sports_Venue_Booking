package duan.sportify.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import duan.sportify.entities.Voucher;
import duan.sportify.entities.VoucherOfUser;
import duan.sportify.Repository.VoucherOfUserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class VoucherOfUserService {

    @Autowired
    private VoucherOfUserRepository voucherOfUserRepository;
    @Autowired
    private VoucherService voucherService;

    public VoucherOfUser create(VoucherOfUser voucherOfUser) {
        return voucherOfUserRepository.save(voucherOfUser);
    }

    public VoucherOfUser update(VoucherOfUser voucherOfUser) {
        return voucherOfUserRepository.save(voucherOfUser);
    }

    public void delete(Long id) {
        voucherOfUserRepository.deleteById(id);
    }

    public VoucherOfUser findById(Long id) {
        return voucherOfUserRepository.findById(id).orElse(null);
    }

    public List<VoucherOfUser> findByUsername(String username) {
        return voucherOfUserRepository.findByUsernameAndEndDateGreaterThanEqual(username, LocalDate.now());
    }

    public VoucherOfUser addOrUpdateVoucher(String voucherId, String username, int quantity, LocalDate startDate,
            LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        Voucher voucher = voucherService.findByVoucherId(voucherId);
        if (voucher == null) {
            throw new IllegalArgumentException("Voucher not found");
        }

        VoucherOfUser newVoucher = new VoucherOfUser();
        newVoucher.setVoucherid(voucher);
        newVoucher.setUsername(username);
        newVoucher.setQuantity(quantity);
        newVoucher.setStartDate(startDate);
        newVoucher.setEndDate(endDate);

        return voucherOfUserRepository.save(newVoucher);
    }

    public void usedVoucher(Long voucherOfUserId) {
        Optional<VoucherOfUser> voucher = voucherOfUserRepository.findById(voucherOfUserId);
        if (voucher.isPresent()) {
            voucher.get().setQuantity(voucher.get().getQuantity() - 1);
            voucherOfUserRepository.save(voucher.get());
        }
    }
}
