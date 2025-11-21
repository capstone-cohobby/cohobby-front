'use client';

import { useState } from 'react';
import { FormData } from './types';
import { productSuggestions, categories, categoryIcons } from './constants';

interface Step1BasicInfoProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onNext: () => void;
}

export default function Step1BasicInfo({ formData, onInputChange, onNext }: Step1BasicInfoProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    onInputChange('productName', suggestion);
    setShowSuggestions(false);
  };

  const filteredSuggestions = productSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(formData.productName.toLowerCase())
  ).slice(0, 6);

  const handleCategoryChange = (category: string) => {
    onInputChange('category', category);
    onInputChange('subCategory', '');
  };

  return (
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
          onChange={(e) => {
            onInputChange('productName', e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
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
              onClick={() => onInputChange('subCategory', subCategory)}
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
        onClick={onNext}
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
}

