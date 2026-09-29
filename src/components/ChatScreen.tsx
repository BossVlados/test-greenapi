import { useCallback, useEffect, useMemo, useState } from 'react';
import { createApiClient, readChat, sendMessage } from '../api';
import { usePolling } from '../hooks/usePolling';
import { useChatsStore } from '../store/chatsStore';
import type { ChatMessage, Credentials } from '../types';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';

interface Props {
  credentials: Credentials;
  onLogout: () => void;
}

export function ChatScreen({ credentials, onLogout }: Props) {
  const { idInstance, apiTokenInstance, phone } = credentials;
  const [sending, setSending] = useState(false);

  const client = useMemo(
    () => createApiClient(idInstance, apiTokenInstance),
    [idInstance, apiTokenInstance]
  );

  const chats = useChatsStore((s) => s.chats);
  const activeChatId = useChatsStore((s) => s.activeChatId);
  const activeChat = useChatsStore(
    (s) => s.chats.find((c) => c.id === s.activeChatId) ?? null
  );
  const addChat = useChatsStore((s) => s.addChat);
  const removeChat = useChatsStore((s) => s.removeChat);
  const selectChat = useChatsStore((s) => s.selectChat);
  const appendMessage = useChatsStore((s) => s.appendMessage);
  const updateMessage = useChatsStore((s) => s.updateMessage);

  useEffect(() => {
    if (phone) addChat(phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIncoming = useCallback(
    (msg: ChatMessage) => appendMessage(msg.chatId, msg),
    [appendMessage]
  );

  const handleStatus = useCallback(
    ({
      serverId,
      status,
    }: {
      serverId: string;
      status: 'sent' | 'delivered' | 'read';
    }): void => {
      const state = useChatsStore.getState();
      const order: Record<string, number> = { sent: 1, delivered: 2, read: 3 };

      for (const chat of state.chats) {
        const msg = chat.messages.find((m) => m.serverId === serverId);
        if (!msg) continue;

        const current = msg.deliveryStatus ?? 'sent';
        if ((order[status] ?? 0) >= (order[current] ?? 0)) {
          updateMessage(chat.id, msg.id, { deliveryStatus: status });
        }
        return;
      }
    },
    [updateMessage]
  );

  usePolling({
    client,
    idInstance,
    apiTokenInstance,
    enabled: true,
    onMessage: handleIncoming,
    onStatus: handleStatus,
  });

  const handleSelectChat = useCallback(
    (chatId: string) => {
      selectChat(chatId);

      const chat = useChatsStore.getState().chats.find((c) => c.id === chatId);
      if (!chat) return;

      const lastIncoming = [...chat.messages]
        .reverse()
        .find((m) => m.direction === 'incoming' && m.serverId);
      if (!lastIncoming?.serverId) return;

      void readChat({
        client,
        idInstance,
        apiTokenInstance,
        chatId,
        idMessage: lastIncoming.serverId,
      }).catch(() => {
        // readChat — необязательный вызов, ошибки игнорируем
      });
    },
    [client, idInstance, apiTokenInstance, selectChat]
  );

  const handleSend = useCallback(
    async (text: string): Promise<void> => {
      if (!activeChat) return;

      const chatId = activeChat.id;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: ChatMessage = {
        id: tempId,
        text,
        sender: 'Вы',
        chatId,
        timestamp: Date.now(),
        direction: 'outgoing',
        pending: true,
      };

      appendMessage(chatId, optimistic, { incrementUnread: false });
      setSending(true);

      try {
        const { idMessage } = await sendMessage({
          client,
          idInstance,
          apiTokenInstance,
          payload: { chatId, message: text },
        });
        updateMessage(chatId, tempId, {
          serverId: idMessage,
          pending: false,
          deliveryStatus: 'sent',
        });
      } catch {
        updateMessage(chatId, tempId, { failed: true, pending: false });
      } finally {
        setSending(false);
      }
    },
    [
      activeChat,
      appendMessage,
      updateMessage,
      client,
      idInstance,
      apiTokenInstance,
    ]
  );

  const handleRetry = useCallback(
    async (messageId: string): Promise<void> => {
      const state = useChatsStore.getState();
      const chat = state.chats.find((c) =>
        c.messages.some((m) => m.id === messageId)
      );
      if (!chat) return;

      const msg = chat.messages.find((m) => m.id === messageId);
      if (!msg || !msg.failed) return;

      updateMessage(chat.id, messageId, { failed: false, pending: true });

      try {
        const { idMessage } = await sendMessage({
          client,
          idInstance,
          apiTokenInstance,
          payload: { chatId: chat.id, message: msg.text },
        });
        updateMessage(chat.id, messageId, {
          serverId: idMessage,
          pending: false,
          deliveryStatus: 'sent',
        });
      } catch {
        updateMessage(chat.id, messageId, { failed: true, pending: false });
      }
    },
    [client, idInstance, apiTokenInstance, updateMessage]
  );

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      const chat = useChatsStore.getState().chats.find((c) => c.id === chatId);
      const label = chat?.title ?? 'этот чат';
      if (!window.confirm(`Удалить чат с ${label}?`)) return;
      removeChat(chatId);
    },
    [removeChat]
  );

  const handleLogout = useCallback(() => {
    if (window.confirm('Выйти и удалить все чаты?')) {
      useChatsStore.getState().clearAll();
      onLogout();
    }
  }, [onLogout]);

  return (
    <div className={`chat-screen ${activeChatId ? 'has-active-chat' : ''}`}>
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelect={handleSelectChat}
        onCreate={addChat}
        onDelete={handleDeleteChat}
        onLogout={handleLogout}
      />
      <ChatArea
        chat={activeChat}
        onSend={handleSend}
        onRetry={handleRetry}
        onBack={() => selectChat(null)}
        sending={sending}
      />
    </div>
  );
}