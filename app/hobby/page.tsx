'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';

export default function HobbyPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const categories = ['전체', '스포츠', '악기', '액티비티', '촬영', '게임'];

  const hobbies = [
    {
      id: 1,
      name: '골프',
      category: '스포츠',
      progress: 75,
      level: '중급자',
      contributed: true,
      icon: 'ri-golf-ball-line',
      color: 'from-green-400 to-green-600',
      items: 15,
      experience: 1250
    },
    {
      id: 2,
      name: '기타',
      category: '악기',
      progress: 45,
      level: '초급자',
      contributed: false,
      icon: 'ri-music-line',
      color: 'from-blue-400 to-blue-600',
      items: 8,
      experience: 680
    },
    {
      id: 3,
      name: '캠핑',
      category: '액티비티',
      progress: 90,
      level: '전문가',
      contributed: true,
      icon: 'ri-tent-line',
      color: 'from-green-400 to-green-600',
      items: 23,
      experience: 2100
    },
    {
      id: 4,
      name: '사진촬영',
      category: '촬영',
      progress: 60,
      level: '중급자',
      contributed: true,
      icon: 'ri-camera-line',
      color: 'from-purple-400 to-purple-600',
      items: 12,
      experience: 940
    },
    {
      id: 5,
      name: '테니스',
      category: '스포츠',
      progress: 30,
      level: '초급자',
      contributed: false,
      icon: 'ri-basketball-line',
      color: 'from-gray-400 to-gray-600',
      items: 5,
      experience: 420
    },
    {
      id: 6,
      name: '게임',
      category: '게임',
      progress: 85,
      level: '전문가',
      contributed: true,
      icon: 'ri-gamepad-line',
      color: 'from-indigo-400 to-indigo-600',
      items: 18,
      experience: 1850
    }
  ];

  const filteredHobbies = selectedCategory === '전체' 
    ? hobbies 
    : hobbies.filter(hobby => hobby.category === selectedCategory);

  const totalExperience = hobbies.reduce((sum, hobby) => sum + hobby.experience, 0);
  const totalItems = hobbies.reduce((sum, hobby) => sum + hobby.items, 0);
  const contributedHobbies = hobbies.filter(hobby => hobby.contributed).length;

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
          <div className="space-y-4">
            {filteredHobbies.map((hobby) => (
              <div key={hobby.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${hobby.color} rounded-2xl flex items-center justify-center`}>
                      <i className={`${hobby.icon} text-white text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{hobby.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{hobby.level}</span>
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
                    <div className="text-sm font-medium text-gray-600">{hobby.progress}%</div>
                    <div className="text-xs text-gray-500">{hobby.experience} XP</div>
                  </div>
                </div>

                {/* 진척도 바 */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>진척도</span>
                    <span>{hobby.items}개 아이템 대여</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${
                        hobby.contributed 
                          ? 'from-green-400 to-green-600' 
                          : 'from-gray-300 to-gray-400'
                      } rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${hobby.progress}%` }}
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
            ))}
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-8"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}