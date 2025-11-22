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


  const filteredSuggestions = productSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(formData.goods.toLowerCase())
  ).slice(0, 6);

  const handleCategoryChange = (category: string) => {
    onInputChange('category', category);
  };

  const handleHobbyChange = (hobby: string) => {
    onInputChange('hobby', hobby);
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
          value={formData.goods}
          onChange={(e) => {
            onInputChange('goods', e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(formData.goods.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="예: 미러리스 카메라, 클라이밍 로프, 골프채 세트"
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

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
          {categories[formData.category]?.map((hobby) => (
            <button
              key={hobby}
              onClick={() => handleHobbyChange(hobby)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                formData.hobby === hobby
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              {hobby}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!formData.goods}
        className={`w-full py-4 rounded-2xl font-medium transition-all whitespace-nowrap cursor-pointer ${
          formData.goods
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        다음 단계
      </button>
    </div>
  );
}

