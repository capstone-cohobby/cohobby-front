
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import { getMyRentalHistory, getMyPosts, getLikedPosts, MyRentalHistoryResponse, GetPostResponse } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface UserProfile {
  id: number;
  nickname: string | null;
  email: string | null;
  profilePicture: string | null;
  score: number;
  gender: string | null;
  birthYear: number | null;
  birthday: string | null;
  phoneNumber: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState('대여내역');
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rentalHistory, setRentalHistory] = useState<MyRentalHistoryResponse[]>([]);
  const [myPosts, setMyPosts] = useState<GetPostResponse[]>([]);
  const [likedProducts, setLikedProducts] = useState<Array<{
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
  const [isLoadingRentals, setIsLoadingRentals] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingLikedProducts, setIsLoadingLikedProducts] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        
        if (!token) {
          setIsLoading(false);
          router.push('/login');
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const userData = await response.json();
            setProfileData(userData);
          } else if (response.status === 401) {
            // 인증 실패 시 로그인 페이지로 이동
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setIsLoading(false);
            router.push('/login');
            return;
          } else {
            // 다른 에러 발생 시
            console.error('사용자 정보를 가져오는 중 오류 발생:', response.status, response.statusText);
            // 에러가 발생해도 기본 정보는 표시하도록 함
            const errorText = await response.text();
            console.error('에러 응답:', errorText);
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          // 네트워크 에러나 타임아웃인 경우
          if (fetchError.name === 'AbortError') {
            console.error('요청 타임아웃');
          } else if (fetchError.message?.includes('fetch')) {
            console.error('네트워크 에러:', fetchError);
            // 백엔드 서버가 실행되지 않았을 수 있음
            // 하지만 사용자에게는 기본 정보를 표시하도록 함
          } else {
            throw fetchError;
          }
        }
      } catch (error) {
        console.error('사용자 정보를 가져오는 중 예상치 못한 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // 대여 내역 조회
  useEffect(() => {
    const fetchRentalHistory = async () => {
      if (selectedTab !== '대여내역') return;
      
      setIsLoadingRentals(true);
      try {
        const rentals = await getMyRentalHistory();
        setRentalHistory(rentals);
      } catch (error) {
        console.error('대여 내역 조회 실패:', error);
        setRentalHistory([]);
      } finally {
        setIsLoadingRentals(false);
      }
    };

    fetchRentalHistory();
  }, [selectedTab]);

  // 내 등록 상품 조회
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (selectedTab !== '등록상품') return;
      
      setIsLoadingPosts(true);
      try {
        const posts = await getMyPosts();
        setMyPosts(posts);
      } catch (error) {
        console.error('등록 상품 조회 실패:', error);
        setMyPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchMyPosts();
  }, [selectedTab]);

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
      verified: false, // TODO: 백엔드에 verified 필드 추가 필요
      rating: 4.5, // TODO: Review API에서 평균 평점 계산 필요 (임시로 4.5 하드코딩)
      reviews: 0, // TODO: Review API에서 리뷰 개수 계산 필요
      location: '', // TODO: User 엔티티에 location 필드 추가 필요
      time: '보통 1시간 이내', // TODO: 계산 로직 필요
      price: post.dailyPrice ? `${post.dailyPrice.toLocaleString()}원/일` : '가격 문의',
      image: post.imageUrl || 'https://via.placeholder.com/300x400',
      available: isAvailable,
      category: post.categoryName || '',
      keywords: [], // TODO: 키워드 필드 추가 필요
      userId: post.userId
    };
  };

  // 찜한 상품 조회
  useEffect(() => {
    const fetchLikedProducts = async () => {
      if (selectedTab !== '찜한상품') return;
      
      setIsLoadingLikedProducts(true);
      try {
        const posts = await getLikedPosts();
        const mappedProducts = posts.map(mapPostToProduct);
        setLikedProducts(mappedProducts);
      } catch (error) {
        console.error('찜한 상품 조회 실패:', error);
        setLikedProducts([]);
      } finally {
        setIsLoadingLikedProducts(false);
      }
    };

    fetchLikedProducts();
  }, [selectedTab]);

  // 사용자 레벨 계산 (score 기반)
  const getUserLevel = (score: number) => {
    if (score >= 2000) return '플래티넘';
    if (score >= 1000) return '골드';
    if (score >= 500) return '실버';
    return '브론즈';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '');
  };

  // 기본 프로필 데이터 (로딩 중이거나 데이터가 없을 때)
  const defaultProfileData = {
    name: profileData?.nickname || '사용자',
    email: profileData?.email || '',
    joinDate: formatDate(profileData?.createdAt || null),
    avatar: profileData?.profilePicture || 'https://readdy.ai/api/search-image?query=Professional%20friendly%20person%20avatar%20headshot%20with%20warm%20smile%20on%20clean%20white%20background%2C%20modern%20profile%20photo%20style&width=120&height=120&seq=profile1&orientation=squarish',
    level: getUserLevel(profileData?.score || 0),
    contributionPoints: profileData?.score || 0,
    rentalCount: 0, // TODO: 실제 대여 횟수 API 연동 필요
    registeredItems: 0, // TODO: 실제 등록 상품 수 API 연동 필요
    rating: 4.5, // TODO: 실제 평점 API 연동 필요 (임시로 4.5 하드코딩)
    completedDeals: 0 // TODO: 실제 완료 거래 수 API 연동 필요
  };

  // RentStatus를 한글로 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case 'CREATED':
        return '생성됨';
      case 'CONFIRMED':
        return '확정됨';
      case 'ONGOING':
        return '대여중';
      case 'COMPLETED':
        return '완료';
      case 'CANCELLED':
        return '취소됨';
      case 'DISPUTED':
        return '분쟁중';
      default:
        return status;
    }
  };

  // RentStatus에 따른 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'bg-gray-100 text-gray-600';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-600';
      case 'ONGOING':
        return 'bg-purple-100 text-purple-600';
      case 'COMPLETED':
        return 'bg-green-100 text-green-600';
      case 'CANCELLED':
        return 'bg-red-100 text-red-600';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };



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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      // localStorage에서 토큰 가져오기
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      // fetch에 timeout 추가하여 연결 실패 시 빠르게 처리
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          credentials: 'include',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (response.ok) {
          // 로컬 스토리지에서 토큰 제거
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // 로그인 페이지로 이동
          router.push('/login');
        } else {
          // API 호출 실패해도 로컬 토큰은 제거하고 로그인 페이지로 이동
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          router.push('/login');
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // 네트워크 에러나 타임아웃인 경우
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) {
          // 백엔드 서버가 실행되지 않았거나 연결할 수 없는 경우
          // 로컬 토큰만 제거하고 로그인 페이지로 이동
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          router.push('/login');
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류 발생해도 로컬 토큰은 제거하고 로그인 페이지로 이동
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case '대여내역':
        if (isLoadingRentals) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-loader-4-line text-gray-400 text-2xl animate-spin"></i>
              </div>
              <p className="text-gray-500 text-sm">로딩 중...</p>
            </div>
          );
        }
        if (rentalHistory.length === 0) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">대여 내역이 없습니다</p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            {rentalHistory.map((item) => {
              const period = item.startAt && item.duedate
                ? `${new Date(item.startAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')} - ${new Date(item.duedate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')}`
                : '날짜 미정';
              const price = item.totalPrice ? `${item.totalPrice.toLocaleString()}원` : '가격 미정';
              const imageUrl = item.postImageUrl || 'https://via.placeholder.com/80x80';
              
              return (
                <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
                  <div className="flex items-center gap-4">
                    <img 
                      src={imageUrl} 
                      alt={item.postGoods || '상품'}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{item.postGoods || '상품명 없음'}</h3>
                      <p className="text-xs text-gray-500 mb-1">빌려준 사람: {item.ownerNickname || '알 수 없음'}</p>
                      <p className="text-xs text-gray-500 mb-2">{period}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-purple-600">{price}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case '등록상품':
        if (isLoadingPosts) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-loader-4-line text-gray-400 text-2xl animate-spin"></i>
              </div>
              <p className="text-gray-500 text-sm">로딩 중...</p>
            </div>
          );
        }
        if (myPosts.length === 0) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">등록한 상품이 없습니다</p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            {myPosts.map((post) => {
              const imageUrl = post.imageUrl || (post.postId ? `https://via.placeholder.com/80x80` : 'https://via.placeholder.com/80x80');
              const price = post.dailyPrice ? `${post.dailyPrice.toLocaleString()}원/일` : '가격 문의';
              const status = post.availableFrom && post.availableUntil
                ? (new Date() >= new Date(post.availableFrom) && new Date() <= new Date(post.availableUntil) ? '대여가능' : '대여불가')
                : '대여가능';
              
              return (
                <Link key={post.postId} href={`/product/${post.postId}`}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <img 
                        src={imageUrl} 
                        alt={post.goods || '상품'}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm mb-1">{post.goods || '상품명 없음'}</h3>
                        <p className="text-xs text-gray-500 mb-1">{post.categoryName || ''} {post.hobbyName ? `> ${post.hobbyName}` : ''}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-purple-600">{price}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === '대여가능' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        );

      case '찜한상품':
        if (isLoadingLikedProducts) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-loader-4-line text-gray-400 text-2xl animate-spin"></i>
              </div>
              <p className="text-gray-500 text-sm">로딩 중...</p>
            </div>
          );
        }
        if (likedProducts.length === 0) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">찜한 상품이 없습니다</p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            {likedProducts.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-1">대여자: {item.owner}</p>
                      <p className="text-xs text-gray-500 mb-2">{item.location || '위치 정보 없음'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-purple-600">{item.price}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <i className="ri-star-fill text-yellow-400 text-xs"></i>
                            <span className="text-xs text-gray-600">{item.rating === 0 ? 4.5 : item.rating}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/product/${item.id}`);
                            }}
                            className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium hover:bg-purple-600 transition-colors"
                          >
                            대여하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // profileData가 없어도 기본 정보는 표시 (API 호출 실패 시에도)
  // profileData가 null이면 기본값 사용

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-20">
        {/* 프로필 섹션 */}
        <div className="px-4 py-6">
          <div className="bg-gradient-to-r from-purple-500 to-green-400 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={defaultProfileData.avatar} 
                alt="프로필" 
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{defaultProfileData.name}</h2>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {defaultProfileData.level}
                  </span>
                </div>
                <p className="text-sm opacity-90 mb-1">{defaultProfileData.email}</p>
                <p className="text-xs opacity-75">가입일: {defaultProfileData.joinDate || '정보 없음'}</p>
                <div className="flex items-center gap-1 mt-2">
                  <i className="ri-star-fill text-yellow-300 text-sm"></i>
                  <span className="text-sm font-medium">{defaultProfileData.rating}</span>
                  <span className="text-xs opacity-75">({defaultProfileData.completedDeals}회 거래)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{defaultProfileData.contributionPoints.toLocaleString()}</div>
                <div className="text-xs opacity-90">기여포인트</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{defaultProfileData.rentalCount}</div>
                <div className="text-xs opacity-90">대여 횟수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{defaultProfileData.registeredItems}</div>
                <div className="text-xs opacity-90">등록 상품</div>
              </div>
            </div>
          </div>
          
          {/* 로그아웃 버튼 */}
          <div className="mt-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full py-3 bg-white/90 backdrop-blur-sm text-red-600 rounded-2xl font-medium hover:bg-white transition-colors shadow-sm border border-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="ri-logout-box-line text-lg"></i>
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
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
