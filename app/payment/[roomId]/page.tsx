import PaymentPageClient from './PaymentPageClient';

export default function PaymentPage({ params }: { params: Promise<{ roomId: string }> }) {
  return <PaymentPageClient params={params} />;
}

