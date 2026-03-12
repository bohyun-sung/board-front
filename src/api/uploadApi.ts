import api from './axiosInstance';
import * as T from '../types';

export const uploadApi = {
  uploadFiles: (files: File[], uploadType: T.UploadType) => {
    const formData = new FormData();
    
    // 1. 파일들은 그대로 추가
    files.forEach(file => formData.append('files', file));
    
    // 2. 핵심 수정: uploadType을 JSON 형식의 문자열로 변환하여 Blob으로 감쌉니다.
    // 단순히 'FREE'가 아니라 '"FREE"' 형태로 전달되어야 파싱이 가능합니다.
    const typeBlob = new Blob([JSON.stringify(uploadType)], { 
      type: 'application/json' 
    });
    formData.append('uploadType', typeBlob);

    return api.post('/api/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};