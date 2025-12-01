'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import { getMyHobbyStats, HobbyStatsResponse } from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

export default function HobbyPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [stats, setStats] = useState<HobbyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 로그인 체크
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [router]);

  const categories = ['전체', '스포츠', '악기', '액티비티', '촬영', '게임', '관람'];

  // 취미별 아이콘 매핑
  const hobbyIconMap: Record<string, string> = {
    '골프': 'ri-golf-ball-line',
    '테니스/배드민턴/탁구': 'ri-basketball-line',
    '클라이밍/러닝': 'ri-run-line',
    '자전거': 'ri-bike-line',
    '축구/야구/농구': 'ri-football-line',
    '헬스/요가': 'ri-heart-pulse-line',
    '보드/스키': 'ri-snowflake-line',
    '스쿠버 다이빙': 'ri-water-percent-line',
    '격투기/검도': 'ri-sword-line',
    '기타': 'ri-music-line',
    '피아노': 'ri-piano-line',
    '악보': 'ri-file-music-line',
    '현악기': 'ri-music-2-line',
    '관악기': 'ri-music-2-line',
    '캠핑': 'ri-tent-line',
    '등산': 'ri-mountain-line',
    '낚시': 'ri-fish-line',
    '카메라': 'ri-camera-line',
    '드론': 'ri-flight-takeoff-line',
    '영상장비': 'ri-video-line',
    '천체 관측': 'ri-telescope-line',
    '보드게임': 'ri-gamepad-line',
    '닌텐도/Wii': 'ri-gamepad-line',
    'VR': 'ri-vr-line',
    '콘서트': 'ri-mic-line',
    '뮤지컬/오페라': 'ri-mic-line',
    '스포츠경기': 'ri-ticket-line',
  };

  // 취미별 색상 매핑 (카테고리별)
  const getHobbyColor = (categoryName: string | null, contributed: boolean): string => {
    if (!contributed) {
      return 'from-gray-300 to-gray-400';
    }
    
    const categoryColorMap: Record<string, string> = {
      '스포츠': 'from-green-400 to-green-600',
      '악기': 'from-blue-400 to-blue-600',
      '액티비티': 'from-orange-400 to-orange-600',
      '촬영': 'from-purple-400 to-purple-600',
      '게임': 'from-indigo-400 to-indigo-600',
      '관람': 'from-pink-400 to-pink-600',
    };
    
    return categoryColorMap[categoryName || ''] || 'from-gray-400 to-gray-600';
  };

  // 레벨 계산
  const getLevel = (progress: number): string => {
    if (progress >= 80) return '전문가';
    if (progress >= 50) return '중급자';
    return '초급자';
  };

  // 취미 통계 조회
  useEffect(() => {
    const fetchHobbyStats = async () => {
      setLoading(true);
      try {
        const data = await getMyHobbyStats();
        setStats(data);
      } catch (error) {
        console.error('취미 통계 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHobbyStats();
  }, []);

  const filteredHobbies = stats 
    ? (selectedCategory === '전체' 
        ? stats.hobbies 
        : stats.hobbies.filter(hobby => hobby.categoryName === selectedCategory))
    : [];

  const totalExperience = stats?.totalExperience || 0;
  const totalItems = stats?.totalRentedItems || 0;
  const contributedHobbies = stats?.contributedHobbiesCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <Header />
      
      <div className="pt-20 pb-20">
        {/* 헤더 섹션 */}
        <div className="px-4 py-6">
          <div className="bg-gradient-to-r from-purple-500 to-green-400 rounded-3xl p-6 text-white shadow-lg">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold mb-2">나의 취미 현황</h1>
              <p className="text-sm opacity-90">취미를 통해 새로운 경험을 만들어보세요</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{totalExperience.toLocaleString()}</div>
                <div className="text-xs opacity-90">총 경험치</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{totalItems}</div>
                <div className="text-xs opacity-90">대여한 물품</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{contributedHobbies}</div>
                <div className="text-xs opacity-90">기여한 취미</div>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 취미 목록 */}
        <div className="px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-loader-4-line text-gray-400 text-2xl animate-spin"></i>
              </div>
              <p className="text-gray-500 text-sm">로딩 중...</p>
            </div>
          ) : filteredHobbies.length > 0 ? (
            <div className="space-y-4">
              {filteredHobbies.map((hobby) => {
                const progress = Math.min(hobby.progress, 100);
                const level = getLevel(progress);
                const icon = hobbyIconMap[hobby.name] || 'ri-star-line';
                const color = getHobbyColor(hobby.categoryName, hobby.contributed);
                
                return (
                  <div key={hobby.hobbyId} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center`}>
                          <i className={`${icon} text-white text-xl`}></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{hobby.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{level}</span>
                            {hobby.contributed && (
                              <div className="flex items-center gap-1">
                                <i className="ri-award-line text-green-500 text-sm"></i>
                                <span className="text-xs text-green-600 font-medium">기여 완료</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">{progress.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">{hobby.score.toLocaleString()} XP</div>
                      </div>
                    </div>

                    {/* 진척도 바 */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>진척도</span>
                        <span>{hobby.score.toLocaleString()} / 1,000,000 XP</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-2xl text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
                        아이템 둘러보기
                      </button>
                      <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors duration-300">
                        <i className="ri-share-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-star-line text-gray-400 text-3xl"></i>
              </div>
              <h3 className="font-bold text-gray-600 text-lg mb-2">
                {selectedCategory === '전체' ? '취미 정보가 없어요' : '해당 카테고리에 취미가 없어요'}
              </h3>
              <p className="text-gray-500 text-sm">다른 카테고리를 확인해보세요</p>
            </div>
          )}
        </div>

        {/* 하단 여백 */}
        <div className="h-8"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}