import type { AxiosInstance } from 'axios';
import { buildMethodUrl } from './client';
import type { DeleteNotificationResponse } from '../types';

interface Params {
  client: AxiosInstance;
  idInstance: string;
  apiTokenInstance: string;
  receiptId: number;
}

export async function deleteNotification({
  client,
  idInstance,
  apiTokenInstance,
  receiptId,
}: Params): Promise<DeleteNotificationResponse> {
  const url = buildMethodUrl(
    'deleteNotification',
    idInstance,
    apiTokenInstance,
    String(receiptId)
  );
  const { data } = await client.delete<DeleteNotificationResponse>(url);
  return data;
}