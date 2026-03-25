const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { translateHolidayName, translateWeatherCondition } from "../../helper/Translate";

interface BookingForecast {
  fieldId: number;
  fieldName: string;
  date: string;
  predictedBookings: number;
  totalBookings7Day?: number;
  totalBookings3Day?: number;
  totalBookings1Day?: number;
  fieldImage?: string;
}

interface Weather {
  locationName: string;
  current: {
    conditionText: string;
    conditionIcon: string;
    tempC: number;
  };
  forecast: {
    date: string;
    avgtempC: number;
    dailyChanceOfRain: number;
    conditionText: string;
    conditionIcon: string;
  }[];
}

interface Holiday {
  summary: string;
  startDate: string;
  endDate: string;
}

const AiSupportPage: React.FC = () => {
  const [bookingForecasts, setBookingForecasts] = useState<BookingForecast[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [forecastSelected, setForecastSelected] = useState<BookingForecast | null>(null);
  const [fieldUsageData, setFieldUsageData] = useState<any[]>([]);

  const onHandleShow = (forecast: any) => { setForecastSelected(forecast) };
  const onHandleClose = () => { setForecastSelected(null) };

  useEffect(() => {
    // Fetch booking forecasts
    const fetchForecasts = fetch(`${URL_BACKEND}/api/forecast/next-week`)
      .then(res => res.json());

    // Fetch field usage data
    const fetchFieldUsage = fetch(`${URL_BACKEND}/api/field-usage/active-fields/by-7daylast`)
      .then(res => res.json());

    // Merge forecasts with field usage data
    Promise.all([fetchForecasts, fetchFieldUsage])
      .then(([forecasts, fieldUsage]) => {
        setFieldUsageData(fieldUsage);
        const mergedData = forecasts.map((forecast: any) => {
          const usageData = fieldUsage.find((field: any) => field.fieldId === forecast.fieldId);
          return {
            ...forecast,
            totalBookings7Day: usageData?.totalBookings7Day || 0,
            totalBookings3Day: usageData?.totalBookings3Day || 0,
            totalBookings1Day: usageData?.totalBookings1Day || 0,
            fieldImage: usageData?.fieldImage
          };
        });
        setBookingForecasts(mergedData);
      });

    // Fetch weather
    fetch(`${URL_BACKEND}/api/forecast/weather`)
      .then(res => res.json())
      .then(data => setWeather(data));

    // Fetch holidays
    fetch(`${URL_BACKEND}/api/forecast/holiday`)
      .then(res => res.json())
      .then(data => setHolidays(data));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Hỗ Trợ AI</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Trang Chủ</a></li>
                <li className="breadcrumb-item active" aria-current="page">Hỗ Trợ AI</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Weather Forecast Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Dự Báo Thời Tiết - {weather?.locationName}</h5>
              </div>
              <div className="card-body">
                {weather && (
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center p-3 border rounded">
                        <h6>Thời Tiết Hiện Tại</h6>
                        <img src={weather.current.conditionIcon} alt="weather" />
                        <p className="mb-0">{translateWeatherCondition(weather.current.conditionText)}</p>
                        <h4>{weather.current.tempC}°C</h4>
                      </div>
                    </div>
                    {weather.forecast.map((day) => (
                      <div key={day.date} className="col-md-3">
                        <div className="text-center p-3 border rounded">
                          <h6>{formatDate(day.date)}</h6>
                          <img src={day.conditionIcon} alt="weather" />
                          <p className="mb-0">{translateWeatherCondition(day.conditionText)}</p>
                          <h4>{day.avgtempC}°C</h4>
                          <p className="text-muted">Rain: {day.dailyChanceOfRain}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Forecast Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Dự Báo Lượng Đặt Sân</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Tên Sân</th>
                        <th>Ngày</th>
                        <th>Dự Đoán Số Lượt Đặt</th>
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingForecasts.map((forecast, index) => (
                        <tr key={index}>
                          <td>{forecast.fieldName}</td>
                          <td>{formatDate(forecast.date)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1" style={{ height: "20px" }}>
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{ width: `${(forecast.predictedBookings / 10) * 100}%` }}
                                >
                                  {forecast.predictedBookings}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onHandleShow(forecast)}
                            >
                              Xem
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal Chi Tiết */}
        <Modal show={!!forecastSelected} onHide={onHandleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Chi Tiết Dự Báo - {forecastSelected?.fieldName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {forecastSelected && (
              <>
                <p><strong>Tên Sân:</strong> {forecastSelected.fieldName}</p>
                <p><strong>Ngày:</strong> {formatDate(forecastSelected.date)}</p>
                <p><strong>Dự đoán số lượt đặt:</strong> {forecastSelected.predictedBookings}</p>

                <hr />
                <h5>Thống Kê Đặt Sân:</h5>
                <div className="row mb-3">
                  <div className="col-4">
                    <div className="text-center p-2 border rounded">
                      <h6 className="text-primary">{forecastSelected.totalBookings7Day}</h6>
                      <small>7 ngày qua</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center p-2 border rounded">
                      <h6 className="text-warning">{forecastSelected.totalBookings3Day}</h6>
                      <small>3 ngày qua</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center p-2 border rounded">
                      <h6 className="text-success">{forecastSelected.totalBookings1Day}</h6>
                      <small>Hôm qua</small>
                    </div>
                  </div>
                </div>

                <hr />
                <h3>Yếu Tố Ảnh Hưởng:</h3>
                {weather && (
                  <>
                    {weather.forecast.filter((day) => day.date === forecastSelected.date).map((day, index) => (
                      <div key={index} className="row">

                        <div className="col-8">
                          <p><strong>Nhiệt độ trung bình:</strong> {day.avgtempC}°C</p>
                          <p><strong>Khả năng mưa:</strong> {day.dailyChanceOfRain}%</p>
                        </div>
                        <div className="col-4 text-center">
                          <img src={day.conditionIcon} alt="weather" />
                        </div>
                      </div>
                    ))}

                  </>
                )}
                {holidays && holidays.length > 0 ? (
                  holidays.filter((h) => forecastSelected.date >= h.startDate && forecastSelected.date <= h.endDate).map((h, index) => (
                    <p key={index} className="text-center"><strong>Ngày lễ:</strong> {h.summary} ({h.startDate} - {h.endDate})</p>
                  ))
                ) : (
                  <p className="text-center">Không có lịch nghĩ lễ nào!</p>
                )}

                <hr />
                <p><strong>Mô tả:</strong> Dựa trên các yếu tố thời tiết, ngày lễ và dữ liệu lịch sử, dự đoán số lượt đặt sân có thể thay đổi. Đây là một dự báo tham khảo.</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHandleClose}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Holidays Section */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Ngày Lễ Sắp Tới</h5>
              </div>
              <div className="card-body">
                {holidays.length === 0 ? (
                  <p>Không có ngày lễ nào trong tuần sắp tới.</p>
                ) : (<div className="timeline">
                  {holidays.map((holiday, index) => (
                    <div key={index} className="alert alert-info">
                      <h6 className="mb-1">{translateHolidayName(holiday.summary)}</h6>
                      <p className="mb-0">
                        From: {formatDate(holiday.startDate)} - To: {formatDate(holiday.endDate)}
                      </p>
                    </div>
                  ))}
                </div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSupportPage;
