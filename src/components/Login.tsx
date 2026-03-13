import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  // 구글 OAuth2 엔드포인트
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8090/oauth2/authorization/google";
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
