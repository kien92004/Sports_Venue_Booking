import axios from 'axios';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
const API_BASE_URL = `${URL_BACKEND}/rest/dashboard`;

export interface DashboardSummary {
  linecharts_b: number[][];
  countFieldActiving: number;
  sumRevenueOrder2Month: [boolean, number, number][];
  countOrderInDate: number;
  linecharts_a: number[][];
  totalProduct: number;
  totalOrderBooking: number;
  thisthatMonth: number[][];
  countProductActive: number;
  barcharts_b: number[][];
  barcharts_a: number[][];
  totalUser: number;
  totalField: number;
  countBookingInDate: number;
}

export interface DashboardDetails {
  top5UserDatSan: [string, string, string, number, number][];
  demLienHeTrongNgay: number;
  thongKeOrderInDay: [string, number, number | null][];
  top3SanDatNhieu: [string, number, number, number][];
  danhsach3contact: any[];
  top5UserOrder: [string, string, string, number, number][];
  tongDoanhThuBooking2Month: number[][];
  tongSoPhieuDatSan2Thang: [string, number][];
  tongSoPhieuOrder2Thang: [string, number][];
  doanhThuOrder2Month: number[][];
  thongkebookingtrongngay: [string, number, number][];
  top3SanPhamBanNhieu: [string, number, number, number][];
}

export const dashboardService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  getDashboardDetails: async (): Promise<DashboardDetails> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all-details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
      throw error;
    }
  }
};