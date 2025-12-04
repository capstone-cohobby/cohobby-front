
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';

interface UserProfileClientProps {
  userId: string;
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  // 사용자 데이터 - API에서 가져올 예정 (현재는 null)
  type UserDataType = {
    name: string;
    email: string;
    joinDate: string;
    avatar: string;
    level: string;
    contributionPoints: number;
    rentalCount: number;
    registeredItems: number;
    rating: number;
    completedDeals: number;
    location: string;
  };
  const userData: UserDataType | null = null;

  // 등록 상품 - API에서 가져올 예정 (현재는 빈 배열)
  const userItems: Array<{
    id: number;
    title: string;
    category: string;
    price: string;
    status: string;
    rentalCount: number;
    rating: number;
    image: string;
  }> = [];

  // 리뷰 - API에서 가져올 예정 (현재는 빈 배열)
  const reviews: Array<{
    id: number;
    reviewer: string;
    rating: number;
    comment: string;
    date: string;
    item: string;
  }> = [];

  const reportReasons = [
    '부적절한 콘텐츠',
    '사기 의심',
    '욕설 및 비방',
    '스팸 또는 광고',
    '허위 정보',
    '기타'
  ];

  const handleReport = () => {
    if (selectedReportReason && reportDetails.trim()) {
      setShowReportModal(false);
      setSelectedReportReason('');
      setReportDetails('');
      // 실제로는 신고 API 호출
      alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-20">
        {/* 프로필 섹션 */}
        {(() => {
          if (!userData) {
            return (
              <div className="px-4 py-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-loader-4-line animate-spin text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-500 text-sm">사용자 정보를 불러오는 중...</p>
                </div>
              </div>
            );
          }
          const user: UserDataType = userData;
          return (
            <div className="px-4 py-6">
              <div className="bg-gradient-to-r from-purple-500 to-green-400 rounded-3xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex flex-col items-center">
                    <img 
                      src={user.avatar} 
                      alt="프로필" 
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 mb-3"
                    />
                    {/* 신고하기 버튼을 프로필 사진 아래로 이동 */}
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap"
                    >
                      <i className="ri-flag-line mr-1"></i>
                      신고하기
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold">{user.name}</h2>
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                        {user.level}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 mb-1">{user.location}</p>
                    <p className="text-xs opacity-75">가입일: {user.joinDate}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <i className="ri-star-fill text-yellow-300 text-sm"></i>
                      <span className="text-sm font-medium">{user.rating}</span>
                      <span className="text-xs opacity-75">({user.completedDeals}회 거래)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{user.contributionPoints.toLocaleString()}</div>
                    <div className="text-xs opacity-90">기여포인트</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{user.rentalCount}</div>
                    <div className="text-xs opacity-90">대여 횟수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{user.registeredItems}</div>
                    <div className="text-xs opacity-90">등록 상품</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 등록 상품 */}
        <div className="px-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">등록 상품</h3>
          {userItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">등록된 상품이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userItems.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h4>
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
          )}
        </div>

        {/* 리뷰 */}
        <div className="px-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">받은 리뷰</h3>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">받은 리뷰가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{review.reviewer}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-yellow-400 text-xs`}></i>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{review.item}</p>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 여백 */}
        <div className="h-8"></div>
      </div>

      {/* 신고하기 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">사용자 신고</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReportReason('');
                  setReportDetails('');
                }}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-500 text-xl"></i>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">신고 사유를 선택해주세요:</p>
            
            <div className="space-y-3 mb-6">
              {reportReasons.map((reason) => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReportReason === reason}
                    onChange={(e) => setSelectedReportReason(e.target.value)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
            
            {/* 구체적인 사유 입력 */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">구체적인 사유를 적어주세요:</p>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="신고 사유에 대한 자세한 내용을 입력해주세요..."
                maxLength={500}
                className="w-full h-24 p-3 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-400">{reportDetails.length}/500</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReportReason('');
                  setReportDetails('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReport}
                disabled={!selectedReportReason || !reportDetails.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-medium hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
