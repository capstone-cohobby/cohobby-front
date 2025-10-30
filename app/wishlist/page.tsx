
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import ProductCard from '../../components/ProductCard';

export default function WishlistPage() {
  const router = useRouter();
  
  const wishlistProducts = [
    {
      id: '17',
      title: 'DJI Mini 3 Pro 드론',
      owner: '드론파일럿',
      verified: true,
      rating: 4.9,
      reviews: 21,
      location: '송파구 잠실동',
      time: '보통 1시간 이내',
      price: '18,000원/일',
      image: 'https://readdy.ai/api/search-image?query=DJI%20Mini%203%20Pro%20drone%20quadcopter%20with%20camera%20on%20clean%20white%20background%2C%20professional%20aerial%20photography%20equipment&width=300&height=240&seq=drone1&orientation=landscape',
      available: true
    },
    {
      id: '15',
      title: 'Yamaha 디지털 피아노',
      owner: '피아노선생님',
      verified: true,
      rating: 4.8,
      reviews: 16,
      location: '서초구 반포동',
      time: '보통 2시간 이내',
      price: '12,000원/일',
      image: 'https://readdy.ai/api/search-image?query=Yamaha%20digital%20piano%20keyboard%20electronic%20musical%20instrument%20with%20keys%20on%20clean%20white%20background%2C%20modern%20music%20equipment&width=300&height=240&seq=keyboard1&orientation=landscape',
      available: true
    },
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
      image: 'https://readdy.ai/api/search-image?query=Canon%20EOS%20R5%20mirrorless%20camera%20professional%20photography%20equipment%20with%20lens%20on%20clean%20white%20background%2C%20product%20photography%20style&width=300&height=240&seq=camera1&orientation=landscape',
      available: true
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
      image: 'https://readdy.ai/api/search-image?query=PlayStation%205%20console%20with%20controller%20modern%20white%20gaming%20system%20on%20clean%20white%20background%2C%20next%20generation%20gaming%20device&width=300&height=240&seq=ps5_1&orientation=landscape',
      available: true
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
      image: 'https://readdy.ai/api/search-image?query=Professional%20tennis%20racket%20set%20with%20tennis%20balls%20on%20clean%20white%20background%2C%20sports%20equipment%20for%20tennis%20game&width=300&height=240&seq=tennis1&orientation=landscape',
      available: true
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
      image: 'https://readdy.ai/api/search-image?query=Large%20hiking%20backpack%2060L%20outdoor%20camping%20equipment%20with%20straps%20on%20clean%20white%20background%2C%20mountain%20climbing%20gear&width=300&height=240&seq=backpack1&orientation=landscape',
      available: true
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('전체');
  
  const categories = ['전체', '촬영', '게임', '스포츠', '악기', '액티비티'];

  const filteredProducts = selectedCategory === '전체' 
    ? wishlistProducts 
    : wishlistProducts.filter(product => {
        if (selectedCategory === '촬영') return ['17', '9'].includes(product.id);
        if (selectedCategory === '게임') return ['18'].includes(product.id);
        if (selectedCategory === '스포츠') return ['14', '16'].includes(product.id);
        if (selectedCategory === '악기') return ['15'].includes(product.id);
        if (selectedCategory === '액티비티') return ['16'].includes(product.id);
        return true;
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-20">
        {/* 헤더 섹션 */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">찜한 상품</h1>
              <p className="text-gray-500 text-sm">마음에 드는 상품들을 모아봤어요</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <i className="ri-heart-fill text-white text-xl"></i>
            </div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md border border-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="px-4">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-2-line text-gray-400 text-3xl"></i>
              </div>
              <h3 className="font-bold text-gray-600 text-lg mb-2">해당 카테고리에 찜한 상품이 없어요</h3>
              <p className="text-gray-500 text-sm mb-6">다른 카테고리를 확인해보세요</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap"
              >
                상품 둘러보기
              </button>
            </div>
          )}
        </div>

        {/* 하단 여백 */}
        <div className="h-8"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}
