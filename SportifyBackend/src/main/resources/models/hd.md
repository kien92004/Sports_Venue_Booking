## cài đặt môi trường :


python -m venv venv
source venv/bin/activate   # (Linux / macOS)
venv\Scripts\activate      # (Windows)

## Cài các thư viện cần thiết:
pip install xgboost scikit-learn onnxmltools pandas numpy

## chạy lệnh 
python train_xgboost_to_onnx.py


# công thức

totalBookings_tomorrow = (

# Biến mục tiêu: số lượt đặt sân ngày mai

totalBookings_month → 80%

avgtempC → 5%

dailyChanceOfRain → 3%

isHoliday → 10%

ngẫu nhiên → 2%

totalBookings_tomorrow = []
for i in range(len(data)):
    tb_today = data["totalBookings_today"].iloc[i]
    tb_month = data["totalBookings_month"].iloc[i]
    temp = data["avgtempC"].iloc[i]
    rain = data["dailyChanceOfRain"].iloc[i]
    holiday = data["isHoliday"].iloc[i]
    
    val = (
        tb_today * np.random.uniform(1.0, 1.2) +   # random riêng từng ngày, tăng scale
        (tb_month / 30) * 0.8 +                    # tăng ảnh hưởng của trung bình tháng
        (35 - temp) * 0.3 +                        # tăng ảnh hưởng của nhiệt độ
        (rain / 100) * (-2.0) +                    # tăng ảnh hưởng của mưa
        holiday * 2 +
        np.random.normal(0, 0.3)                   # giảm nhiễu ngẫu nhiên
    )
    totalBookings_tomorrow.append(val)

data["totalBookings_tomorrow"] = totalBookings_tomorrow
                   
)