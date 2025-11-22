'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';
import { getHobbyId, DEFAULT_HOBBY_ID } from '../../../constants/hobbyMapping';
import Step1BasicInfo from '../../../components/post-register/Step1BasicInfo';
import Step2DetailInfo from '../../../components/post-register/Step2DetailInfo';
import Step3Photos from '../../../components/post-register/Step3Photos';
import Step4Price from '../../../components/post-register/Step4Price';
import { FormData as PostFormData } from '../../../components/post-register/types';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const getApiUrl = (endpoint: string) => {
  return `${baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

export default function NewPostPage() {
  const router = useRouter();
  
  // [수정] State 위치 이동: 컴포넌트 내부로!
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [hobbyId, setHobbyId] = useState<number | null>(null);
  const [postId, setPostId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    goods: '',
    category: '스포츠',
    hobby: '',
    purchaseDate: '',
    defects: '',
    precautions: '',
    rentalStartDate: '',
    rentalEndDate: '',
    photos: [],
    dailyPrice: '',
    weeklyPrice: '',
    deposit: ''
  });

  useEffect(() => {
    if (currentStep === 1) {
      if (formData.category && formData.hobby) {
        const id = getHobbyId(formData.category, formData.hobby);
        setHobbyId(id);
      } else {
        setHobbyId(DEFAULT_HOBBY_ID);
      }
    }
  }, [currentStep, formData.category, formData.hobby]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoAdd = () => {
    if (formData.photos.length < 5) {
      const newPhoto = `https://readdy.ai/api/search-image?query=Product%20item%20placeholder%20photo%20for%20rental%20listing%20clean%20white%20background%20simple%20modern%20style&width=300&height=300&seq=photo${formData.photos.length + 1}&orientation=squarish`;
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto]
      }));
    }
  };

  const handlePhotoRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Step 1: 게시글 생성
  const handleStep1Next = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
  
      if (!accessToken) {
        alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
        router.push('/login');
        return;
      }
  
      const apiUrl = getApiUrl('/posts');
      const requestBody = { 
        goods: formData.goods,
        hobbyId: hobbyId 
      };
  
      console.log('=== API Request Info ===');
      console.log('URL:', apiUrl);
      
      const doRequest = async (token?: string) => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
  
        return fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          mode: 'cors',
          credentials: 'include',
        });
      };
  
      let response = await doRequest(accessToken || undefined);
  
      // 토큰 재발급 로직
      if (response.status === 401 && refreshToken) {
        console.log('401 발생 → /auth/token/refresh');
        const refreshResponse = await fetch(getApiUrl('/auth/token/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
  
        if (refreshResponse.ok) {
          const { accessToken: newAccessToken } = await refreshResponse.json();
          localStorage.setItem('accessToken', newAccessToken);
          response = await doRequest(newAccessToken);
        } else {
          alert('인증 세션이 만료되었습니다.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
          return;
        }
      }
  
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`서버 오류 (${response.status}): ${text}`);
      }
  
      const createdPost = await response.json();
      const realId = createdPost.result?.postId || createdPost.postId; 

      if (realId) {
        setPostId(realId);
        localStorage.setItem('tempPostId', String(realId)); 
        console.log("✅ ID 저장 완료:", realId);
      } else {
        alert("서버 응답에서 ID를 찾을 수 없습니다.");
        return; 
      }
  
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Post creation error:', error);
      alert('게시글 생성 중 오류가 발생했어요: ' + (error?.message ?? '알 수 없는 오류'));
    }
  };
  

  // Step 2: 물품 정보 업데이트 후 AI 호출
  const handleStep2Next = async () => {
    const targetPostId = postId || Number(localStorage.getItem('tempPostId'));

    if (!targetPostId) {
      alert('게시글 ID가 없습니다. 처음부터 다시 작성해주세요.');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        router.push('/login');
        return;
    }

    try {
      // 1. 상세 정보 저장
      const response = await fetch(`${baseURL}/posts/${targetPostId}/details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          purchasedAt: formData.purchaseDate,
          defectStatus: formData.defects,
          availableFrom: formData.rentalStartDate,
          availableUntil: formData.rentalEndDate
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '물품 정보 업데이트 실패');
      }

      console.log('✅ 상세 정보 저장 완료');
      
      // 2. [비동기] AI 호출 (결과 대기 안 함)
      setIsAiLoading(true); 

      fetch(`${baseURL}/posts/${targetPostId}/ai-estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: formData.goods,
          bought_at: formData.purchaseDate,
          precondition: formData.defects
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.isSuccess && data.result) {
          console.log("🤖 AI 계산 완료:", data.result);
          setAiSuggestion({
            min: data.result.suggestedLowPrice,
            point: data.result.suggestedPointPrice,
            max: data.result.suggestedHighPrice,
            deposit: data.result.suggestedDeposit,
            reason: data.result.reason,
            confidence: data.result.confidence 
          });
          
          // 🔥 [자동 입력] 대여료, 보증금, 주의사항 자동 채우기
          setFormData(prev => ({
             ...prev,
             dailyPrice: data.result.suggestedPointPrice?.toLocaleString() || '',
             deposit: data.result.suggestedDeposit?.toLocaleString() || '',
             // AI가 준 caution을 precautions에 매핑
             precautions: data.result.caution || '' 
          }));
        }
      })
      .catch(err => console.error("AI 호출 에러:", err))
      .finally(() => setIsAiLoading(false)); 

      setCurrentStep(3);
    } catch (error: any) {
      console.error('Post update error:', error);
      alert('물품 정보 업데이트 중 오류가 발생했어요: ' + (error?.message ?? ''));
    }
  };

  // Step 3: 사진 등록 (임시 패스)
  const handleStep3Next = async () => {
    const targetPostId = postId || Number(localStorage.getItem('tempPostId'));
    if (!targetPostId) {
      alert('게시글 ID가 없습니다.');
      return;
    }

    if (formData.photos.length === 0) {
      alert('최소 1장의 사진을 등록해주세요.');
      return;
    }

    console.log("🚧 사진 등록 API 건너뛰고 4단계로 이동");
    setCurrentStep(4);
  };

  // Step 4: 가격 설정 (최종 등록)
  const handleSubmit = async () => {
    const targetPostId = postId || Number(localStorage.getItem('tempPostId'));
    if (!targetPostId) {
      alert('게시글 정보를 찾을 수 없습니다.');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    try {
      // [수정] URL: /pricing, Method: PATCH
      const response = await fetch(`${baseURL}/posts/${targetPostId}/pricing`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // 토큰 필수
        },
        body: JSON.stringify({
          dailyPrice: parseInt(formData.dailyPrice.replace(/,/g, '')),
          deposit: parseInt(formData.deposit.replace(/,/g, '')),
          caution: formData.precautions
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '게시글 상세 정보 업데이트 실패');
      }

      const result = await response.json();
      console.log('✅ 최종 등록 완료:', result);

      // 메인 화면으로 이동
      router.push('/');
    } catch (error: any) {
      console.error('Final submit error:', error);
      alert('등록 중 오류가 발생했어요: ' + (error?.message ?? ''));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-24">
        {/* 상단 스텝 바 */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${step < currentStep ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>기본정보</span>
            <span>물품정보</span>
            <span>사진등록</span>
            <span>가격설정</span>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="px-4 pb-6">
          {currentStep === 1 && (
            <Step1BasicInfo
              formData={formData}
              onInputChange={handleInputChange}
              onNext={handleStep1Next}
            />
          )}
          {currentStep === 2 && (
            <Step2DetailInfo
              formData={formData}
              onInputChange={handleInputChange}
              onNext={handleStep2Next}
              onPrevious={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <Step3Photos
              formData={formData}
              onInputChange={handleInputChange}
              onPhotoAdd={handlePhotoAdd}
              onPhotoRemove={handlePhotoRemove}
              onNext={handleStep3Next}
              onPrevious={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <Step4Price
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onPrevious={() => setCurrentStep(3)}
              aiSuggestion={aiSuggestion}
              isAiLoading={isAiLoading}
            />
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}