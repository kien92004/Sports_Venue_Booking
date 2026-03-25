const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import axios from "axios";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import getImageUrl from "../../helper/getImageUrl";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// Define interfaces based on the API documentation
interface ProductSalesDTO {
  productId: number;
  productName: string;
  image: string;
  price: number;
  quantitySold: number;
}

interface SalesReportDTO {
  productSales: ProductSalesDTO[];
  totalQuantitySold: number;
  period: 'day' | 'month';
  date: string;
}

const OrderManager: React.FC = () => {
  // State variables
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<SalesReportDTO | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for calculations
  const calculateTotalRevenue = (): number => {
    if (!salesData || !salesData.productSales) return 0;
    return salesData.productSales.reduce((total, product) =>
      total + (product.price * product.quantitySold), 0);
  };

  const getAveragePrice = (): string => {
    if (!salesData?.totalQuantitySold || salesData.totalQuantitySold === 0) return "0.00";
    return (calculateTotalRevenue() / salesData.totalQuantitySold).toFixed(2);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  // Fetch data when date/month changes
  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailySales(selectedDate);
    } else {
      fetchMonthlySales(selectedMonth);
    }
  }, [activeTab, selectedDate, selectedMonth]);

  // Fetch daily sales data
  const fetchDailySales = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${URL_BACKEND}/sportify/rest/sales/by-date?date=${formatDate(date)}`);
      console.log(formatDate(date));
      setSalesData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch daily sales data');
      setLoading(false);
    }
  };

  // Fetch monthly sales data
  const fetchMonthlySales = async (month: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${URL_BACKEND}/sportify/rest/sales/by-month?month=${month}`);
      setSalesData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch monthly sales data');
      setLoading(false);
    }
  };


  // Refresh handler
  const handleRefresh = () => {
    if (activeTab === 'daily') {
      fetchDailySales(selectedDate);
    } else {
      fetchMonthlySales(selectedMonth);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!salesData || !salesData.productSales) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = salesData.productSales.map(product => product.productName);
    const quantities = salesData.productSales.map(product => product.quantitySold);
    const revenues = salesData.productSales.map(product => product.price * product.quantitySold);

    return {
      labels,
      datasets: [
        {
          label: 'Số Lượng Đã Bán',
          data: quantities,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderWidth: 1,
        },
        {
          label: 'Doanh Thu (VND)',
          data: revenues,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderWidth: 1,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Thống Kê Bán Hàng',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Helper function to render loading spinner
  const renderLoadingSpinner = () => (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );

  // Helper function for rendering product rows in tables
  const renderProductRow = (product: ProductSalesDTO, idx: number, showImage: boolean = true) => (
    <tr key={product.productId}>
      <td>{idx + 1}</td>
      {showImage && (
        <td>
          <img
            src={getImageUrl(product.image)}
            alt={product.productName}
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            className="rounded border"
          />
        </td>
      )}
      <td>{product.productName}</td>
      <td>{product.price.toFixed(2)} VND</td>
      <td>{product.quantitySold}</td>
      <td>{(product.price * product.quantitySold).toFixed(2)} VND</td>
    </tr>
  );

  // Helper function to check if data is available
  const hasData = (): boolean => {
    return Boolean(salesData?.productSales && salesData.productSales.length > 0);
  };

  return (
    <div className="page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Quản Lý Bán Hàng</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Trang Chủ</a></li>
                <li className="breadcrumb-item active" aria-current="page">Thống Kê Bán Hàng</li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={() => window.print()}>
              <i className="fa fa-print"></i> In Báo Cáo
            </button>
          </div>
        </div>
        {/* /Page Header */}

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Dashboard Cards */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <h5 className="card-title">Tổng Sản Phẩm Đã Bán</h5>
                <p className="display-4 mb-0 fw-bold text-primary">
                  {salesData?.totalQuantitySold || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <h5 className="card-title">Tổng Doanh Thu</h5>
                <p className="display-4 mb-0 fw-bold text-success">
                  {calculateTotalRevenue().toFixed(2)} VND
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <h5 className="card-title">Giá Trung Bình</h5>
                <p className="display-4 mb-0 fw-bold text-warning">
                  {getAveragePrice()} VND
                </p>
              </div>
            </div>
          </div>
        </div>



        <div>
          <div className="col-sm-6 col-md-2">
            <button type="button" className="btn btn-secondary w-100" onClick={handleRefresh}>
              <i className="fa fa-refresh "></i> Làm Mới
            </button>
          </div>
        </div>
        {/* /Search Filter */}

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              Doanh Thu Theo Ngày
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthly')}
            >
              Doanh Thu Theo Tháng
            </button>
          </li>
        </ul>

        {/* Charts Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {activeTab === 'daily' ? 'Biểu Đồ Doanh Thu Theo Ngày' : 'Biểu Đồ Doanh Thu Theo Tháng'}
                </h5>
                {activeTab === 'daily' ? (
                  <input
                    type="date"
                    className="form-control w-auto"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                ) : (
                  <input
                    type="month"
                    className="form-control w-auto"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                )}
              </div>
              <div className="card-body">
                {loading ? renderLoadingSpinner() : (
                  hasData() ? (
                    <Bar data={prepareChartData()} options={chartOptions} />
                  ) : (
                    <p className="text-center py-5">Không có dữ liệu doanh thu cho khoảng thời gian đã chọn.</p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Sales Table */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Chi Tiết Doanh Thu Sản Phẩm</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Hình Ảnh</th>
                        <th>Tên Sản Phẩm</th>
                        <th>Giá</th>
                        <th>Số Lượng Bán</th>
                        <th>Doanh Thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            {renderLoadingSpinner()}
                          </td>
                        </tr>
                      ) : hasData() ? (
                        salesData!.productSales.map((product, idx) =>
                          renderProductRow(product, idx)
                        )
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">
                            Không có dữ liệu doanh thu cho khoảng thời gian đã chọn.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="table-secondary">
                        <td colSpan={4}><strong>Tổng Cộng</strong></td>
                        <td><strong>{salesData?.totalQuantitySold || 0}</strong></td>
                        <td><strong>{calculateTotalRevenue().toFixed(2)} VND</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products Section */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white">
                <h5 className="mb-0">Sản Phẩm Bán Chạy Nhất</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Sản Phẩm</th>
                        <th>Số Lượng</th>
                        <th>Doanh Thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hasData() ? (
                        salesData!.productSales
                          .slice(0, 5)
                          .map((product, idx) => (
                            <tr key={product.productId}>
                              <td>{idx + 1}</td>
                              <td>{product.productName}</td>
                              <td>{product.quantitySold}</td>
                              <td>{(product.price * product.quantitySold).toFixed(2)} VND</td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center">Không có dữ liệu</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white">
                <h5 className="mb-0">Tổng Kết Doanh Thu</h5>
              </div>
              <div className="card-body">
                <div className="p-4 text-center">
                  <h4>
                    {activeTab === 'daily' ? 'Báo Cáo Doanh Thu Theo Ngày' : 'Báo Cáo Doanh Thu Theo Tháng'}
                  </h4>
                  <p className="text-muted">
                    Thời Gian: {salesData?.date ?
                      (activeTab === 'daily' ? formatDate(salesData.date) : formatMonthYear(salesData.date))
                      : '-'}
                  </p>
                  <div className="row mt-4">
                    <div className="col-6">
                      <h5>Tổng Số Lượng</h5>
                      <p className="display-6 text-primary">{salesData?.totalQuantitySold || 0}</p>
                    </div>
                    <div className="col-6">
                      <h5>Tổng Doanh Thu</h5>
                      <p className="display-6 text-success">{calculateTotalRevenue().toFixed(2)} VND</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;
