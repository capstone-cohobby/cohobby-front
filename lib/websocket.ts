import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from './auth';

let stompClient: Client | null = null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function getStompClient(): Client | null {
  return stompClient;
}

export function connectWebSocket(
  onConnect: () => void,
  onError: (error: any) => void
): Client {
  if (stompClient && stompClient.connected) {
    console.log('이미 WebSocket이 연결되어 있습니다.');
    onConnect();
    return stompClient;
  }

  const token = getAccessToken();
  if (!token) {
    console.error('인증 토큰이 없습니다.');
    throw new Error('인증 토큰이 없습니다.');
  }

  // 기존 연결이 있으면 해제
  if (stompClient) {
    console.log('기존 WebSocket 연결 해제');
    stompClient.deactivate();
    stompClient = null;
  }

  // SockJS는 헤더를 직접 전달할 수 없으므로 쿼리 파라미터로 토큰 전달
  // 백엔드의 WebSocketHandshakeInterceptor가 쿼리 파라미터에서 토큰을 추출합니다
  // http:// -> ws://, https:// -> wss:// 변환
  const wsUrl = `${API_BASE_URL}/ws-stomp?token=${encodeURIComponent(token)}`;
  
  const socket = new SockJS(wsUrl);
  const client = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => {
      // 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('STOMP:', str);
      }
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('✅ WebSocket 연결 성공');
      onConnect();
    },
    onStompError: (frame) => {
      console.error('❌ STOMP 에러:', frame);
      onError(frame);
    },
    onWebSocketError: (event) => {
      console.error('❌ WebSocket 에러:', event);
      onError(event);
    },
    onDisconnect: () => {
      console.log('WebSocket 연결 종료');
      stompClient = null;
    },
  });

  console.log('WebSocket 클라이언트 활성화 중...');
  client.activate();
  stompClient = client;
  return client;
}

export function disconnectWebSocket() {
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
    stompClient = null;
  }
}

