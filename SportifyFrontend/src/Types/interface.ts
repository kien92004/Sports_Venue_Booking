// models/types.ts

// Người dùng
export interface User {
  username: string;
  image?: string;
}

// Sân thể thao
export interface Field {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  image: string;
  address: string;
  isActive: boolean;
}

// Sản phẩm
export interface Product {
  id: number;
  name: string;
  count: number;
  image: string;
  price: number;
  description: string;
}

// Sự kiện
export interface Event {
  id: number;
  title: string;
  date: string;       // nếu muốn có thể để Date type
  time: string;       // nếu muốn gộp chung với date thì dùng Date
  image: string;
  description: string;
}

// Dữ liệu thống kê sân
export interface FieldUsage {
  fieldId: number;
  fieldName: string;
  fieldImage: string;
  fieldPrice: number;
  oneTimeBookings: number;
  permanentBookings: number;
  totalBookings: number;
  totalRevenue: number;
}
