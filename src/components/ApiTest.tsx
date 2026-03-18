import { useState, useEffect } from "react";
import { postApi, authApi } from "../api";
import type { PostListRes } from "../types";
import { useNavigate } from "react-router-dom";

export const ApiTest = () => {
  const [currentPage, setCurrentPage] = useState(0); // 백엔드 Pageable은 0부터 시작
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostListRes[]>([]);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!localStorage.getItem("accessToken");

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

  const fetchPosts = async (page: number = 0) => {
    setLoading(true);
    try {
      // 이제 인자로 받은 page를 api 호출에 사용합니다.
      const res = await postApi.getPosts({ page, size: 10 });

      const actualData = res.data.data.content;
      const totalPages = res.data.data.totalPages; // 백엔드에서 주는 전체 페이지 수

      if (actualData) {
        setPosts(actualData);
        setTotalPages(totalPages); // totalPages 상태도 업데이트 해주세요!
        setCurrentPage(page); // 현재 페이지 상태 저장
      }
    } catch (err) {
      console.error("목록 로딩 에러:", err);
      alert("데이터를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getBoardTypeBadge = (type: string) => {
    switch (type) {
      case "NOTICE":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
            공지
          </span>
        );
      case "NEWS":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
            뉴스
          </span>
        );
      case "FREE":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
            자유
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            {type}
          </span>
        );
    }
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          📋 ToyProject 게시판
        </h2>
        <button
          onClick={() => navigate("/write")}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md font-bold"
        >
          ✍️ 새 글 작성
        </button>
      </div>

      {/* 🔹 로그인 및 액션 버튼 영역 (깔끔하게 통합됨) */}
      <div className="mb-10 p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
        {isLoggedIn ? (
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-indigo-600 mb-4">
              ✅ {localStorage.getItem("role")} 권한으로 로그인 중입니다.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold shadow"
              >
                🔓 로그아웃
              </button>
              <button
                onClick={() => fetchPosts}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold shadow"
              >
                🔄 게시물 불러오기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-500 mb-4">
              서비스를 이용하려면 로그인이 필요합니다.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg"
              >
                🔑 로그인 / 회원가입 하러가기
              </button>
              <button
                onClick={() => fetchPosts}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold"
              >
                🔄 비회원으로 목록 보기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 테이블 영역 (기존 유지) */}
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
                  번호
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  유형
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
                    <td className="px-6 py-4 text-sm">
                      {getBoardTypeBadge(post.boardType)}
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
          {/* 🔹 페이지네이션 컨트롤 UI */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center gap-2 py-6 border-t border-gray-100 bg-gray-50/50">
              <button
                disabled={currentPage === 0}
                onClick={() => fetchPosts(currentPage - 1)}
                className="px-3 py-1 rounded border bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
              >
                이전
              </button>

              {/* 페이지 번호 버튼 */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchPosts(i)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${
                    currentPage === i
                      ? "bg-blue-600 text-white shadow-md scale-110"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => fetchPosts(currentPage + 1)}
                className="px-3 py-1 rounded border bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
