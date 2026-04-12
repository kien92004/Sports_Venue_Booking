import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Status colors for charts
const statusColors = {
  // Booking statuses
  "Hoàn Thành": "rgba(40, 167, 69, 0.7)",
  "Đã Cọc": "rgba(255, 193, 7, 0.7)",
  "Đã Hủy": "rgba(220, 53, 69, 0.7)",
  "Đang Xử Lý": "rgba(23, 162, 184, 0.7)",
  "Trả Hàng": "rgba(108, 117, 125, 0.7)",
};

// Define types for props
type BookingData = {
  bookingstatus: string;
  bookingdate: string;
  bookingprice: number;
  bookingType: string;
};

type OrderData = {
  orderid: number;
  createdate: string;
  orderstatus: string;
  paymentstatus: boolean;
  totalprice: number;
};

interface BookingRadarChartProps {
  bookings: BookingData[];
}

interface BookingBarChartProps {
  bookings: BookingData[];
}

interface OrderRadarChartProps {
  orders: OrderData[];
}

interface OrderBarChartProps {
  orders: OrderData[];
}

/**
 * Radar chart showing booking status distribution
 */
export const BookingStatusRadarChart: React.FC<BookingRadarChartProps> = ({ bookings }) => {
  // Process data for Radar Chart - Booking Status Distribution
  const processRadarChartData = () => {
    const statusCounts: Record<string, number> = {};
    
    bookings.forEach(booking => {
      const status = booking.bookingstatus || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Số lượng đặt sân theo trạng thái',
          data: Object.values(statusCounts),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          pointBackgroundColor: Object.keys(statusCounts).map(
            status => statusColors[status as keyof typeof statusColors] || 'rgba(54, 162, 235, 1)'
          ),
        },
      ],
    };
  };

  // Chart options
  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Phân bố trạng thái đặt sân',
        font: { size: 16 }
      }
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h4 className="card-title mb-0">Phân bố trạng thái đặt sân</h4>
      </div>
      <div className="card-body">
        {bookings.length > 0 ? (
          <Radar 
            data={processRadarChartData()} 
            options={radarOptions}
          />
        ) : (
          <div className="text-center py-4">Không có dữ liệu</div>
        )}
      </div>
    </div>
  );
};

/**
 * Bar chart showing monthly booking revenue
 */
export const BookingRevenueBarChart: React.FC<BookingBarChartProps> = ({ bookings }) => {
  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12"
  ];

  // Process data for Bar Chart - Monthly Distribution
  const processBarChartData = () => {
    const monthlyData: Record<string, number> = {};
    
    // Initialize months
    months.forEach(month => {
      monthlyData[month] = 0;
    });
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.bookingdate);
      const monthStr = String(bookingDate.getMonth() + 1).padStart(2, '0');
      
      if (monthlyData[monthStr] !== undefined) {
        monthlyData[monthStr] += booking.bookingprice || 0;
      }
    });
    
    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Doanh thu theo tháng (VND)',
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh thu đặt sân theo tháng',
        font: { size: 16 }
      },
    },
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h4 className="card-title mb-0">Doanh thu đặt sân theo tháng</h4>
      </div>
      <div className="card-body">
        {bookings.length > 0 ? (
          <Bar 
            data={processBarChartData()} 
            options={barOptions}
          />
        ) : (
          <div className="text-center py-4">Không có dữ liệu</div>
        )}
      </div>
    </div>
  );
};

/**
 * Radar chart showing order status distribution
 */
export const OrderStatusRadarChart: React.FC<OrderRadarChartProps> = ({ orders }) => {
  // Process data for Radar Chart - Order Status Distribution
  const processRadarChartData = () => {
    const statusCounts: Record<string, number> = {};
    
    orders.forEach(order => {
      const status = order.orderstatus || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Số lượng đơn hàng theo trạng thái',
          data: Object.values(statusCounts),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          pointBackgroundColor: Object.keys(statusCounts).map(
            status => statusColors[status as keyof typeof statusColors] || 'rgba(54, 162, 235, 1)'
          ),
        },
      ],
    };
  };

  // Chart options
  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Phân bố trạng thái đơn hàng',
        font: { size: 16 }
      }
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h4 className="card-title mb-0">Phân bố trạng thái đơn hàng</h4>
      </div>
      <div className="card-body">
        {orders.length > 0 ? (
          <Radar 
            data={processRadarChartData()} 
            options={radarOptions}
          />
        ) : (
          <div className="text-center py-4">Không có dữ liệu</div>
        )}
      </div>
    </div>
  );
};

/**
 * Bar chart showing monthly order revenue
 */
export const OrderRevenueBarChart: React.FC<OrderBarChartProps> = ({ orders }) => {
  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12"
  ];

  // Process data for Bar Chart - Monthly Distribution
  const processBarChartData = () => {
    const monthlyData: Record<string, number> = {};
    const paidMonthlyData: Record<string, number> = {};
    
    // Initialize months
    months.forEach(month => {
      monthlyData[month] = 0;
      paidMonthlyData[month] = 0;
    });
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdate);
      const monthStr = String(orderDate.getMonth() + 1).padStart(2, '0');
      
      if (monthlyData[monthStr] !== undefined) {
        monthlyData[monthStr] += order.totalprice || 0;
        
        // Track separately paid and unpaid orders
        if (order.paymentstatus) {
          paidMonthlyData[monthStr] += order.totalprice || 0;
        }
      }
    });
    
    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Tổng doanh thu theo tháng (VND)',
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Doanh thu đã thanh toán (VND)',
          data: Object.values(paidMonthlyData),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ],
    };
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh thu đơn hàng theo tháng',
        font: { size: 16 }
      },
    },
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h4 className="card-title mb-0">Doanh thu đơn hàng theo tháng</h4>
      </div>
      <div className="card-body">
        {orders.length > 0 ? (
          <Bar 
            data={processBarChartData()} 
            options={barOptions}
          />
        ) : (
          <div className="text-center py-4">Không có dữ liệu</div>
        )}
      </div>
    </div>
  );
};
