import { useState } from "react";
import { authApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export const MemberRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    nickname: "",
    phone: "",
    password: "",
    passwordCheck: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordCheck)
      return alert("비밀번호가 일치하지 않습니다.");

    try {
      const res: any = await authApi.createMember(formData);
      // 백엔드 응답이 res.result 또는 res.data.result로 올 수 있음
      if (res?.result || res?.data?.result) {
        alert("회원가입이 완료되었습니다!");
        navigate("/login");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.fail?.message || "입력 형식을 확인해주세요.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleRegister}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          👤 멤버 회원가입
        </h2>
        <input
          type="email"
          placeholder="이메일"
          className="w-full border p-3 rounded-lg"
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="닉네임"
          className="w-full border p-3 rounded-lg"
          required
          onChange={(e) =>
            setFormData({ ...formData, nickname: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="전화번호 (010-0000-0000)"
          className="w-full border p-3 rounded-lg"
          required
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full border p-3 rounded-lg"
          required
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          className="w-full border p-3 rounded-lg"
          required
          onChange={(e) =>
            setFormData({ ...formData, passwordCheck: e.target.value })
          }
        />
        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">
          가입하기
        </button>
      </form>
    </div>
  );
};
