// API 타입 정의
// 자동 생성된 타입들을 export

export * from './generated/entities';
export * from './generated/enums';

// 추가 타입 정의 (수동으로 관리)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// 요청 타입들 (DTO 기반으로 수동 정의 필요)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  phoneNumber: string;
  birthYear: number;
  birthday: string;
  gender?: string;
}

// API 응답에서 사용할 타입들 (엔티티 기반)
export type { User, Post, Rent, Review, Payment, ChattingRoom, Chatting } from './generated/entities';

