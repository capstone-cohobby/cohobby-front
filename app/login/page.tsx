
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAccessToken, setRefreshToken, isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // 이미 로그인되어 있으면 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated()) {
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/');
    }
  }, [router, searchParams]);

  const handleKakaoLogin = () => {
    setIsLoading(true);
    // 카카오 로그인 시뮬레이션
    // 실제로는 백엔드 OAuth2 엔드포인트로 리다이렉트해야 함
    // 예: window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
    
    // 임시: 테스트용 토큰 저장
    setTimeout(() => {
      // 실제 구현 시 백엔드에서 받은 토큰을 저장
      setAccessToken('test-access-token');
      setRefreshToken('test-refresh-token');
      
      setIsLoading(false);
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-green-100 flex flex-col">
      {/* 상단 장식 */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-500/30 to-transparent"></div>
      
      <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10">
        {/* 로고 및 브랜딩 */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-green-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <i className="ri-heart-3-fill text-white text-4xl"></i>
          </div>
          <h1 className="font-['Pacifico'] text-4xl font-bold text-gray-800 mb-2">CoHobby</h1>
          <p className="text-gray-600 text-lg">취미를 함께 나누는 공간</p>
        </div>

        {/* 설명 텍스트 */}
        <div className="text-center mb-12 max-w-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-3">이웃과 함께하는 취미생활</h2>
          <p className="text-gray-600 leading-relaxed">
            골프채부터 카메라까지, 다양한 취미 용품을<br />
            이웃과 함께 나누고 새로운 친구도 만나보세요
          </p>
        </div>

        {/* 카카오 로그인 버튼 */}
        <div className="w-full max-w-sm">
          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <span>로그인 중...</span>
              </>
            ) : (
              <>
                <i className="ri-kakao-talk-fill text-2xl"></i>
                <span>카카오톡으로 시작하기</span>
              </>
            )}
          </button>
        </div>

        {/* 부가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            로그인하면 <span className="text-purple-600 font-medium">이용약관</span> 및 <span className="text-purple-600 font-medium">개인정보처리방침</span>에 동의하게 됩니다
          </p>
        </div>
      </div>

      {/* 하단 장식 */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-green-500/30 to-transparent"></div>
    </div>
  );
}
