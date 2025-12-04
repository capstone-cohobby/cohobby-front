import { getAuthHeader } from './auth';

// 프로덕션에서는 /api를 사용 (Vercel rewrites가 처리), 로컬에서는 직접 백엔드 주소 사용
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:8080');

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

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[apiFetch] 요청: ${options?.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // 응답 본문 읽기 시도
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.text();
      if (errorBody) {
        try {
          const errorJson = JSON.parse(errorBody);
          // BaseResponse 형식의 에러 응답 처리
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          } else if (errorJson.result && typeof errorJson.result === 'string') {
            errorMessage = errorJson.result;
          } else if (errorJson.code) {
            // 에러 코드가 있으면 메시지와 함께 표시
            errorMessage = errorJson.message || `오류 코드: ${errorJson.code}`;
          }
        } catch {
          errorMessage = errorBody || errorMessage;
        }
      }
    } catch {
      // 응답 본문 읽기 실패 시 기본 메시지 사용
    }
    
    console.error(`[apiFetch] 에러: ${url} - ${errorMessage}`, response.status);
    throw new Error(errorMessage);
  }

  // 응답 본문이 있는지 확인 (Content-Length 헤더 또는 본문 확인)
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');
  
  // 본문이 없거나 빈 응답인 경우 (DELETE, 204 No Content 등)
  if (contentLength === '0' || !contentType?.includes('application/json')) {
    // 빈 응답인 경우 undefined 반환 (void 타입 처리)
    return undefined as T;
  }

  // 본문이 있는 경우에만 JSON 파싱
  const text = await response.text();
  if (!text || text.trim() === '') {
    return undefined as T;
  }

  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    // JSON 파싱 실패 시 빈 응답으로 처리
    return undefined as T;
  }
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
    role: string | null;
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

// Rent 일일 대여료 업데이트
export async function updateRentDailyPrice(roomId: number, dailyPrice: number) {
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
      dailyPrice: dailyPrice
    })
  });
  return response.result;
}

// Rent 대여 규칙 업데이트
export async function updateRentRule(roomId: number, rule: string) {
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
      rule: rule
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
      totalPrice: number | null;
      dailyPrice: number | null;
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
    dailyPrice: response.result.dailyPrice || 0,
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
export async function createChatRoom(
  postId: number,
  options?: {
    startDate?: string;
    endDate?: string;
    totalPrice?: number;
  }
) {
  const requestBody: any = { postId };
  if (options?.startDate) {
    requestBody.startDate = options.startDate;
  }
  if (options?.endDate) {
    requestBody.endDate = options.endDate;
  }
  if (options?.totalPrice !== undefined) {
    requestBody.totalPrice = options.totalPrice;
  }

  const response = await apiFetch<any>('/chatting/room', {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
  
  // BaseResponse로 감싸져 있으면 result, 아니면 직접 응답
  if (response && typeof response === 'object') {
    if ('result' in response && response.result) {
      return response.result;
    } else if ('id' in response) {
      return response;
    }
  }
  
  throw new Error('Invalid response format from createChatRoom');
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

// 게시물 삭제
export async function deletePost(postId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
  }>(`/posts/${postId}`, {
    method: 'DELETE'
  });
  return response;
}

// 내 대여 내역 조회
export interface MyRentalHistoryResponse {
  id: number;
  postId: number;
  postGoods: string;
  postImageUrl: string | null;
  ownerNickname: string | null;
  startAt: string | null;
  duedate: string | null;
  totalPrice: number | null;
  status: string;
}

export async function getMyRentalHistory() {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: MyRentalHistoryResponse[];
  }>('/rents/my-rentals');
  return response.result;
}

// 내 등록 상품 조회
export async function getMyPosts() {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: GetPostResponse[];
  }>('/posts/my-posts');
  return response.result;
}

// 찜 생성
export async function createLike(postId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
      likeId: number;
      postId: number;
      message: string;
    };
  }>(`/posts/${postId}/likes`, {
    method: 'POST'
  });
  return response.result;
}

// 찜 취소
export async function deleteLike(postId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
      postId: number;
      message: string;
    };
  }>(`/posts/${postId}/likes`, {
    method: 'DELETE'
  });
  return response.result;
}

