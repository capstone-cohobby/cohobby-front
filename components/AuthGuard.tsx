'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * - 서버 렌더링 시에는 로그인 여부를 판단할 수 없으므로,
 *   초기에는 로딩 UI를 동일하게 렌더하고 클라이언트에서만 실제 로그인 여부를 체크한다.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // null: 아직 체크 전, true/false: 체크 완료
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 클라이언트에서만 실행되므로 localStorage 접근이 안전함
    setAuthenticated(isAuthenticated());
  }, []);

  // 로그인 / 회원가입 페이지는 가드 건너뜀
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  // 로그인 여부를 아직 모를 때: SSR과 첫 렌더에서 동일한 로딩 UI
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 로그인하지 않은 경우 로그인 안내 UI 표시
  if (!authenticated) {
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

  // 로그인한 경우 실제 콘텐츠 렌더링
  return <>{children}</>;
}

