
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';

interface ChatRoomClientProps {
  chatId: string;
}

export default function ChatRoomClient({ chatId }: ChatRoomClientProps) {
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const handleUserProfileClick = () => {
    router.push(`/user/${chatId}`);
  };

  // --- existing code start ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'received',
      sender: '김민수',
      message: '안녕하세요! 골프채 세트 대여 가능한가요?',
      time: '오후 2:30',
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=40&height=40&seq=chat1&orientation=squarish',
      isRead: true
    },
    {
      id: 2,
      type: 'sent',
      message: '네, 가능합니다! 언제 필요하신가요?',
      time: '오후 2:32',
      isRead: true
    },
    {
      id: 3,
      type: 'received',
      sender: '김민수',
      message: '이번 주말에 사용하려고 하는데, 금요일 저녁에 픽업 가능할까요?',
      time: '오후 2:33',
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=40&height=40&seq=chat1&orientation=squarish',
      isRead: true
    },
    {
      id: 4,
      type: 'sent',
      message: '금요일 6시 이후면 가능해요! 위치는 강남역 근처입니다.',
      time: '오후 2:35',
      isRead: true
    },
    {
      id: 5,
      type: 'received',
      sender: '김민수',
      message: '완벽해요! 대여 기간은 2박 3일 정도로 생각하고 있어요.',
      time: '오후 2:37',
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=40&height=40&seq=chat1&orientation=squarish',
      isRead: true
    },
    {
      id: 6,
      type: 'sent',
      message: '2박 3일이면 15,000원입니다. 보증금은 50,000원이구요.',
      time: '오후 2:40',
      isRead: true
    },
    {
      id: 7,
      type: 'received',
      sender: '김민수',
      message: '좋아요! 그럼 내일 오후에 만나서 거래할 수 있을까요?',
      time: '오후 2:42',
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=40&height=40&seq=chat1&orientation=squarish',
      isRead: true
    },
    {
      id: 8,
      type: 'sent',
      message: '네 좋습니다! 강남역 2번 출구에서 만나요.',
      time: '오후 2:45',
      isRead: false
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const chatRooms = [
    {
      id: 1,
      name: '김민수',
      lastMessage: '금요일 6시 이후면 가능해요!',
      time: '오후 2:35',
      unread: 0,
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=50&height=50&seq=chat1&orientation=squarish',
      item: '골프채 세트'
    },
    {
      id: 2,
      name: '박지영',
      lastMessage: '카메라 상태 정말 좋네요! 감사합니다',
      time: '오전 11:20',
      unread: 2,
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20woman%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=50&height=50&seq=chat2&orientation=squarish',
      item: '미러리스 카메라'
    },
    {
      id: 3,
      name: '이준호',
      lastMessage: '텐트 반납 완료했습니다!',
      time: '어제',
      unread: 0,
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20with%20casual%20style%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=50&height=50&seq=chat3&orientation=squarish',
      item: '캠핑 텐트'
    },
    {
      id: 4,
      name: '최수진',
      lastMessage: '기타 레슨 정보 공유해주셔서 감사해요!',
      time: '2일 전',
      unread: 1,
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20woman%20with%20artistic%20style%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=50&height=50&seq=chat4&orientation=squarish',
      item: '어쿠스틱 기타'
    }
  ];

  const currentChat = chatRooms.find(
    (room) => room.id === parseInt(chatId)
  );

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        type: 'sent' as const,
        message: newMessage,
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isRead: false
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };
  // --- existing code end ---

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

  if (!currentChat) {
    return <div>채팅방을 찾을 수 없습니다</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <div className="flex flex-col h-screen">
        {/* 채팅 헤더 - 상단 패딩 제거하고 전화/점세개 버튼 제거, 신고하기 버튼을 맨 오른쪽으로 */}
        <div className="px-4 py-4 bg-white/90 backdrop-blur-sm border-b border-white/20">
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
                src={currentChat.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="text-left">
                <h3 className="font-semibold text-gray-800">{currentChat.name}</h3>
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
        <div className="px-4 py-3 bg-yellow-50/80 backdrop-blur-sm border-b border-yellow-100">
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
                {message.type === 'received' && (
                  <img
                    src={message.avatar || ''}
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
        </div>

        {/* 메시지 입력 */}
        <div className="px-4 py-4 bg-white/90 backdrop-blur-sm border-t border-white/20">
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
