package duan.sportify.service;

import duan.sportify.Repository.PaymentMethodRepository;
import duan.sportify.entities.PaymentMethod;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;


@Service
public class PaymentMethodService {
    @Autowired
    PaymentMethodRepository repository;
   

    @Transactional
    public PaymentMethod addPaymentMethod(PaymentMethod pm)  {
          // 1️⃣ Kiểm tra max 3 thẻ
        long count = repository.countByUsername(pm.getUsername());
        if(count >= 3) {
            throw new RuntimeException("Bạn đã lưu tối đa 3 thẻ");
        }
        pm.setIsDefault(count == 0);

        // 3️⃣ Lưu vào DB
        return repository.save(pm);
    }

    public List<PaymentMethod> getUserPaymentMethods(String username) {
        return repository.findByUsername(username);
    }

    public PaymentMethod getPaymentMethod(Long id) {
        return repository.findById(id)
                .orElse(null);
    }

     // --- Cập nhật thẻ mặc định ---
    @Transactional
    public void setDefaultPaymentMethod(String username, Long paymentMethodId) {
        List<PaymentMethod> userCards = repository.findByUsername(username);
        userCards.forEach(pm -> pm.setIsDefault(false));
        repository.saveAll(userCards);

        PaymentMethod selected = repository.findById(paymentMethodId)
                .filter(pm -> pm.getUsername().equals(username))
                .orElseThrow(() -> new RuntimeException("Thẻ không tồn tại"));
        selected.setIsDefault(true);
        repository.save(selected);
    }

    // --- Xoá thẻ ---
    @Transactional
    public void deletePaymentMethod(String username, Long paymentMethodId) {
        PaymentMethod pm = repository.findById(paymentMethodId)
                .filter(p -> p.getUsername().equals(username))
                .orElseThrow(() -> new RuntimeException("Thẻ không tồn tại"));
        repository.delete(pm);
    }
    public List<PaymentMethod> findByUsername(String username) {
        return repository.findByUsername(username);
    }

    
}
