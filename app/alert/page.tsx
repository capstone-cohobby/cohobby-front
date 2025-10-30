
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  action?: () => void;
};

export default function AlertPage() {
  const router = useRouter();

  // Notification list (static for demo; could be fetched from an API)
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'chat',
      title: '새로운 메시지',
      message: '김민수님이 메시지를 보냈습니다: "금요일 6시 이후면 가능해요!"',
      time: '5분 전',
      isRead: false,
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=40&height=40&seq=chat1&orientation=squarish',
      action: () => {
        try {
          router.push('/chat/1');
        } catch (e) {
          console.error('Navigation error:', e);
        }
      },
    },
    {
      id: 2,
      type: 'rental',
      title: '대여 요청',
      message: '박지영님이 미러리스 카메라 대여를 요청했습니다.',
      time: '1시간 전',
      isRead: false,
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20woman%20smiling%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=40&height=40&seq=chat2&orientation=squarish',
      action: () => {
        try {
          router.push('/chat/2');
        } catch (e) {
          console.error('Navigation error:', e);
        }
      },
    },
    {
      id: 3,
      type: 'return',
      title: '반납 완료',
      message: '이준호님이 캠핑 텐트를 반납했습니다. 후기를 남겨주세요!',
      time: '3시간 전',
      isRead: true,
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20man%20with%20casual%20style%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=40&height=40&seq=chat3&orientation=squarish',
      action: () => {
        try {
          router.push('/chat/3');
        } catch (e) {
          console.error('Navigation error:', e);
        }
      },
    },
    {
      id: 4,
      type: 'review',
      title: '새로운 후기',
      message: '최수진님이 어쿠스틱 기타에 후기를 남겼습니다. ⭐⭐⭐⭐⭐',
      time: '6시간 전',
      isRead: true,
      avatar:
        'https://readdy.ai/api/search-image?query=friendly%20young%20korean%20woman%20with%20artistic%20style%20profile%20photo%20with%20clean%20background%20for%20chat%20application&width=40&height=40&seq=chat4&orientation=squarish',
      action: () => {
        try {
          router.push('/chat/4');
        } catch (e) {
          console.error('Navigation error:', e);
        }
      },
    },
  ];

  /** Returns the appropriate Remix Icon class name for a given notification type */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return 'ri-chat-3-line';
      case 'rental':
        return 'ri-calendar-check-line';
      case 'return':
        return 'ri-check-double-line';
      case 'review':
        return 'ri-star-line';
      case 'system':
        return 'ri-shield-check-line';
      case 'promotion':
        return 'ri-gift-line';
      default:
        return 'ri-notification-2-line';
    }
  };

  /** Returns a gradient class string for a given notification type */
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'from-blue-500 to-blue-600';
      case 'rental':
        return 'from-green-500 to-green-600';
      case 'return':
        return 'from-purple-500 to-purple-600';
      case 'review':
        return 'from-yellow-500 to-yellow-600';
      case 'system':
        return 'from-gray-500 to-gray-600';
      case 'promotion':
        // Fixed broken string literal (was: 'from-pink-5\n00 to-pink-600')
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  /** Placeholder for "Mark all as read" functionality */
  const markAllAsRead = () => {
    // In a real app, we'd update the backend and local state here.
    console.log('모든 알림을 읽음 처리');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />

      <div className="pt-20 pb-20">
        <div className="px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">알림</h1>
            <button
              onClick={markAllAsRead}
              className="text-sm text-purple-600 font-medium cursor-pointer hover:text-purple-700 transition-colors duration-300"
            >
              모두 읽음
            </button>
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={notification.action}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 transition-all duration-300 ${
                  notification.action ? 'cursor-pointer hover:shadow-md hover:bg-white' : ''
                } ${!notification.isRead ? 'border-l-4 border-l-purple-500' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0">
                    {notification.avatar ? (
                      <img
                        src={notification.avatar}
                        alt={notification.title}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${getNotificationColor(
                          notification.type,
                        )} rounded-full flex items-center justify-center`}
                      >
                        <i
                          className={`${getNotificationIcon(notification.type)} text-white text-xl`}
                        ></i>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-semibold text-gray-800 ${
                          !notification.isRead ? 'text-purple-800' : ''
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {notification.time}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>

                    {/* Unread badge */}
                    {!notification.isRead && (
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-xs text-purple-600 font-medium">새 알림</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {notifications.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-notification-2-line text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">알림이 없습니다</h3>
              <p className="text-sm text-gray-500">새로운 알림이 오면 여기에 표시됩니다</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
