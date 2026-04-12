# Hướng dẫn sử dụng chức năng tìm sân gần nhất

## Giới thiệu
Chức năng "Tìm sân gần nhất" cho phép người dùng tìm các sân bóng gần vị trí hiện tại của mình nhất. Hệ thống sẽ sử dụng API định vị của trình duyệt để xác định vị trí hiện tại, sau đó tìm kiếm các sân bóng gần nhất và sắp xếp chúng theo khoảng cách tăng dần.

## Yêu cầu kỹ thuật
- Người dùng phải cho phép trình duyệt truy cập thông tin vị trí của họ
- Trình duyệt cần hỗ trợ Geolocation API
- Các sân bóng trong hệ thống cần có thông tin tọa độ (latitude và longitude)

## Cách sử dụng

### Người dùng:
1. Truy cập trang danh sách sân bóng
2. Nhấn nút "Tìm sân gần nhất" để cho phép ứng dụng truy cập vị trí của bạn
3. Hệ thống sẽ hiển thị danh sách các sân bóng gần vị trí của bạn nhất
4. Khoảng cách đến từng sân sẽ được hiển thị cạnh tên sân

### Quản trị viên:
1. Đảm bảo cập nhật tọa độ chính xác cho các sân bóng trong hệ thống
2. Có thể chạy script SQL để cập nhật tọa độ theo địa chỉ sân

## Lưu ý
- Việc hiển thị khoảng cách chính xác phụ thuộc vào việc thông tin tọa độ của sân bóng phải chính xác
- Khoảng cách được tính theo đường chim bay, không phải theo đường đi thực tế
- Nếu người dùng từ chối cung cấp thông tin vị trí, chức năng này sẽ không hoạt động

## Hướng dẫn cài đặt

### Backend:
1. Đã thêm các trường latitude và longitude vào entity Field
2. Đã tạo API endpoint `/sportify/field/nearest` để lấy danh sách sân gần nhất
3. Chạy script SQL để cập nhật tọa độ cho các sân hiện có

### Frontend:
1. Đã tạo component NearestFieldFinder để hỗ trợ tìm sân gần nhất
2. Component này có thể được thêm vào bất kỳ trang nào cần chức năng tìm sân gần nhất