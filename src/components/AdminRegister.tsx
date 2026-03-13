import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

export const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    password: "",
    passwordCheck: "",
    email: "",
    phone: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordCheck) {
      return alert("비밀번호가 일치하지 않습니다.");
    }

    try {
      const res: any = await authApi.createAdmin(formData);

      // 1. 로그를 찍어 구조를 다시 확인 (이미 {result: true}로 오는 것 확인됨)
      console.log("백엔드 응답 확인:", res);

      // 2. 접근 경로 수정 (res.data.result -> res.result)
      // 백엔드 응답 방식에 따라 둘 다 대응하도록 작성
      const isSuccess = res?.result || res?.data?.result;

      if (isSuccess) {
        alert("관리자 계정 생성이 완료되었습니다.");
        navigate("/login");
      } else {
        // result가 false로 명시되어 온 경우
        const msg =
          res?.fail?.message || res?.data?.fail?.message || "가입 실패";
        alert(msg);
      }
    } catch (err: any) {
      // 3. 409 Conflict 등 HTTP 에러 발생 시 (Axios 에러)
      console.error("에러 발생:", err);

      // Axios 에러 객체에서 백엔드가 보낸 에러 메시지 추출
      const backendErrorMsg =
        err.response?.data?.fail?.message ||
        err.response?.data?.message ||
        "이미 존재하는 계정이거나 입력 형식이 잘못되었습니다.";

      alert(backendErrorMsg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-10">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-md w-[450px]"
      >
        <h2 className="text-xl font-bold mb-6 text-center text-indigo-700">
          관리자 계정 생성
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 ml-1">이름</label>
            <input
              className="w-full border p-2 rounded outline-indigo-500"
              placeholder="홍길동"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1">아이디</label>
            <input
              className="w-full border p-2 rounded outline-indigo-500"
              placeholder="admin_1"
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 ml-1">비밀번호</label>
              <input
                className="w-full border p-2 rounded outline-indigo-500"
                type="password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 ml-1">
                비밀번호 확인
              </label>
              <input
                className="w-full border p-2 rounded outline-indigo-500"
                type="password"
                onChange={(e) =>
                  setFormData({ ...formData, passwordCheck: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1">이메일</label>
            <input
              className="w-full border p-2 rounded outline-indigo-500"
              type="email"
              placeholder="admin@example.com"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 ml-1">핸드폰 번호</label>
            <input
              className="w-full border p-2 rounded outline-indigo-500"
              placeholder="010-0000-0000"
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-4">
            관리자 가입하기
          </button>
        </div>
      </form>
    </div>
  );
};
