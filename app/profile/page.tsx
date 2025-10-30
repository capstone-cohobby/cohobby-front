
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState('대여내역');
  const router = useRouter();

  const profileData = {
    name: '김대여',
    email: 'rental@example.com',
    joinDate: '2023.03.15',
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20friendly%20person%20avatar%20headshot%20with%20warm%20smile%20on%20clean%20white%20background%2C%20modern%20profile%20photo%20style&width=120&height=120&seq=profile1&orientation=squarish',
    level: '플래티넘',
    contributionPoints: 2450,
    rentalCount: 47,
    registeredItems: 12,
    rating: 4.8,
    completedDeals: 39
  };

  const rentalHistory = [
    {
      id: 1,
      item: 'Canon EOS R5 미러리스',
      owner: '김포토',
      period: '2024.01.15 - 2024.01.17',
      price: '50,000원',
      status: '완료',
      rating: 5,
      hasReview: true, // 이미 리뷰 작성함
      image: 'https://readdy.ai/api/search-image?query=Canon%20EOS%20R5%20mirrorless%20camera%20professional%20photography%20equipment%20with%20lens%20on%20clean%20white%20background&width=80&height=80&seq=camera2&orientation=squarish'
    },
    {
      id: 2,
      item: 'Wilson 골프채 세트',
      owner: '골프마니아',
      period: '2024.01.10 - 2024.01.12',
      price: '75,000원',
      status: '완료',
      rating: 0,
      hasReview: false, // 리뷰 미작성
      image: 'https://readdy.ai/api/search-image?query=Wilson%20golf%20club%20set%20professional%20equipment%20with%20golf%20bag%20on%20clean%20white%20background&width=80&height=80&seq=golf2&orientation=squarish'
    },
    {
      id: 3,
      item: '4인용 캠핑 텐트',
      owner: '캠핑러버',
      period: '2024.01.05 - 2024.01.07',
      price: '36,000원',
      status: '완료',
      rating: 5,
      hasReview: true, // 이미 리뷰 작성함
      image: 'https://readdy.ai/api/search-image?query=Four%20person%20camping%20tent%20outdoor%20equipment%20green%20and%20orange%20colors%20on%20clean%20white%20background&width=80&height=80&seq=tent2&orientation=squarish'
    }
  ];

  const myItems = [
    {
      id: 1,
      title: 'MacBook Pro 16인치',
      category: '전자기기',
      price: '30,000원/일',
      status: '대여중',
      rentalCount: 8,
      rating: 4.9,
      image: 'https://readdy.ai/api/search-image?query=MacBook%20Pro%2016%20inch%20laptop%20computer%20silver%20color%20on%20clean%20white%20background%2C%20premium%20technology%20product&width=80&height=80&seq=macbook1&orientation=squarish'
    },
    {
      id: 2,
      title: 'Nintendo Switch OLED',
      category: '게임',
      price: '10,000원/일',
      status: '대여가능',
      rentalCount: 15,
      rating: 4.8,
      image: 'https://readdy.ai/api/search-image?query=Nintendo%20Switch%20OLED%20gaming%20console%20with%20Joy-Cond%20controllers%20on%20clean%20white%20background&width=80&height=80&seq=switch2&orientation=squarish'
    },
    {
      id: 3,
      title: '전동 드릴 세트',
      category: '공구',
      price: '8,000원/일',
      status: '대여가능',
      rentalCount: 5,
      rating: 4.7,
      image: 'https://readdy.ai/api/search-image?query=Electric%20drill%20set%20professional%20tools%20with%20case%20on%20clean%20white%20background%2C%20power%20tools%20equipment&width=80&height=80&seq=drill1&orientation=squarish'
    }
  ];

  const wishlistItems = [
    {
      id: 1,
      title: 'DJI Mini 3 Pro 드론',
      owner: '드론파일럿',
      price: '20,000원/일',
      rating: 4.9,
      location: '강남구',
      image: 'https://readdy.ai/api/search-image?query=DJI%20Mini%203%20Pro%20drone%20quadcopter%20with%20camera%20on%20clean%20white%20background%2C%20professional%20aerial%20photography%20equipment&width=80&height=80&seq=drone1&orientation=squarish'
    },
    {
      id: 2,
      title: 'Yamaha 디지털 피아노',
      owner: '피아노선생',
      price: '15,000원/일',
      rating: 4.8,
      location: '서초구',
      image: 'https://readdy.ai/api/search-image?query=Yamaha%20digital%20piano%20keyboard%20black%20color%20on%20clean%20white%20background%2C%20musical%20instrument%20product%20photography&width=80&height=80&seq=piano1&orientation=squarish'
    }
  ];

  const reviews = [
    {
      id: 1,
      item: 'Canon EOS R5 미러리스',
      reviewer: '사진애호가',
      rating: 5,
      comment: '상태가 정말 좋았어요! 깨끗하게 관리되어 있고 설명도 자세히 해주셔서 감사합니다.',
      date: '2024.01.18',
      reply: '좋은 리뷰 감사합니다! 앞으로도 깨끗하게 관리하겠습니다.'
    },
    {
      id: 2,
      item: 'Nintendo Switch OLED',
      reviewer: '게임러버',
      rating: 4,
      comment: '게임 잘 되고 화질도 좋네요. 다음에도 빌릴게요!',
      date: '2024.01.15',
      reply: ''
    }
  ];

  const menuItems = [
    { id: '대여내역', icon: 'ri-history-line', label: '내 대여 내역' },
    { id: '등록상품', icon: 'ri-box-line', label: '내 등록 상품' },
    { id: '찜한상품', icon: 'ri-heart-line', label: '찜한 상품' },
    { id: '리뷰관리', icon: 'ri-star-line', label: '리뷰 관리' },
    { id: '고객센터', icon: 'ri-customer-service-line', label: '고객센터' }
  ];

  const handleWriteReview = (itemId: number) => {
    router.push(`/review/write?itemId=${itemId}`);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case '대여내역':
        return (
          <div className="space-y-4">
            {rentalHistory.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.item}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{item.item}</h3>
                    <p className="text-xs text-gray-500 mb-1">대여자: {item.owner}</p>
                    <p className="text-xs text-gray-500 mb-2">{item.period}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-600">{item.price}</span>
                      <div className="flex items-center gap-2">
                        {item.hasReview ? (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`ri-star-${i < item.rating ? 'fill' : 'line'} text-yellow-400 text-xs`}></i>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleWriteReview(item.id)}
                            className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium hover:bg-purple-600 transition-colors whitespace-nowrap"
                          >
                            리뷰 작성하기
                          </button>
                        )}
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case '등록상품':
        return (
          <div className="space-y-4">
            {myItems.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-600">{item.price}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{item.rentalCount}회 대여</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === '대여중' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <i className="ri-star-fill text-yellow-400 text-xs"></i>
                      <span className="text-xs text-gray-600">{item.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case '찜한상품':
        return (
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-1">대여자: {item.owner}</p>
                    <p className="text-xs text-gray-500 mb-2">{item.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-600">{item.price}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <i className="ri-star-fill text-yellow-400 text-xs"></i>
                          <span className="text-xs text-gray-600">{item.rating}</span>
                        </div>
                        <button className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium hover:bg-purple-600 transition-colors">
                          대여하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case '리뷰관리':
        return (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-sm">{review.item}</h3>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">작성자: {review.reviewer}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-yellow-400 text-xs`}></i>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
                
                {review.reply ? (
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <i className="ri-reply-line text-purple-500 text-sm"></i>
                      <span className="text-xs font-medium text-purple-600">내 답글</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.reply}</p>
                  </div>
                ) : (
                  <button className="w-full py-2 bg-purple-100 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors">
                    답글 작성하기
                  </button>
                )}
              </div>
            ))}
          </div>
        );

      case '고객센터':
        return (
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-customer-service-2-line text-white text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">고객센터</h3>
              <p className="text-sm text-gray-500 mb-6">문의사항이 있으시면 언제든지 연락해주세요</p>
              
              <div className="space-y-3">
                <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all">
                  <i className="ri-chat-3-line mr-2"></i>
                  실시간 채팅 상담
                </button>
                <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors">
                  <i className="ri-mail-line mr-2"></i>
                  이메일 문의
                </button>
                <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors">
                  <i className="ri-phone-line mr-2"></i>
                  전화 문의
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">운영시간: 평일 09:00 - 18:00</p>
                <p className="text-xs text-gray-500">고객센터: 1588-1234</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-20">
        {/* 프로필 섹션 */}
        <div className="px-4 py-6">
          <div className="bg-gradient-to-r from-purple-500 to-green-400 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={profileData.avatar} 
                alt="프로필" 
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{profileData.name}</h2>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {profileData.level}
                  </span>
                </div>
                <p className="text-sm opacity-90 mb-1">{profileData.email}</p>
                <p className="text-xs opacity-75">가입일: {profileData.joinDate}</p>
                <div className="flex items-center gap-1 mt-2">
                  <i className="ri-star-fill text-yellow-300 text-sm"></i>
                  <span className="text-sm font-medium">{profileData.rating}</span>
                  <span className="text-xs opacity-75">({profileData.completedDeals}회 거래)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{profileData.contributionPoints.toLocaleString()}</div>
                <div className="text-xs opacity-90">기여포인트</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{profileData.rentalCount}</div>
                <div className="text-xs opacity-90">대여 횟수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{profileData.registeredItems}</div>
                <div className="text-xs opacity-90">등록 상품</div>
              </div>
            </div>
          </div>
        </div>

        {/* 메뉴 탭 */}
        <div className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedTab(item.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                  selectedTab === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="px-4">
          {renderContent()}
        </div>

        {/* 하단 여백 */}
        <div className="h-8"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}
