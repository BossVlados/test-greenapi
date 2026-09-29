import { useMemo, useRef, useState, type SubmitEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Chat } from '../types';
import { ChatSidebarItem } from './ChatSidebarItem';

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: (phone: string) => void;
  onDelete: (chatId: string) => void;
  onLogout: () => void;
}

const CHAT_ITEM_HEIGHT = 62;
const VIRTUALIZE_THRESHOLD = 30;

export function ChatSidebar({
  chats,
  activeChatId,
  onSelect,
  onCreate,
  onDelete,
  onLogout,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () => [...chats].sort((a, b) => b.lastActivityAt - a.lastActivityAt),
    [chats]
  );

  const shouldVirtualize = sorted.length >= VIRTUALIZE_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => CHAT_ITEM_HEIGHT,
    overscan: 8,
    getItemKey: (index) => sorted[index]?.id ?? index,
  });

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const normalized = phone.replace(/\D/g, '');
    if (normalized.length < 10) {
      setError('Введите номер в формате 79991234567');
      return;
    }
    setError(null);
    onCreate(normalized);
    setPhone('');
    setShowForm(false);
  };

  const renderItem = (chat: Chat) => (
    <ChatSidebarItem
      chat={chat}
      active={chat.id === activeChatId}
      onClick={onSelect}
      onDelete={onDelete}
    />
  );

  return (
    <aside className="chat-sidebar">
      <header className="chat-sidebar-header">
        <span className="app-title">MAX Chat</span>
        <button className="icon-btn" onClick={onLogout} title="Выйти">
          Выйти
        </button>
      </header>

      <div className="chat-sidebar-actions">
        <button
          type="button"
          className="new-chat-btn"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Отмена' : '+ Новый чат'}
        </button>
      </div>

      {showForm && (
        <form className="new-chat-form" onSubmit={handleSubmit}>
          <input
            autoFocus
            placeholder="79991234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
          />
          <button type="submit">Создать</button>
          {error && <div className="error-text">{error}</div>}
        </form>
      )}

      {sorted.length === 0 ? (
        <div className="chat-sidebar-empty">Нет чатов. Создайте первый.</div>
      ) : shouldVirtualize ? (
        <div ref={listRef} className="chat-sidebar-list">
          <div
            className="chat-list-inner"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((vItem) => {
              const chat = sorted[vItem.index];
              if (!chat) return null;
              return (
                <div
                  key={vItem.key}
                  className="chat-list-row"
                  style={{ transform: `translateY(${vItem.start}px)` }}
                >
                  {renderItem(chat)}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div ref={listRef} className="chat-sidebar-list">
          {sorted.map((chat) => (
            <div key={chat.id}>{renderItem(chat)}</div>
          ))}
        </div>
      )}
    </aside>
  );
}