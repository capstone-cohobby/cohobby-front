'use client';

import { FormData } from './types';

interface Step4PriceProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onPrevious: () => void;
}

export default function Step4Price({ formData, onInputChange, onSubmit, onPrevious }: Step4PriceProps) {
  const isFormValid = formData.dailyPrice && formData.weeklyPrice && formData.deposit;

  return (
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
            onChange={(e) => onInputChange('dailyPrice', e.target.value.replace(/[^0-9,]/g, ''))}
            placeholder="10,000"
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">원</span>
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
            onChange={(e) => onInputChange('weeklyPrice', e.target.value.replace(/[^0-9,]/g, ''))}
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
            onChange={(e) => onInputChange('deposit', e.target.value.replace(/[^0-9,]/g, ''))}
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
          onClick={onPrevious}
          className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-medium hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          이전
        </button>
        <button
          onClick={onSubmit}
          disabled={!isFormValid}
          className={`flex-1 py-4 rounded-2xl font-medium transition-all whitespace-nowrap cursor-pointer ${
            isFormValid
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          등록 완료
        </button>
      </div>
    </div>
  );
}

