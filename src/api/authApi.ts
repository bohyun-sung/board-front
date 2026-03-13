// src/api/authApi.ts (파일명에 맞춰 확인)
import api from "./axiosInstance";
import * as T from "../types";
import type { AxiosResponse } from "axios";
// 1. 객체의 구조를 인터페이스로 정의합니다.
interface AuthApiService {
  loginMember: (
    data: any,
  ) => Promise<AxiosResponse<T.ApiResponse<T.MemberLoginRes>>>;
  loginAdmin: (
    data: any,
  ) => Promise<AxiosResponse<T.ApiResponse<T.AdminLoginRes>>>;
  createAdmin: (
    data: T.AdminCreateReq,
  ) => Promise<AxiosResponse<T.ApiResponse<any>>>; // ✅ 명시적 추가
  createMember: (data: any) => Promise<AxiosResponse<T.ApiResponse<any>>>; // ✅ 명시적 추가
  logout: () => Promise<AxiosResponse<T.ApiResponse<any>>>;
  reissue: () => Promise<AxiosResponse<T.ApiResponse<any>>>;
}

// 2. 정의한 인터페이스를 객체에 적용합니다.
export const authApi: AuthApiService = {
  loginMember: (data) => api.post("/api/auth/login/member", data),
  loginAdmin: (data) => api.post("/api/auth/login/admin", data),
  createAdmin: (data) => api.post("/api/auth/create/admin", data),
  createMember: (data) => api.post("/api/auth/create/member", data),
  logout: () => api.post("/api/auth/logout"),
  reissue: () => api.post("/api/auth/reissue"),
};
