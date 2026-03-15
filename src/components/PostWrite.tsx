import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postApi, uploadApi } from "../api";
import type { BoardType } from "../types";

export const PostWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [boardType, setBoardType] = useState<BoardType>("FREE");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const userRole = localStorage.getItem("role");
  const isAdmin = userRole === "ADMIN";

  // 파일 선택 시 누적 로직
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // 파일 객체 누적
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      // 새로운 미리보기 URL 생성 및 누적
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
    // 동일 파일 재선택 가능하게 초기화
    e.target.value = "";
  };

  // 개별 이미지 삭제
  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // 메모리 해제
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim())
      return alert("제목과 내용을 입력하세요.");

    setIsUploading(true);
    try {
      let uploadIdxs: number[] = [];

      if (selectedFiles.length > 0) {
        const uploadRes = await uploadApi.uploadFiles(selectedFiles, "POST");
        uploadIdxs = uploadRes.data.data.map((item: any) => item.uploadIdx);
      }

      await postApi.createPost({
        title,
        content,
        boardType,
        uploadIdxs: uploadIdxs,
      });

      alert("등록 완료!");
      navigate("/");
    } catch (err: any) {
      alert("등록 실패: " + (err.response?.data?.message || "서버 에러"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">새 글 작성하기</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 관리자일 때만 게시판 선택창 표시 */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              게시판 종류
            </label>
            <select
              value={boardType}
              onChange={(e) => setBoardType(e.target.value as BoardType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="FREE">자유게시판</option>
              <option value="NOTICE">공지사항</option>
              <option value="NEWS">뉴스</option>
            </select>
          </div>
        )}
        {/* 제목 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 내용 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-60"
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 파일 업로드 섹션 */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            이미지 첨부 ({selectedFiles.length}개)
          </label>

          {/* 이미지 미리보기 목록 */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg border">
              {previews.map((url, index) => (
                <div key={index} className="relative w-20 h-20 group">
                  <img
                    src={url}
                    className="w-full h-full object-cover rounded-md border"
                    alt="미리보기"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 파일 선택 버튼 */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">📷 클릭하여 사진 추가</span>
              </p>
              <p className="text-xs text-gray-400">
                여러 장을 동시에 선택하거나 나눠서 올릴 수 있습니다.
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className={`px-6 py-2 rounded-lg font-bold text-white transition shadow-md ${
              isUploading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? "업로드 중..." : "등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
};
