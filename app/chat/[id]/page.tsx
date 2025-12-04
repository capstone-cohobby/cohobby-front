import ChatRoomWrapper from './ChatRoomWrapper';

// generateStaticParams 함수는 삭제했습니다.
// 채팅방은 동적으로 생성되므로 정적 경로를 미리 생성할 필요가 없습니다.
// 이제 어떤 ID(1, 14, 100, 999...)가 와도 404 없이 동적으로 렌더링됩니다.

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatRoomWrapper chatId={id} />;
}
