import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postApi, uploadApi } from "../api";
import type { UploadsShowDto } from "../types";

export const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [existingFiles, setExistingFiles] = useState<UploadsShowDto[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      postApi
        .getPost(Number(id))
        .then((res) => {
          if (res.data && res.data.result) {
            const data = res.data.data;
            setTitle(data.title);
            setContent(data.content);
            setExistingFiles(data.uploads || []);
          }
        })
        .catch(() => {
          alert("게시글을 불러올 수 없습니다.");
          navigate(-1);
        });
    }
  }, [id, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...files]);
      const urls = files.map((file) => URL.createObjectURL(file));
      setNewPreviews((prev) => [...prev, ...urls]);
    }
    e.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("내용을 입력하세요.");

    setIsUpdating(true);
    try {
      let finalUploadIdxs: number[] = existingFiles.map((img) => img.uploadIdx);

      if (newFiles.length > 0) {
        const uploadRes = await uploadApi.uploadFiles(newFiles, "POST");
        const newIdxs = uploadRes.data.data.map((item: any) => item.uploadIdx);
        finalUploadIdxs = [...finalUploadIdxs, ...newIdxs];
      }

      await postApi.updatePost(Number(id), {
        title,
        content,
        boardType: "FREE",
        uploadIdxs: finalUploadIdxs,
      });

      alert("수정되었습니다!");
      navigate(`/post/${id}`);
    } catch (err) {
      alert("수정 실패");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="제목"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg min-h-75 outline-none"
          placeholder="내용"
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            이미지 관리
          </label>
          <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg border">
            {existingFiles.map((img, index) => (
              <div key={`ex-${img.uploadIdx}`} className="relative w-20 h-20">
                <img
                  src={img.uploadUrl}
                  className="w-full h-full object-cover rounded-md border"
                  alt="기존"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {newPreviews.map((url, index) => (
              <div key={`new-${index}`} className="relative w-20 h-20">
                <img
                  src={url}
                  className="w-full h-full object-cover rounded-md border border-blue-400"
                  alt="새"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
            <span className="text-gray-500">📷 사진 추가하기</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className={`px-6 py-2 rounded-lg font-bold text-white transition ${isUpdating ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isUpdating ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </form>
    </div>
  );
};
