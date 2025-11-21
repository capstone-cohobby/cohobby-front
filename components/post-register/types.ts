// 공통 타입 정의
export interface FormData {
  productName: string;
  category: string;
  subCategory: string;
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

