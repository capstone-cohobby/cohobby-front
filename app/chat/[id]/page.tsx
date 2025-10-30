
import ChatRoomClient from './ChatRoomClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  return <ChatRoomClient chatId={params.id} />;
}
