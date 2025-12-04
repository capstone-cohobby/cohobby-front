
import ChatRoomClient from './ChatRoomClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default async function ChatRoomPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <ChatRoomClient chatId={id} />;
}
