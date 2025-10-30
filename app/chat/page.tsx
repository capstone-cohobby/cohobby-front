
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';

export default function ChatPage() {
  const router = useRouter();

  const chatRooms = [
    {
      id: 1,
      name: '김민수',
      lastMessage: '금요일 6시 이후면 가능해요!',
      time: '오후 2:35',
      unread: 0,
      avatar: 'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=50&height=50&seq=chat1&orientation=squarish',
      item: '골프채 세트'
    },
    {
      id: 2,
      name: '박지영',
      lastMessage: '카메라 상태 정말 좋네요! 감사합니다',
      time: '오전 11:20',
      unread: 2,
      avatar: 'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20woman%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=50&height=50&seq=chat2&orientation=squarish',
      item: '미러리스 카메라'
    },
    {
      id: 3,
      name: '이준호',
      lastMessage: '텐트 반납 완료했습니다!',
      time: '어제',
      unread: 0,
      avatar: 'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20with%20casual%20style%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=50&height=50&seq=chat3&orientation=squarish',
      item: '캠핑 텐트'
    },
    {
      id: 4,
      name: '최수진',
      lastMessage: '기타 레슨 정보 공유해주셔서 감사해요!',
      time: '2일 전',
      unread: 1,
      avatar: 'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20woman%20with%20artistic%20style%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=50&height=50&seq=chat4&orientation=squarish',
      item: '어쿠스틱 기타'
    }
  ];

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
                      src={room.avatar}
                      alt={room.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800">{room.name}</h3>
                      <span className="text-xs text-gray-500">{room.time}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-xs text-gray-600 truncate">{room.lastMessage}</p>
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
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}