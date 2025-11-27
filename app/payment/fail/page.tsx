'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 text-center">
            <div className="mb-4">
              <i className="ri-close-circle-line text-red-500 text-6xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">결제 실패</h2>
            {errorMessage && (
              <p className="text-gray-600 mb-2">{errorMessage}</p>
            )}
            {errorCode && (
              <p className="text-sm text-gray-500 mb-6">에러 코드: {errorCode}</p>
            )}
            {!errorMessage && (
              <p className="text-gray-600 mb-6">
                결제 처리 중 오류가 발생했습니다.
              </p>
            )}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/chat')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
              >
                채팅방으로 돌아가기
              </button>
              <button
                onClick={() => router.back()}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
              >
                다시 시도하기
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

