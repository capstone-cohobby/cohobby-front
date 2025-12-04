import PaymentPageClient from './PaymentPageClient';

export default function PaymentPage({ params }: { params: { roomId: string } }) {
  return <PaymentPageClient params={params} />;
}

