import React, { useState } from "react";
import { uploadApi } from "../api";

interface CommentItemProps {
  comment: any;
  onReplySubmit: (
    parentIdx: number,
    content: string,
    uploadIdxs: number[],
  ) => Promise<void>;
}

export const CommentItem = ({ comment, onReplySubmit }: CommentItemProps) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);

  console.log("댓글 데이터 확인:", comment);

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setReplyFiles((prev) => [...prev, ...selectedFiles]);

    e.target.value = "";
  };

  const handleReplyClick = async () => {
    if (!replyContent.trim()) return alert("내용을 입력해주세요.");

    try {
      let finalIdxs: number[] = [];

      // 대댓글 등록 버튼 누를 때 업로드
      if (replyFiles.length > 0) {
        const res = await uploadApi.uploadFiles(replyFiles, "COMMENT");
        finalIdxs = res.data.data.map((file: any) => file.uploadIdx);
      }

      await onReplySubmit(comment.commentIdx, replyContent, finalIdxs);

      // 초기화
      setReplyContent("");
      setReplyFiles([]);
      setIsReplyOpen(false);
    } catch (err) {
      alert("답글 등록 실패");
    }
  };

  return (
    <div className="border-b py-4 last:border-0">
      {/* 댓글 작성자 정보 및 내용 */}
      <div className="flex justify-between text-sm">
        <span className="font-bold text-blue-600">{comment.nickname}</span>
        <span className="text-gray-400">
          {new Date(comment.rgdt).toLocaleString()}
        </span>
      </div>
      <p className="mt-2 text-gray-800">{comment.content}</p>

      {comment.uploads && comment.uploads.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {comment.uploads.map((file: any) => (
            <div key={file.uploadIdx} className="shrink-0">
              <img
                src={file.uploadUrl} // S3 URL
                alt="첨부이미지"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                // 이미지가 안 보인다면 콘솔에 찍힌 src 주소가 유효한지 확인하세요.
                onError={(e) => {
                  console.error("이미지 로드 실패:", file.uploadUrl);
                  e.currentTarget.src =
                    "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 답글 달기 버튼 */}
      <button
        onClick={() => setIsReplyOpen(!isReplyOpen)}
        className="mt-2 text-xs text-blue-500 hover:underline"
      >
        {isReplyOpen ? "취소" : "답글 달기"}
      </button>

      {/* 답글 입력 영역 (isReplyOpen이 true일 때만 렌더링) */}
      {isReplyOpen && (
        <div className="mt-3 pl-4 border-l-2 border-blue-100 bg-gray-50/50 p-3 rounded-r-lg">
          {/* 📸 선택한 파일 미리보기 */}
          {replyFiles.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto py-1">
              {replyFiles.map((file, idx) => (
                <div key={idx} className="relative shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="미리보기"
                    className="w-16 h-16 object-cover rounded-md border-2 border-white shadow-sm"
                  />
                  <button
                    onClick={() =>
                      setReplyFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm outline-none bg-white"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글 내용을 입력하세요..."
            />
            <button
              onClick={handleReplyClick}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm shrink-0 font-bold"
            >
              등록
            </button>
          </div>

          <div className="mt-2">
            <label className="inline-block cursor-pointer bg-white border border-gray-300 px-2 py-1 rounded text-[11px] font-medium text-gray-600 hover:bg-gray-50">
              📷 사진 추가 ({replyFiles.length})
              <input
                type="file"
                multiple
                onChange={handleReplyFileChange}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>
        </div>
      )}

      {/* 5. 자식 댓글 재귀 호출 */}
      {comment.children && comment.children.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-gray-100 pl-4">
          {comment.children.map((child: any) => (
            <CommentItem
              key={child.commentIdx}
              comment={child}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
