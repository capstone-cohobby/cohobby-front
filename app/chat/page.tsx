
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import { getChatRooms } from '../../lib/api';
import { DEFAULT_PROFILE_IMAGE } from '../../lib/constants';

interface ChatRoom {
  id: number;
  name: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unread: number;
  avatar: string | null;
  item: string;
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    // 오늘
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  } else if (days === 1) {
    return '어제';
  } else if (days < 7) {
    return `${days}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }
}

export default function ChatPage() {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const rooms = await getChatRooms();
        
        const formattedRooms: ChatRoom[] = rooms.map(room => ({
          id: room.id,
          name: room.peerName,
          lastMessage: room.lastMessage,
          lastMessageTime: room.lastMessageTime,
          unread: room.unreadCount || 0,
          avatar: room.peerProfilePicture || DEFAULT_PROFILE_IMAGE,
          item: room.postGoods
        }));
        
        // 최신 메시지 시간순으로 정렬
        formattedRooms.sort((a, b) => {
          if (!a.lastMessageTime && !b.lastMessageTime) return 0;
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });
        
        setChatRooms(formattedRooms);
        setError(null);
      } catch (err) {
        console.error('채팅방 목록을 가져오는데 실패했습니다:', err);
        setError('채팅방 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <Header />
        <div className="pt-20 pb-24 flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <Header />
        <div className="pt-20 pb-24 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-24">
        {/* 채팅 목록 */}
        <div className="px-4 pb-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">채팅</h1>
          </div>

          {/* 채팅방 목록 */}
          {chatRooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">채팅방이 없습니다.</p>
            </div>
          ) : (
          <div className="space-y-3">
            {chatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => router.push(`/chat/${room.id}`)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={room.avatar || DEFAULT_PROFILE_IMAGE}
                      alt={room.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800">{room.name}</h3>
                      <span className="text-xs text-gray-500">{formatTime(room.lastMessageTime)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-xs text-gray-600 truncate">{room.lastMessage || '메시지가 없습니다'}</p>
                        <p className="text-xs text-purple-600 mt-1">📦 {room.item}</p>
                      </div>
                      
                      {room.unread > 0 && (
                        <div className="flex-shrink-0 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {room.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}