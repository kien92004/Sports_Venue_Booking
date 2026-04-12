package duan.sportify.service.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import duan.sportify.dao.BookingDetailDAO;
import duan.sportify.dao.FavoriteFieldDAO;
import duan.sportify.service.HomeService;

@Service
public class HomeServiceImpl implements HomeService {

    @Autowired
    private BookingDetailDAO bookingDetailDAO;
    
    @Autowired
    private FavoriteFieldDAO favoriteFieldDAO;

    @Override
    public List<Object[]> getPrioritizedFieldsForHome(String username) {
        List<Object[]> result = new ArrayList<>();
        Set<Integer> addedFieldIds = new HashSet<>();
        
        // Nếu có username, ưu tiên sân từ lịch sử và yêu thích
        if (username != null && !username.isEmpty()) {
            // 1. Lấy sân từ lịch sử đặt
            List<Object[]> userBookedFields = bookingDetailDAO.findUserMostBookedFields(username);
            for (Object[] field : userBookedFields) {
                Integer fieldId = (Integer) field[0];
                if (!addedFieldIds.contains(fieldId)) {
                    result.add(field);
                    addedFieldIds.add(fieldId);
                    if (result.size() >= 4) break; // Chỉ lấy tối đa 4 sân
                }
            }
            
            // 2. Nếu chưa đủ 4 sân, bổ sung từ danh sách yêu thích
            if (result.size() < 4) {
                List<Object[]> userFavoriteFields = favoriteFieldDAO.findUserFavoriteFields(username);
                for (Object[] field : userFavoriteFields) {
                    Integer fieldId = (Integer) field[0];
                    if (!addedFieldIds.contains(fieldId)) {
                        result.add(field);
                        addedFieldIds.add(fieldId);
                        if (result.size() >= 4) break;
                    }
                }
            }
        }
        
        // 3. Bổ sung các sân được đặt nhiều nhất (cho cả trường hợp có/không có username)
        List<Object[]> topFields = bookingDetailDAO.findTopFieldsWithMostBookings();
        for (Object[] field : topFields) {
            Integer fieldId = (Integer) field[0];
            if (!addedFieldIds.contains(fieldId)) {
                result.add(field);
                addedFieldIds.add(fieldId);
            }
        }
        
        return result;
    }
}
