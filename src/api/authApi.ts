import api from './axiosInstance';
import * as T from '../types';

export const authApi = {
  loginMember: (data: any) => api.post<any, T.ApiResponse<T.MemberLoginRes>>('/api/auth/login/member', data),
  loginAdmin: (data: any) => api.post<any, T.ApiResponse<any>>('/api/auth/login/admin', data),
  createMember: (data: any) => api.post('/api/auth/create/member', data),
  logout: () => api.post('/api/auth/logout'),
};