'use client';

import { FormData } from './types';

interface Step2DetailInfoProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step2DetailInfo({ formData, onInputChange, onNext, onPrevious }: Step2DetailInfoProps) {
  const isFormValid = formData.purchaseDate && formData.defects && formData.rentalStartDate && formData.rentalEndDate;

  return (
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
          onChange={(e) => onInputChange('purchaseDate', e.target.value)}
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          하자 사항 (상태)
        </label>
        <textarea
          value={formData.defects}
          onChange={(e) => onInputChange('defects', e.target.value)}
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
          onChange={(e) => onInputChange('precautions', e.target.value)}
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
              onChange={(e) => onInputChange('rentalStartDate', e.target.value)}
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">종료일</label>
            <input
              type="date"
              value={formData.rentalEndDate}
              onChange={(e) => onInputChange('rentalEndDate', e.target.value)}
              min={formData.rentalStartDate}
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
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
          onClick={onNext}
          disabled={!isFormValid}
          className={`flex-1 py-4 rounded-2xl font-medium transition-all whitespace-nowrap cursor-pointer ${
            isFormValid
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}

