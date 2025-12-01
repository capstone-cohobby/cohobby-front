
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';
import { getPostDetail, GetPostDetailResponse, createChatRoom, getCurrentUser } from '../../../lib/api';
import { connectWebSocket, getStompClient } from '../../../lib/websocket';

interface ProductDetailProps {
  productId: string;
}

interface Product {
  id: string;
  title: string;
  owner: string;
  verified: boolean;
  rating: number;
  reviews: number;
  location: string;
  time: string;
  dailyPrice: string;
  weeklyPrice: string;
  deposit: string;
  images: string[];
  available: boolean;
  category: string;
  subCategory: string;
  purchaseDate: string;
  defects: string;
  precautions: string;
  rentalPeriod: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [product, setProduct] = useState<Product | null>(null);
  const [postDetail, setPostDetail] = useState<GetPostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user.id);
      } catch (error) {
        // 로그인하지 않은 경우
        setCurrentUserId(null);
      }
    };
    fetchCurrentUser();
  }, []);

  // 게시물 상세 정보 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const postDetail = await getPostDetail(Number(productId));
        
        // 대여 가능 날짜 생성
        const availableDates: string[] = [];
        if (postDetail.availableFrom && postDetail.availableUntil) {
          const start = new Date(postDetail.availableFrom);
          const end = new Date(postDetail.availableUntil);
          const current = new Date(start);
          
          while (current <= end) {
            availableDates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
          }
        }

        // 주간 가격 계산 (일일 가격 * 6일, 7일 대여 시)
        const weeklyPrice = postDetail.dailyPrice 
          ? `${(postDetail.dailyPrice * 6).toLocaleString()}원/주`
          : '가격 문의';

        // 대여 기간 포맷팅
        const rentalPeriod = postDetail.availableFrom && postDetail.availableUntil
          ? `${postDetail.availableFrom} ~ ${postDetail.availableUntil}`
          : '상시 대여 가능';

        // 이미지가 없을 경우 기본 이미지 추가
        const images = postDetail.images && postDetail.images.length > 0
          ? postDetail.images
          : ['https://via.placeholder.com/400x400'];

        // 대여 가능 여부 확인
        const today = new Date();
        const isAvailable = postDetail.availableFrom && postDetail.availableUntil
          ? today >= new Date(postDetail.availableFrom) && today <= new Date(postDetail.availableUntil)
          : true;

        const mappedProduct: Product = {
          id: String(postDetail.postId),
          title: postDetail.goods || '',
          owner: postDetail.userNickname || '알 수 없음',
          verified: false, // TODO: 백엔드에 verified 필드 추가 필요
          rating: 0, // TODO: Review API에서 평균 평점 계산 필요
          reviews: 0, // TODO: Review API에서 리뷰 개수 계산 필요
          location: '', // TODO: User 엔티티에 location 필드 추가 필요
          time: '보통 1시간 이내', // TODO: 계산 로직 필요
          dailyPrice: postDetail.dailyPrice ? `${postDetail.dailyPrice.toLocaleString()}원/일` : '가격 문의',
          weeklyPrice: weeklyPrice,
          deposit: postDetail.deposit ? `${postDetail.deposit.toLocaleString()}원` : '보증금 문의',
          images: images,
          available: isAvailable,
          category: postDetail.categoryName || '',
          subCategory: postDetail.hobbyName || '',
          purchaseDate: postDetail.purchasedAt || '',
          defects: postDetail.defectStatus || '하자 사항 없음',
          precautions: postDetail.caution || '주의사항 없음',
          rentalPeriod: rentalPeriod
        };

        setProduct(mappedProduct);
        setPostDetail(postDetail);
      } catch (err) {
        console.error('게시물 상세 조회 실패:', err);
        setError('게시물을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // 대여 가능 날짜 목록 (product가 로드된 후 계산)
  const availableDates: string[] = [];
  if (product) {
    const rentalPeriod = product.rentalPeriod;
    if (rentalPeriod.includes('~')) {
      const [startStr, endStr] = rentalPeriod.split('~').map(s => s.trim());
      if (startStr && endStr) {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const current = new Date(start);
        
        while (current <= end) {
          availableDates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
      }
    }
  }

  const handleRentalInquiry = () => {
    setShowDatePicker(true);
  };

  const handleContinueToChat = async () => {
    if (!selectedStartDate || !selectedEndDate || !product || !postDetail) {
      return;
    }

    const { total } = calculatePrice();

    try {
      // 채팅방 생성 (날짜와 가격 정보 포함)
      const room = await createChatRoom(Number(product.id), {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        totalPrice: total
      });
      
      // room이 제대로 생성되었는지 확인
      if (!room || !room.id) {
        console.error('채팅방 생성 실패: room 객체가 유효하지 않습니다.', room);
        alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      
      console.log('채팅방 생성 성공:', room);
      
      // 채팅방 생성 성공 메시지 표시 및 모달 닫기
      alert('채팅방이 생성되었습니다!');
      setShowDatePicker(false);
      
      // 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
      const formatDateForMessage = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
      };

      const startDateFormatted = formatDateForMessage(selectedStartDate);
      const endDateFormatted = formatDateForMessage(selectedEndDate);
      
      // 게시물명 가져오기
      const postTitle = product.title || postDetail.goods || '게시물';
      
      // room.id를 변수에 저장 (클로저 문제 방지)
      const roomId = room.id;

      // 웹소켓 연결 및 메시지 전송
      const sendMessageViaWebSocket = () => {
        return new Promise<void>((resolve, reject) => {
          const messageText = `${postTitle}에 대해 ${startDateFormatted}부터 ${endDateFormatted}까지 대여를 요청했어요!`;
          
          // 메시지 전송 함수
          const sendMessage = () => {
            const client = getStompClient();
            if (client && client.connected && roomId) {
              const message = {
                roomId: roomId,
                text: messageText
              };
              
              client.publish({
                destination: '/pub/chatting/send',
                body: JSON.stringify(message)
              });
              console.log('메시지 전송 성공:', messageText);
              resolve();
              return true;
            }
            return false;
          };

          // 이미 연결되어 있으면 바로 전송
          if (sendMessage()) {
            return;
          }

          // 연결되어 있지 않으면 연결 시도
          try {
            connectWebSocket(
              () => {
                // 연결 완료 후 메시지 전송 시도
                // 연결이 완료되어도 약간의 지연이 있을 수 있으므로 재시도
                let retryCount = 0;
                const maxRetries = 20; // 2초 (100ms * 20)
                
                const checkAndSend = setInterval(() => {
                  retryCount++;
                  if (sendMessage()) {
                    clearInterval(checkAndSend);
                  } else if (retryCount >= maxRetries) {
                    clearInterval(checkAndSend);
                    console.error('메시지 전송 실패: WebSocket 연결 후 전송 타임아웃');
                    reject(new Error('메시지 전송 타임아웃'));
                  }
                }, 100);
              },
              (error) => {
                console.error('WebSocket 연결 오류:', error);
                reject(error);
              }
            );
          } catch (error) {
            console.error('WebSocket 연결 초기화 실패:', error);
            reject(error);
          }
        });
      };

      try {
        await sendMessageViaWebSocket();
        console.log('메시지 전송 완료');
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        // 메시지 전송 실패해도 채팅방은 생성되었으므로 이동은 진행
        // 사용자에게 알림은 하지 않음 (채팅방에서 직접 메시지를 보낼 수 있음)
      }

      // 채팅방으로 이동
      router.push(`/chat/${roomId}`);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <Header />
        <div className="pt-20 pb-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-loader-4-line text-gray-400 text-2xl animate-spin"></i>
            </div>
            <p className="text-gray-500 text-sm">로딩 중...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // 에러 발생
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
        <Header />
        <div className="pt-20 pb-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-500 text-sm">{error || '게시물을 찾을 수 없습니다.'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              돌아가기
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // 달력 관련 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateAvailable = (dateString: string) => {
    // 모든 날짜를 대여 가능하게 변경 (주말 포함)
    return availableDates.includes(dateString);
  };

  const isDateSelected = (dateString: string) => {
    if (!selectedStartDate && !selectedEndDate) return false;
    if (selectedStartDate === dateString || selectedEndDate === dateString) return true;

    if (selectedStartDate && selectedEndDate) {
      const current = new Date(dateString);
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      return current >= start && current <= end;
    }

    return false;
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const todayString = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return dateString === todayString;
  };

  const handleDateClick = (dateString: string) => {
    if (!isDateAvailable(dateString)) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(dateString);
      setSelectedEndDate('');
    } else if (selectedStartDate && !selectedEndDate) {
      if (dateString >= selectedStartDate) {
        setSelectedEndDate(dateString);
      } else {
        setSelectedStartDate(dateString);
        setSelectedEndDate('');
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const calculatePrice = () => {
    if (!selectedStartDate || !selectedEndDate || !postDetail) return { total: 0, days: 0 };

    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 게시물의 실제 일일 대여료 가져오기
    const dailyPrice = postDetail.dailyPrice || 0;
    const total = diffDays * dailyPrice;

    return { total, days: diffDays };
  };

  const { total, days } = calculatePrice();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    const daysArray = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        {daysArray.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10"></div>;
          }
          
          const dateString = formatDateString(year, month, day);
          const isSelected = isDateSelected(dateString);
          const isAvailable = isDateAvailable(dateString);
          const today = isToday(dateString);
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(dateString)}
              className={`h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-purple-500 text-white'
                  : isAvailable
                  ? 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } ${today ? 'font-bold' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    );
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <div className="px-4 pt-6 pb-60 max-w-2xl mx-auto">
        {/* 상품 이미지 캐러셀 */}
        <div className="relative mb-6">
          <div className="aspect-square md:aspect-auto md:min-h-[400px] md:max-h-[600px] rounded-2xl overflow-hidden bg-white shadow-lg flex items-center justify-center">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.title}
              className="w-full h-full md:w-auto md:max-w-full md:max-h-full object-contain"
            />
          </div>
          
          {/* 이미지 인디케이터 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* 상품 기본 정보 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-gray-800">{product.title}</h2>
              <div className="flex items-center gap-1">
                <i className="ri-verified-badge-fill text-blue-500"></i>
                <span className="text-sm text-blue-600">인증됨</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-600">소유자:</span>
              <span className="font-medium text-gray-800">{product.owner}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <i className="ri-star-fill text-yellow-400"></i>
                  <span className="font-bold text-gray-800">{product.rating}</span>
                  <span className="text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <i className="ri-map-pin-2-fill"></i>
                  <span>{product.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">응답 시간</div>
                <div className="text-sm text-gray-700">{product.time}</div>
              </div>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-gray-800 mb-3">가격 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">일일 대여료</span>
                <span className="font-bold text-purple-600">{product.dailyPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">주 대여료</span>
                <span className="font-bold text-purple-600">{product.weeklyPrice}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-600">보증금</span>
                <span className="font-bold text-red-600">{product.deposit}</span>
              </div>
            </div>
          </div>

          {/* 상품 상세 정보 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-gray-800 mb-3">상품 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">카테고리</span>
                <span className="text-gray-800">{product.category} &gt; {product.subCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">구입일</span>
                <span className="text-gray-800">{product.purchaseDate}</span>
              </div>
            </div>
          </div>

          {/* 상품 상태 및 하자사항 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-gray-800 mb-3">상품 상태</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{product.defects}</p>
          </div>

          {/* 주의사항 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-24">
            <h3 className="font-bold text-gray-800 mb-3">주의사항 및 보증금 규칙</h3>
            <div className="text-gray-600 text-sm leading-relaxed">
              {showFullDescription ? (
                <div>
                  {product.precautions}
                  <button
                    onClick={() => setShowFullDescription(false)}
                    className="text-purple-600 font-medium ml-2 cursor-pointer"
                  >
                    간략히 보기
                  </button>
                </div>
              ) : (
                <div>
                  {product.precautions.length > 100 
                    ? `${product.precautions.substring(0, 100)}...`
                    : product.precautions
                  }
                  {product.precautions.length > 100 && (
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="text-purple-600 font-medium ml-2 cursor-pointer"
                    >
                      더보기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 대여하기 버튼 - 고정 위치 (자신의 게시물이 아닐 때만 표시) */}
      {currentUserId === null || !postDetail || postDetail.userId === null || currentUserId !== postDetail.userId ? (
        <div className="fixed bottom-24 left-0 right-0 px-4 bg-white/90 backdrop-blur-md py-4 border-t border-white/20 shadow-lg z-40">
          <button 
            onClick={handleRentalInquiry}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg cursor-pointer whitespace-nowrap"
          >
            대여하기
          </button>
        </div>
      ) : null}

      {/* 날짜 선택 팝업 */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">대여 날짜 선택</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* 달력 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800">날짜 선택</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-left-s-line text-gray-600"></i>
                  </button>
                  <span className="text-sm font-medium text-gray-800 min-w-[100px] text-center">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-right-s-line text-gray-600"></i>
                  </button>
                </div>
              </div>

              {renderCalendar()}

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-gray-600">선택</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                  <span className="text-gray-600">가능</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">불가</span>
                </div>
              </div>
            </div>

            {/* 선택된 날짜 정보 */}
            {selectedStartDate && (
              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <h5 className="font-medium text-blue-800 mb-1 text-sm">선택된 날짜</h5>
                <div className="text-sm text-blue-700">
                  <div>시작: {formatDate(selectedStartDate)}</div>
                  {selectedEndDate && <div>종료: {formatDate(selectedEndDate)}</div>}
                </div>
              </div>
            )}

            {/* 가격 계산 */}
            {selectedStartDate && selectedEndDate && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <h5 className="font-medium text-gray-800 mb-2 text-sm">대여 요약</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">기간</span>
                    <span className="text-gray-800">{days}일</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-800">총 대여료</span>
                    <span className="text-purple-600">{total.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">보증금</span>
                    <span className="text-red-600">50,000원</span>
                  </div>
                </div>
              </div>
            )}

            {/* 확인 버튼 */}
            <button
              onClick={handleContinueToChat}
              disabled={!selectedStartDate || !selectedEndDate}
              className={`w-full py-4 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedStartDate && selectedEndDate
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              채팅으로 대여 문의하기
            </button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
