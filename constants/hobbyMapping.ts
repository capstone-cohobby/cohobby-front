// 매핑 실패시 사용할 기본값 (기타 카테고리의 미술 용품 등으로 설정하거나 0으로 처리)
export const DEFAULT_HOBBY_ID = 30; 

export const HOBBY_ID_BY_CATEGORY_SUBCATEGORY: Record<string, number> = {
  // 스포츠
  '스포츠|골프': 1,
  '스포츠|테니스/배드민턴/탁구': 2,
  '스포츠|클라이밍/러닝': 3,
  '스포츠|자전거': 4,
  '스포츠|축구/야구/농구': 5,
  '스포츠|헬스/요가': 6,
  '스포츠|보드/스키': 7,
  '스포츠|스쿠버 다이빙': 8,
  '스포츠|격투기/검도': 9,

  // 악기
  '악기|기타': 10,
  '악기|피아노': 11,
  '악기|악보': 12,
  '악기|현악기': 13,
  '악기|관악기': 14,

  // 액티비티
  '액티비티|캠핑': 15,
  '액티비티|등산': 16,
  '액티비티|낚시': 17,

  // 촬영
  '촬영|카메라': 18,
  '촬영|드론': 19,
  '촬영|영상장비': 20,
  '촬영|천체 관측': 21,

  // 게임
  '게임|보드게임': 22,
  '게임|닌텐도/Wii': 23,
  '게임|VR': 24,

  // 관람
  '관람|콘서트': 25,
  '관람|뮤지컬/오페라': 26,
  '관람|스포츠경기': 27,

  // 기타
  '기타|반려동물 용품': 28,
  '기타|마술 용품': 29,
  '기타|미술 용품': 30,
};

export const getHobbyId = (category: string, subCategory: string): number => {
  // category나 subCategory가 undefined일 경우 방어 로직
  if (!category || !subCategory) return DEFAULT_HOBBY_ID;
  
  const key = `${category}|${subCategory}`;
  return HOBBY_ID_BY_CATEGORY_SUBCATEGORY[key] ?? DEFAULT_HOBBY_ID;
};