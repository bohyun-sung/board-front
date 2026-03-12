export * from "./authApi";
export * from "./postApi";
export * from "./commentApi";
export * from "./uploadApi";

import axios from "axios";

// 'api' 인스턴스를 만들기.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8090",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키(RefreshToken)를 같이 보내기 위해 필수!
});

// 요청 인터셉터 (토큰을 자동으로 실어 보내기 위해 필요)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  // 브라우저 콘솔에서 확인용
  console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);

  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token injected into header.");
  } else {
    console.log("No token found in localStorage.");
  }
  return config;
});

// 응답 인터셉터: 401 발생 시 토큰 재발급 로직
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 이미 재시도한 요청이 아닐 때만 실행
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // /reissue 호출 (AccessToken 갱신)
        // 주의: reissue 호출 시에는 인터셉터가 아닌 생 axios를 쓰거나 별도 처리 권장
        const baseURL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
        const res = await axios.post(
          `${baseURL}/api/auth/reissue`,
          {},
          {
            withCredentials: true,
          },
        );
        if (res.data.result) {
          const { accessToken } = res.data.data;

          // 신규 토큰 저장
          localStorage.setItem("accessToken", accessToken);

          // 원래 실패했던 요청의 헤더를 새 토큰으로 교체
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // 원래 요청 재시도
          return api(originalRequest);
        }
      } catch (reissueError) {
        // 리프레쉬 토큰마저 만료된 경우
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(reissueError);
      }
    }
    return Promise.reject(error);
  },
);

export const postApi = {
  getPosts: (params?: any) => api.get("/api/posts", { params }),

  getPost: (postIdx: number) => api.get(`/api/posts/${postIdx}`),

  createPost: (data: {
    title: string;
    content: string;
    boardType: string;
    uploadIdxs?: number[];
  }) => api.post("/api/posts", data),

  updatePost: (postIdx: number, data: any) =>
    api.patch(`/api/posts/${postIdx}`, data),

  deletePost: (postIdx: number) => api.delete(`/api/posts/${postIdx}`),
};

export const authApi = {
  // 멤버 로그인: email 사용
  loginMember: (data: { email: string; password: string }) =>
    api.post("/api/auth/login/member", data),

  // 관리자 로그인: userId 사용
  loginAdmin: (data: { userId: string; password: string }) =>
    api.post("/api/auth/login/admin", data),
  // 멤버 관리자 로그아웃
  logout: () => api.post("/api/auth/logout"),
};

export const uploadApi = {
  uploadFiles: (files: File[], uploadType: "POST" | "COMMENT") => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    // 백엔드 Enum 타입에 맞게 "POST" 형식의 JSON으로 보냄
    const typeBlob = new Blob([JSON.stringify(uploadType)], {
      type: "application/json",
    });
    formData.append("uploadType", typeBlob);

    return api.post("/api/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const commentApi = {
  createComment: (
    postIdx: number,
    data: {
      content: string;
      parentIdx?: number | null;
      uploadIdxs?: number[];
    },
  ) => {
    return api.post(`/api/posts/${postIdx}/comments`, data);
  },

  getComments: (postIdx: number) => {
    return api.get(`/api/posts/${postIdx}/comments`);
  },
};
