
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
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

  // 품명 자동완성 데이터
  const productSuggestions = [
    '미러리스 카메라', 'DSLR 카메라', '액션캠', '드론', '짐벌',
    '골프채 세트', '골프백', '골프화', '골프공', 
    '테니스 라켓', '배드민턴 라켓', '탁구채',
    '클라이밍 하네스', '클라이밍 로프', '등반화', '헬멧',
    '자전거', '자전거 헬멧', '자전거 용품',
    '축구공', '농구공', '야구 글러브', '야구 배트',
    '요가 매트', '덤벨', '바벨', '운동기구',
    '스키', '스노우보드', '스키복', '보드복',
    '다이빙 장비', '웨트슈트', '오리발', '마스크',
    '기타', '베이스 기타', '키보드', '드럼', '바이올린', '첼로',
    '캠핑 텐트', '침낭', '캠핑 의자', '랜턴', '버너',
    '등산 배낭', '등산화', '등산 스틱', '등산복',
    '낚시대', '릴', '낚시 의자', '쿨러박스',
    '보드게임', '닌텐도 스위치', 'VR 헤드셋', '게임패드',
    '반려동물 캐리어', '펫 카메라', '자동급식기',
    '마술 용품', '마술 카드', '마술 도구',
    '화구', '이젤', '캔버스', '물감', '붓'
  ];

  const categories = {
    '관람': ['콘서트', '뮤지컬/오페라', '스포츠경기'],
    '스포츠': ['골프', '테니스/배드민턴/탁구', '클라이밍/러닝', '자전거', '축구/야구/농구', '헬스/요가', '보드/스키', '스쿠버 다이빙', '격투기/검도'],
    '악기': ['기타', '피아노', '악보', '현악기', '관악기'],
    '액티비티': ['캠핑', '등산', '낚시'],
    '촬영': ['카메라', '드론', '영상장비', '천체 관측'],
    '게임': ['보드게임', '닌텐도/Wii', 'VR'],
    '기타': ['반려동물 용품', '마술 용품', '미술 용품']
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 품명 입력 시 자동완성 표시
    if (field === 'productName') {
      setShowSuggestions(value.length > 0);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({ ...prev, productName: suggestion }));
    setShowSuggestions(false);
  };

  const filteredSuggestions = productSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(formData.productName.toLowerCase())
  ).slice(0, 6);

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category: category,
      subCategory: ''
    }));
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

  const handlePhotoRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    alert('상품이 성공적으로 등록되었습니다!');
    router.push('/');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">물품 등록하기</h1>
        <p className="text-gray-500 text-sm">어떤 물품을 등록하시나요?</p>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          품명
        </label>
        <input
          type="text"
          value={formData.productName}
          onChange={(e) => handleInputChange('productName', e.target.value)}
          onFocus={() => setShowSuggestions(formData.productName.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="예: 미러리스 카메라, 클라이밍 로프, 골프채 세트"
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        
        {/* 자동완성 드롭다운 */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left text-sm text-gray-7 hover:bg-purple-50 hover:text-purple-600 transition-colors cursor-pointer first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-search-line text-gray-400 text-xs"></i>
                  </div>
                  {suggestion}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          카테고리
        </label>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {Object.keys(categories).slice(0, 4).map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                formData.category === category
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                <i className={`${categoryIcons[category]} text-lg`}></i>
              </div>
              <div className="text-xs font-medium">{category}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {Object.keys(categories).slice(4).map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                formData.category === category
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                <i className={`${categoryIcons[category]} text-lg`}></i>
              </div>
              <div className="text-xs font-medium">{category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 세부 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          세부 카테고리
        </label>
        <div className="flex flex-wrap gap-2">
          {categories[formData.category]?.map((subCategory) => (
            <button
              key={subCategory}
              onClick={() => handleInputChange('subCategory', subCategory)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                formData.subCategory === subCategory
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              {subCategory}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setCurrentStep(2)}
        disabled={!formData.productName}
        className={`w-full py-4 rounded-2xl font-medium transition-all whitespace-nowrap cursor-pointer ${
          formData.productName
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        다음 단계
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">물품 정보 입력</h1>
        <p className="text-gray-500 text-sm">물품에 대한 자세한 정보를 알려주세요</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          구입 일시
        </label>
        <input
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          하자 사항 (상태)
        </label>
        <textarea
          value={formData.defects}
          onChange={(e) => handleInputChange('defects', e.target.value)}
          placeholder="물품의 상태와 하자 사항을 자세히 적어주세요. 예: 우측 상단에 작은 긁힘 있음, 전체적으로 깨끗한 상태"
          rows={4}
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          주의사항(보증금 규칙)
        </label>
        <textarea
          value={formData.precautions}
          onChange={(e) => handleInputChange('precautions', e.target.value)}
          placeholder="보증금 및 대여 시 주의할 점을 적어주세요. 예: 물에 젖지 않도록 주의, 충격에 민감함, 연체 시 추가 요금 발생"
          rows={3}
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          대여 가능 기간
        </label>
        <p className="text-xs text-gray-500 mb-3">* 물품을 대여해줄 수 있는 기간입니다.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">시작일</label>
            <input
              type="date"
              value={formData.rentalStartDate}
              onChange={(e) => handleInputChange('rentalStartDate', e.target.value)}
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">종료일</label>
            <input
              type="date"
              value={formData.rentalEndDate}
              onChange={(e) => handleInputChange('rentalEndDate', e.target.value)}
              min={formData.rentalStartDate}
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-medium hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          이전
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={!formData.purchaseDate || !formData.defects || !formData.rentalStartDate || !formData.rentalEndDate}
          className={`flex-1 py-4 rounded-2xl font-medium transition-all whitespace-nowrap cursor-pointer ${
            formData.purchaseDate && formData.defects && formData.rentalStartDate && formData.rentalEndDate
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">사진 등록</h1>
        <p className="text-gray-500 text-sm">물품의 전체 모습과 하자 부분을 확인할 수 있도록 여러 장의 사진을 올려주세요. (최대 5장)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {formData.photos.map((photo, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={photo}
              alt={`사진 ${index + 1}`}
              className="w-full h-full object-cover rounded-2xl object-top"
            />
            <button
              onClick={() => handlePhotoRemove(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                대표
              </div>
            )}
          </div>
        ))}

        {formData.photos.length < 5 && (
          <button
            onClick={handlePhotoAdd}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="ri-camera-line text-2xl"></i>
            </div>
            <span className="text-xs mt-2">사진 업로드</span>
          </button>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-white text-sm"></i>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 text-sm mb-1">사진 등록 팁</h3>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• 첫 번째 사진이 대표 사진으로 노출됩니다</li>
              <li>• 물품의 전체적인 모습을 담아주세요</li>
              <li>• 하자가 있다면 해당 부분도 촬영해주세요</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-medium hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          이전
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          disabled={formData.photos.length === 0}
          className={`flex-1 py-4 rounded-2xl font-medium transition-all whitespace-nowrap cursor-pointer ${
            formData.photos.length > 0
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">가격 설정</h1>
        <p className="text-gray-500 text-sm">대여료와 보증금을 설정해주세요</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          일일 대여료
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.dailyPrice}
            onChange={(e) => handleInputChange('dailyPrice', e.target.value.replace(/[^0-9,]/g, ''))}
            placeholder="10,000"
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-5 0 text-sm">원</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          주간 대여료
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.weeklyPrice}
            onChange={(e) => handleInputChange('weeklyPrice', e.target.value.replace(/[^0-9,]/g, ''))}
            placeholder="60,000"
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">원</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">7일 기준 대여료입니다</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          보증금
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.deposit}
            onChange={(e) => handleInputChange('deposit', e.target.value.replace(/[^0-9,]/g, ''))}
            placeholder="100,000"
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">원</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          보증금은 물품 손상 방지를 위해 받는 금액으로, 반납 후 전액 환불됩니다
        </p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-line text-white text-sm"></i>
          </div>
          <div>
            <h3 className="font-medium text-yellow-800 text-sm mb-1">가격 설정 가이드</h3>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• 주간 대여료는 일일 대여료의 5-6배가 적당해요</li>
              <li>• 보증금은 물품 가치의 10-30% 정도로 설정하세요</li>
              <li>• 비슷한 물품들의 가격을 참고해보세요</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(3)}
          className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-medium hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.dailyPrice || !formData.weeklyPrice || !formData.deposit}
          className={`flex-1 py-4 rounded-2xl font-medium transition-all whitespace-nowrap cursor-pointer ${
            formData.dailyPrice && formData.weeklyPrice && formData.deposit
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          등록 완료
        </button>
      </div>
    </div>
  );

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
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
