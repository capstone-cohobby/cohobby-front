
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [notifications] = useState(0); // 실제 알림 개수는 API에서 가져올 예정
  const router = useRouter();

  const handleSearchClick = () => {
    router.push('/search');
  };

  const handleNotificationClick = () => {
    router.push('/alert');
  };

  const handleWishlistClick = () => {
    router.push('/wishlist');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-green-400 rounded-2xl flex items-center justify-center">
            <i className="ri-heart-3-fill text-white text-xl"></i>
          </div>
          <div>
            <h1 className="font-['Pacifico'] text-xl font-bold text-gray-800">CoHobby</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSearchClick}
            className="w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className="ri-search-line text-gray-600 text-xl"></i>
          </button>
          
          <button 
            onClick={handleWishlistClick}
            className="w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className="ri-heart-line text-gray-600 text-xl"></i>
          </button>
          
          <button 
            onClick={handleNotificationClick}
            className="w-10 h-10 flex items-center justify-center relative cursor-pointer"
          >
            <i className="ri-notification-2-line text-gray-600 text-xl"></i>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
