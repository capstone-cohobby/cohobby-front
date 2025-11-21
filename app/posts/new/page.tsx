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
import { FormData } from '../../../components/post-register/types';

// baseURL 설정 - Swagger 문서: http://43.203.228.76:8080/docs/swagger-ui/index.html
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://43.203.228.76:8080';

// API 경로 확인을 위한 헬퍼 함수
const getApiUrl = (endpoint: string) => {
  // Swagger 문서를 보면 실제 API 경로가 다를 수 있음
  // 예: /api/posts, /posts 등
  return `${baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

export default function NewPostPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [hobbyId, setHobbyId] = useState<number | null>(null);
  const [postId, setPostId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    category: '스포츠',
    subCategory: '',
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

  // Step 1이 렌더링될 때와 subCategory가 변경될 때 hobbyId 업데이트
  useEffect(() => {
    if (currentStep === 1) {
      if (formData.category && formData.subCategory) {
        const id = getHobbyId(formData.category, formData.subCategory);
        setHobbyId(id);
      } else {
        setHobbyId(DEFAULT_HOBBY_ID);
      }
    }
  }, [currentStep, formData.category, formData.subCategory]);

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

  // Step 1에서 다음 단계 클릭 시 post 생성
  const handleStep1Next = async () => {
    try {
      const userId = localStorage.getItem('userId') || '1';
      const currentHobbyId = hobbyId || 1;
      
      const goods = {
        productName: formData.productName,
        category: formData.category,
        subCategory: formData.subCategory
      };

      // Swagger 문서에서 확인한 실제 API 경로 사용
      // Swagger: http://43.203.228.76:8080/docs/swagger-ui/index.html#/Post/createPost
      const apiUrl = getApiUrl('/posts');
      const requestBody = {
        goods: goods,
        hobbyId: currentHobbyId,
        userId: parseInt(userId)
      };
      
      console.log('=== API Request Info ===');
      console.log('API URL:', apiUrl);
      console.log('baseURL:', baseURL);
      console.log('Request Method: POST');
      console.log('Request Body:', requestBody);
      console.log('========================');

      let response: Response;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
          mode: 'cors', // CORS 모드 명시
          credentials: 'omit' // credentials는 필요시 'include'로 변경
        });
        
        console.log('=== API Response Info ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        console.log('========================');
      } catch (fetchError: any) {
        console.error('=== Fetch Error Details ===');
        console.error('Error Message:', fetchError.message);
        console.error('Error Name:', fetchError.name);
        console.error('Error Type:', fetchError.constructor.name);
        console.error('API URL:', apiUrl);
        console.error('==========================');
        
        // 네트워크 에러인지 CORS 에러인지 구분
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
          throw new Error(`네트워크 연결 실패: ${apiUrl}에 연결할 수 없습니다. 서버가 실행 중인지, URL이 올바른지 확인해주세요.`);
        } else if (fetchError.message.includes('CORS') || fetchError.name === 'TypeError') {
          throw new Error(`CORS 오류: 백엔드 서버의 CORS 설정을 확인해주세요. (${apiUrl})`);
        } else {
          throw new Error(`요청 실패: ${fetchError.message}`);
        }
      }

      if (!response.ok) {
        const text = await response.text();
        console.error('API Error - Status:', response.status);
        console.error('API Error - URL:', apiUrl);
        console.error('API Error - Response:', text);
        throw new Error(`서버 오류 (${response.status}): ${text || '게시글 생성 실패'}`);
      }

      const createdPost = await response.json();
      console.log('Post created:', createdPost);
      
      if (createdPost.id) {
        setPostId(createdPost.id);
      }
      
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Post creation error:', error);
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      });
      alert('게시글 생성 중 오류가 발생했어요: ' + (error?.message ?? '알 수 없는 오류'));
    }
  };

  // Step 2에서 다음 버튼 클릭 시 물품 정보 업데이트
  const handleStep2Next = async () => {
    if (!postId) {
      alert('게시글 정보를 찾을 수 없습니다. 처음부터 다시 시도해주세요.');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/posts/${postId}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purchaseDate: formData.purchaseDate,
          defects: formData.defects,
          precautions: formData.precautions,
          rentalStartDate: formData.rentalStartDate,
          rentalEndDate: formData.rentalEndDate
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '물품 정보 업데이트 실패');
      }

      const updatedPost = await response.json();
      console.log('Post updated:', updatedPost);
      
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Post update error:', error);
      alert('물품 정보 업데이트 중 오류가 발생했어요: ' + (error?.message ?? ''));
    }
  };

  // Step 3에서 다음 버튼 클릭 시 사진 등록
  const handleStep3Next = async () => {
    if (!postId) {
      alert('게시글 정보를 찾을 수 없습니다. 처음부터 다시 시도해주세요.');
      return;
    }

    if (formData.photos.length === 0) {
      alert('최소 1장의 사진을 등록해주세요.');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/posts/${postId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photos: formData.photos.map((photo, index) => ({
            url: photo,
            isMain: index === 0,
            order: index + 1
          }))
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '사진 등록 실패');
      }

      const result = await response.json();
      console.log('Photos uploaded:', result);
      
      setCurrentStep(4);
    } catch (error: any) {
      console.error('Photo upload error:', error);
      alert('사진 등록 중 오류가 발생했어요: ' + (error?.message ?? ''));
    }
  };

  // Step 4에서 등록 완료 - updateDetailPost API 호출
  const handleSubmit = async () => {
    if (!postId) {
      alert('게시글 정보를 찾을 수 없습니다. 처음부터 다시 시도해주세요.');
      return;
    }

    try {
      // updateDetailPost API 호출
      const response = await fetch(`${baseURL}/posts/${postId}/detail`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dailyPrice: parseInt(formData.dailyPrice.replace(/,/g, '')),
          weeklyPrice: parseInt(formData.weeklyPrice.replace(/,/g, '')),
          deposit: parseInt(formData.deposit.replace(/,/g, ''))
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '게시글 상세 정보 업데이트 실패');
      }

      const updatedPost = await response.json();
      console.log('Post detail updated:', updatedPost);

      // 메인 화면으로 이동
      router.push('/');
    } catch (error: any) {
      console.error('Post detail update error:', error);
      alert('등록 중 오류가 발생했어요: ' + (error?.message ?? ''));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-24">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                  }`}></div>
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
            />
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

