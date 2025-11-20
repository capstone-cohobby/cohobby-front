'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * 로그인하지 않은 사용자를 로그인 페이지로 리다이렉트
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 로그인 페이지는 체크하지 않음
    if (pathname === '/login' || pathname === '/register') {
      return;
    }

    // 인증 확인
    if (!isAuthenticated()) {
      // 원래 가려던 경로를 쿼리 파라미터로 저장
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectUrl}`);
    }
  }, [router, pathname]);

  // 로그인하지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!isAuthenticated() && pathname !== '/login' && pathname !== '/register') {
    return null;
  }

  return <>{children}</>;
}

