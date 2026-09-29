import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, ChatMessage } from '../types';

const STORAGE_KEY = 'max-chats';

interface AppendOptions {
  incrementUnread?: boolean;
}

interface ChatsState {
  chats: Chat[];
  activeChatId: string | null;

  addChat: (phone: string) => string;
  removeChat: (chatId: string) => void;
  selectChat: (chatId: string | null) => void;
  appendMessage: (chatId: string, message: ChatMessage, opts?: AppendOptions) => void;
  updateMessage: (chatId: string, messageId: string, patch: Partial<ChatMessage>) => void;
  markRead: (chatId: string) => void;
  normalizePendingMessages: () => void;
  clearAll: () => void;
}

const normalizePhone = (raw: string): string => raw.replace(/\D/g, '');
const toChatId = (phone: string): string => `${normalizePhone(phone)}@c.us`;
const fromChatId = (chatId: string): string =>
  chatId.split('@')[0] ?? chatId;

export const useChatsStore = create<ChatsState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,

      addChat: (phone) => {
        const chatId = toChatId(phone);
        if (get().chats.some((c) => c.id === chatId)) {
          set({ activeChatId: chatId });
          return chatId;
        }
        const now = Date.now();
        const chat: Chat = {
          id: chatId,
          phone: fromChatId(chatId),
          title: fromChatId(chatId),
          messages: [],
          unreadCount: 0,
          createdAt: now,
          lastActivityAt: now,
        };
        set((state) => ({
          chats: [chat, ...state.chats],
          activeChatId: chatId,
        }));
        return chatId;
      },

      removeChat: (chatId) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
          activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
        })),

      selectChat: (chatId) => {
        set({ activeChatId: chatId });
        if (chatId) {
          set((state) => ({
            chats: state.chats.map((c) =>
              c.id === chatId ? { ...c, unreadCount: 0 } : c
            ),
          }));
        }
      },

      appendMessage: (chatId, message, opts = {}) =>
        set((state) => {
          const shouldIncrement =
            opts.incrementUnread ?? chatId !== state.activeChatId;

          let idx = state.chats.findIndex((c) => c.id === chatId);

          if (idx === -1) {
            const incomingPhone = chatId.replace(/\D/g, '');
            if (incomingPhone) {
              idx = state.chats.findIndex(
                (c) => c.phone.replace(/\D/g, '') === incomingPhone
              );
            }
          }

          if (idx === -1) {
            const now = Date.now();
            const phone = chatId.replace(/\D/g, '') || chatId;
            const chat: Chat = {
              id: chatId,
              phone,
              title: phone,
              messages: [message],
              unreadCount: shouldIncrement ? 1 : 0,
              createdAt: now,
              lastActivityAt: message.timestamp,
            };
            return { chats: [chat, ...state.chats] };
          }

          const current = state.chats[idx];
          const updated: Chat = {
            ...current,
            messages: [...current.messages, message],
            unreadCount: shouldIncrement
              ? current.unreadCount + 1
              : current.unreadCount,
            lastActivityAt: message.timestamp,
          };

          const copy = [...state.chats];
          copy[idx] = updated;
          return { chats: copy };
        }),

      updateMessage: (chatId, messageId, patch) =>
        set((state) => {
          const idx = state.chats.findIndex((c) => c.id === chatId);
          if (idx === -1) return state;
          const current = state.chats[idx];
          const updated: Chat = {
            ...current,
            messages: current.messages.map((m) =>
              m.id === messageId ? { ...m, ...patch } : m
            ),
          };
          const copy = [...state.chats];
          copy[idx] = updated;
          return { chats: copy };
        }),

      markRead: (chatId) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, unreadCount: 0 } : c
          ),
        })),

      normalizePendingMessages: () =>
        set((state) => ({
          chats: state.chats.map((c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.pending ? { ...m, pending: false, failed: true } : m
            ),
          })),
        })),

      clearAll: () => set({ chats: [], activeChatId: null }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ chats: state.chats }),
      onRehydrateStorage: () => (state) => {
        state?.normalizePendingMessages();
      },
    }
  )
);