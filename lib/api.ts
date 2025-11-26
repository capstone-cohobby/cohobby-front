import { getAuthHeader } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(authHeader && { Authorization: authHeader }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// 채팅방 목록 가져오기
export async function getChatRooms() {
  return apiFetch<Array<{
    id: number;
    postId: number;
    ownerId: number;
    borrowerId: number;
    name: string;
    lastMessage: string | null;
    lastMessageTime: string | null;
    peerName: string;
    peerId: number;
    peerProfilePicture: string | null;
    postGoods: string;
    unreadCount: number;
  }>>('/chatting/room');
}

// 사용자 프로필 가져오기
export async function getUserProfile(userId: number) {
  return apiFetch<{
    id: number;
    nickname: string;
    email: string;
    profilePicture: string | null;
    score: number;
    gender: string | null;
    birthYear: number | null;
    birthday: string | null;
    phoneNumber: string | null;
    createdAt: string;
  }>(`/users/${userId}`);
}

// 특정 채팅방의 메시지 가져오기
export async function getChatMessages(roomId: number) {
  return apiFetch<Array<{
    id: number;
    roomId: number;
    senderId: number;
    receiverId: number;
    text: string;
    time: string;
  }>>(`/chatting/${roomId}`);
}

// 읽음 상태 가져오기 (현재 사용자의 읽음 상태)
export async function getReadStatus(roomId: number) {
  return apiFetch<{
    roomId: number;
    userId: number;
    lastReadMessageId: number;
  }>(`/chatting/rooms/${roomId}/read-status`);
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser() {
  return apiFetch<{
    id: number;
    nickname: string;
    email: string;
    profilePicture: string | null;
    score: number;
    gender: string | null;
    birthYear: number | null;
    birthday: string | null;
    phoneNumber: string | null;
    createdAt: string;
  }>('/auth/me');
}

