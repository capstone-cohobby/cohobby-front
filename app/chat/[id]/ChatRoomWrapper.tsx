'use client';

import dynamic from 'next/dynamic';

// ssr: false 옵션을 주면 서버에서는 아예 실행 안 하고 무시합니다. (에러 원천 차단)
const ChatRoomClient = dynamic(() => import('./ChatRoomClient'), { 
  ssr: false 
});

interface ChatRoomWrapperProps {
  chatId: string;
}

export default function ChatRoomWrapper({ chatId }: ChatRoomWrapperProps) {
  return <ChatRoomClient chatId={chatId} />;
}

