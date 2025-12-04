import PaymentPageClient from './PaymentPageClient';

export async function generateStaticParams() {
  return [
    { roomId: '1' },
    { roomId: '2' },
    { roomId: '3' },
    { roomId: '4' },
  ];
}

export default async function PaymentPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = await params;
  return <PaymentPageClient params={resolvedParams} />;
}

