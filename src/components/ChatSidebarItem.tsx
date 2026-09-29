import type { MouseEvent } from 'react';
import type { Chat } from '../types';
import { getAvatarColor, getInitial } from '../utils/avatar';

interface Props {
  chat: Chat;
  active: boolean;
  onClick: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}

const formatPreviewTime = (ts: number): string => {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (sameDay) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};

export function ChatSidebarItem({ chat, active, onClick, onDelete }: Props) {
  const last = chat.messages[chat.messages.length - 1];

  const handleClick = (): void => onClick(chat.id);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(chat.id);
    }
  };

  const handleDelete = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onDelete(chat.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`chat-item ${active ? 'active' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="avatar"
        style={{ backgroundColor: getAvatarColor(chat.title) }}
        aria-hidden="true"
      >
        {getInitial(chat.title)}
      </div>

      <div className="chat-item-body">
        <div className="chat-item-top">
          <span className="chat-item-title">{chat.title}</span>
          {last && (
            <span className="chat-item-time">{formatPreviewTime(last.timestamp)}</span>
          )}
        </div>
        <div className="chat-item-bottom">
          <span className="chat-item-preview">
            {last
              ? `${last.direction === 'outgoing' ? 'Вы: ' : ''}${last.text}`
              : 'Нет сообщений'}
          </span>
          {chat.unreadCount > 0 && (
            <span className="chat-item-badge">{chat.unreadCount}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="chat-item-delete"
        onClick={handleDelete}
        title="Удалить чат"
        aria-label="Удалить чат"
      >
        ×
      </button>
    </div>
  );
}