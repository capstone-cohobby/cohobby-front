
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { setAccessToken, setRefreshToken } from '../../lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  useEffect(() => {
    // URL에서 토큰이 있는지 확인 (OAuth2 로그인 성공 후 리다이렉트)
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      // 에러가 있는 경우 알림 표시
      alert(`로그인 중 오류가 발생했습니다: ${error}`);
      // 에러 파라미터 제거
      router.replace('/login');
      return;
    }

    if (accessToken && refreshToken) {
      // 토큰을 localStorage에 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // URL에서 토큰 파라미터 제거하고 메인 페이지로 이동
      router.replace('/');
    }
  }, [searchParams, router]);

  const handleKakaoLogin = () => {
    setIsLoading(true);
    
    // 현재 프론트엔드 URL을 redirect_to 파라미터로 전달
    const currentUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/login`
      : 'http://localhost:3000/login';
    
    // 백엔드 OAuth2 카카오 로그인 엔드포인트로 리다이렉트
    const redirectUrl = `${API_BASE_URL}/oauth2/authorization/kakao?redirect_to=${encodeURIComponent(currentUrl)}`;
    
    window.location.href = redirectUrl;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    setIsAdminLoading(true);
    try {
      const response = await apiFetch<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail.trim() })
      });

      // 토큰 저장
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      // 관리자 페이지로 이동
      router.push('/admin/reports');
    } catch (error: any) {
      alert(`관리자 로그인 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsAdminLoading(false);
    }
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

        {/* 로그인 버튼들 */}
        <div className="w-full max-w-sm space-y-4">
          {/* 사용자 로그인 버튼 */}
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
                <span>사용자 로그인</span>
              </>
            )}
          </button>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-purple-100 via-white to-green-100 text-gray-500">또는</span>
            </div>
          </div>

          {/* 관리자 로그인 */}
          {!isAdminLogin ? (
            <button
              onClick={() => setIsAdminLogin(true)}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <i className="ri-admin-line text-2xl"></i>
              <span>관리자 로그인</span>
            </button>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="관리자 이메일을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminLogin(false);
                    setAdminEmail('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-2xl transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isAdminLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>로그인 중...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-login-box-line"></i>
                      <span>로그인</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-green-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