// 내가 찜한 게시글 목록 조회
export async function getMyLikes(categoryId?: number) {
  const url = categoryId 
    ? `/users/my-likes?categoryId=${categoryId}`
    : '/users/my-likes';
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: GetPostResponse[];
  }>(url);
  return response.result;
}

// 게시물 이미지 업로드
export async function uploadPostImages(postId: number, images: File[]) {
  if (!images || images.length === 0) {
    throw new Error('업로드할 이미지가 없습니다.');
  }

  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });

  const authHeader = getAuthHeader();
  if (!authHeader) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }

  const headers: HeadersInit = {
    // FormData를 사용할 때는 Content-Type을 설정하지 않아야 브라우저가 자동으로 boundary를 설정합니다
    Authorization: authHeader,
  };

  const url = `${API_BASE_URL}/posts/${postId}/image`;
  
  console.log('이미지 업로드 요청:', {
    url,
    postId,
    imageCount: images.length,
    apiBaseUrl: API_BASE_URL
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    // 응답 본문을 먼저 읽어서 에러 메시지에 포함
    const responseText = await response.text();
    let errorMessage = `이미지 업로드 실패 (${response.status}): ${response.statusText}`;

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('이미지 업로드 에러 응답:', errorData);
      } catch (e) {
        // JSON 파싱 실패 시 원본 텍스트 사용
        if (responseText) {
          errorMessage = `${errorMessage}\n서버 응답: ${responseText}`;
        }
        console.error('이미지 업로드 에러 (텍스트):', responseText);
      }
      throw new Error(errorMessage);
    }

    const result = JSON.parse(responseText);
    console.log('이미지 업로드 성공:', result);
    return result.result || result;
  } catch (error: any) {
    // 네트워크 에러 등
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('네트워크 에러:', error);
      throw new Error(`서버에 연결할 수 없습니다. 서버 주소를 확인해주세요: ${API_BASE_URL}`);
    }
    throw error;
  }
}

// 좋아요 토글
export async function toggleLike(postId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
      isLiked?: boolean;
      liked?: boolean;
    };
  }>(`/likes/${postId}`, {
    method: 'POST'
  });
  console.log('toggleLike API 응답:', response);
  // Jackson이 isLiked() 메서드를 liked로 직렬화할 수도 있으므로 둘 다 확인
  const isLiked = response.result.isLiked ?? response.result.liked ?? false;
  return isLiked;
}

// 좋아요 여부 확인
export async function checkLikeStatus(postId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
      isLiked?: boolean;
      liked?: boolean;
    };
  }>(`/likes/${postId}`);
  // Jackson이 isLiked() 메서드를 liked로 직렬화할 수도 있으므로 둘 다 확인
  return response.result.isLiked ?? response.result.liked ?? false;
}

// 좋아요한 게시물 목록 조회
export async function getLikedPosts() {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: GetPostResponse[];
  }>('/likes/my');
  return response.result;
}

// 취미 통계 조회
export interface HobbyStatsResponse {
  totalExperience: number;
  totalRentedItems: number;
  contributedHobbiesCount: number;
  hobbies: Array<{
    hobbyId: number;
    name: string;
    categoryName: string | null;
    score: number;
    progress: number;
    contributed: boolean;
  }>;
}

export async function getMyHobbyStats() {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: HobbyStatsResponse;
  }>('/hobbies/my-stats');
  return response.result;
}

// 게시물 AI 추정 정보 조회 (대여자용)
export interface PostEstimateResponse {
  suggestedLowPrice: number;
  suggestedPointPrice: number;
  suggestedHighPrice: number;
  suggestedDeposit: number;
  priceReason: string;
  depositReason: string;
  ruleReason: string;
  evidence: Array<{
    url: string;
    type: string;
    price: number;
  }>;
  confidence: number;
  decision: string;
  referenceUrl?: string;
  referenceType?: string;
  referencePrice?: number;
  caution?: string;
}

