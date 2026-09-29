import type { AxiosInstance } from 'axios';
import { buildMethodUrl } from './client';
import type { Notification } from '../types';

interface Params {
  client: AxiosInstance;
  idInstance: string;
  apiTokenInstance: string;
  receiveTimeout?: number;
}

/**
 * Возвращает уведомление или null, если очередь пуста (таймаут).
 */
export async function receiveNotification({
  client,
  idInstance,
  apiTokenInstance,
  receiveTimeout = 5,
}: Params): Promise<Notification | null> {
  const url = buildMethodUrl('receiveNotification', idInstance, apiTokenInstance);
  const { data } = await client.get<Notification | null>(url, {
    params: { receiveTimeout },
  });
  return data ?? null;
}