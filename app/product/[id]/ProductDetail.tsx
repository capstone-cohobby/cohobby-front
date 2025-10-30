
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '../../../components/Header';
import BottomNavigation from '../../../components/BottomNavigation';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 예시 대여 가능 날짜들 (모든 날짜 포함)
  const availableDates = [
    '2024-01-13', '2024-01-14', '2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19',
    '2024-01-20', '2024-01-21', '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26',
    '2024-01-27', '2024-01-28', '2024-01-29', '2024-01-30', '2024-01-31', '2024-02-01', '2024-02-02',
    '2024-02-03', '2024-02-04', '2024-02-05', '2024-02-06', '2024-02-07', '2024-02-08', '2024-02-09',
    '2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13', '2024-02-14', '2024-02-15', '2024-02-16',
    '2024-02-17', '2024-02-18', '2024-02-19', '2024-02-20', '2024-02-21', '2024-02-22', '2024-02-23',
    '2024-02-24', '2024-02-25', '2024-02-26', '2024-02-27', '2024-02-28', '2024-02-29'
  ];

  const handleRentalInquiry = () => {
    setShowDatePicker(true);
  };

  const handleContinueToChat = () => {
    if (selectedStartDate && selectedEndDate) {
      router.push('/chat/1');
    }
  };

  const allProducts = [
    {
      id: '1',
      title: '콘서트 쌍안경',
      owner: '뮤직러버',
      verified: true,
      rating: 4.9,
      reviews: 15,
      location: '강남구 역삼동',
      time: '보통 1시간 이내',
      dailyPrice: '3,000원/일',
      weeklyPrice: '18,000원/주',
      deposit: '30,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Professional%20binoculars%20for%20concerts%20and%20theater%20performances%2C%20compact%20black%20opera%20glasses%20on%20clean%20white%20background%2C%20elegant%20design%20for%20cultural%20events&width=400&height=400&seq=binoculars1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Close%20up%20view%20of%20concert%20binoculars%20lens%20detail%2C%20professional%20opera%20glasses%20macro%20photography%20on%20clean%20white%20background&width=400&height=400&seq=binoculars2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Concert%20binoculars%20side%20view%20showing%20ergonomic%20design%20and%20adjustment%20knobs%20on%20clean%20white%20background%2C%20professional%20photography&width=400&height=400&seq=binoculars3&orientation=squarish'
      ],
      available: true,
      category: '관람',
      subCategory: '콘서트',
      purchaseDate: '2023-03-15',
      defects: '전체적으로 깨끗한 상태입니다. 렌즈에 미세한 먼지가 있을 수 있으나 사용에는 전혀 문제없습니다.',
      precautions: '렌즈 청소 시 전용 천을 사용해주세요. 충격에 주의하시고, 습기가 많은 곳에 보관하지 마세요. 연체 시 일일 대여료의 50% 추가 요금이 발생합니다.',
      rentalPeriod: '2024-01-15 ~ 2024-06-30'
    },
    {
      id: '3',
      title: 'Wilson 골프채 세트',
      owner: '골프마니아',
      verified: true,
      rating: 4.8,
      reviews: 31,
      location: '분당구 정자동',
      time: '보통 2시간 이내',
      dailyPrice: '25,000원/일',
      weeklyPrice: '150,000원/주',
      deposit: '200,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Wilson%20golf%20club%20set%20professional%20equipment%20with%20golf%20bag%2C%20complete%20iron%20and%20driver%20set%20on%20clean%20white%20background%2C%20premium%20golf%20gear&width=400&height=400&seq=golf1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Close%20up%20of%20Wilson%20golf%20club%20heads%20showing%20iron%20numbers%20and%20brand%20logo%2C%20professional%20golf%20equipment%20photography%20on%20white%20background&width=400&height=400&seq=golf2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Wilson%20golf%20bag%20with%20clubs%20arranged%20showing%20full%20set%20contents%2C%20professional%20golf%20equipment%20on%20clean%20white%20background&width=400&height=400&seq=golf3&orientation=squarish'
      ],
      available: true,
      category: '스포츠',
      subCategory: '골프',
      purchaseDate: '2023-05-20',
      defects: '드라이버 헤드에 사용감이 있으나 성능에는 문제없습니다. 골프백 바퀴 부분에 약간의 스크래치가 있습니다.',
      precautions: '골프채는 충격에 주의해서 다뤄주세요. 라운드 후 깨끗이 청소해서 반납 부탁드립니다. 분실 시 개별 클럽 가격으로 보상해주셔야 합니다.',
      rentalPeriod: '2024-01-01 ~ 2024-12-31'
    },
    {
      id: '4',
      title: '전문 클라이밍 장비 세트',
      owner: '암벽등반가',
      verified: true,
      rating: 4.9,
      reviews: 18,
      location: '서대문구 연희동',
      time: '보통 1시간 이내',
      dailyPrice: '15,000원/일',
      weeklyPrice: '90,000원/주',
      deposit: '100,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Professional%20rock%20climbing%20equipment%20set%20with%20harness%2C%20carabiners%2C%20and%20ropes%20on%20clean%20white%20background%2C%20safety%20climbing%20gear&width=400&height=400&seq=climbing1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Climbing%20harness%20close%20up%20showing%20safety%20buckles%20and%20gear%20loops%2C%20professional%20climbing%20equipment%20on%20white%20background&width=400&height=400&seq=climbing2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Climbing%20carabiners%20and%20safety%20equipment%20detail%20shot%2C%20professional%20mountaineering%20gear%20on%20clean%20white%20background&width=400&height=400&seq=climbing3&orientation=squarish'
      ],
      available: true,
      category: '스포츠',
      subCategory: '클라이밍/러닝',
      purchaseDate: '2023-08-10',
      defects: '하네스 패딩 부분에 약간의 사용감이 있습니다. 카라비너는 모두 정상 작동하며 안전검사 완료된 상태입니다.',
      precautions: '안전장비이므로 사용 전 반드시 점검해주세요. 로프는 날카로운 모서리에 닿지 않도록 주의하세요. 장비 손상 시 전액 보상 부탁드립니다.',
      rentalPeriod: '2024-03-01 ~ 2024-11-30'
    },
    {
      id: '5',
      title: 'Yamaha 어쿠스틱 기타',
      owner: '기타치는사람',
      verified: true,
      rating: 4.6,
      reviews: 27,
      location: '마포구 상암동',
      time: '보통 1시간 이내',
      dailyPrice: '8,000원/일',
      weeklyPrice: '45,000원/주',
      deposit: '80,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Yamaha%20acoustic%20guitar%20wooden%20musical%20instrument%20on%20clean%20white%20background%2C%20professional%20guitar%20product%20photography%20warm%20wood%20finish&width=400&height=400&seq=guitar1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Yamaha%20guitar%20headstock%20and%20tuning%20pegs%20close%20up%2C%20professional%20musical%20instrument%20photography%20on%20white%20background&width=400&height=400&seq=guitar2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Acoustic%20guitar%20sound%20hole%20and%20strings%20detail%2C%20Yamaha%20guitar%20close%20up%20photography%20on%20clean%20white%20background&width=400&height=400&seq=guitar3&orientation=squarish'
      ],
      available: true,
      category: '악기',
      subCategory: '기타',
      purchaseDate: '2023-02-28',
      defects: '바디 뒷면에 작은 스크래치가 2-3개 있으나 소리에는 영향 없습니다. 프렛은 깨끗한 상태입니다.',
      precautions: '습도와 온도 변화에 민감하니 케이스에 보관해주세요. 줄 교체가 필요한 경우 미리 연락 부탁드립니다. 넥 부분 충격 금지입니다.',
      rentalPeriod: '2024-01-01 ~ 2024-12-31'
    },
    {
      id: '7',
      title: '4인용 캠핑 텐트',
      owner: '캠핑러버',
      verified: true,
      rating: 4.7,
      reviews: 25,
      location: '용산구 이태원동',
      time: '보통 2시간 이내',
      dailyPrice: '12,000원/일',
      weeklyPrice: '70,000원/주',
      deposit: '60,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Four%20person%20camping%20tent%20outdoor%20equipment%20green%20and%20orange%20colors%20on%20clean%20white%20background%2C%20family%20camping%20gear&width=400&height=400&seq=tent1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Camping%20tent%20interior%20view%20showing%20spacious%204%20person%20capacity%2C%20outdoor%20equipment%20photography%20on%20white%20background&width=400&height=400&seq=tent2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Camping%20tent%20packed%20in%20carrying%20bag%20with%20stakes%20and%20accessories%2C%20outdoor%20gear%20on%20clean%20white%20background&width=400&height=400&seq=tent3&orientation=squarish'
      ],
      available: true,
      category: '액티비티',
      subCategory: '캠핑',
      purchaseDate: '2023-04-12',
      defects: '텐트 바닥에 미세한 구멍이 1개 있으나 방수 테이프로 보수되어 있습니다. 전체적으로 양호한 상태입니다.',
      precautions: '설치 시 날카로운 돌이나 가지를 제거 후 설치해주세요. 철거 시 완전히 건조 후 보관 부탁드립니다. 화기 근처 설치 금지입니다.',
      rentalPeriod: '2024-03-15 ~ 2024-10-30'
    },
    {
      id: '9',
      title: 'Canon EOS R5 미러리스',
      owner: '김포토',
      verified: true,
      rating: 4.8,
      reviews: 24,
      location: '강남구 역삼동',
      time: '보통 1시간 이내',
      dailyPrice: '25,000원/일',
      weeklyPrice: '140,000원/주',
      deposit: '300,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Canon%20EOS%20R5%20mirrorless%20camera%20professional%20photography%20equipment%20with%20lens%20on%20clean%20white%20background%2C%20product%20photography%20style%2C%20high%20quality%20DSLR%20camera&width=400&height=400&seq=camera1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Canon%20camera%20LCD%20screen%20and%20control%20buttons%20detail%2C%20professional%20camera%20equipment%20close%20up%20on%20white%20background&width=400&height=400&seq=camera2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Canon%20EOS%20R5%20camera%20with%20multiple%20lenses%20and%20accessories%2C%20professional%20photography%20equipment%20set%20on%20clean%20white%20background&width=400&height=400&seq=camera3&orientation=squarish'
      ],
      available: true,
      category: '촬영',
      subCategory: '카메라',
      purchaseDate: '2023-07-08',
      defects: '카메라 바디는 완벽한 상태입니다. 렌즈에 미세한 먼지가 있을 수 있으나 촬영에는 영향 없습니다.',
      precautions: '습기와 충격에 매우 민감합니다. 반드시 케이스에 보관하고 렌즈캡을 씌워주세요. SD카드는 포함되지 않습니다. 배터리는 충전된 상태로 드립니다.',
      rentalPeriod: '2024-01-01 ~ 2024-12-31'
    },
    {
      id: '11',
      title: 'Nintendo Switch OLED',
      owner: '게임러버',
      verified: true,
      rating: 4.9,
      reviews: 18,
      location: '서초구 서초동',
      time: '보통 30분 이내',
      dailyPrice: '10,000원/일',
      weeklyPrice: '55,000원/주',
      deposit: '40,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Nintendo%20Switch%20OLED%20gaming%20console%20with%20Joy-Con%20controllers%20on%20clean%20white%20background%2C%20modern%20gaming%20device%20product%20photography&width=400&height=400&seq=switch1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Nintendo%20Switch%20OLED%20screen%20display%20showing%20game%20interface%2C%20gaming%20console%20close%20up%20on%20white%20background&width=400&height=400&seq=switch2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Nintendo%20Switch%20accessories%20and%20Joy-Con%20controllers%20detail%2C%20gaming%20equipment%20on%20clean%20white%20background&width=400&height=400&seq=switch3&orientation=squarish'
      ],
      available: true,
      category: '게임',
      subCategory: '닌텐도/Wii',
      purchaseDate: '2023-09-22',
      defects: '본체와 조이콘 모두 완벽한 상태입니다. 화면에 보호필름이 부착되어 있습니다.',
      precautions: '조이콘 스틱은 부드럽게 조작해주세요. 물이나 음료수 근처에서 사용 금지입니다. 충전기와 게임 소프트웨어는 별도입니다.',
      rentalPeriod: '2024-01-10 ~ 2024-12-20'
    },
    {
      id: '13',
      title: '강아지 캐리어',
      owner: '펫러버',
      verified: true,
      rating: 4.7,
      reviews: 13,
      location: '성동구 성수동',
      time: '보통 1시간 이내',
      dailyPrice: '5,000원/일',
      weeklyPrice: '28,000원/주',
      deposit: '25,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Pet%20carrier%20bag%20for%20small%20dogs%20comfortable%20travel%20case%20with%20mesh%20windows%20on%20clean%20white%20background%2C%20pet%20transportation%20equipment&width=400&height=400&seq=carrier1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Pet%20carrier%20interior%20view%20showing%20comfortable%20padding%20and%20ventilation%2C%20dog%20travel%20bag%20on%20white%20background&width=400&height=400&seq=carrier2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Pet%20carrier%20side%20view%20showing%20mesh%20windows%20and%20carrying%20handles&width=400&height=400&seq=carrier3&orientation=squarish'
      ],
      available: true,
      category: '기타',
      subCategory: '반려동물 용품',
      purchaseDate: '2023-06-18',
      defects: '캐리어 바닥 패딩에 약간의 털이 묻어 있을 수 있습니다. 전체적으로 깨끗하게 관리되고 있습니다.',
      precautions: '사용 전후 소독 및 청소 부탁드립니다. 10kg 이하 소형견만 사용 가능합니다. 장거리 이동 시 중간중간 환기시켜주세요.',
      rentalPeriod: '2024-02-01 ~ 2024-11-30'
    },
    {
      id: '14',
      title: '테니스 라켓 세트',
      owner: '테니스왕',
      verified: true,
      rating: 4.7,
      reviews: 22,
      location: '강남구 청담동',
      time: '보통 1시간 이내',
      dailyPrice: '8,000원/일',
      weeklyPrice: '45,000원/주',
      deposit: '50,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Professional%20tennis%20racket%20set%20with%20tennis%20balls%20on%20clean%20white%20background%2C%20sports%20equipment%20for%20tennis%20game&width=400&height=400&seq=tennis1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Tennis%20racket%20head%20and%20string%20pattern%20close%20up%2C%20professional%20sports%20equipment%20photography%20on%20white%20background&width=400&height=400&seq=tennis2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=%D0%A2%D0%B5%D0%BD%D0%B8%D1%81%D0%BD%D1%8B%D0%B9%20%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%82%20%D0%BE%D0%B1%D0%BE%D1%80%D1%83%D0%B4%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F%20%D1%81%20%D0%BF%D0%BE%D0%BA%D1%80%D1%8B%D1%82%D0%B8%D0%B5%D0%BC%20%D1%80%D0%B0%D0%BA%D0%B5%D1%82%D0%BA%D0%B8%20%D0%B8%20%D0%B0%D0%BA%D1%81%D0%B5%D1%81%D1%81%D1%83%D0%B0%D1%80%D0%B0%D0%BC%D0%B8%2C%20%D1%81%D0%BF%D0%BE%D1%80%D1%82%D0%B8%D0%B2%D0%BD%D1%8B%D0%B9%20%D0%B8%D0%BD%D0%B2%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D1%8C%20%D0%BD%D0%B0%20%D1%87%D0%B8%D1%81%D1%82%D0%BE%D0%BC%20%D0%B1%D0%B5%D0%BB%D0%BE%D0%BC%20%D1%84%D0%BE%D0%BD%D0%B5&width=400&height=400&seq=tennis3&orientation=squarish'
      ],
      available: true,
      category: '스포츠',
      subCategory: '테니스/배드민턴/탁구',
      purchaseDate: '2023-03-25',
      defects: '라켓 프레임은 완벽한 상태이고, 스트링 장력도 적절합니다. 그립 테이프만 약간 사용감이 있습니다.',
      precautions: '라켓은 충격에 주의해서 사용해주세요. 사용 후 스트링에 묻은 먼지를 제거해주시면 감사하겠습니다.',
      rentalPeriod: '2024-03-01 ~ 2024-10-31'
    },
    {
      id: '15',
      title: '전자 키보드 피아노',
      owner: '피아노선생님',
      verified: true,
      rating: 4.8,
      reviews: 16,
      location: '서초구 반포동',
      time: '보통 2시간 이내',
      dailyPrice: '12,000원/일',
      weeklyPrice: '65,000원/주',
      deposit: '90,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Digital%20keyboard%20piano%20electronic%20musical%20instrument%20with%20keys%20on%20clean%20white%20background%2C%20modern%20music%20equipment&width=400&height=400&seq=keyboard1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Digital%20piano%20keys%20close%20up%20showing%20full%2088%20key%20layout%2C%20electronic%20keyboard%20musical%20instrument%20on%20white%20background&width=400&height=400&seq=keyboard2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Electronic%20keyboard%20control%20panel%20and%20display%20screen%2C%20digital%20piano%20interface%20on%20clean%20white%20background&width=400&height=400&seq=keyboard3&orientation=squarish'
      ],
      available: true,
      category: '악기',
      subCategory: '피아노',
      purchaseDate: '2023-01-12',
      defects: '모든 건반이 정상 작동하며 음색도 깨끗합니다. 스탠드에 약간의 사용감이 있습니다.',
      precautions: '전원 연결 시 주의하시고, 음량 조절에 신경 써주세요. 이동 시 키보드 덮개를 씌워 먼지를 방지해주세요.',
      rentalPeriod: '2024-01-15 ~ 2024-12-15'
    },
    {
      id: '16',
      title: '등산 배낭 60L',
      owner: '산악인',
      verified: true,
      rating: 4.6,
      reviews: 19,
      location: '노원구 상계동',
      time: '보통 1시간 이내',
      dailyPrice: '6,000원/일',
      weeklyPrice: '35,000원/주',
      deposit: '40,000원',
      images: [
        'https://readdy.ai/api/search-image?query=Large%20hiking%20backpack%2060L%20outdoor%20camping%20equipment%20with%20straps%20on%20clean%20white%20background%2C%20mountain%20climbing%20gear&width=400&height=400&seq=backpack1& orientation=squarish',
        'https://readdy.ai/api/search-image?query=Hiking%20backpack%20side%20view%20showing%20pockets%20and%20attachment%20points%2C%20outdoor%20equipment%20on%20white%20background&width=400&height=400&seq=backpack2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Hiking%20backpack%20shoulder%20straps%20and%20waist%20belt%20detail%2C%20mountain%20climbing%20equipment%20on%20clean%20white%20background&width=400&height=400&seq=backpack3&orientation=squarish'
      ],
      available: true,
      category: '액티비티',
      subCategory: '등산',
      purchaseDate: '2023-05-03',
      defects: '배낭 바닥 부분에 약간의 오염이 있으나 기능에는 문제없습니다. 지퍼는 모두 정상 작동합니다.',
      precautions: '무게 분산을 위해 적절히 짐을 배치해주세요. 날카로운 물건은 별도 포장 후 넣어주시고, 사용 후 이물질 제거 부탁드립니다.',
      rentalPeriod: '2024-03-01 ~ 2024-11-30'
    },
    {
      id: '17',
      title: 'DJI 드론 Mini 3',
      owner: '드론파일럿',
      verified: true,
      rating: 4.9,
      reviews: 21,
      location: '송파구 잠실동',
      time: '보통 1시간 이내',
      dailyPrice: '18,000원/일',
      weeklyPrice: '100,000원/주',
      deposit: '150,000원',
      images: [
        'https://readdy.ai/api/search-image?query=DJI%20Mini%203%20drone%20quadcopter%20with%20controller%20on%20clean%20white%20background%2C%20professional%20aerial%20photography%20equipment&width=400&height=400&seq=drone1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=DJI%20Mini%203%20drone%20close%20up%20showing%20camera%20and%20gimbal%20detail%2C%20professional%20drone%20equipment%20on%20white%20background&width=400&height=400&seq=drone2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=DJI%20drone%20controller%20and%20accessories%20set%2C%20aerial%20photography%20equipment%20on%20clean%20white%20background&width=400&height=400&seq=drone3&orientation=squarish'
      ],
      available: true,
      category: '촬영',
      subCategory: '드론',
      purchaseDate: '2023-08-30',
      defects: '드론과 컨트롤러 모두 완벽한 상태입니다. 짐벌 카메라도 정상 작동하며 화질이 선명합니다.',
      precautions: '비행 전 반드시 항공안전법을 확인하시고, 배터리 잔량을 체크해주세요. 강풍이나 비 오는 날 사용 금지입니다. 추락 시 전액 보상 부탁드립니다.',
      rentalPeriod: '2024-01-01 ~ 2024-12-31'
    },
    {
      id: '18',
      title: 'PlayStation 5',
      owner: '콘솔게이머',
      verified: true,
      rating: 4.8,
      reviews: 26,
      location: '마포구 홍대동',
      time: '보통 1시간 이내',
      dailyPrice: '15,000원/일',
      weeklyPrice: '85,000원/주',
      deposit: '80,000원',
      images: [
        'https://readdy.ai/api/search-image?query=PlayStation%205%20console%20with%20controller%20modern%20white%20gaming%20system%20on%20clean%20white%20background%2C%20next%20generation%20gaming%20device&width=400&height=400&seq=ps5_1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=PlayStation%205%20DualSense%20controller%20close%20up%20showing%20buttons%20and%20touchpad%2C%20gaming%20controller%20on%20white%20background&width=400&height=400&seq=ps5_2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=PlayStation%205%20console%20side%20view%20showing%20ports%20and%20ventilation%2C%20gaming%20system%20on%20clean%20white%20background&width=400&height=400&seq=ps5_3&orientation=squarish'
      ],
      available: true,
      category: '게임',
      subCategory: '닌텐도/Wii',
      purchaseDate: '2023-11-15',
      defects: '본체와 컨트롤러 모두 새것 같은 상태입니다. 패키지 박스와 모든 구성품이 포함됩니다.',
      precautions: '환기가 잘 되는 곳에 설치해주세요. 본체 위에 물건을 올리지 마시고, 게임 소프트웨어는 별도 대여입니다.',
      rentalPeriod: '2024-02-01 ~ 2024-12-31'
    }
  ];

  const product = allProducts.find(p => p.id === productId);

  // 달력 관련 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateAvailable = (dateString: string) => {
    // 모든 날짜를 대여 가능하게 변경 (주말 포함)
    return availableDates.includes(dateString);
  };

  const isDateSelected = (dateString: string) => {
    if (!selectedStartDate && !selectedEndDate) return false;
    if (selectedStartDate === dateString || selectedEndDate === dateString) return true;

    if (selectedStartDate && selectedEndDate) {
      const current = new Date(dateString);
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      return current >= start && current <= end;
    }

    return false;
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const todayString = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return dateString === todayString;
  };

  const handleDateClick = (dateString: string) => {
    if (!isDateAvailable(dateString)) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(dateString);
      setSelectedEndDate('');
    } else if (selectedStartDate && !selectedEndDate) {
      if (dateString >= selectedStartDate) {
        setSelectedEndDate(dateString);
      } else {
        setSelectedStartDate(dateString);
        setSelectedEndDate('');
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const calculatePrice = () => {
    if (!selectedStartDate || !selectedEndDate) return { total: 0, days: 0 };

    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const dailyPrice = 8000;
    const total = diffDays * dailyPrice;

    return { total, days: diffDays };
  };

  const { total, days } = calculatePrice();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    const daysArray = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        {daysArray.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10"></div>;
          }
          
          const dateString = formatDateString(year, month, day);
          const isSelected = isDateSelected(dateString);
          const isAvailable = isDateAvailable(dateString);
          const today = isToday(dateString);
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(dateString)}
              className={`h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-purple-500 text-white'
                  : isAvailable
                  ? 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } ${today ? 'font-bold' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    );
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <div className="px-4 pt-6 pb-32">
        {/* 상품 이미지 캐러셀 */}
        <div className="relative mb-6">
          <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 이미지 인디케이터 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* 상품 기본 정보 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-gray-800">{product.title}</h2>
              <div className="flex items-center gap-1">
                <i className="ri-verified-badge-fill text-blue-500"></i>
                <span className="text-sm text-blue-600">인증됨</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-600">소유자:</span>
              <span className="font-medium text-gray-800">{product.owner}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <i className="ri-star-fill text-yellow-400"></i>
                  <span className="font-bold text-gray-800">{product.rating}</span>
                  <span className="text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <i className="ri-map-pin-2-fill"></i>
                  <span>{product.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">응답 시간</div>
                <div className="text-sm text-gray-700">{product.time}</div>
              </div>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-gray-800 mb-3">가격 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">일일 대여료</span>
                <span className="font-bold text-purple-600">{product.dailyPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">주 대여료</span>
                <span className="font-bold text-purple-600">{product.weeklyPrice}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-600">보증금</span>
                <span className="font-bold text-red-600">{product.deposit}</span>
              </div>
            </div>
          </div>

          {/* 상품 상세 정보 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-gray-800 mb-3">상품 정보</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">카테고리</span>
                <span className="text-gray-800">{product.category} &gt; {product.subCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">구입일</span>
                <span className="text-gray-800">{product.purchaseDate}</span>
              </div>
            </div>
          </div>

          {/* 상품 상태 및 하자사항 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-gray-800 mb-3">상품 상태</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{product.defects}</p>
          </div>

          {/* 주의사항 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-8">
            <h3 className="font-bold text-gray-800 mb-3">주의사항 및 보증금 규칙</h3>
            <div className="text-gray-600 text-sm leading-relaxed">
              {showFullDescription ? (
                <div>
                  {product.precautions}
                  <button
                    onClick={() => setShowFullDescription(false)}
                    className="text-purple-600 font-medium ml-2 cursor-pointer"
                  >
                    간략히 보기
                  </button>
                </div>
              ) : (
                <div>
                  {product.precautions.length > 100 
                    ? `${product.precautions.substring(0, 100)}...`
                    : product.precautions
                  }
                  {product.precautions.length > 100 && (
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="text-purple-600 font-medium ml-2 cursor-pointer"
                    >
                      더보기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 대여하기 버튼 - 고정 위치 */}
      <div className="fixed bottom-24 left-0 right-0 px-4 bg-white/90 backdrop-blur-md py-4 border-t border-white/20 shadow-lg z-40">
        <button 
          onClick={handleRentalInquiry}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg cursor-pointer whitespace-nowrap"
        >
          대여하기
        </button>
      </div>

      {/* 날짜 선택 팝업 */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl p-6 max-w-md w-full max-h-[65vh] overflow-y-auto mb-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">대여 날짜 선택</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* 달력 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800">날짜 선택</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-left-s-line text-gray-600"></i>
                  </button>
                  <span className="text-sm font-medium text-gray-800 min-w-[100px] text-center">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-right-s-line text-gray-600"></i>
                  </button>
                </div>
              </div>

              {renderCalendar()}

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-gray-600">선택</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                  <span className="text-gray-600">가능</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">불가</span>
                </div>
              </div>
            </div>

            {/* 선택된 날짜 정보 */}
            {selectedStartDate && (
              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <h5 className="font-medium text-blue-800 mb-1 text-sm">선택된 날짜</h5>
                <div className="text-sm text-blue-700">
                  <div>시작: {formatDate(selectedStartDate)}</div>
                  {selectedEndDate && <div>종료: {formatDate(selectedEndDate)}</div>}
                </div>
              </div>
            )}

            {/* 가격 계산 */}
            {selectedStartDate && selectedEndDate && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <h5 className="font-medium text-gray-800 mb-2 text-sm">대여 요약</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">기간</span>
                    <span className="text-gray-800">{days}일</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-800">총 대여료</span>
                    <span className="text-purple-600">{total.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">보증금</span>
                    <span className="text-red-600">50,000원</span>
                  </div>
                </div>
              </div>
            )}

            {/* 확인 버튼 */}
            <button
              onClick={handleContinueToChat}
              disabled={!selectedStartDate || !selectedEndDate}
              className={`w-full py-4 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedStartDate && selectedEndDate
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              채팅으로 대여 문의하기
            </button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
