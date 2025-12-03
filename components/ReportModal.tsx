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
  const [imageUrl, setImageUrl] = useState('');
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

    setIsSubmitting(true);
    try {
      const request: CreateReportRequest = {
        rentId,
        type: reportType,
        title,
        content,
        imageUrl: imageUrl || undefined,
        delayDays: delayDays ? parseInt(delayDays) : undefined,
      };

      await createReport(request);
      alert('신고가 접수되었습니다.');
      // 폼 초기화
      setReportType('');
      setTitle('');
      setContent('');
      setImageUrl('');
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이미지 URL (선택)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
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

