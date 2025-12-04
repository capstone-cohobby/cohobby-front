'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';
import { Suspense } from 'react';

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rentIdParam = searchParams.get('rentId');
  const rentId = rentIdParam ? parseInt(rentIdParam, 10) : null;
  
  // 대여 정보는 API에서 가져올 예정 (현재는 null)
  const currentItem: { title: string; owner: string; period: string; image: string } | null = null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    
    if (comment.trim().length < 10) {
      alert('리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    // 리뷰 저장 로직 (실제로는 API 호출)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    alert('리뷰가 성공적으로 등록되었습니다!');
    router.push('/profile');
  };

  const reviewTemplates = [
    '상품 상태가 매우 좋았어요!',
    '설명과 동일하고 만족합니다.',
    '깨끗하게 관리되어 있었어요.',
    '친절하게 대응해주셔서 감사합니다.',
    '다음에도 이용하고 싶어요!'
  ];

  const addTemplate = (template: string) => {
    if (comment.includes(template)) return;
    setComment(prev => prev ? `${prev} ${template}` : template);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-20">
        {/* 헤더 */}
        <div className="px-4 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <i className="ri-arrow-left-line text-xl text-gray-600"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">리뷰 작성하기</h1>
          </div>
        </div>

        {/* 상품 정보 */}
        {currentItem && (
          <div className="px-4 py-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src={currentItem.image} 
                  alt={currentItem.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-base mb-1">{currentItem.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">대여자: {currentItem.owner}</p>
                  <p className="text-sm text-gray-500">{currentItem.period}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="px-4 py-6">

          {/* 별점 선택 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 mb-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">이번 대여는 어떠셨나요?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="w-12 h-12 flex items-center justify-center transition-transform hover:scale-110"
                >
                  <i 
                    className={`ri-star-${
                      star <= (hoverRating || rating) ? 'fill' : 'line'
                    } text-3xl ${
                      star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  ></i>
                </button>
              ))}
            </div>
            <div className="text-center">
              {rating > 0 && (
                <p className="text-sm text-gray-600">
                  {rating === 5 && '아주 만족해요!'}
                  {rating === 4 && '만족해요!'}
                  {rating === 3 && '보통이에요'}
                  {rating === 2 && '아쉬워요'}
                  {rating === 1 && '별로예요'}
                </p>
              )}
            </div>
          </div>

          {/* 리뷰 작성 */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 mb-6">
              <h4 className="font-bold text-gray-800 mb-4">상세 리뷰를 작성해주세요</h4>
              
              {/* 빠른 입력 템플릿 */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">빠른 입력</p>
                <div className="flex flex-wrap gap-2">
                  {reviewTemplates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addTemplate(template)}
                      className="px-3 py-2 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-600 rounded-full text-sm transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="대여 경험을 자세히 공유해주세요. 다른 사용자들에게 도움이 되는 리뷰를 작성해주시면 감사하겠습니다."
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">최소 10자 이상 작성해주세요</p>
                <p className="text-xs text-gray-500">{comment.length}/500</p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  리뷰 등록 중...
                </>
              ) : (
                '리뷰 등록하기'
              )}
            </button>
          </form>
        </div>

        {/* 하단 여백 */}
        <div className="h-8"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-purple-500 mb-4"></i>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <WriteReviewContent />
    </Suspense>
  );
}