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

// 상대방의 읽음 상태 가져오기
export async function getPeerReadStatus(roomId: number) {
  return apiFetch<{
    roomId: number;
    userId: number;
    lastReadMessageId: number;
  }>(`/chatting/rooms/${roomId}/read-status/peer`);
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

// Rent 날짜 업데이트
export async function updateRentDates(roomId: number, startDate: string, endDate: string) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
      rentId: number;
    };
  }>(`/rents/${roomId}/detail`, {
    method: 'PATCH',
    body: JSON.stringify({
      startAt: startDate,
      duedate: endDate
    })
  });
  return response.result;
}

// Rent 정보 가져오기 (roomId로)
export async function getRentByRoomId(roomId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
      id: number;
      startAt: string | null;
      duedate: string | null;
      rule: string | null;
      status: string;
      totalPrice: number;
      currency: string;
      postId: number;
      postGoods: string;
    };
  }>(`/rents/${roomId}/detail`, {
    method: 'GET'
  });
  return {
    id: response.result.id,
    startAt: response.result.startAt,
    duedate: response.result.duedate,
    rule: response.result.rule,
    status: response.result.status,
    totalPrice: response.result.totalPrice || 0,
    currency: response.result.currency || 'KRW',
    post: {
      id: response.result.postId,
      goods: response.result.postGoods
    }
  };
}

// 결제 의도 생성
export async function createPaymentIntent(rentId: number, amount: number) {
  const response = await apiFetch<{
    method: string;
    amountValue: number;
    amountCurrency: string;
    orderName: string;
    pgOrderNo: string;
    customerName: string;
    customerEmail: string;
    successUrl: string;
    failUrl: string;
  }>('/payments/intents', {
    method: 'POST',
    body: JSON.stringify({
      rentId: rentId,
      amount: amount
    })
  });
  return response;
}

// 결제 승인
export async function confirmPayment(orderId: string, paymentKey: string, amount: number) {
  const response = await apiFetch<{
    paymentId: number;
    paymentMethod: string;
    amountCaptured: number;
    capturedAt: string;
    rentId: number;
    orderName: string;
    customerName: string;
  }>('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify({
      orderId: orderId,
      paymentKey: paymentKey,
      amount: amount
    })
  });
  return response;
}

// 채팅방 생성
export async function createChatRoom(postId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
      id: number;
      postId: number;
      ownerId: number;
      borrowerId: number;
      name: string;
    };
  }>('/chatting/room', {
    method: 'POST',
    body: JSON.stringify({ postId })
  });
  return response.result;
}

// 게시물 조회 응답 타입
export interface GetPostResponse {
  postId: number;
  goods: string;
  dailyPrice: number | null;
  deposit: number | null;
  imageUrl: string | null;
  availableFrom: string | null;
  availableUntil: string | null;
  hobbyName: string | null;
  categoryName: string | null;
  userId: number | null;
  userNickname: string | null;
}

// 게시물 검색
export async function getPostsBySearch(query?: string) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: GetPostResponse[];
  }>(`/posts/search${query ? `?query=${encodeURIComponent(query)}` : ''}`);
  return response.result;
}

// 카테고리로 게시물 조회
export async function getPostsByCategory(categoryId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: GetPostResponse[];
  }>(`/posts/category/${categoryId}`);
  return response.result;
}

// 취미로 게시물 조회
export async function getPostsByHobby(hobbyId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: GetPostResponse[];
  }>(`/posts/hobby/${hobbyId}`);
  return response.result;
}

// 게시물 상세 조회 응답 타입
export interface GetPostDetailResponse {
  postId: number;
  goods: string;
  dailyPrice: number | null;
  deposit: number | null;
  images: string[];
  availableFrom: string | null;
  availableUntil: string | null;
  purchasedAt: string | null;
  defectStatus: string | null;
  caution: string | null;
  hobbyName: string | null;
  categoryName: string | null;
  userId: number | null;
  userNickname: string | null;
  userProfilePicture: string | null;
}

// 게시물 상세 조회
export async function getPostDetail(postId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: GetPostDetailResponse;
  }>(`/posts/${postId}`);
  return response.result;
}

// 게시물 이미지 업로드
export async function uploadPostImages(postId: number, images: File[]) {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });

  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    ...(authHeader && { Authorization: authHeader }),
  };

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.result || result;
}

