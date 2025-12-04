'use client';

import { useState } from 'react';
import { createReport, type CreateReportRequest } from '@/lib/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentId: number;
  reportTypes: Array<{ value: string; label: string }>;
  isOwner?: boolean; // owner인 경우 보증금 자동결제 관련 신고 가능
}

export default function ReportModal({ isOpen, onClose, rentId, reportTypes, isOwner = false }: ReportModalProps) {
  const [reportType, setReportType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [delayDays, setDelayDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType || !title || !content) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (reportType === 'RETURN_DELAY' && (!delayDays || parseInt(delayDays) <= 0)) {
      alert('반납 연체 신고 시 연체일수를 입력해주세요.');
      return;
    }

    if (imageFiles.length > 5) {
      alert('이미지는 최대 5개까지 업로드할 수 있습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const request: CreateReportRequest = {
        rentId,
        type: reportType,
        title,
        content,
        images: imageFiles.length > 0 ? imageFiles : undefined,
        delayDays: delayDays ? parseInt(delayDays) : undefined,
      };

      await createReport(request);
      alert('신고가 접수되었습니다.');
      // 폼 초기화
      setReportType('');
      setTitle('');
      setContent('');
      setImageFiles([]);
      setImagePreviews([]);
      setDelayDays('');
      onClose();
    } catch (error: any) {
      alert(`신고 접수 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">신고하기</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신고 유형 *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {reportType === 'RETURN_DELAY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연체일수 *
              </label>
              <input
                type="number"
                value={delayDays}
                onChange={(e) => setDelayDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 (선택, 최대 5개)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={preview}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = [...imageFiles];
                      const newPreviews = [...imagePreviews];
                      newFiles.splice(index, 1);
                      newPreviews.splice(index, 1);
                      setImageFiles(newFiles);
                      setImagePreviews(newPreviews);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {imageFiles.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const remainingSlots = 5 - imageFiles.length;
                      const filesToAdd = files.slice(0, remainingSlots);
                      
                      if (files.length > remainingSlots) {
                        alert(`최대 ${remainingSlots}개까지 추가할 수 있습니다.`);
                      }
                      
                      if (filesToAdd.length > 0) {
                        setImageFiles([...imageFiles, ...filesToAdd]);
                        
                        // 미리보기 생성
                        filesToAdd.forEach((file) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreviews((prev) => [...prev, reader.result as string]);
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                      
                      // input 초기화 (같은 파일 다시 선택 가능하도록)
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <div className="text-center">
                    <i className="ri-add-line text-2xl text-gray-400"></i>
                    <p className="text-xs text-gray-400 mt-1">추가</p>
                  </div>
                </label>
              )}
            </div>
            {imageFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {imageFiles.length}/5 개의 이미지가 선택되었습니다.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '제출 중...' : '신고 접수'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

