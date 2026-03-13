// 공통 응답 구조
export interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export interface ApiErrorResponse {
  result: false;
  fail: {
    code: number;
    message: string;
  };
}

// 페이징 처리된 응답 구조 (Spring Data Page)
export interface PageResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  empty: boolean;
}

// 열거형(Enums)
export type BoardType = "FREE" | "NOTICE" | "NEWS";
export type RoleType = "MEMBER" | "ADMIN";
export type UploadType = "POST" | "COMMENT";

// DTOs
export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

export interface MemberLoginRes {
  accessToken: string;
  nickname: string;
  email: string;
}

export interface PostListRes {
  postIdx: number;
  title: string;
  nickname: string;
  boardType: BoardType;
  viewCount: number;
  rgdt: string;
}

export interface UploadsShowDto {
  uploadIdx: number;
  uploadUrl: string;
  thumbnailUrl: string;
  uploadType: UploadType;
}

export interface PostShowRes {
  postIdx: number;
  memberIdx?: number | null;
  adminIdx?: number | null;
  title: string;
  content: string;
  boardType: BoardType;
  nickname: string;
  viewCount: number;
  rgdt: string;
  uploads: UploadsShowDto[];
}

export interface CommentListRes {
  commentIdx: number;
  content: string;
  nickname: string;
  rgdt: string;
  isDeleted: boolean;
  uploads: UploadsShowDto[];
  children: CommentListRes[];
}

export interface AdminCreateReq {
  name: string;
  userId: string;
  password: string;
  passwordCheck: string;
  email: string;
  phone: string;
}

export interface AdminLoginRes {
  adminIdx: number;
  userId: string;
  token: TokenDto;
}
