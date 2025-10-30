
import UserProfileClient from './UserProfileClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return <UserProfileClient userId={params.id} />;
}
