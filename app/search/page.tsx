
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import BottomNavigation from '../../components/BottomNavigation';
import { getPostsBySearch, GetPostResponse } from '../../lib/api';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Array<{
    id: string;
    title: string;
    owner: string;
    verified: boolean;
    rating: number;
    reviews: number;
    location: string;
    time: string;
    price: string;
    image: string;
    available: boolean;
    category: string;
    keywords: string[];
    userId?: number | null;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  // 백엔드 응답을 프론트엔드 형식으로 변환
  const mapPostToProduct = (post: GetPostResponse) => {
    const today = new Date();
    const availableFrom = post.availableFrom ? new Date(post.availableFrom) : null;
    const availableUntil = post.availableUntil ? new Date(post.availableUntil) : null;
    const isAvailable = availableFrom && availableUntil 
      ? today >= availableFrom && today <= availableUntil 
      : true;

    return {
      id: String(post.postId),
      title: post.goods || '',
      owner: post.userNickname || '알 수 없음',
      verified: false,
      rating: 0,
      reviews: 0,
      location: '',
      time: '보통 1시간 이내',
      price: post.dailyPrice ? `${post.dailyPrice.toLocaleString()}원/일` : '가격 문의',
      image: post.imageUrl || 'https://via.placeholder.com/300x400',
      available: isAvailable,
      category: post.categoryName || '',
      keywords: [],
      userId: post.userId
    };
  };

  // 검색어가 변경될 때마다 API 호출
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const posts = await getPostsBySearch(searchQuery);
        const mappedProducts = posts.map(mapPostToProduct);
        setProducts(mappedProducts);
      } catch (error) {
        console.error('검색 실패:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-20">
        {/* 검색창 */}
        <div className="px-4 py-4">
          <div className="relative mb-4">
            <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-4 shadow-sm border border-white/20">
              <button 
                onClick={() => router.back()}
                className="w-6 h-6 flex items-center justify-center mr-3"
              >
                <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
              </button>
              <input
                type="text"
                placeholder="무엇을 빌려드릴까요? 🎯"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent text-sm placeholder-gray-500 outline-none"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 flex items-center justify-center ml-2"
                >
                  <i className="ri-close-line text-gray-500 text-lg"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {searchQuery ? `'${searchQuery}' 검색 결과` : '검색 결과'}
            </h2>
            {searchQuery && (
              <span className="text-sm text-gray-500">
                {loading ? '검색 중...' : `${products.length}개 발견`}
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-loader-4-line text-gray-400 text-3xl animate-spin"></i>
              </div>
              <p className="text-gray-500 text-sm">검색 중...</p>
            </div>
          ) : searchQuery && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-search-line text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-500 text-sm mb-4">다른 키워드로 검색해보세요</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['골프', '카메라', '기타', '캠핑', '게임'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => handleSearch(keyword)}
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full text-sm hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-search-line text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">검색어를 입력해주세요</h3>
              <p className="text-gray-500 text-sm mb-4">원하는 물품을 검색해보세요</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['골프', '카메라', '기타', '캠핑', '게임'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => handleSearch(keyword)}
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full text-sm hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">검색 중...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
