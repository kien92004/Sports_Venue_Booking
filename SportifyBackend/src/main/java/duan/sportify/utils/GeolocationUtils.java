package duan.sportify.utils;

/**
 * Utility class để tính toán khoảng cách dựa trên tọa độ
 */
public class GeolocationUtils {
    
    // Bán kính trái đất tính bằng kilômét
    private static final double EARTH_RADIUS = 6371;
    
    /**
     * Tính khoảng cách giữa hai điểm dựa trên công thức Haversine
     * 
     * @param lat1 Vĩ độ của điểm thứ nhất
     * @param lon1 Kinh độ của điểm thứ nhất
     * @param lat2 Vĩ độ của điểm thứ hai
     * @param lon2 Kinh độ của điểm thứ hai
     * @return Khoảng cách tính bằng kilômét
     */
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Chuyển đổi độ sang radian
        double lat1Rad = Math.toRadians(lat1);
        double lon1Rad = Math.toRadians(lon1);
        double lat2Rad = Math.toRadians(lat2);
        double lon2Rad = Math.toRadians(lon2);
        
        // Tính khoảng cách giữa kinh độ và vĩ độ
        double latDistance = lat2Rad - lat1Rad;
        double lonDistance = lon2Rad - lon1Rad;
        
        // Công thức Haversine
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        // Khoảng cách tính theo km
        return EARTH_RADIUS * c;
    }
    
    /**
     * Định dạng khoảng cách thành chuỗi hiển thị thân thiện với người dùng
     * 
     * @param distance Khoảng cách tính bằng kilômét
     * @return Chuỗi định dạng thân thiện (VD: "1.2 km" hoặc "350 m")
     */
    public static String formatDistance(double distance) {
        if (distance < 1) {
            // Nếu dưới 1km, hiển thị bằng mét
            int meters = (int) (distance * 1000);
            return meters + " m";
        } else {
            // Nếu từ 1km trở lên, hiển thị bằng km, làm tròn đến 1 số thập phân
            return String.format("%.1f km", distance);
        }
    }
}