import axios from 'axios';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const API_BASE_URL = `${URL_BACKEND}/api/admin/field-owner`;

export type FieldOwnerFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

export interface FieldOwnerRequest {
  ownerId: number;
  businessName: string;
  businessEmail: string;
  phone: string;
  address: string;
  idNumber: string | null;
  idFrontUrl: string | null;
  idBackUrl: string | null;
  businessLicenseUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  username: string;
}

export const fieldOwnerService = {
  async getRequests(status: FieldOwnerFilter = 'PENDING'): Promise<FieldOwnerRequest[]> {
    const params = status === 'ALL' ? {} : { status };
    const response = await axios.get(`${API_BASE_URL}/requests`, { params });
    return response.data;
  },

  async approveRequest(ownerId: number): Promise<void> {
    await axios.post(`${API_BASE_URL}/requests/${ownerId}/approve`);
  },

  async rejectRequest(ownerId: number, reason: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/requests/${ownerId}/reject`, { reason });
  },

  async deleteRequest(ownerId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/requests/${ownerId}`);
  },
};
