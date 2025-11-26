'use client';

import { FormData } from './types';

// 참고자료 타입
interface EvidenceItem {
  title: string;
  url: string;
}

// AI 응답 데이터 타입 정의
interface AiSuggestion {
  min: number;
  point: number;
  max: number;
  deposit: number | null;

  // ✅ 각각의 이유
  priceReason?: string;
  depositReason?: string;
  ruleReason?: string;

  // ✅ 참고자료
  evidence?: EvidenceItem[];

  confidence?: number;
  decision?: string;

  // ✅ 참고 가격 정보 (시장 데이터 또는 판매가 대비 역계산)
  referenceUrl?: string;
  referenceType?: string; // "MARKET_DATA" 또는 "REVERSE_CALCULATION" 등
  referencePrice?: number;
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
            
            {/* 신뢰감 강조 배지 */}
            <div className="mb-4 flex items-center gap-2 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>시장 데이터 기반 분석</span>
              </span>
              {aiSuggestion.evidence && aiSuggestion.evidence.length > 0 && (
                <span className="text-gray-400">•</span>
              )}
              {aiSuggestion.evidence && aiSuggestion.evidence.length > 0 && (
                <span>{aiSuggestion.evidence.length}개 참고 자료 활용</span>
              )}
            </div>

            {/* 가격 범위 제안 */}
            <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl mb-4 text-sm">
              <div className="text-center flex-1 border-r border-gray-200">
                <span className="block text-gray-500 text-xs">최소</span>
                <span className="font-semibold text-gray-700">
                  {aiSuggestion.min?.toLocaleString()}원
                </span>
              </div>
              <div className="text-center flex-1 border-r border-gray-200">
                <span className="block text-purple-600 text-xs font-bold">추천 (기준)</span>
                <span className="font-bold text-purple-700">
                  {aiSuggestion.point?.toLocaleString()}원
                </span>
              </div>
              <div className="text-center flex-1">
                <span className="block text-gray-500 text-xs">최대</span>
                <span className="font-semibold text-gray-700">
                  {aiSuggestion.max?.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* ✅ 이유 카드들 */}
            <div className="space-y-3">
              {aiSuggestion.priceReason && (
                <div className="bg-white p-3 rounded-xl border border-purple-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-purple-700">
                      💡 대여료 책정 배경
                    </p>
                    {/* 참고 가격 정보 표시 (판매가 기준 역계산일 때만 표시) */}
                    {aiSuggestion.referenceType && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-orange-100 text-orange-700 border border-orange-200">
                        📊 판매가 기준 역계산
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-2">
                    {aiSuggestion.priceReason}
                  </p>
                  {/* 참고 URL 표시 (판매가 기준 역계산일 때만 표시) */}
                  {aiSuggestion.referenceUrl && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <a
                        href={aiSuggestion.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition-all hover:gap-2"
                      >
                        <span>🔗</span>
                        <span className="underline">
                          판매가 참고 링크 확인하기
                        </span>
                        <span>→</span>
                      </a>
                      {aiSuggestion.referencePrice && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          참고 가격: {aiSuggestion.referencePrice.toLocaleString()}원
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {aiSuggestion.depositReason && (
                <div className="bg-white p-3 rounded-xl border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-1">
                    💰 보증금 책정 배경
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiSuggestion.depositReason}
                  </p>
                </div>
              )}

              {aiSuggestion.ruleReason && (
                <div className="bg-white p-3 rounded-xl border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-1">
                    📜 대여 규칙 / 주의사항 제안 배경
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiSuggestion.ruleReason}
                  </p>
                </div>
              )}

              {/* ✅ 참고자료 카드 리스트 */}
              {aiSuggestion.evidence && aiSuggestion.evidence.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    🔍 추가 참고 자료
                  </p>
                  <div className="space-y-2">
                    {aiSuggestion.evidence.map((item, index) => (
                      <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white/80 border border-gray-200 hover:border-purple-300 hover:shadow-sm rounded-xl px-3 py-2 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                            <span className="text-[13px] text-purple-600">📎</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {item.title || '제목 없는 참고자료'}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {item.url}
                            </p>
                          </div>
                          <span className="text-[11px] text-purple-500 font-semibold flex-shrink-0">
                            열기 →
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* 이하 기존 폼 영역 그대로 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          일일 대여료
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.dailyPrice}
            onChange={(e) =>
              onInputChange('dailyPrice', e.target.value.replace(/[^0-9,]/g, ''))
            }
            placeholder="10,000"
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            원
          </span>
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
            onChange={(e) =>
              onInputChange('deposit', e.target.value.replace(/[^0-9,]/g, ''))
            }
            placeholder="100,000"
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            원
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          보증금은 물품 손상 방지를 위해 받는 금액으로, 반납 후 확인 시 물품 손상이 있을 시 대여자에게 자동 청구됩니다. 
        </p>
        <p className="text-xs text-gray-500 mt-1">
          대여자의 물품 손실 시 배상 가격은 대여 규칙에 기재하고 신고해주세요
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대여 규칙
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
            <h3 className="font-medium text-yellow-800 text-sm mb-1">
              설정 가이드
            </h3>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Ai 가격 제안 리포트의 신뢰도와 기준을 참고하세요</li>
              <li>• 필요한 사항은 수정해서 설정해주세요.</li>
              <li>• 필요 시 반납 연체에 따른 연체료도 대여 규칙에 기재해주세요.</li>
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
