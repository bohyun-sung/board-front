import api from './axiosInstance';
import * as T from '../types';

export const postApi = {
  getPosts: (params?: any) => api.get<any, T.ApiResponse<T.PageResponse<T.PostListRes>>>('/api/posts', { params }),
  getPost: (postIdx: number) => api.get<any, T.ApiResponse<T.PostShowRes>>(`/api/posts/${postIdx}`),
  createPost: (data: any) => api.post('/api/posts', data),
  updatePost: (postIdx: number, data: any) => api.patch(`/api/posts/${postIdx}`, data),
  deletePost: (postIdx: number) => api.delete(`/api/posts/${postIdx}`),
};