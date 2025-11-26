'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../../components/BottomNavigation';
import { getChatMessages, getCurrentUser, getChatRooms, getUserProfile, getReadStatus, getPeerReadStatus, updateRentDates } from '../../../lib/api';
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
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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
  const roomInfoRef = useRef<{ roomId: number; userId: number; peerId: number; lastMessageId?: number } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 액션 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.action-menu-container')) {
          setShowActionMenu(false);
        }
      }
    };

    if (showActionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showActionMenu]);

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
        
        // 상대방의 읽음 상태 가져오기
        let peerLastReadMessageId = 0;
        try {
          const peerReadStatus = await getPeerReadStatus(roomId);
          if (mounted && peerReadStatus.lastReadMessageId) {
            peerLastReadMessageId = peerReadStatus.lastReadMessageId;
            setLastReadOfPeer(peerLastReadMessageId);
          }
        } catch (err) {
          console.error('상대방 읽음 상태 가져오기 실패:', err);
        }
        
        const formattedMessages: Message[] = chatMessages.map(msg => {
          const isSent = msg.senderId === user.id;
          // 내가 보낸 메시지이고, 상대방이 읽었다면 isRead를 true로 설정
          const isRead = isSent && msg.id <= peerLastReadMessageId;
          return {
            id: msg.id,
            type: isSent ? 'sent' : 'received',
            message: msg.text,
            time: formatMessageTime(msg.time),
            senderId: msg.senderId,
            isRead: isRead,
            avatar: !isSent ? (peerProfile.profilePicture || DEFAULT_PROFILE_IMAGE) : undefined
          };
        });
        setMessages(formattedMessages);

        // 현재 사용자의 마지막 읽은 메시지 ID 저장 (필요시 사용)
        try {
          const readStatus = await getReadStatus(roomId);
          if (mounted) {
            // 현재 사용자의 읽음 상태는 저장만 하고, 실제로는 사용하지 않음
            // (상대방이 보낸 메시지에 대한 읽음 표시는 필요 없음)
          }
        } catch (err) {
          console.error('읽음 상태 가져오기 실패:', err);
        }

        // 채팅방 정보 저장
        roomInfoRef.current = { roomId, userId: user.id, peerId };

        // 채팅방 진입 시 상대방이 보낸 마지막 메시지 읽음 처리
        // (WebSocket 연결 후 처리하기 위해 lastMessageId 저장)
        const lastReceivedMessage = formattedMessages
          .filter(msg => msg.senderId !== user.id)
          .sort((a, b) => b.id - a.id)[0];
        if (lastReceivedMessage) {
          roomInfoRef.current.lastMessageId = lastReceivedMessage.id;
        }

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

    // 채팅방 진입 시 상대방이 보낸 마지막 메시지 읽음 처리
    if (roomInfoRef.current?.lastMessageId) {
      const lastMessageId = roomInfoRef.current.lastMessageId;
      sendRead(roomId, currentUserId, lastMessageId);
    }

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

  // 캘린더 관련 함수들
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    // 빈 칸 추가 (이전 달의 마지막 날들)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const isPastDate = (day: number): boolean => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDateOnly < todayOnly;
  };

  const handleDateSelect = (day: number) => {
    // 과거 날짜는 선택 불가
    if (isPastDate(day)) {
      return;
    }
    
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateOnly = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    
    if (!startDate) {
      // 시작 날짜 선택
      setStartDate(dateOnly);
      setEndDate(null);
    } else if (!endDate) {
      // 종료 날짜 선택
      if (dateOnly < startDate) {
        // 이전 날짜를 선택하면 시작 날짜를 재설정
        setStartDate(dateOnly);
        setEndDate(null);
      } else {
        setEndDate(dateOnly);
      }
    } else {
      // 둘 다 선택되어 있으면 새로운 시작 날짜로 재시작
      setStartDate(dateOnly);
      setEndDate(null);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDateForMessage = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const handleSendDate = async () => {
    if (startDate) {
      const roomId = parseInt(chatId);
      let dateMessage = '';
      let startDateStr = '';
      let endDateStr = '';
      
      // 날짜를 YYYY-MM-DD 형식으로 변환
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      if (endDate) {
        // 날짜 범위: "대여 날짜를 {며칠} ~ {며칠}로 요청했어요!"
        const startFormatted = formatDateForMessage(startDate);
        const endFormatted = formatDateForMessage(endDate);
        dateMessage = `대여 날짜를 ${startFormatted} ~ ${endFormatted}로 요청했어요!`;
        startDateStr = formatDateForAPI(startDate);
        endDateStr = formatDateForAPI(endDate);
      } else {
        // 단일 날짜: "대여 날짜를 {며칠}로 요청했어요!"
        const dateFormatted = formatDateForMessage(startDate);
        dateMessage = `대여 날짜를 ${dateFormatted}로 요청했어요!`;
        startDateStr = formatDateForAPI(startDate);
        endDateStr = formatDateForAPI(startDate); // 단일 날짜인 경우 시작일과 종료일을 같게 설정
      }
      
      try {
        // Rent 날짜 업데이트 API 호출
        await updateRentDates(roomId, startDateStr, endDateStr);
        
        // 날짜를 메시지로 전송
        const client = getStompClient();
        if (client && client.connected) {
          const message = {
            roomId: roomId,
            text: dateMessage
          };
          client.publish({
            destination: '/pub/chatting/send',
            body: JSON.stringify(message)
          });
        }
        
        setShowDatePicker(false);
        setStartDate(null);
        setEndDate(null);
      } catch (error) {
        console.error('날짜 업데이트 실패:', error);
        alert('날짜 업데이트에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const isDateInRange = (day: number | null): { isStart: boolean; isEnd: boolean; isInRange: boolean } => {
    if (!startDate || day === null) {
      return { isStart: false, isEnd: false, isInRange: false };
    }
    
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    const isStart = checkDateOnly.getTime() === startDateOnly.getTime();
    
    if (endDate) {
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const isEnd = checkDateOnly.getTime() === endDateOnly.getTime();
      const isInRange = checkDateOnly >= startDateOnly && checkDateOnly <= endDateOnly;
      return { isStart, isEnd, isInRange };
    }
    
    return { isStart, isEnd: false, isInRange: false };
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
        <div className="px-4 py-4 bg-white/90 backdrop-blur-sm border-t border-white/20 flex-shrink-0 relative action-menu-container">
          {/* 액션 메뉴 팝업 */}
          {showActionMenu && (
            <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 min-w-[200px] z-10">
              <button
                onClick={() => setShowActionMenu(false)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
              
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  setStartDate(null); // 모달 열 때 선택 초기화
                  setEndDate(null);
                  setShowDatePicker(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors mb-2"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-calendar-line text-purple-600 text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-800">날짜 선택</p>
                  <p className="text-xs text-gray-500">대여 날짜를 설정하세요</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowActionMenu(false);
                  // 결제하기 기능 구현
                  alert('결제하기 기능을 구현해주세요.');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-wallet-line text-green-600 text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-800">결제하기</p>
                  <p className="text-xs text-gray-500">대여료를 결제하세요</p>
                </div>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="w-10 h-10 flex items-center justify-center"
            >
              <i className="ri-add-line text-gray-600 text-xl"></i>
            </button>

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

      {/* 날짜 선택 모달 */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-32">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">대여 날짜 선택</h3>
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* 월/년 네비게이션 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <i className="ri-arrow-left-s-line text-xl"></i>
              </button>
              <h4 className="text-base font-semibold text-gray-800">
                {formatMonthYear(currentMonth)}
              </h4>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <i className="ri-arrow-right-s-line text-xl"></i>
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-xs font-medium py-2 ${
                    index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {getDaysInMonth(currentMonth).map((day, index) => {
                if (day === null) {
                  return <div key={index} className="aspect-square"></div>;
                }
                
                const isPast = isPastDate(day);
                const { isStart, isEnd, isInRange } = isDateInRange(day);
                const today = new Date();
                const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
                const isToday = todayOnly.getTime() === checkDateOnly.getTime();
                
                // 스타일 결정: 과거 날짜 > 선택된 날짜 > 범위 내 날짜 > 오늘 날짜 > 기본
                let displayStyle = '';
                let isDisabled = false;
                if (isPast) {
                  displayStyle = 'bg-gray-100 text-gray-400 cursor-not-allowed';
                  isDisabled = true;
                } else if (isStart || isEnd) {
                  displayStyle = 'bg-purple-500 text-white';
                } else if (isInRange) {
                  displayStyle = 'bg-purple-100 text-purple-700';
                } else if (isToday) {
                  displayStyle = 'bg-purple-50 text-purple-600 border border-purple-200';
                } else {
                  displayStyle = 'bg-gray-50 text-gray-700 hover:bg-gray-100';
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    disabled={isDisabled}
                    className={`aspect-square rounded-lg text-sm font-medium transition-colors ${displayStyle} ${isDisabled ? 'opacity-50' : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* 범례 */}
            <div className="flex items-center justify-center gap-4 mb-6 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span>선택</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border border-gray-300"></div>
                <span>가능</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border border-gray-300"></div>
                <span>불가</span>
              </div>
            </div>

            {/* 날짜 전송하기 버튼 */}
            <button
              onClick={handleSendDate}
              disabled={!startDate}
              className="w-full py-3 bg-gray-200 text-gray-600 rounded-2xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              날짜 전송하기
            </button>
          </div>
        </div>
      )}

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
