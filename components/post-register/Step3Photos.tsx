'use client';

import { FormData } from './types';

interface Step3PhotosProps {
  formData: FormData;
  onInputChange: (field: string, value: string | string[]) => void;
  onPhotoAdd: () => void;
  onPhotoRemove: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step3Photos({ 
  formData, 
  onPhotoAdd, 
  onPhotoRemove, 
  onNext, 
  onPrevious 
}: Step3PhotosProps) {
  return (
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
              onClick={() => onPhotoRemove(index)}
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
            onClick={onPhotoAdd}
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
          onClick={onPrevious}
          className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-medium hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          이전
        </button>
        <button
          onClick={onNext}
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
}

