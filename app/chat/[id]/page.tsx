import ChatRoomWrapper from './ChatRoomWrapper';

// output: "export" 설정을 위해 필요
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatRoomWrapper chatId={id} />;
}
