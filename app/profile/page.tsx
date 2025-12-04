
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import { getMyRentalHistory, getMyPosts, getLikedPosts, MyRentalHistoryResponse, GetPostResponse, getUserCard, registerCard, deleteUserCard, UserCardResponse, CardRegisterRequest } from '../../lib/api';

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
  const [userCard, setUserCard] = useState<UserCardResponse | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [showCardRegisterModal, setShowCardRegisterModal] = useState(false);
  const cardRegisterHandledRef = useRef<string | null>(null);

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
        return '대여 요청 중';
      case 'CONFIRMED':
        return '대여 확정됨';
      case 'ONGOING':
        return '대여중';
      case 'COMPLETED':
        return '대여 종료';
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



  const reviews: Array<{
    id: number;
    item: string;
    reviewer: string;
    rating: number;
    comment: string;
    date: string;
    reply: string;
  }> = [];

  const menuItems = [
    { id: '대여내역', icon: 'ri-history-line', label: '내 대여 내역' },
    { id: '등록상품', icon: 'ri-box-line', label: '내 등록 상품' },
    { id: '찜한상품', icon: 'ri-heart-line', label: '찜한 상품' },
    { id: '리뷰관리', icon: 'ri-star-line', label: '리뷰 관리' },
    { id: '카드관리', icon: 'ri-bank-card-line', label: '카드 관리' },
    { id: '고객센터', icon: 'ri-customer-service-line', label: '고객센터' }
  ];

  // 카드 정보 조회
  useEffect(() => {
    const fetchUserCard = async () => {
      if (selectedTab !== '카드관리') return;
      
      setIsLoadingCard(true);
      try {
        const card = await getUserCard();
        setUserCard(card);
      } catch (error: any) {
        if (error.message?.includes('404') || error.message?.includes('등록된 카드가 없습니다')) {
          setUserCard(null);
        } else {
          console.error('카드 정보 조회 실패:', error);
        }
      } finally {
        setIsLoadingCard(false);
      }
    };

    fetchUserCard();
  }, [selectedTab]);

  const searchParams = useSearchParams();

  // 외부에서 카드 등록 모달을 열도록 요청한 경우 처리
  useEffect(() => {
    const openCardModal = searchParams.get('openCardModal');
    if (openCardModal === 'true') {
      setSelectedTab('카드관리');
      setShowCardRegisterModal(true);
      router.replace('/profile');
    }
  }, [searchParams, router]);

  // 카드 등록 성공/실패 처리
  useEffect(() => {
    const cardRegisterStatus = searchParams.get('cardRegister');
    const authKey = searchParams.get('authKey');

    if (!cardRegisterStatus) {
      cardRegisterHandledRef.current = null;
      return;
    }

    const fingerprint = `${cardRegisterStatus}-${authKey ?? ''}`;
    if (cardRegisterHandledRef.current === fingerprint) {
      return;
    }
    cardRegisterHandledRef.current = fingerprint;

    console.log('카드 등록 리다이렉트 파라미터:', {
      cardRegisterStatus,
      authKey,
      allParams: Object.fromEntries(searchParams.entries())
    });

    const finalize = () => {
      router.replace('/profile');
    };

    if (cardRegisterStatus === 'success') {
      if (authKey) {
        (async () => {
          try {
            const request: CardRegisterRequest = { authKey };
            const registeredCard = await registerCard(request);
            setUserCard(registeredCard);
            alert('카드가 성공적으로 등록되었습니다.');
          } catch (error: any) {
            console.error('카드 등록 실패:', error);
            const errorMessage = error.message || '알 수 없는 오류';
            // 서버 에러 메시지가 있으면 그대로 표시
            alert('카드 등록에 실패했습니다.\n\n' + errorMessage);
          } finally {
            finalize();
          }
        })();
      } else {
        console.warn('authKey가 URL 파라미터에 없습니다. 카드 정보를 다시 확인합니다.');
        (async () => {
          try {
            const card = await getUserCard();
            if (card) {
              setUserCard(card);
              alert('카드가 성공적으로 등록되었습니다.');
            } else {
              alert('카드 인증은 완료되었지만, 등록 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
          } catch (error) {
            console.error('카드 정보 조회 실패:', error);
            alert('카드 인증은 완료되었지만, 등록 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
          } finally {
            finalize();
          }
        })();
      }
    } else if (cardRegisterStatus === 'fail') {
      alert('카드 등록에 실패했습니다.');
      finalize();
    }
  }, [searchParams, router]);

  // 카드 등록 핸들러
  const handleCardRegister = async (authKey: string) => {
    try {
      const request: CardRegisterRequest = { authKey };
      const registeredCard = await registerCard(request);
      setUserCard(registeredCard);
      setShowCardRegisterModal(false);
      alert('카드가 성공적으로 등록되었습니다.');
    } catch (error: any) {
      console.error('카드 등록 실패:', error);
      alert('카드 등록에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

  // 카드 삭제 핸들러
  const handleCardDelete = async () => {
    if (!confirm('등록된 카드를 삭제하시겠습니까?')) return;
    
    try {
      await deleteUserCard();
      setUserCard(null);
      alert('카드가 삭제되었습니다.');
    } catch (error: any) {
      console.error('카드 삭제 실패:', error);
      alert('카드 삭제에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

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
        if (reviews.length === 0) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">받은 리뷰가 없습니다</p>
            </div>
          );
        }
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

      case '카드관리':
        if (isLoadingCard) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-loader-4-line text-gray-400 text-2xl animate-spin"></i>
              </div>
              <p className="text-gray-500 text-sm">로딩 중...</p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            {userCard ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">등록된 카드</h3>
                  <button
                    onClick={handleCardDelete}
                    disabled={!userCard.deletable}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      userCard.deletable
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    삭제
                  </button>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">카드사</p>
                      <p className="text-base font-medium text-gray-800">{userCard.cardCompany || '알 수 없음'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">카드 타입</p>
                      <p className="text-base font-medium text-gray-800">{userCard.cardType || '알 수 없음'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">카드 번호</p>
                    <p className="text-base font-medium tracking-wider text-gray-800">{userCard.cardNumber || '카드 번호 없음'}</p>
                  </div>
                  {!userCard.deletable && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800 leading-relaxed">
                      진행 중인 대여가 있어 카드를 삭제할 수 없습니다. 대여가 종료된 후 다시 시도해주세요.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-bank-card-line text-gray-400 text-2xl"></i>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">등록된 카드가 없습니다</h3>
                <p className="text-sm text-gray-500 mb-6">대여료 자동결제를 위해 카드를 등록해주세요</p>
                <button
                  onClick={() => setShowCardRegisterModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  <i className="ri-add-line mr-2"></i>
                  카드 등록하기
                </button>
              </div>
            )}
            {showCardRegisterModal && (
              <CardRegisterModal
                onClose={() => setShowCardRegisterModal(false)}
                userId={profileData?.id || null}
              />
            )}
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

// 카드 등록 모달 컴포넌트
function CardRegisterModal({ onClose, userId }: { onClose: () => void; userId: number | null }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [tossPaymentsLoaded, setTossPaymentsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 모달이 닫힐 때 상태 초기화 및 타임아웃 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsRegistering(false);
    };
  }, []);

  const handleCardRegister = async () => {
    if (!tossPaymentsLoaded) {
      setError('결제 시스템을 초기화하는데 시간이 걸리고 있습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!userId) {
      setError('사용자 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    // 기존 타임아웃이 있으면 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      setIsRegistering(true);
      setError(null);

      // Toss Payments 클라이언트 키
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      
      if (!clientKey) {
        setIsRegistering(false);
        setError('Toss Payments 클라이언트 키가 설정되지 않았습니다.\n환경 변수 NEXT_PUBLIC_TOSS_CLIENT_KEY를 확인해주세요.');
        return;
      }

      if (typeof window === 'undefined' || !(window as any).TossPayments) {
        setIsRegistering(false);
        setError('결제 시스템을 초기화하는데 실패했습니다. 페이지를 새로고침해주세요.');
        return;
      }

      const tossPayments = (window as any).TossPayments(clientKey);

      // 빌링키 발급을 위한 카드 인증 요청
      // requestBillingAuth는 리다이렉트 방식으로 작동합니다.
      // successUrl은 절대 URL이어야 하며, http:// 또는 https://로 시작해야 합니다.
      // 토스페이먼츠 관리자 콘솔에 등록된 도메인만 사용할 수 있습니다.
      const baseUrl = window.location.origin;
      
      // customerKey는 백엔드와 동일하게 사용자 ID 기반으로 생성
      // 백엔드에서도 "customer_" + user.getId() 형식을 사용하므로 일치시켜야 함
      const customerKey = `customer_${userId}`;
      
      // successUrl과 failUrl을 단순하게 설정 (쿼리 파라미터 포함)
      // 토스페이먼츠가 리다이렉트할 때 쿼리 파라미터를 추가할 수 있습니다.
      const successUrl = `${baseUrl}/profile?cardRegister=success`;
      const failUrl = `${baseUrl}/profile?cardRegister=fail`;
      
      console.log('카드 인증 요청 시작:', { successUrl, failUrl, baseUrl, customerKey, userId });
      
      // 타임아웃 설정: 3초 후에도 리다이렉트가 발생하지 않으면 상태 초기화
      // requestBillingAuth는 즉시 리다이렉트를 수행해야 하므로 3초면 충분합니다
      timeoutRef.current = setTimeout(() => {
        console.warn('카드 인증 타임아웃: 리다이렉트가 발생하지 않았습니다.');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsRegistering(false);
        setError('카드 인증 창이 열리지 않았습니다.\n\n가능한 원인:\n1. 팝업 차단기가 활성화되어 있음\n2. 브라우저가 리다이렉트를 차단함\n3. 토스페이먼츠 서버 연결 문제\n\n해결 방법:\n- 팝업 차단을 해제하고 다시 시도해주세요.\n- 다른 브라우저로 시도해보세요.');
      }, 3000);
      
      try {
        // 현재 URL 저장 (리다이렉트 확인용)
        const currentUrl = window.location.href;
        
        // requestBillingAuth 호출
        // 이 함수는 리다이렉트를 수행하므로 Promise가 완료되지 않을 수 있습니다
        console.log('requestBillingAuth 호출 시작...');
        
        // requestBillingAuth를 비동기로 호출하되, 에러만 catch
        tossPayments.requestBillingAuth('카드', {
          customerKey: customerKey,
          successUrl: successUrl,
          failUrl: failUrl,
        }).catch((error: any) => {
          // 즉시 에러가 발생한 경우에만 처리
          console.error('requestBillingAuth 즉시 에러:', error);
          
          // 타임아웃 정리
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          setIsRegistering(false);
          
          if (error.message && (error.message.includes('successUrl') || error.message.includes('URL'))) {
            setError(`URL 설정 오류가 발생했습니다.\n\n성공 URL: ${successUrl}\n실패 URL: ${failUrl}\n\n토스페이먼츠 관리자 콘솔에서 이 URL들을 등록했는지 확인해주세요.`);
          } else {
            setError(error.message || '카드 인증 요청에 실패했습니다. 다시 시도해주세요.');
          }
        });

        // requestBillingAuth 호출 후 짧은 시간 대기하여 리다이렉트 여부 확인
        // 리다이렉트가 발생하면 이 코드는 실행되지 않습니다
        setTimeout(() => {
          // 페이지가 여전히 같은 위치에 있는지 확인
          if (window.location.href === currentUrl && timeoutRef.current) {
            console.log('리다이렉트가 발생하지 않았습니다. 타임아웃 핸들러가 처리합니다.');
            // 타임아웃 핸들러가 이미 처리하므로 여기서는 아무것도 하지 않음
          }
        }, 1000);
        
      } catch (urlError: any) {
        // 타임아웃 정리
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        console.error('requestBillingAuth 호출 중 에러:', urlError);
        
        // successUrl 오류인 경우 더 자세한 정보 제공
        if (urlError.message && (urlError.message.includes('successUrl') || urlError.message.includes('URL'))) {
          setIsRegistering(false);
          setError(`URL 설정 오류가 발생했습니다.\n\n성공 URL: ${successUrl}\n실패 URL: ${failUrl}\n\n토스페이먼츠 관리자 콘솔에서 이 URL들을 등록했는지 확인해주세요.`);
          return;
        }
        
        // 기타 에러
        setIsRegistering(false);
        setError(urlError.message || '카드 인증 요청에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      // requestBillingAuth는 리다이렉트를 수행하므로 여기까지 도달하지 않습니다.
      // 성공 시 successUrl로 리다이렉트되고, useEffect에서 authKey를 처리합니다.
      // 모달은 리다이렉트로 인해 자동으로 닫힙니다.
    } catch (err: any) {
      // 타임아웃 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.error('카드 등록 오류:', err);
      setIsRegistering(false);
      setError(err.message || '카드 등록에 실패했습니다.');
    }
  };

  const handleClose = () => {
    // 타임아웃 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRegistering(false);
    setError(null);
    onClose();
  };

  // 토스페이먼츠 스크립트 로드 확인
  useEffect(() => {
    // 스크립트가 이미 로드되어 있는지 확인
    if (typeof window !== 'undefined' && (window as any).TossPayments) {
      setTossPaymentsLoaded(true);
    }
  }, []);

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1"
        onLoad={() => {
          console.log('토스페이먼츠 스크립트 로드 완료');
          setTossPaymentsLoaded(true);
        }}
        onError={() => {
          console.error('토스페이먼츠 스크립트 로드 실패');
          setError('결제 시스템을 로드하는데 실패했습니다. 인터넷 연결을 확인해주세요.');
        }}
      />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">카드 등록</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isRegistering}
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <i className="ri-information-line mr-2"></i>
                카드 정보는 토스페이먼츠를 통해 안전하게 처리되며, 저장되지 않습니다.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isRegistering}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCardRegister}
                disabled={isRegistering || !tossPaymentsLoaded}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!tossPaymentsLoaded 
                  ? '결제 시스템 로딩 중...' 
                  : isRegistering 
                  ? '카드 인증 창 열기 중...' 
                  : '카드 인증하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
