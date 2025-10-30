'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  const getActiveTab = () => {
    if (pathname === '/') return '홈';
    if (pathname === '/chat') return '채팅';
    if (pathname === '/hobby') return '취미';
    if (pathname === '/profile') return '내정보';
    return '홈';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    switch (tabId) {
      case '홈':
        router.push('/');
        break;
      case '채팅':
        router.push('/chat');
        break;
      case '취미':
        router.push('/hobby');
        break;
      case '등록':
        router.push('/register');
        break;
      case '내정보':
        router.push('/profile');
        break;
    }
  };

  const tabs = [
    { id: '홈', icon: 'ri-home-fill', label: '홈' },
    { id: '채팅', icon: 'ri-chat-3-line', label: '채팅' },
    { id: '등록', icon: 'ri-add-circle-fill', label: '등록', isMain: true },
    { id: '취미', icon: 'ri-heart-line', label: '취미' },
    { id: '내정보', icon: 'ri-user-line', label: '내정보' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 z-50 shadow-lg">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 transition-all duration-300 ${
              tab.isMain ? 'relative' : ''
            }`}
          >
            {tab.isMain ? (
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-1 shadow-lg">
                <i className={`${tab.icon} text-white text-2xl`}></i>
              </div>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center mb-1">
                <i
                  className={`${tab.icon} text-xl transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'
                  }`}
                ></i>
              </div>
            )}
            <span
              className={`text-xs transition-colors duration-300 ${
                tab.isMain 
                  ? 'text-purple-600 font-medium' 
                  : activeTab === tab.id
                  ? 'text-purple-600 font-medium'
                  : 'text-gray-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}