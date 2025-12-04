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

  // SockJS는 HTTP/HTTPS 프로토콜을 사용해야 합니다 (ws:// 또는 wss:// 사용 불가)
  // SockJS가 내부적으로 프로토콜을 자동으로 처리합니다
  // 배포 환경에서는 https://를 사용해야 합니다
  const wsUrl = `${API_BASE_URL}/ws-stomp?token=${encodeURIComponent(token)}`;
  console.log(`WebSocket 연결 시도: ${API_BASE_URL}/ws-stomp`);
  
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

