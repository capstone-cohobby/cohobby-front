'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';
import { getRentByRoomId, createPaymentIntent, getCurrentUser } from '../../../lib/api';

interface PaymentPageClientProps {
  params: Promise<{ roomId: string }>;
}

interface RentInfo {
  id: number;
  startAt: string | null;
  duedate: string | null;
  rule: string | null;
  status: string;
  totalPrice: number;
  currency: string;
  post: {
    id: number;
    goods: string;
  };
}

export default function PaymentPageClient({ params }: PaymentPageClientProps) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [rentInfo, setRentInfo] = useState<RentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tossPaymentsLoaded, setTossPaymentsLoaded] = useState(false);

  // params에서 roomId 추출
  useEffect(() => {
    params.then(({ roomId }) => {
      setRoomId(roomId);
    });
  }, [params]);

  useEffect(() => {
    if (!roomId) return;

    const fetchRentInfo = async () => {
      try {
        setLoading(true);
        const roomIdNum = parseInt(roomId);
        // 채팅방 정보에서 기본 정보 가져오기
        const rent = await getRentByRoomId(roomIdNum);
        setRentInfo(rent);
        setError(null);
      } catch (err: any) {
        console.error('대여 정보를 가져오는데 실패했습니다:', err);
        setError('대여 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRentInfo();
  }, [roomId]);

  const handlePayment = async () => {
    if (!rentInfo || !tossPaymentsLoaded) {
      if (!tossPaymentsLoaded) {
        setError('결제 시스템을 초기화하는데 시간이 걸리고 있습니다. 잠시 후 다시 시도해주세요.');
      }
      return;
    }

    // 대여 시작일이 오늘이 아니면 결제 불가
    if (!isRentStartDateToday()) {
      setError('대여 시작 날이 아닙니다.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Rent 정보 검증
      if (!rentInfo.id) {
        throw new Error('대여 정보를 찾을 수 없습니다.');
      }

      if (!rentInfo.totalPrice || rentInfo.totalPrice === 0) {
        throw new Error('결제 금액이 설정되지 않았습니다. 채팅방에서 날짜를 설정한 후 다시 시도해주세요.');
      }

      // 결제 의도 생성
      const paymentIntent = await createPaymentIntent(rentInfo.id, rentInfo.totalPrice);

      // 프론트엔드 URL로 성공/실패 URL 설정
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = `${baseUrl}/payment/success`;
      const failUrl = `${baseUrl}/payment/fail`;

      // Toss Payments 위젯 초기화 및 실행
      if (typeof window === 'undefined' || !(window as any).TossPayments) {
        setError('결제 시스템을 초기화하는데 실패했습니다. 페이지를 새로고침해주세요.');
        return;
      }

      // Toss Payments 클라이언트 키 (테스트 환경)
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      
      if (!clientKey) {
        // 테스트용 임시 키
        throw new Error('Toss Payments 클라이언트 키가 설정되지 않았습니다.\n프로젝트 루트에 .env.local 파일을 만들고 다음을 추가하세요:\nNEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_your_client_key_here\n\nToss Payments 대시보드에서 Secret Key와 함께 발급받은 Client Key를 사용하세요.');
      }

      try {
        const tossPayments = (window as any).TossPayments(clientKey);
        
        // 테스트 환경에서는 계좌이체가 사용 불가능하므로 카드 결제로 변경
        // 운영 환경에서는 원하는 결제 방법으로 변경 가능
        await tossPayments.requestPayment('카드', {
          successUrl: successUrl,
          failUrl: failUrl,
          orderId: paymentIntent.pgOrderNo,
          orderName: paymentIntent.orderName,
          customerName: paymentIntent.customerName,
          customerEmail: paymentIntent.customerEmail,
          amount: paymentIntent.amountValue,
          currency: paymentIntent.amountCurrency,
        });
      } catch (tossError: any) {
        console.error('Toss Payments 오류:', tossError);
        if (tossError.message && tossError.message.includes('인증')) {
          throw new Error('Toss Payments 클라이언트 키가 올바르지 않습니다. 환경 변수를 확인해주세요.');
        }
        if (tossError.message && tossError.message.includes('계약')) {
          throw new Error('테스트 환경에서는 해당 결제 방법을 사용할 수 없습니다. 카드 결제를 사용해주세요.');
        }
        throw tossError;
      }
    } catch (err: any) {
      console.error('결제 처리 중 오류 발생:', err);
      setError(err.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '미정';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 대여 시작일이 오늘인지 확인 (UTC+9 기준, 날짜만 비교)
  const isRentStartDateToday = (): boolean => {
    if (!rentInfo?.startAt) return false;
    
    const startDate = new Date(rentInfo.startAt);
    const today = new Date();
    
    // 한국 시간대(UTC+9) 기준으로 날짜만 비교
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return startDateOnly.getTime() === todayOnly.getTime();
  };

  const canMakePayment = isRentStartDateToday();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <Header />
        <div className="pt-20 pb-24 flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error && !rentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <Header />
        <div className="pt-20 pb-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => roomId && router.push(`/chat/${roomId}`)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg"
            >
              채팅방으로 돌아가기
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!rentInfo) {
    return null;
  }

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1"
        onLoad={() => setTossPaymentsLoaded(true)}
        onError={() => setError('결제 시스템을 로드하는데 실패했습니다.')}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <Header />
      
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <button
              onClick={() => roomId && router.push(`/chat/${roomId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <i className="ri-arrow-left-line text-xl"></i>
              <span>채팅방으로 돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">결제하기</h1>
          </div>

          {/* 결제 정보 카드 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">결제 정보</h2>
            
            <div className="space-y-4">
              {/* 상품 정보 */}
              <div className="pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">상품명</p>
                <p className="text-base font-medium text-gray-800">{rentInfo.post.goods}</p>
              </div>

              {/* 대여 기간 */}
              <div className="pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">대여 기간</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-gray-800">
                    {formatDate(rentInfo.startAt)} ~ {formatDate(rentInfo.duedate)}
                  </p>
                </div>
              </div>

              {/* 대여 규칙 */}
              {rentInfo.rule && (
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">대여 규칙</p>
                  <p className="text-base text-gray-800 whitespace-pre-wrap">{rentInfo.rule}</p>
                </div>
              )}

              {/* 결제 금액 */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">결제 금액</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(rentInfo.totalPrice)}원
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 방법 안내 */}
          <div className="bg-yellow-50/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-yellow-100 mb-6">
            <div className="flex items-start gap-2">
              <i className="ri-information-line text-yellow-600 text-lg flex-shrink-0 mt-0.5"></i>
              <div className="text-xs text-yellow-700 leading-relaxed">
                <p className="mb-1">• 카드 결제로 진행됩니다. (테스트 환경)</p>
                <p className="mb-1">• 결제 완료 후 채팅방에서 확인할 수 있습니다.</p>
                <p>• 결제 취소는 채팅방에서 상대방과 협의 후 진행해주세요.</p>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 결제하기 버튼 */}
          <button
            onClick={handlePayment}
            disabled={processing || !rentInfo || !tossPaymentsLoaded || !canMakePayment}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!tossPaymentsLoaded 
              ? '결제 시스템 로딩 중...' 
              : processing 
              ? '결제 처리 중...' 
              : !canMakePayment
              ? '대여 시작 날이 아닙니다'
              : `${formatPrice(rentInfo.totalPrice)}원 결제하기`}
          </button>
        </div>
      </div>

        <BottomNavigation />
      </div>
    </>
  );
}

