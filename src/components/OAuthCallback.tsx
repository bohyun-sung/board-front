import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // URL 파라미터에서 토큰 추출 (백엔드 설계에 따라 다름)
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const memberIdx = params.get("memberIdx");

    if (token) {
      localStorage.setItem("accessToken", token);
      if (memberIdx) localStorage.setItem("memberIdx", memberIdx);
      localStorage.setItem("role", "USER");

      navigate("/"); // 메인으로 이동
      window.location.reload();
    } else {
      alert("로그인 정보가 유효하지 않습니다.");
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-gray-600">로그인 처리 중...</p>
    </div>
  );
};
