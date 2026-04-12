import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor
import onnxmltools
from onnxmltools.convert.common.data_types import FloatTensorType
import onnxruntime as rt

np.random.seed(42)
n_samples = 2000

# ========================
# 1️⃣ TẠO DỮ LIỆU CHÍNH
# ========================

totalBookingsMonth_raw = np.random.randint(20, 400, n_samples)
totalBookings7Day_raw = np.random.randint(0, 80, (n_samples, 7))
totalBookings3Day_raw = np.random.randint(0, 100, (n_samples, 3))
totalBookings1Day_raw = np.random.randint(0, 120, n_samples)

data = pd.DataFrame({
    "totalBookingsMonth": totalBookingsMonth_raw / 30,
    "totalBookings7Day": totalBookings7Day_raw.mean(axis=1),
    "totalBookings3Day": totalBookings3Day_raw.mean(axis=1),
    "totalBookings1Day": totalBookings1Day_raw,
    "avgTemp": np.random.uniform(20, 35, n_samples),
    "rain": np.random.randint(0, 100, n_samples),
    "holidayFlag": np.random.randint(0, 2, n_samples)
})

# ========================
# 2️⃣ TẠO TARGET
# ========================

def generate_booking_conditional(row):
    total_recent = row["totalBookings1Day"] + row["totalBookings3Day"] + row["totalBookings7Day"]
    if total_recent <= 10:  # THẤP
        val = (
            row["totalBookings1Day"]*0.2 +
            row["totalBookings3Day"]*0.15 +
            row["totalBookings7Day"]*0.1 +
            row["totalBookingsMonth"]*0.05 +
            row["holidayFlag"]*0.1
        )
    elif total_recent <= 50:  # TRUNG BÌNH
        val = (
            row["totalBookings1Day"]*0.5 +
            row["totalBookings3Day"]*0.25 +
            row["totalBookings7Day"]*0.15 +
            row["totalBookingsMonth"]*0.05 +
            row["holidayFlag"]*0.2
        )
    else:  # CAO
        val = (
            row["totalBookings1Day"]*0.6 +
            row["totalBookings3Day"]*0.3 +
            row["totalBookings7Day"]*0.2 +
            row["totalBookingsMonth"]*0.05 +
            row["holidayFlag"]*0.4
        )
    return max(0, val)

data["totalBookingsTomorrow"] = data.apply(generate_booking_conditional, axis=1)

# ========================
# 2.5️⃣ TẠO THÊM DỮ LIỆU "LOW BOOKINGS"
# ========================

n_low = 500
low_samples = pd.DataFrame({
    "totalBookingsMonth": np.random.randint(0, 50, n_low)/30,
    "totalBookings7Day": np.random.randint(0, 5, n_low),
    "totalBookings3Day": np.random.randint(0, 3, n_low),
    "totalBookings1Day": np.random.randint(0, 3, n_low),
    "avgTemp": np.random.uniform(20, 35, n_low),
    "rain": np.random.randint(0, 100, n_low),
    "holidayFlag": np.random.randint(0, 2, n_low)
})
low_samples["totalBookingsTomorrow"] = low_samples.apply(generate_booking_conditional, axis=1)
data = pd.concat([data, low_samples], ignore_index=True)

# ========================
# 3️⃣ CHUẨN HÓA CHỌN LỌC
# ========================

X = data[[
    "totalBookingsMonth",
    "totalBookings7Day",
    "totalBookings3Day",
    "totalBookings1Day",
    "avgTemp",
    "rain",
    "holidayFlag"
]].copy()

# Chỉ chuẩn hóa các feature liên tục
scaler = StandardScaler()
X[["avgTemp", "rain"]] = scaler.fit_transform(X[["avgTemp", "rain"]])

# Log-transform target
y = np.log1p(data["totalBookingsTomorrow"])

# ========================
# 3.5️⃣ ĐỔI TÊN CỘT CHO ONNX
# ========================

X_scaled = X.copy()
X_scaled.columns = [f"f{i}" for i in range(X_scaled.shape[1])]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

# ========================
# 4️⃣ TRAIN XGBOOST
# ========================

model = XGBRegressor(
    n_estimators=250,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.9,
    colsample_bytree=0.7,
    reg_alpha=0.15,      
    reg_lambda=1.3,
    min_child_weight=5,
    random_state=42
)

model.fit(X_train, y_train)

y_pred_log = model.predict(X_test)
y_pred = np.expm1(y_pred_log)  # trở về scale gốc

rmse = np.sqrt(mean_squared_error(np.expm1(y_test), y_pred))
print("RMSE =", rmse)

# ========================
# 5️⃣ EXPORT ONNX
# ========================

input_type = [('float_input', FloatTensorType([None, X_scaled.shape[1]]))]
onnx_model = onnxmltools.convert_xgboost(model, initial_types=input_type)

with open("field_booking_final.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("🏁 Đã xuất mô hình tối ưu")

# ========================
# 6️⃣ TEST 3 MẪU
# ========================

test_samples = np.array([
    [10, 5, 3, 2, 30, 50, 0],
    [50, 20, 37, 10, 28, 20, 0],
    [90, 70, 40, 30, 28, 10, 1]
], dtype=np.float32)

test_df = pd.DataFrame(test_samples, columns=X.columns)
test_df[["avgTemp", "rain"]] = scaler.transform(test_df[["avgTemp", "rain"]])
test_df = test_df[X.columns]  # sắp xếp lại
test_df.columns = [f"f{i}" for i in range(test_df.shape[1])]

sess = rt.InferenceSession("field_booking_final.onnx")
input_name = sess.get_inputs()[0].name

pred_log = sess.run(None, {input_name: test_df.values.astype(np.float32)})[0]
pred = np.expm1(pred_log)
print("Dự đoán:", pred)
