import { useState } from "react";
import { authApi } from "../api";
import { useNavigate } from "react-router-dom";

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await authApi.loginAdmin(formData);

      if (res.data.result) {
        // 1. 백엔드 응답 데이터 구조 파악 (res.data.data에 AdminLoginRes가 들어있음)
        const loginData = res.data.data;

        // 2. record AdminLoginRes의 token 필드 접근
        const accessToken = loginData.token?.accessToken;
        const adminIdx = loginData.adminIdx;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("adminIdx", String(adminIdx));
          localStorage.setItem("role", "ADMIN");

          alert("관리자 로그인 성공!");
          navigate("/");
          window.location.reload();
        } else {
          alert("로그인 정보에서 토큰을 찾을 수 없습니다.");
        }
      }
    } catch (err: any) {
      console.error("로그인 에러:", err);
      alert(err.response?.data?.fail?.message || "관리자 인증에 실패했습니다.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-6 text-center text-indigo-700">
          🔒 관리자 로그인
        </h2>
        <div className="space-y-4">
          <input
            className="w-full border p-2 rounded outline-indigo-500"
            placeholder="관리자 아이디"
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
          />
          <input
            className="w-full border p-2 rounded outline-indigo-500"
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 transition">
            로그인
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-xs text-gray-400 hover:underline"
          >
            이전으로 돌아가기
          </button>
        </div>
      </form>
    </div>
  );
};
