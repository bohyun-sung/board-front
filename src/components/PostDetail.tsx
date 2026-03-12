import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postApi, commentApi, uploadApi } from "../api";
import type { PostShowRes } from "../types";
import { CommentItem } from "./CommentItem";

// --- 1. 별도의 컴포넌트로 분리 (재귀 구조) ---

// --- 2. 메인 PostDetail 컴포넌트 ---
export const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostShowRes | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentFiles, setCommentFiles] = useState<File[]>([]);

  const myMemberIdx = localStorage.getItem("memberIdx")
    ? Number(localStorage.getItem("memberIdx"))
    : null;
  const myAdminIdx = localStorage.getItem("adminIdx")
    ? Number(localStorage.getItem("adminIdx"))
    : null;

  const fetchComments = async () => {
    try {
      const response = await commentApi.getComments(Number(id));
      const commentList = response.data.data?.content || [];
      setComments(commentList);
    } catch (err) {
      console.error("댓글 로딩 실패:", err);
    }
  };

  useEffect(() => {
    if (id) {
      postApi
        .getPost(Number(id))
        .then((res) => {
          if (res.data && res.data.result) {
            setPost(res.data.data);
            fetchComments();
          }
        })
        .catch((err) => {
          console.error(err);
          alert("글을 불러오는데 실패했습니다.");
          navigate("/");
        });
    }
  }, [id, navigate]);

  const handleReplySubmit = async (
    parentIdx: number,
    content: string,
    uploadIdxs: number[],
  ) => {
    try {
      await commentApi.createComment(Number(id), {
        content: content,
        parentIdx: parentIdx,
        uploadIdxs: uploadIdxs, // ⬅️ 전달받은 이미지 ID들 추가
      });
      alert("답글이 등록되었습니다.");
      fetchComments();
    } catch (err) {
      alert("답글 등록 실패");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // 기존 파일 리스트에 추가 (누적)
    setCommentFiles((prev) => [...prev, ...selectedFiles]);
  };

  // 2. 등록 버튼 핸들러 (여기서 업로드 + 댓글 등록을 한꺼번에!)
  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) return alert("내용을 입력해주세요.");

    try {
      let finalUploadIdxs: number[] = [];

      // 🔥 사진이 있을 때만 먼저 업로드 실행
      if (commentFiles.length > 0) {
        const res = await uploadApi.uploadFiles(commentFiles, "COMMENT");
        finalUploadIdxs = res.data.data.map(
          (file: any) => file.uploadIdx || file.idx,
        );
      }

      // 업로드된 ID들과 함께 댓글 등록
      await commentApi.createComment(Number(id), {
        content: commentContent,
        parentIdx: null,
        uploadIdxs: finalUploadIdxs,
      });

      alert("댓글이 등록되었습니다!");

      // 모든 상태 초기화
      setCommentContent("");
      setCommentFiles([]);
      fetchComments();
    } catch (error) {
      console.error(error);
      alert("댓글 등록 또는 이미지 업로드에 실패했습니다.");
    }
  };

  const canControl =
    !!post &&
    (myAdminIdx !== null ||
      (myMemberIdx !== null && post.memberIdx === myMemberIdx));

  if (!post)
    return <div className="p-10 text-center text-gray-500">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
      {/* 상단 버튼 바 */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium"
        >
          ← 목록으로
        </button>
        {canControl && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/post/edit/${id}`)}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 text-sm"
            >
              ✏️ 수정
            </button>
            <button
              onClick={() => {
                /* 삭제 로직 */
              }}
              className="px-3 py-1 bg-red-50 text-red-600 rounded border border-red-100 text-sm"
            >
              🗑️ 삭제
            </button>
          </div>
        )}
      </div>

      {/* 본문 내용 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="text-sm text-gray-500 mb-6 flex gap-4">
          <span>✍️ {post.nickname}</span>
          <span>📅 {new Date(post.rgdt).toLocaleDateString()}</span>
        </div>

        {/* 게시글 텍스트 본문 */}
        <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap mb-10">
          {post.content}
        </div>

        {/* 🖼️ [추가] 게시글 본문에 첨부된 이미지들 */}
        {post.uploads && post.uploads.length > 0 && (
          <div className="flex flex-col gap-4 mb-10">
            {post.uploads.map((file: any) => (
              <img
                key={file.uploadIdx}
                src={file.uploadUrl}
                alt="게시글 이미지"
                className="max-w-full h-auto rounded-lg shadow-md border"
              />
            ))}
          </div>
        )}
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-10 border-t pt-8">
        <h3 className="font-bold text-lg mb-4">댓글 {comments.length}개</h3>

        {/* 메인 댓글 입력 영역 */}
        <div className="flex flex-col gap-2 mb-8 border p-4 rounded-lg bg-gray-50">
          {/* 📸 1. 메인 댓글용 미리보기 이미지 리스트 추가 */}
          {commentFiles.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto py-1">
              {commentFiles.map((file, idx) => (
                <div key={idx} className="relative shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="미리보기"
                    className="w-16 h-16 object-cover rounded-md border-2 border-white shadow-sm"
                  />
                  <button
                    onClick={() =>
                      setCommentFiles((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            className="w-full p-2 resize-none text-sm outline-none bg-transparent"
            rows={2}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="이미지와 함께 댓글을 남겨보세요."
          />

          <div className="flex justify-between items-center border-t pt-2">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs font-medium transition">
                📁 사진 추가 ({commentFiles.length})
                <input
                  type="file"
                  multiple // 🔥 반드시 multiple이 있어야 여러 개 선택 가능!
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 font-bold"
            >
              등록
            </button>
          </div>
        </div>
        {/* 업로드된 파일 미리보기 이름들 */}
        {commentFiles.length > 0 && (
          <div className="text-xs text-blue-400">
            📎 {commentFiles.length}개의 파일이 선택됨
          </div>
        )}
      </div>
      {/* 댓글 목록 (재귀 컴포넌트 호출) */}
      <div className="space-y-1">
        {comments.map((comment) => (
          <CommentItem
            key={comment.commentIdx}
            comment={comment}
            onReplySubmit={handleReplySubmit}
          />
        ))}
      </div>
    </div>
  );
};
