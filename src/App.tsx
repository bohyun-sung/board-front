import { Routes, Route } from "react-router-dom";
import { ApiTest } from "./components/ApiTest";
import { PostDetail } from "./components/PostDetail";
import { PostWrite } from "./components/PostWrite";
// 1. PostEdit 컴포넌트 임포트 추가 (파일 위치가 동일하다면 아래와 같이)
import { PostEdit } from "./components/PostEdit";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* 목록 */}
        <Route path="/" element={<ApiTest />} />

        {/* 상세 조회 */}
        <Route path="/post/:id" element={<PostDetail />} />

        {/* 글쓰기 (작성하신 주소 /write 기준) */}
        <Route path="/write" element={<PostWrite />} />

        {/* 2. 게시물 수정 경로 추가 (id를 받아야 하므로 :id 필수) */}
        <Route path="/post/edit/:id" element={<PostEdit />} />
      </Routes>
    </div>
  );
}

export default App;
