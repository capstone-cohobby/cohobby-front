'use client';

import { FormData } from './types';

// AI 응답 데이터 타입 정의
interface AiSuggestion {
  min: number;
  point: number;
  max: number;
  deposit: number | null;
  reason: string;
  confidence?: number;
  decision?: string;
}

// 인터페이스 통합 (중복 제거함)
interface Step4PriceProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  aiSuggestion: AiSuggestion | null;
  isAiLoading: boolean;
}

export default function Step4Price({ 
  formData, 
  onInputChange, 
  onSubmit, 
  onPrevious,
  aiSuggestion,
  isAiLoading
}: Step4PriceProps) {
  const isFormValid = formData.dailyPrice && formData.deposit;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">가격 설정</h1>
        <p className="text-gray-500 text-sm">대여료와 보증금을 설정해주세요</p>
      </div>

      {/* 🤖 AI 분석 결과 / 로딩 섹션 */}
      <div className="mb-6">
        {isAiLoading ? (
          // [CASE 1] 로딩 중 UI
          <div className="bg-purple-50 border border-purple-100 p-5 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
             <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-purple-700 font-medium text-sm">
               AI가 적정 가격을 분석하고 있어요...
             </span>
          </div>
        ) : aiSuggestion ? (
          // [CASE 2] 분석 완료 UI
          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <h3 className="font-bold text-purple-900">AI 가격 제안 리포트</h3>
              {aiSuggestion.confidence && (
                 <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-purple-200">
                   신뢰도 {Math.round(aiSuggestion.confidence * 100)}%
                 </span>
              )}
            </div>
            
            {/* 가격 범위 제안 */}
            <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl mb-3 text-sm">
               <div className="text-center flex-1 border-r border-gray-200">
                  <span className="block text-gray-500 text-xs">최소</span>
                  <span className="font-semibold text-gray-700">{aiSuggestion.min?.toLocaleString()}원</span>
               </div>
               <div className="text-center flex-1 border-r border-gray-200">
                  <span className="block text-purple-600 text-xs font-bold">추천 (기준)</span>
                  <span className="font-bold text-purple-700">{aiSuggestion.point?.toLocaleString()}원</span>
               </div>
               <div className="text-center flex-1">
                  <span className="block text-gray-500 text-xs">최대</span>
                  <span className="font-semibold text-gray-700">{aiSuggestion.max?.toLocaleString()}원</span>
               </div>
            </div>

            {/* AI 분석 이유 (Reason) */}
            <div className="bg-white p-3 rounded-xl border border-purple-100">
               <p className="text-sm text-gray-700 leading-relaxed">
                 <span className="font-bold text-purple-800 mr-2">💡 분석 이유:</span>
                 {aiSuggestion.reason}
               </p>
            </div>
          </div>
        ) : null}
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

      <div className="bg-yellow-50 p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-line text-white text-sm"></i>
          </div>
          <div>
            <h3 className="font-medium text-yellow-800 text-sm mb-1">가격 설정 가이드</h3>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Ai 가격 제안 리포트를 참고해보세요!</li>
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