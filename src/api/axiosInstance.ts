//  axiosInstance.ts (Axios 설정 및 인터셉터)
//  JWT 토큰 관리 및 자동 갱신(Reissue) 로직을 포함합니다.


import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:8090', // 백엔드 서버 주소
//   baseURL: 'https://bohyun-board.duckdns.org', // 배포 백엔드 서버 주소
  withCredentials: true, // 쿠키(Refresh Token) 전송을 위해 필요
});
// 요청 인터셉터: 헤더에 Access Token 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// 응답 인터셉터: 401 에러 시 토큰 재발급 시도
api.interceptors.response.use(
  (response) => response.data, // ApiResponse<T> 바로 반환
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.post('/api/auth/reissue');
        const newToken = res.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (reissueError) {
        // 재발급 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(reissueError);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);
export default api;