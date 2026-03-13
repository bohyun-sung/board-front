import React, { useState } from "react";
import { uploadApi, commentApi } from "../api";

interface CommentItemProps {
  comment: any;
  onReplySubmit: (
    parentIdx: number,
    content: string,
    uploadIdxs: number[],
  ) => Promise<void>;
  refreshComments: () => void;
}

export const CommentItem = ({
  comment,
  onReplySubmit,
  refreshComments,
}: CommentItemProps) => {
  // ---  상태 관리 ---
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);

  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
  const [editContent, setEditContent] = useState(comment.content); // 수정 내용
  const [editFiles, setEditFiles] = useState<File[]>([]); // 수정 시 새로 추가할 파일

  const [currentUploads, setCurrentUploads] = useState(comment.uploads || []);

  // 로컬 스토리지 정보 (본인 확인용)
  const myMemberIdx = localStorage.getItem("memberIdx")
    ? Number(localStorage.getItem("memberIdx"))
    : null;

  //  본인 확인 로직 (타입 일치를 위해 양쪽 모두 Number 처리)
  const isMyComment = Number(comment.memberIdx) === myMemberIdx;

  //  디버깅 로그 (버튼이 여전히 안 보일 경우만 확인 후 삭제하세요)
  console.log(
    `댓글 ID: ${comment.commentIdx} | 작성자: ${comment.memberIdx} | 나: ${myMemberIdx} | 일치: ${isMyComment}`,
  );
  // ---  답글(Reply) 관련 핸들러 ---
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
      if (replyFiles.length > 0) {
        const res: any = await uploadApi.uploadFiles(replyFiles, "COMMENT");
        finalIdxs = res.data.data.map(
          (file: any) => file.uploadIdx || file.idx,
        );
      }
      await onReplySubmit(comment.commentIdx, replyContent, finalIdxs);
      setReplyContent("");
      setReplyFiles([]);
      setIsReplyOpen(false);
    } catch (err) {
      alert("답글 등록 실패");
    }
  };
  const startEditing = () => {
    setEditContent(comment.content);
    setCurrentUploads(comment.uploads || []); // 기존 이미지 상태 복사
    setEditFiles([]);
    setIsEditing(true);
  };

  // ✅ 기존 이미지 삭제 핸들러
  const handleRemoveExistingFile = (uploadIdx: number) => {
    setCurrentUploads((prev: any[]) =>
      prev.filter((u) => u.uploadIdx !== uploadIdx),
    );
  };

  // --- 수정(Update) 관련 핸들러 ---
  const handleUpdateClick = async () => {
    if (!editContent.trim()) return alert("수정할 내용을 입력해주세요.");
    try {
      // 기존 이미지 ID 유지
      let finalUploadIdxs: number[] = currentUploads.map(
        (u: any) => u.uploadIdx,
      );
      // 새로 추가한 파일이 있다면 업로드 후 ID 합치기
      if (editFiles.length > 0) {
        const res: any = await uploadApi.uploadFiles(editFiles, "COMMENT");
        if (res.data.result) {
          const newIdxs = res.data.data.map((f: any) => f.uploadIdx || f.idx);
          finalUploadIdxs = [...finalUploadIdxs, ...newIdxs];
        }
      }

      // PATCH 요청 발송
      const updateRes: any = await commentApi.updateComment(
        comment.commentIdx,
        {
          content: editContent,
          uploadIdxs: finalUploadIdxs, // 백엔드는 이 리스트를 기준으로 이미지를 재설정함
        },
      );

      if (updateRes.data.result) {
        alert("댓글이 수정되었습니다.");
        setIsEditing(false);
        refreshComments();
      }
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.fail?.message ||
          "수정 권한이 없거나 오류가 발생했습니다.",
      );
    }
  };

  return (
    <div className="border-b py-4 last:border-0">
      {/* ... 헤더 생략 (수정 버튼 클릭 시 startEditing 호출하도록 변경) ... */}
      <button onClick={startEditing}>수정</button>

      {!isEditing ? (
        /* 일반 모드 UI */
        <>
          <p className="mt-2">{comment.content}</p>
          {/* 기존 이미지 렌더링 코드 유지 */}
        </>
      ) : (
        /* 수정 모드 UI */
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <textarea
            className="w-full p-2 text-sm border rounded"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />

          {/* 📸 현재 유지 중인 기존 이미지 미리보기 및 삭제 */}
          <div className="flex gap-2 mt-2 overflow-x-auto py-2">
            {currentUploads.map((file: any) => (
              <div key={file.uploadIdx} className="relative shrink-0">
                <img
                  src={file.uploadUrl}
                  className="w-20 h-20 object-cover rounded border"
                />
                <button
                  onClick={() => handleRemoveExistingFile(file.uploadIdx)}
                  className="absolute -top-1 -right-1 bg-black/70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* 새로 추가할 파일 미리보기 (선택 사항) */}
            {editFiles.map((file, idx) => (
              <div key={idx} className="relative shrink-0 opacity-70">
                <img
                  src={URL.createObjectURL(file)}
                  className="w-20 h-20 object-cover rounded border border-blue-400"
                />
                <div className="absolute bottom-0 bg-blue-500 text-[8px] text-white w-full text-center">
                  NEW
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-2">
            <input
              type="file"
              multiple
              onChange={(e) => setEditFiles(Array.from(e.target.files || []))}
              className="text-xs"
            />
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="text-xs">
                취소
              </button>
              <button
                onClick={handleUpdateClick}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold"
              >
                수정완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A. 헤더 영역: 닉네임, 날짜, 수정 버튼 */}
      <div className="flex justify-between text-sm">
        <div className="flex gap-2 items-center">
          <span className="font-bold text-blue-600">{comment.nickname}</span>
          {!comment.isDeleted && isMyComment && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200 text-gray-600"
            >
              수정
            </button>
          )}
        </div>
        <span className="text-gray-400">
          {new Date(comment.rgdt).toLocaleString()}
        </span>
      </div>

      {/* B. 본문 영역: 일반 모드 vs 수정 모드 */}
      {!isEditing ? (
        <>
          <p className="mt-2 text-gray-800">{comment.content}</p>

          {/* 업로드 이미지 목록 */}
          {comment.uploads && comment.uploads.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              {comment.uploads.map((file: any) => (
                <div key={file.uploadIdx} className="shrink-0">
                  <img
                    src={file.uploadUrl}
                    alt="첨부이미지"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 답글 버튼 */}
          {!comment.isDeleted && (
            <button
              onClick={() => setIsReplyOpen(!isReplyOpen)}
              className="mt-2 text-xs text-blue-500 hover:underline"
            >
              {isReplyOpen ? "취소" : "답글 달기"}
            </button>
          )}
        </>
      ) : (
        /* C. 수정 입력 영역 (수정 모드 활성화 시) */
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <textarea
            className="w-full border rounded p-2 text-sm outline-none resize-none bg-white"
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="flex justify-between items-center mt-2">
            <input
              type="file"
              multiple
              onChange={(e) => setEditFiles(Array.from(e.target.files || []))}
              className="text-[11px] text-gray-500"
              accept="image/*"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditFiles([]);
                  setEditContent(comment.content);
                }}
                className="px-3 py-1 bg-white border text-xs rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleUpdateClick}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded font-bold hover:bg-blue-700"
              >
                수정완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. 답글 입력 영역 (isReplyOpen이 true일 때) */}
      {isReplyOpen && (
        <div className="mt-3 pl-4 border-l-2 border-blue-100 bg-gray-50/50 p-3 rounded-r-lg">
          {/* 선택한 파일 미리보기 */}
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

      {/* E. 자식 댓글 재귀 호출 */}
      {comment.children && comment.children.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-gray-100 pl-4">
          {comment.children.map((child: any) => (
            <CommentItem
              key={child.commentIdx}
              comment={child}
              onReplySubmit={onReplySubmit}
              refreshComments={refreshComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};
