'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllReports, getReportsByStatus, approveReport, getCurrentUser, type ReportResponse } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

const REPORT_TYPES: Record<string, string> = {
  MINOR_DAMAGE: '경미파손',
  DAMAGE: '파손',
  RETURN_DELAY: '반납 연체',
  NOT_AS_DESCRIBED: '설명과 다름',
  SCAM: '사기',
  PROHIBITED_ITEM: '금지물품',
  ABUSE: '욕설',
  OTHER: '기타',
};

const REPORT_STATUSES = ['OPEN', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'];

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('OPEN'); // 기본값을 OPEN으로 설정하여 접수된 신고만 표시
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 권한 체크
  useEffect(() => {
    const checkAdminAuth = async () => {
      if (!isAuthenticated()) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      try {
        const user = await getCurrentUser();
        // role 정보 확인 (백엔드에서 role 필드 추가됨)
        if (!user.role || user.role !== 'ADMIN') {
          alert('관리자 권한이 필요합니다.');
          router.push('/login');
          return;
        }
        setIsCheckingAuth(false);
        loadReports();
      } catch (error: any) {
        alert('관리자 권한이 필요합니다.');
        router.push('/login');
      }
    };

    checkAdminAuth();
  }, [router]);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadReports();
    }
  }, [selectedStatus, isCheckingAuth]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      let reportsData: ReportResponse[];
      if (selectedStatus === 'ALL') {
        reportsData = await getAllReports();
      } else {
        reportsData = await getReportsByStatus(selectedStatus);
      }
      setReports(reportsData);
    } catch (error: any) {
      alert(`신고 목록 조회 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reportId: number, approved: boolean) => {
    if (!confirm(approved ? '이 신고를 승인하시겠습니까? (자동결제가 실행됩니다.)' : '이 신고를 거부하시겠습니까?')) {
      return;
    }

    setProcessingId(reportId);
    try {
      await approveReport(reportId, approved);
      alert(approved ? '신고가 승인되었습니다.' : '신고가 거부되었습니다.');
      loadReports();
    } catch (error: any) {
      alert(`처리 실패: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">관리자 - 신고 관리</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            메인으로
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">신고 목록</h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">전체</option>
              {REPORT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <p className="text-center text-gray-500 py-8">로딩 중...</p>
          ) : reports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">신고 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          report.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          report.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          report.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                          {REPORT_TYPES[report.type] || report.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        대여 ID: {report.rentId} | 신고자 ID: {report.userId}
                        {report.delayDays && ` | 연체일수: ${report.delayDays}일`}
                      </p>
                      <p className="text-gray-700 mb-2">{report.content}</p>
                      {report.imageUrl && (
                        <a
                          href={report.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          이미지 보기
                        </a>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        접수일: {new Date(report.createdAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {report.status === 'OPEN' || report.status === 'IN_PROGRESS' ? (
                        <>
                          <button
                            onClick={() => handleApprove(report.id, true)}
                            disabled={processingId === report.id}
                            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                          >
                            {processingId === report.id ? '처리 중...' : '승인'}
                          </button>
                          <button
                            onClick={() => handleApprove(report.id, false)}
                            disabled={processingId === report.id}
                            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                          >
                            {processingId === report.id ? '처리 중...' : '거부'}
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {report.status === 'APPROVED' ? '승인됨' : 
                           report.status === 'REJECTED' ? '거부됨' : '처리 완료'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

