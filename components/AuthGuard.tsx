'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * 로그인하지 않은 사용자에게 로그인 안내 메시지 표시
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // 로그인 페이지는 체크하지 않음
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  // 로그인하지 않은 경우 로그인 안내 UI 표시
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

