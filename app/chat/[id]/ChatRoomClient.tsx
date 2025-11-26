'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../../components/BottomNavigation';
import { getChatMessages, getCurrentUser, getChatRooms, getUserProfile, getReadStatus } from '../../../lib/api';
import { connectWebSocket, disconnectWebSocket, getStompClient } from '../../../lib/websocket';
import { DEFAULT_PROFILE_IMAGE } from '../../../lib/constants';
import { Client } from '@stomp/stompjs';

interface ChatRoomClientProps {
  chatId: string;
}

interface Message {
  id: number;
  type: 'sent' | 'received';
  message: string;
  time: string;
  senderId?: number;
  isRead: boolean;
  avatar?: string;
}

export default function ChatRoomClient({ chatId }: ChatRoomClientProps) {
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: number; nickname: string } | null>(null);
  const [peerInfo, setPeerInfo] = useState<{ name: string; avatar: string; id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastReadOfPeer, setLastReadOfPeer] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomSubRef = useRef<any>(null);
  const readSubRef = useRef<any>(null);
  const roomInfoRef = useRef<{ roomId: number; userId: number; peerId: number } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    
    const initializeChat = async () => {
      try {
        setLoading(true);
        const roomId = parseInt(chatId);
        
        // 현재 사용자 정보 가져오기
        const user = await getCurrentUser();
        if (!mounted) return;
        setCurrentUser(user);

        // 채팅방 정보 가져오기
        const rooms = await getChatRooms();
        if (!mounted) return;
        const room = rooms.find(r => r.id === roomId);
        
        if (!room) {
          alert('채팅방을 찾을 수 없습니다.');
          router.push('/chat');
          return;
        }

        // 상대방 정보 설정
        const peerId = user.id === room.ownerId ? room.borrowerId : room.ownerId;
        const peerProfile = await getUserProfile(peerId);
        if (!mounted) return;
        setPeerInfo({
          name: peerProfile.nickname || '사용자',
          avatar: peerProfile.profilePicture || DEFAULT_PROFILE_IMAGE,
          id: peerId
        });

        // 기존 메시지 로드
        const chatMessages = await getChatMessages(roomId);
        if (!mounted) return;
        
        const formattedMessages: Message[] = chatMessages.map(msg => {
          const isSent = msg.senderId === user.id;
          return {
            id: msg.id,
            type: isSent ? 'sent' : 'received',
            message: msg.text,
            time: formatMessageTime(msg.time),
            senderId: msg.senderId,
            isRead: false,
            avatar: !isSent ? (peerProfile.profilePicture || DEFAULT_PROFILE_IMAGE) : undefined
          };
        });
        setMessages(formattedMessages);

        // 읽음 상태 가져오기 (현재 사용자의 읽음 상태)
        try {
          const readStatus = await getReadStatus(roomId);
          if (mounted) {
            // 현재 사용자의 마지막 읽은 메시지 ID 저장 (자신이 보낸 메시지의 읽음 상태 확인용)
            // 상대방의 읽음 상태는 WebSocket으로 받습니다
          }
        } catch (err) {
          console.error('읽음 상태 가져오기 실패:', err);
        }
        
        // 상대방의 읽음 상태는 나중에 WebSocket으로 받습니다

        // 채팅방 정보 저장
        roomInfoRef.current = { roomId, userId: user.id, peerId };

        // WebSocket 연결 및 구독
        try {
          const client = connectWebSocket(
            () => {
              if (!mounted) return;
              setWsConnected(true);
              // 연결 완료 후 enterRoom 호출
              if (roomInfoRef.current) {
                enterRoom(roomInfoRef.current.roomId, roomInfoRef.current.userId, roomInfoRef.current.peerId);
              }
            },
            (error) => {
              console.error('WebSocket 연결 오류:', error);
              if (mounted) {
                setWsConnected(false);
                alert('WebSocket 연결에 실패했습니다. 페이지를 새로고침해주세요.');
              }
            }
          );
        } catch (error) {
          console.error('WebSocket 연결 초기화 실패:', error);
          alert('WebSocket 연결 초기화에 실패했습니다.');
        }

      } catch (err) {
        console.error('채팅방 초기화 실패:', err);
        alert('채팅방을 불러오는데 실패했습니다.');
        router.push('/chat');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      mounted = false;
      exitRoom();
      disconnectWebSocket();
    };
  }, [chatId, router]);

  const enterRoom = (roomId: number, currentUserId: number, peerUserId: number) => {
    const client = getStompClient();
    if (!client) {
      console.error('WebSocket 클라이언트가 없습니다.');
      return;
    }
    
    // 연결 대기 로직
    if (!client.connected) {
      console.log('WebSocket 연결 대기 중...');
      // 연결이 완료될 때까지 재시도
      let retryCount = 0;
      const maxRetries = 50; // 5초 (100ms * 50)
      
      const checkConnection = setInterval(() => {
        const currentClient = getStompClient();
        retryCount++;
        
        if (currentClient && currentClient.connected) {
          clearInterval(checkConnection);
          // 연결 완료 후 구독 시작
          setupSubscriptions(roomId, currentUserId, peerUserId);
        } else if (retryCount >= maxRetries) {
          clearInterval(checkConnection);
          console.error('WebSocket 연결 타임아웃');
          alert('WebSocket 연결에 시간이 너무 오래 걸립니다. 페이지를 새로고침해주세요.');
        }
      }, 100);
      return;
    }
    
    setupSubscriptions(roomId, currentUserId, peerUserId);
  };

  const setupSubscriptions = (roomId: number, currentUserId: number, peerUserId: number) => {
    const client = getStompClient();
    if (!client || !client.connected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return;
    }

    // 기존 구독 해제
    if (roomSubRef.current) {
      roomSubRef.current.unsubscribe();
      roomSubRef.current = null;
    }
    if (readSubRef.current) {
      readSubRef.current.unsubscribe();
      readSubRef.current = null;
    }
    
    console.log(`채팅방 ${roomId} 구독 시작`);

    // 새 메시지 구독
    roomSubRef.current = client.subscribe(`/sub/chatting/room/${roomId}`, (frame) => {
      try {
        const msg = JSON.parse(frame.body);
        const newMsg: Message = {
          id: msg.id,
          type: msg.senderId === currentUserId ? 'sent' : 'received',
          message: msg.text,
          time: formatMessageTime(msg.time),
          senderId: msg.senderId,
          isRead: false,
          avatar: msg.senderId !== currentUserId ? (peerInfo?.avatar || DEFAULT_PROFILE_IMAGE) : undefined
        };

        setMessages((prev) => {
          // 중복 메시지 체크
          if (prev.some(m => m.id === newMsg.id)) {
            return prev;
          }
          return [...prev, newMsg];
        });

        // 상대방이 보낸 메시지면 읽음 표시 전송
        if (msg.senderId !== currentUserId) {
          sendRead(roomId, currentUserId, msg.id);
        }
      } catch (err) {
        console.error('메시지 파싱 오류:', err);
      }
    });

    // 읽음 상태 구독
    readSubRef.current = client.subscribe(`/sub/chatting/room/${roomId}/read`, (frame) => {
      try {
        const receipt = JSON.parse(frame.body);
        if (receipt.userId !== currentUserId) {
          setLastReadOfPeer(receipt.lastReadMessageId || 0);
          setMessages((prev) => updateMessageReadStatus(prev, receipt.lastReadMessageId || 0));
        }
      } catch (err) {
        console.error('읽음 상태 파싱 오류:', err);
      }
    });
  };

  const exitRoom = () => {
    if (roomSubRef.current) {
      roomSubRef.current.unsubscribe();
      roomSubRef.current = null;
    }
    if (readSubRef.current) {
      readSubRef.current.unsubscribe();
      readSubRef.current = null;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const client = getStompClient();
    if (!client || !client.connected) {
      alert('WebSocket이 연결되지 않았습니다.');
      return;
    }

    const roomId = parseInt(chatId);
    const message = {
      roomId: roomId,
      text: newMessage.trim()
    };

    client.publish({
      destination: '/pub/chatting/send',
      body: JSON.stringify(message)
    });

    setNewMessage('');
  };

  const sendRead = (roomId: number, userId: number, messageId: number) => {
    const client = getStompClient();
    if (!client || !client.connected) return;

    const payload = {
      roomId: roomId,
      userId: userId,
      lastMessageId: messageId
    };

    client.publish({
      destination: '/pub/chatting/read',
      body: JSON.stringify(payload)
    });
  };

  const updateMessageReadStatus = (msgs: Message[], lastReadId: number): Message[] => {
    return msgs.map(msg => {
      if (msg.type === 'sent' && msg.id && msg.id <= lastReadId) {
        return { ...msg, isRead: true };
      }
      return msg;
    });
  };

  const formatMessageTime = (timeStr: string): string => {
    const date = new Date(timeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleUserProfileClick = () => {
    if (peerInfo) {
      router.push(`/user/${peerInfo.id}`);
    }
  };

  const reportReasons = [
    '제품에 공지된 것 이상의 하자가 있음',
    '반납 기한을 지키지 않음',
    '비매너 채팅',
    '반납 후 보증금 책정 이상의 하자가 있음'
  ];

  const handleReport = () => {
    if (selectedReportReason && reportDetails.trim()) {
      setShowReportModal(false);
      setSelectedReportReason('');
      setReportDetails('');
      alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
    }
  };

  if (loading || !currentUser || !peerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">로딩 중...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 pb-24">
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* 채팅 헤더 */}
        <div className="px-4 py-4 bg-white/90 backdrop-blur-sm border-b border-white/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chat')}
              className="w-8 h-8 flex items-center justify-center"
            >
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </button>

            <button
              onClick={handleUserProfileClick}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1"
            >
              <img
                src={peerInfo.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="text-left">
                <h3 className="font-semibold text-gray-800">{peerInfo.name}</h3>
                <p className="text-xs text-green-600">온라인</p>
              </div>
            </button>

            <button 
              onClick={() => setShowReportModal(true)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <i className="ri-flag-line text-gray-600 text-xl"></i>
            </button>
          </div>
        </div>

        {/* 안전 거래 안내 */}
        <div className="px-4 py-3 bg-yellow-50/80 backdrop-blur-sm border-b border-yellow-100 flex-shrink-0">
          <div className="flex items-start gap-2">
            <i className="ri-shield-check-line text-yellow-600 text-lg flex-shrink-0 mt-0.5"></i>
            <div className="text-xs text-yellow-700 leading-relaxed">
              <p className="mb-1">안전한 거래를 위해 개인 정보는 공유하지 마세요.</p>
              <p className="mb-1">사기 피해를 방지하기 위해 플랫폼 내에서 결제해주세요.</p>
              <p>거래 전, 대여 물품의 상태와 반납 일자를 꼭 확인하세요!</p>
            </div>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'sent' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-2 max-w-[70%] ${
                  message.type === 'sent' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {message.type === 'received' && message.avatar && (
                  <img
                    src={message.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}

                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === 'sent'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                        : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-white/20'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      message.type === 'sent' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <p className="text-xs text-gray-500">{message.time}</p>
                    {message.type === 'sent' && (
                      <div className="flex items-center">
                        {message.isRead ? (
                          <i className="ri-check-double-line text-purple-500 text-sm"></i>
                        ) : (
                          <i className="ri-check-line text-gray-400 text-sm"></i>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <div className="px-4 py-4 bg-white/90 backdrop-blur-sm border-t border-white/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"  
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지를 입력하세요..."
                className="w-full px-4 py-3 bg-gray-100 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm"
              />
            </div>

            <button className="w-10 h-10 flex items-center justify-center">
              <i className="ri-emotion-line text-gray-600 text-xl"></i>
            </button>

            <button
              onClick={sendMessage}
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300"
            >
              <i className="ri-send-plane-fill text-white text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 신고하기 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">대여자 신고</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReportReason('');
                  setReportDetails('');
                }}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-500 text-xl"></i>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">신고 사유를 선택해주세요:</p>
            
            <div className="space-y-3 mb-6">
              {reportReasons.map((reason) => (
                <label key={reason} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReportReason === reason}
                    onChange={(e) => setSelectedReportReason(e.target.value)}
                    className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">{reason}</span>
                </label>
              ))}
            </div>
            
            {/* 구체적인 사유 입력 */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">구체적인 사유를 적어주세요:</p>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="신고 사유에 대한 자세한 내용을 입력해주세요..."
                maxLength={500}
                className="w-full h-24 p-3 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-400">{reportDetails.length}/500</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReportReason('');
                  setReportDetails('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReport}
                disabled={!selectedReportReason || !reportDetails.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-medium hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
