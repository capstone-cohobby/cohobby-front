'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';
import { confirmPayment } from '../../../lib/api';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const orderId = searchParams.get('orderId');
        const paymentKey = searchParams.get('paymentKey');
        const amount = searchParams.get('amount');

        if (!orderId || !paymentKey || !amount) {
          setError('결제 정보가 올바르지 않습니다.');
          setLoading(false);
          return;
        }

        // 결제 승인 API 호출
        const result = await confirmPayment(orderId, paymentKey, parseInt(amount));
        setPaymentInfo(result);
        setLoading(false);
      } catch (err: any) {
        console.error('결제 승인 실패:', err);
        setError(err.message || '결제 승인에 실패했습니다.');
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <Header />
        <div className="pt-20 pb-24 flex items-center justify-center">
          <p className="text-gray-500">결제 처리 중...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
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
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/chat')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
              >
                채팅방으로 돌아가기
              </button>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 text-center">
            <div className="mb-4">
              <i className="ri-checkbox-circle-line text-green-500 text-6xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">결제 완료</h2>
            {paymentInfo && (
              <div className="mt-6 space-y-2 text-left bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문명:</span>
                  <span className="font-medium text-gray-800">{paymentInfo.orderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 금액:</span>
                  <span className="font-bold text-purple-600">
                    {new Intl.NumberFormat('ko-KR').format(paymentInfo.amountCaptured)}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 방법:</span>
                  <span className="font-medium text-gray-800">계좌이체</span>
                </div>
              </div>
            )}
            <p className="text-gray-600 mt-6 mb-6">
              결제가 성공적으로 완료되었습니다.
            </p>
            <button
              onClick={() => router.push('/chat')}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              채팅방으로 돌아가기
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