export async function getPostEstimate(postId: number) {
  try {
    // 게시글 등록 시 POST로 사용한 경로와 동일한 패턴으로 GET 시도
    // POST: /posts/{postId}/ai-estimate
    // GET도 같은 경로일 가능성이 높음
    const endpoint = `/posts/ai-estimate/${postId}`;
    console.log(`[getPostEstimate] 호출 시작: postId=${postId}, URL=${endpoint}`);
    
    const response = await apiFetch<{
      isSuccess: boolean;
      code: string;
      message: string;
      result: PostEstimateResponse;
    }>(endpoint, {
      method: 'GET'
    });
    
    if (!response.isSuccess) {
      throw new Error(response.message || 'AI 추정 정보를 가져올 수 없습니다.');
    }
    
    console.log('[getPostEstimate] 성공:', response.result);
    return response.result;
  } catch (error: any) {
    console.error(`[getPostEstimate] 에러:`, error);
    // 더 자세한 에러 메시지 제공
    if (error.message) {
      throw error;
    }
    throw new Error(`AI 추정 정보 조회 실패: ${error?.toString() || '알 수 없는 오류'}`);
  }
}

// 카드 등록 응답 타입
export interface UserCardResponse {
  cardId: number;
  cardNumber: string;
  cardCompany: string;
  cardType: string;
  deletable: boolean;
}

// 카드 등록 요청 타입
export interface CardRegisterRequest {
  authKey: string; // 토스페이먼츠 위젯으로 카드 인증 후 받은 authKey
}

// 카드 등록 응답 타입
export interface CardRegisterResponse {
  id: number;
  userId: number;
  billingKey: string;
  cardCompany: string;
  cardNumberMasked: string;
  cardType: string;
  isDefault: boolean;
}

// 카드 조회
export async function getUserCard() {
  return apiFetch<UserCardResponse>('/payments/cards');
}

// 카드 등록
export async function registerCard(request: CardRegisterRequest) {
  return apiFetch<CardRegisterResponse>('/payments/cards', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

// 카드 삭제
export async function deleteUserCard() {
  return apiFetch<void>('/payments/cards', {
    method: 'DELETE'
  });
}

// 신고 관련 타입
export interface ReportResponse {
  id: number;
  rentId: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  status: string;
  imageUrl: string | null;
  delayDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportRequest {
  rentId: number;
  type: string;
  title: string;
  content: string;
  images?: File[];
  delayDays?: number;
}

// 신고 생성
export async function createReport(request: CreateReportRequest) {
  const formData = new FormData();
  formData.append('rentId', request.rentId.toString());
  formData.append('type', request.type);
  formData.append('title', request.title);
  formData.append('content', request.content);
  if (request.images && request.images.length > 0) {
    request.images.forEach((image) => {
      formData.append('images', image);
    });
  }
  if (request.delayDays !== undefined) {
    formData.append('delayDays', request.delayDays.toString());
  }

  const authHeader = getAuthHeader();
  const headers: HeadersInit = {
    ...(authHeader && { Authorization: authHeader }),
  };

  // API_BASE_URL은 파일 상단에서 이미 정의됨
  const url = `${API_BASE_URL}/reports`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.text();
      if (errorBody) {
        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorBody || errorMessage;
        }
      }
    } catch {
      // 응답 본문 읽기 실패 시 기본 메시지 사용
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.result;
}

// 신고 조회
export async function getReport(reportId: number) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: ReportResponse;
  }>(`/reports/${reportId}`);
  return response.result;
}

// 내 신고 목록 조회
export async function getMyReports() {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: ReportResponse[];
  }>('/reports/my');
  return response.result;
}

// 관리자: 신고 승인/거부
export async function approveReport(reportId: number, approved: boolean) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: ReportResponse;
  }>(`/admin/reports/${reportId}/approve?approved=${approved}`, {
    method: 'POST'
  });
  return response.result;
}

// 관리자: 모든 신고 목록 조회
export async function getAllReports() {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: ReportResponse[];
  }>('/admin/reports');
  return response.result;
}

// 관리자: 상태별 신고 목록 조회
export async function getReportsByStatus(status: string) {
  const response = await apiFetch<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: ReportResponse[];
  }>(`/admin/reports/status/${status}`);
  return response.result;
}

