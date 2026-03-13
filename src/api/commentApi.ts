import api from "./axiosInstance";
import * as T from "../types";

export const commentApi = {
  getComments: (postIdx: number, params?: any) =>
    api.get<any, T.ApiResponse<T.PageResponse<T.CommentListRes>>>(
      `/api/posts/${postIdx}/comments`,
      { params },
    ),
  createComment: (postIdx: number, data: any) =>
    api.post(`/api/posts/${postIdx}/comments`, data),
  updateComment: (
    commentIdx: number,
    data: { content: string; uploadIdxs: number[] },
  ) => api.patch(`/api/comments/${commentIdx}`, data),
  deleteComment: (commentIdx: number) =>
    api.delete(`/api/comments/${commentIdx}`),
};
