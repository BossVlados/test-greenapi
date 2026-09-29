import type { Chat } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface Props {
  chat: Chat | null;
  onSend: (text: string) => void;
  onRetry: (messageId: string) => void;
  onBack: () => void;
  sending: boolean;
}

export function ChatArea({ chat, onSend, onRetry, onBack, sending }: Props) {
  if (!chat) {
    return (
      <div className="chat-area empty">
        <div className="empty-hint">Выберите чат слева или создайте новый</div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <header className="chat-header">
        <button
          type="button"
          className="chat-header-back"
          onClick={onBack}
          aria-label="Назад к чатам"
        >
          ‹
        </button>
        <span className="chat-header-title">{chat.title}</span>
        <span className="chat-header-phone">{chat.phone}</span>
      </header>

      <MessageList messages={chat.messages} onRetry={onRetry} />

      <MessageInput onSend={onSend} disabled={sending} />
    </div>
  );
}