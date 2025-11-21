// hobbyMapping.ts

export const DEFAULT_HOBBY_ID = 1 as const;

export const HOBBY_ID_BY_CATEGORY_SUBCATEGORY: Record<string, number> = {
  '스포츠|골프': 1,
  '스포츠|테니스/배드민턴/탁구': 5,
  '스포츠|클라이밍/러닝': 3,
  '스포츠|자전거': 4,
  '스포츠|축구/야구/농구': 5,
  '스포츠|헬스/요가': 5,
  '스포츠|보드/스키': 5,
  '스포츠|스쿠버 다이빙': 5,
  '스포츠|격투기/검도': 5,
  '악기|기타': 2,
  '악기|피아노': 2,
  '악기|악보': 2,
  '악기|현악기': 2,
  '악기|관악기': 2,
  '액티비티|캠핑': 3,
  '액티비티|등산': 3,
  '액티비티|낚시': 3,
  '촬영|카메라': 4,
  '촬영|드론': 4,
  '촬영|영상장비': 4,
  '촬영|천체 관측': 4,
  '게임|보드게임': 6,
  '게임|닌텐도/Wii': 6,
  '게임|VR': 6,
  '관람|콘서트': 1,
  '관람|뮤지컬/오페라': 1,
  '관람|스포츠경기': 1,
  '기타|반려동물 용품': 1,
  '기타|마술 용품': 1,
  '기타|미술 용품': 1,
};

export const getHobbyId = (category: string, subCategory: string): number => {
  const key = `${category}|${subCategory}`;
  return HOBBY_ID_BY_CATEGORY_SUBCATEGORY[key] ?? DEFAULT_HOBBY_ID;
};

