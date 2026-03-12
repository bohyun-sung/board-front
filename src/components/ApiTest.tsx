import { useState } from "react";
import { postApi, authApi } from "../api";
import type { PostListRes } from "../types";
import { useNavigate } from "react-router-dom";

export const ApiTest = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostListRes[]>([]);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  // 1. 멤버 로그인 (email 사용)
  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.loginMember({
        email: "user_1@example.com",
        password: "123!",
      });
      if (res.data.result) {
        const loginData = res.data.data;

        // ⭐ 이 부분에서 키값이 'memberIdx'인지 확인하세요!
        localStorage.setItem("accessToken", loginData.accessToken);
        localStorage.setItem("memberIdx", String(loginData.memberIdx)); // 혹은 loginData.idx
        localStorage.setItem("role", "USER");

        navigate("/");
      }
      // 1. 여기서 서버가 주는 진짜 데이터를 확인합니다.
      console.log("백엔드 응답 전체:", res);

      // 2. 백엔드 관례상 보통 'data'라는 키로 한 번 더 감싸는 경우가 많습니다.
      // 만약 res.data.data.token.accessToken 이라면?
      const targetToken =
        res.data?.token?.accessToken || res.data?.data?.token?.accessToken;

      if (targetToken) {
        localStorage.setItem("accessToken", targetToken);
        alert("로그인 성공!");
        window.location.reload();
      } else {
        alert("로그인은 됐으나 토큰 경로가 다릅니다. 콘솔을 확인하세요.");
      }
    } catch (err: any) {
      console.error("로그인 에러:", err);
      alert(
        "로그인 실패: " + (err.response?.data?.message || "구조 확인 필요"),
      );
    }
  };

  // 2. 관리자 로그인 수정본
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.loginAdmin({
        userId: "admin_5",
        password: "123!",
      });
      if (res.data.result) {
        const loginData = res.data.data;

        // ⭐ 이 부분에서 키값이 'adminIdx'인지 확인하세요!
        localStorage.setItem("accessToken", loginData.accessToken);
        localStorage.setItem("adminIdx", String(loginData.adminIdx)); // 혹은 loginData.idx
        localStorage.setItem("role", "ADMIN");

        navigate("/");
      }
      const token =
        res.data?.token?.accessToken || res.data?.data?.token?.accessToken;

      if (token) {
        localStorage.setItem("accessToken", token);
        alert("관리자 로그인 성공!");

        // ✅ 중요: 로그인 성공 후 페이지를 새로고침하여
        // 인터셉터가 새로운 토큰을 인식하게 만듭니다.
        window.location.reload();
      } else {
        console.log("응답 구조 확인:", res.data);
        alert("로그인은 성공했으나 토큰을 찾을 수 없습니다.");
      }
    } catch (err: any) {
      console.error("관리자 로그인 에러:", err);
      alert(err.response?.data?.message || "관리자 로그인 실패");
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      // 1. 서버에 로그아웃 요청 (인터셉터가 헤더에 Bearer 토큰을 실어 보냅니다)
      await authApi.logout();
      alert("서버 로그아웃 완료");
    } catch (err: any) {
      console.error("서버 로그아웃 중 오류 발생:", err);
      // 서버에서 이미 토큰이 만료되었을 수도 있으므로, 에러가 나더라도 클라이언트는 지워주는게 좋습니다.
    } finally {
      // 2. 요청 성공/실패 여부와 상관없이 클라이언트 토큰은 삭제
      localStorage.removeItem("accessToken");
      setPosts([]);
      window.location.reload();
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.getPosts({ page: 0, size: 10 });

      // 백엔드 응답이 { result: true, data: { content: [...] } } 구조이므로
      // axios의 res.data 안의 data 안의 content를 가져와야 합니다.
      const actualData = res.data.data.content;

      if (actualData) {
        setPosts(actualData);
      }
    } catch (err) {
      console.error("목록 로딩 에러:", err);
      alert("데이터를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          📋 ToyProject 게시판{" "}
        </h2>
        <button
          onClick={() => navigate("/write")}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md font-bold"
        >
          ✍️ 새 글 작성
        </button>
      </div>

      {/* 로그인 및 액션 버튼 영역 */}
      <div className="mb-10 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm font-medium text-gray-500 mb-4 text-center">
          {isLoggedIn
            ? "✅ 로그인 상태입니다"
            : "🔑 계정을 선택해 로그인하세요"}
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {!isLoggedIn ? (
            <>
              {/* 로그인 전: 로그인 버튼들 표시 */}
              <button
                onClick={handleAdminLogin}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-bold shadow"
              >
                🔑 관리자 로그인
              </button>
              <button
                onClick={handleMemberLogin}
                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-black transition text-sm font-bold shadow"
              >
                👤 멤버 로그인
              </button>
            </>
          ) : (
            /* 로그인 후: 로그아웃 버튼 표시 */
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-bold shadow"
            >
              🔓 로그아웃
            </button>
          )}

          {/* 목록 새로고침은 항상 표시 */}
          <button
            onClick={fetchPosts}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-bold shadow"
          >
            🔄 목록 새로고침
          </button>
        </div>
      </div>

      {/* 테이블 영역 (기존과 동일) */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-500 animate-pulse">
          데이터 로딩 중...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  제목
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  작성자
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr
                    key={post.postIdx}
                    onClick={() => navigate(`/post/${post.postIdx}`)}
                    className="hover:bg-blue-50 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {post.postIdx}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {post.nickname}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    등록된 게시글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
