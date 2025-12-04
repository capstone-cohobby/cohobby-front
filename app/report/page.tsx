'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReport, getMyReports, type ReportResponse, type CreateReportRequest } from '@/lib/api';

const REPORT_TYPES = {
  // 보증금 자동결제 관련 (빌려준 사람만)
  MINOR_DAMAGE: '경미파손',
  DAMAGE: '파손',
  RETURN_DELAY: '반납 연체',
  // 양방향 신고
  NOT_AS_DESCRIBED: '설명과 다름',
  SCAM: '사기',
  PROHIBITED_ITEM: '금지물품',
  ABUSE: '욕설',
  OTHER: '기타',
};

export default function ReportPage() {
  const router = useRouter();
  const [rentId, setRentId] = useState<string>('');
  const [reportType, setReportType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [delayDays, setDelayDays] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myReports, setMyReports] = useState<ReportResponse[]>([]);
  const [showMyReports, setShowMyReports] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentId || !reportType || !title || !content) {
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
        rentId: parseInt(rentId),
        type: reportType,
        title,
        content,
        delayDays: delayDays ? parseInt(delayDays) : undefined,
      };

      await createReport(request);
      alert('신고가 접수되었습니다.');
      // 폼 초기화
      setRentId('');
      setReportType('');
      setTitle('');
      setContent('');
      setImageUrl('');
      setDelayDays('');
    } catch (error: any) {
      alert(`신고 접수 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMyReports = async () => {
    try {
      const reports = await getMyReports();
      setMyReports(reports);
      setShowMyReports(true);
    } catch (error: any) {
      alert(`신고 목록 조회 실패: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">신고하기</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">신고 접수</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                대여 ID *
              </label>
              <input
                type="number"
                value={rentId}
                onChange={(e) => setRentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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
                <optgroup label="보증금 자동결제 관련 (빌려준 사람만)">
                  <option value="MINOR_DAMAGE">경미파손</option>
                  <option value="DAMAGE">파손</option>
                  <option value="RETURN_DELAY">반납 연체</option>
                  <option value="OTHER">기타</option>
                </optgroup>
                <optgroup label="양방향 신고">
                  <option value="NOT_AS_DESCRIBED">설명과 다름</option>
                  <option value="SCAM">사기</option>
                  <option value="PROHIBITED_ITEM">금지물품</option>
                  <option value="ABUSE">욕설</option>
                  <option value="OTHER">기타</option>
                </optgroup>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '제출 중...' : '신고 접수'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">내 신고 목록</h2>
            <button
              onClick={handleLoadMyReports}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              {showMyReports ? '새로고침' : '조회'}
            </button>
          </div>

          {showMyReports && (
            <div className="space-y-4">
              {myReports.length === 0 ? (
                <p className="text-gray-500">신고 내역이 없습니다.</p>
              ) : (
                myReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-gray-600">
                          {REPORT_TYPES[report.type as keyof typeof REPORT_TYPES] || report.type}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        report.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        report.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        report.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{report.content}</p>
                    <p className="text-xs text-gray-500">
                      접수일: {new Date(report.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

