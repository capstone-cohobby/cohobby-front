'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BottomNavigation from '../components/BottomNavigation';

export default function Home() {
  const [selectedMainCategory, setSelectedMainCategory] = useState('스포츠');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const router = useRouter();

  const categories = {
    '관람': ['콘서트', '뮤지컬/오페라', '스포츠경기'],
    '스포츠': ['골프', '테니스/배드민턴/탁구', '클라이밍/러닝', '자전거', '축구/야구/농구', '헬스/요가', '보드/스키', '스쿠버 다이빙', '격투기/검도'],
    '악기': ['기타', '피아노', '악보', '현악기', '관악기'],
    '액티비티': ['캠핑', '등산', '낚시'],
    '촬영': ['카메라', '드론', '영상장비', '천체 관측'],
    '게임': ['보드게임', '닌텐도/Wii', 'VR'],
    '기타': ['반려동물 용품', '마술 용품', '미술 용품']
  };

  const allProducts = [
    // 관람
    {
      id: '1',
      title: '콘서트 쌍안경',
      owner: '뮤직러버',
      verified: true,
      rating: 4.9,
      reviews: 15,
      location: '강남구 역삼동',
      time: '보통 1시간 이내',
      price: '3,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Professional%20binoculars%20for%20concerts%20and%20theater%20performances%2C%20compact%20black%20opera%20glasses%20on%20clean%20white%20background%2C%20elegant%20design%20for%20cultural%20events&width=300&height=400&seq=binoculars1&orientation=portrait',
      available: true,
      category: '관람',
      keywords: ['콘서트', '쌍안경', '공연', '관람']
    },
    // 스포츠
    {
      id: '3',
      title: 'Wilson 골프채 세트',
      owner: '골프마니아',
      verified: true,
      rating: 4.8,
      reviews: 31,
      location: '분당구 정자동',
      time: '보통 2시간 이내',
      price: '25,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Wilson%20golf%20club%20set%20professional%20equipment%20with%20golf%20bag%2C%20complete%20iron%20and%20driver%20set%20on%20clean%20white%20background%2C%20premium%20golf%20gear&width=300&height=400&seq=golf1&orientation=portrait',
      available: true,
      category: '스포츠',
      keywords: ['골프', '골프채', 'wilson', '스포츠', '운동']
    },
    {
      id: '4',
      title: '전문 클라이밍 장비 세트',
      owner: '암벽등반가',
      verified: true,
      rating: 4.9,
      reviews: 18,
      location: '서대문구 연희동',
      time: '보통 1시간 이내',
      price: '15,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Professional%20rock%20climbing%20equipment%20set%20with%20harness%2C%20carabiners%2C%20and%20ropes%20on%20clean%20white%20background%2C%20safety%20climbing%20gear&width=300&height=400&seq=climbing1&orientation=portrait',
      available: true,
      category: '스포츠',
      keywords: ['클라이밍', '등반', '암벽', '스포츠', '운동', '하네스']
    },
    {
      id: '14',
      title: '테니스 라켓 세트',
      owner: '테니스왕',
      verified: true,
      rating: 4.7,
      reviews: 22,
      location: '강남구 청담동',
      time: '보통 1시간 이내',
      price: '8,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Professional%20tennis%20racket%20set%20with%20tennis%20balls%20on%20clean%20white%20background%2C%20sports%20equipment%20for%20tennis%20game&width=300&height=400&seq=tennis1&orientation=portrait',
      available: true,
      category: '스포츠',
      keywords: ['테니스', '라켓', '스포츠', '운동', '테니스공']
    },
    // 악기
    {
      id: '5',
      title: 'Yamaha 어쿠스틱 기타',
      owner: '기타치는사람',
      verified: true,
      rating: 4.6,
      reviews: 27,
      location: '마포구 상암동',
      time: '보통 1시간 이내',
      price: '8,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Yamaha%20acoustic%20guitar%20wooden%20musical%20instrument%20on%20clean%20white%20background%2C%20professional%20guitar%20product%20photography%20warm%20wood%20finish&width=300&height=400&seq=guitar1&orientation=portrait',
      available: true,
      category: '악기',
      keywords: ['기타', '야마하', 'yamaha', '어쿠스틱', '악기', '음악']
    },
    {
      id: '15',
      title: '전자 키보드 피아노',
      owner: '피아노선생님',
      verified: true,
      rating: 4.8,
      reviews: 16,
      location: '서초구 반포동',
      time: '보통 2시간 이내',
      price: '12,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Digital%20keyboard%20piano%20electronic%20musical%20instrument%20with%20keys%20on%20clean%20white%20background%2C%20modern%20music%20equipment&width=300&height=400&seq=keyboard1&orientation=portrait',
      available: true,
      category: '악기',
      keywords: ['피아노', '키보드', '전자피아노', '악기', '음악']
    },
    // 액티비티
    {
      id: '7',
      title: '4인용 캠핑 텐트',
      owner: '캠핑러버',
      verified: true,
      rating: 4.7,
      reviews: 25,
      location: '용산구 이태원동',
      time: '보통 2시간 이내',
      price: '12,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Four%20person%20camping%20tent%20outdoor%20equipment%20green%20and%20orange%20colors%20on%20clean%20white%20background%2C%20family%20camping%20gear&width=300&height=400&seq=tent1&orientation=portrait',
      available: true,
      category: '액티비티',
      keywords: ['캠핑', '텐트', '야외', '아웃도어', '4인용']
    },
    {
      id: '16',
      title: '등산 배낭 60L',
      owner: '산악인',
      verified: true,
      rating: 4.6,
      reviews: 19,
      location: '노원구 상계동',
      time: '보통 1시간 이내',
      price: '6,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Large%20hiking%20backpack%2060L%20outdoor%20camping%20equipment%20with%20straps%20on%20clean%20white%20background%2C%20mountain%20climbing%20gear&width=300&height=400&seq=backpack1&orientation=portrait',
      available: true,
      category: '액티비티',
      keywords: ['등산', '배낭', '하이킹', '아웃도어', '백팩']
    },
    // 촬영
    {
      id: '9',
      title: 'Canon EOS R5 미러리스',
      owner: '김포토',
      verified: true,
      rating: 4.8,
      reviews: 24,
      location: '강남구 역삼동',
      time: '보통 1시간 이내',
      price: '25,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Canon%20EOS%20R5%20mirrorless%20camera%20professional%20photography%20equipment%20with%20lens%20on%20clean%20white%20background%2C%20product%20photography%20style%2C%20high%20quality%20DSLR%20camera&width=300&height=400&seq=camera1&orientation=portrait',
      available: true,
      category: '촬영',
      keywords: ['카메라', '캐논', 'canon', '미러리스', '사진', '촬영']
    },
    {
      id: '17',
      title: 'DJI 드론 Mini 3',
      owner: '드론파일럿',
      verified: true,
      rating: 4.9,
      reviews: 21,
      location: '송파구 잠실동',
      time: '보통 1시간 이내',
      price: '18,000원/일',
      image: 'https://readdy.ai/api/search-image?query=DJI%20Mini%203%20drone%20quadcopter%20with%20controller%20on%20clean%20white%20background%2C%20professional%20aerial%20photography%20equipment&width=300&height=400&seq=drone1&orientation=portrait',
      available: true,
      category: '촬영',
      keywords: ['드론', 'dji', '항공촬영', '촬영', '쿼드콥터']
    },
    // 게임
    {
      id: '11',
      title: 'Nintendo Switch OLED',
      owner: '게임러버',
      verified: true,
      rating: 4.9,
      reviews: 18,
      location: '서초구 서초동',
      time: '보통 30분 이내',
      price: '10,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Nintendo%20Switch%20OLED%20gaming%20console%20with%20Joy-Con%20controllers%20on%20clean%20white%20background%2C%20modern%20gaming%20device%20product%20photography&width=300&height=400&seq=switch1&orientation=portrait',
      available: true,
      category: '게임',
      keywords: ['닌텐도', 'nintendo', 'switch', '게임', '콘솔']
    },
    {
      id: '18',
      title: 'PlayStation 5',
      owner: '콘솔게이머',
      verified: true,
      rating: 4.8,
      reviews: 26,
      location: '마포구 홍대동',
      time: '보통 1시간 이내',
      price: '15,000원/일',
      image: 'https://readdy.ai/api/search-image?query=PlayStation%205%20console%20with%20controller%20modern%20white%20gaming%20system%20on%20clean%20white%20background%2C%20next%20generation%20gaming%20device&width=300&height=400&seq=ps5_1&orientation=portrait',
      available: true,
      category: '게임',
      keywords: ['플레이스테이션', 'playstation', 'ps5', '게임', '콘솔']
    },
    // 기타
    {
      id: '13',
      title: '강아지 캐리어',
      owner: '펫러버',
      verified: true,
      rating: 4.7,
      reviews: 13,
      location: '성동구 성수동',
      time: '보통 1시간 이내',
      price: '5,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Pet%20carrier%20bag%20for%20small%20dogs%20comfortable%20travel%20case%20with%20mesh%20windows%20on%20clean%20white%20background%2C%20pet%20transportation%20equipment&width=300&height=400&seq=carrier1&orientation=portrait',
      available: true,
      category: '기타',
      keywords: ['강아지', '펫', '캐리어', '반려동물', '이동장']
    }
  ];

  const products = {
    '관람': allProducts.filter(p => p.category === '관람'),
    '스포츠': allProducts.filter(p => p.category === '스포츠'),
    '악기': allProducts.filter(p => p.category === '악기'),
    '액티비티': allProducts.filter(p => p.category === '액티비티'),
    '촬영': allProducts.filter(p => p.category === '촬영'),
    '게임': allProducts.filter(p => p.category === '게임'),
    '기타': allProducts.filter(p => p.category === '기타')
  };

  const handleSearchClick = () => {
    router.push('/search');
  };

  const categoryIcons = {
    '관람': 'ri-ticket-line',
    '스포츠': 'ri-basketball-line',
    '악기': 'ri-music-line',
    '액티비티': 'ri-tent-line',
    '촬영': 'ri-camera-line',
    '게임': 'ri-gamepad-line',
    '기타': 'ri-more-line'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-24">
        {/* 검색창 */}
        <div className="px-4 py-4">
          <button 
            onClick={handleSearchClick}
            className="w-full"
          >
            <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-4 shadow-sm border border-white/20 hover:bg-white hover:shadow-md transition-all duration-300">
              <i className="ri-search-line text-gray-500 text-lg mr-3"></i>
              <span className="flex-1 text-left text-sm text-gray-500">무엇을 빌려드릴까요? 🎯</span>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="ri-search-line text-white text-lg"></i>
              </div>
            </div>
          </button>
        </div>

        {/* 카테고리 */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">카테고리</h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.keys(categories).slice(0, 4).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedMainCategory(category);
                  setSelectedSubCategory('');
                }}
                className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                  selectedMainCategory === category
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <i className={`${categoryIcons[category]} text-2xl`}></i>
                </div>
                <div className="text-xs font-medium">{category}</div>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {Object.keys(categories).slice(4).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedMainCategory(category);
                  setSelectedSubCategory('');
                }}
                className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                  selectedMainCategory === category
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <i className={`${categoryIcons[category]} text-2xl`}></i>
                </div>
                <div className="text-xs font-medium">{category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 선택된 카테고리의 세부 취미 */}
        <div className="px-4 mb-6">
          <h3 className="text-base font-bold text-gray-800 mb-3">{selectedMainCategory} 세부 카테고리</h3>
          <div className="flex flex-wrap gap-2">
            {categories[selectedMainCategory].map((hobby) => (
              <button
                key={hobby}
                onClick={() => setSelectedSubCategory(hobby)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  selectedSubCategory === hobby
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>

        {/* 아이템 목록 */}
        <div className="px-4 pb-4">
          <h3 className="text-base font-bold text-gray-800 mb-4">
            {selectedSubCategory ? `${selectedSubCategory} 아이템` : `${selectedMainCategory} 아이템`}
          </h3>
          {products[selectedMainCategory]?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {products[selectedMainCategory].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">아직 등록된 아이템이 없습니다</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
