import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  // 구글 OAuth2 엔드포인트
  const handleGoogleLogin = () => {
    // 1. 현재 프론트엔드가 실행 중인 호스트 주소를 확인
    // 배포 환경이면 https://bohyun-board.duckdns.org 가 됩니다.
    const currentHost = window.location.origin;

    // 2. API 베이스 URL 설정 (Vite 환경 변수 활용)
    // 로컬 개발 시에는 http://localhost:8090, 배포 시에는 /api 등으로 설정된 값을 읽습니다.
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";

    // 3. 배포 환경(Nginx 프록시 사용 시)인지 로컬인지 판단하여 주소 생성
    const loginUrl = apiBaseUrl.startsWith("http")
      ? `${apiBaseUrl}/oauth2/authorization/google` // 로컬: 직접 주소 호출
      : `${currentHost}${apiBaseUrl}/oauth2/authorization/google`; // 배포: 도메인 + /api/...

    window.location.href = loginUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          🔐 ToyProject 진입하기
        </h2>

        {/* 1. 멤버 섹션 */}
        <div className="mb-8 border-b pb-6">
          <p className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Member
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
                alt="G"
              />
              구글로 로그인 / 가입
            </button>
            {/* 일반 멤버 로그인/가입 */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/member-login")}
                className="flex-1 bg-white border border-indigo-600 text-indigo-600 py-3 rounded-lg font-bold text-sm hover:bg-indigo-50 transition"
              >
                이메일 로그인
              </button>
              <button
                onClick={() => navigate("/member-register")}
                className="flex-1 bg-white border border-gray-600 text-gray-600 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition"
              >
                이메일 가입
              </button>
            </div>
          </div>
        </div>

        {/* 2. 관리자 섹션 */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Admin
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/admin-login")}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-indigo-700 transition"
            >
              관리자 로그인
            </button>
            <button
              onClick={() => navigate("/admin-register")}
              className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-bold text-sm hover:bg-black transition"
            >
              관리자 가입
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-gray-400 text-xs hover:underline mt-4"
        >
          메인 화면으로 돌아가기
        </button>
      </div>
    </div>
  );
};
