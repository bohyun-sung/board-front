import { useState } from "react";
import { authApi } from "../api";
import { useNavigate } from "react-router-dom";

export const MemberLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await authApi.loginMember(credentials);

      // 로그에서 확인된 구조에 따라 접근
      // res.data -> 백엔드가 보낸 {result, data: {tokenDto...}}
      const backendResponse = res.data;

      if (backendResponse.result) {
        // 실제 데이터는 backendResponse.data 안에 있음
        const loginData = backendResponse.data;

        // 토큰 위치: loginData.tokenDto.accessToken
        const token = loginData?.token?.accessToken;

        if (token) {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("memberIdx", String(loginData.memberIdx));
          localStorage.setItem("role", "USER");

          alert("로그인 성공!");
          navigate("/"); // 메인으로 이동
          window.location.reload(); // 상태 반영을 위한 새로고침
        }
      } else {
        alert(backendResponse.fail?.message || "로그인 실패");
      }
    } catch (err: any) {
      console.error("로그인 에러:", err);
      alert("아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-6">🔑 멤버 로그인</h2>
        <input
          type="email"
          placeholder="이메일"
          className="w-full border p-3 rounded-lg"
          required
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full border p-3 rounded-lg"
          required
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />
        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">
          로그인
        </button>
      </form>
    </div>
  );
};
