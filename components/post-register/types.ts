// 공통 타입 정의
export interface FormData {
  goods: string;
  category: string;
  hobby: string;
  hobbyId?: number;
  purchaseDate: string;
  defects: string;
  precautions: string;
  rentalStartDate: string;
  rentalEndDate: string;
  photos: string[];
  dailyPrice: string;
  weeklyPrice: string;
  deposit: string;
}

export interface StepProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

