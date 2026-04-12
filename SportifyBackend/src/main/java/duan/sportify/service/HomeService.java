package duan.sportify.service;

import java.util.List;

public interface HomeService {
    /**
     * Lấy danh sách sân cho trang chủ với logic ưu tiên:
     * - Nếu có username: Ưu tiên sân trong lịch sử đặt và yêu thích (3-4 sân đầu)
     * - Còn lại: Sân được đặt nhiều nhất (top fields)
     * 
     * @param username Username của user (có thể null nếu chưa đăng nhập)
     * @return Danh sách sân đã được sắp xếp theo độ ưu tiên
     */
    List<Object[]> getPrioritizedFieldsForHome(String username);
}
