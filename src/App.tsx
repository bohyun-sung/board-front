import { Routes, Route } from "react-router-dom";
import { ApiTest } from "./components/ApiTest";
import { PostDetail } from "./components/PostDetail";
import { PostWrite } from "./components/PostWrite";
import { PostEdit } from "./components/PostEdit";
// ✅ 로그인 관련 컴포넌트 임포트
import { Login } from "./components/Login";
import { AdminLogin } from "./components/AdminLogin";
import { AdminRegister } from "./components/AdminRegister";
import { OAuthCallback } from "./components/OAuthCallback";
import { MemberLogin } from "./components/MemberLogin";
import { MemberRegister } from "./components/MemberRegister";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* 🏠 메인 */}
        <Route path="/" element={<ApiTest />} />
        {/* 통합 로그인 진입점 */}
        <Route path="/login" element={<Login />} />
        {/* 세부 액션 경로 */}
        {/* <Route path="/login" element={<LoginPage />} /> 통합 페이지 */}
        <Route path="/member-login" element={<MemberLogin />} />
        <Route path="/member-register" element={<MemberRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />{" "}
        {/* 기존 로그인 로직 활용 */}
        <Route path="/admin-register" element={<AdminRegister />} />
        {/* 구글 로그인 성공 후 돌아올 경로 추가 */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        {/* 🏠 게시판*/}
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/write" element={<PostWrite />} />
        <Route path="/post/edit/:id" element={<PostEdit />} />
      </Routes>
    </div>
  );
}

export default App;
