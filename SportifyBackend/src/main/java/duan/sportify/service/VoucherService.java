package duan.sportify.service;

import java.util.List;
import java.util.Optional;

import duan.sportify.entities.Authorized;
import duan.sportify.entities.Voucher;


@SuppressWarnings("unused")
public interface VoucherService {
	List<Voucher> findAll();

	Voucher create(Voucher voucher);

	Voucher update(Voucher voucher);

	void delete(String id);
	
	Optional<Voucher> findById(String id);

	Voucher findByVoucherId(String voucherid);

	void deleteByVoucherId(String voucherid); // thêm phương thức xóa theo voucherid
}
