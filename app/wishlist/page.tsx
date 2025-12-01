
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import ProductCard from '../../components/ProductCard';
import { getMyLikes, GetPostResponse } from '../../lib/api';

export default function WishlistPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [wishlistProducts, setWishlistProducts] = useState<Array<{
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
    userId?: number | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  
  // 카테고리 이름 -> ID 매핑
  const categoryNameToId: Record<string, number | undefined> = {
    '스포츠': 1,
    '악기': 2,
    '액티비티': 3,
    '촬영': 4,
    '게임': 5,
    '관람': 6,
    '기타': 7
  };
  
  const categories = ['전체', '촬영', '게임', '스포츠', '악기', '액티비티'];

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const categoryId = selectedCategory === '전체' 
          ? undefined 
          : categoryNameToId[selectedCategory];
        const posts = await getMyLikes(categoryId);
        
        // GetPostResponse를 ProductCard 형식으로 변환
        const products = posts.map((post: GetPostResponse) => ({
          id: String(post.postId),
          title: post.goods,
          owner: post.userNickname || '익명',
          verified: true, // TODO: 실제 인증 상태 확인 필요
          rating: 4.5, // TODO: 실제 평점 가져오기
          reviews: 0, // TODO: 실제 리뷰 수 가져오기
          location: '서울', // TODO: 실제 위치 가져오기
          time: '보통 1시간 이내',
          price: post.dailyPrice ? `${post.dailyPrice.toLocaleString()}원/일` : '가격 문의',
          image: post.imageUrl || '/placeholder-image.jpg',
          available: true, // TODO: 실제 대여 가능 상태 확인
          userId: post.userId
        }));
        
        setWishlistProducts(products);
      } catch (error) {
        console.error('찜한 게시글 조회 실패:', error);
        setWishlistProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [selectedCategory]);

  const filteredProducts = wishlistProducts;

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
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-loader-4-line text-gray-400 text-2xl animate-spin"></i>
              </div>
              <p className="text-gray-500 text-sm">로딩 중...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
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
