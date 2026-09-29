import { useCallback, useEffect, useRef } from 'react';
import type { AxiosInstance } from 'axios';
import { receiveNotification, deleteNotification } from '../api';
import type { ChatMessage, Notification } from '../types';

interface StatusUpdate {
  serverId: string;
  status: 'sent' | 'delivered' | 'read';
}

interface UsePollingOptions {
  client: AxiosInstance;
  idInstance: string;
  apiTokenInstance: string;
  enabled: boolean;
  onMessage: (msg: ChatMessage) => void;
  onStatus?: (update: StatusUpdate) => void;
  receiveTimeout?: number;
}

export function usePolling({
  client,
  idInstance,
  apiTokenInstance,
  enabled,
  onMessage,
  onStatus,
  receiveTimeout = 5,
}: UsePollingOptions): void {
  const onMessageRef = useRef(onMessage);
  const onStatusRef = useRef(onStatus);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  const handleNotification = useCallback((notif: Notification): void => {
    const { body } = notif;

    if (body.typeWebhook === 'incomingMessageReceived') {
      const md = body.messageData;
      let text = '';

      if (md.typeMessage === 'textMessage' && md.textMessageData) {
        text = md.textMessageData.textMessage;
      } else if (
        md.typeMessage === 'extendedTextMessage' &&
        md.extendedTextMessageData
      ) {
        text = md.extendedTextMessageData.text;
      }

      if (!text) return;

      const rawPhone =
        (body.senderData as { senderPhoneNumber?: string | number })
          .senderPhoneNumber ?? '';
      const senderPhoneNumber = String(rawPhone).replace(/\D/g, '');
      const chatId = body.senderData.chatId;

      const msg: ChatMessage = {
        id: body.idMessage,
        serverId: body.idMessage,
        text,
        sender:
          body.senderData.senderName ||
          body.senderData.sender ||
          'Собеседник',
        chatId: senderPhoneNumber ? `${senderPhoneNumber}@c.us` : chatId,
        timestamp: body.timestamp,
        direction: 'incoming',
      };

      onMessageRef.current(msg);
      return;
    }

    if (body.typeWebhook === 'outgoingMessageStatus') {
      onStatusRef.current?.({
        serverId: body.idMessage,
        status: body.status,
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    (async () => {
      while (!cancelled) {
        try {
          const notif = await receiveNotification({
            client,
            idInstance,
            apiTokenInstance,
            receiveTimeout,
          });

          if (cancelled) break;

          if (notif) {
            try {
              handleNotification(notif);
            } catch {
              // Игнорируем ошибки парсинга — уведомление всё равно удаляем,
              // чтобы очередь не забилась
            }

            try {
              await deleteNotification({
                client,
                idInstance,
                apiTokenInstance,
                receiptId: notif.receiptId,
              });
            } catch {
              // Сетевые сбои deleteNotification — продолжаем цикл
            }
          }
        } catch {
          if (cancelled) break;
          // Пауза перед повтором, чтобы не флудить в API
          await new Promise((r) => setTimeout(r, 2_000));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    client,
    idInstance,
    apiTokenInstance,
    receiveTimeout,
    handleNotification,
  ]);
}