import type { AxiosInstance } from 'axios';
import { buildMethodUrl } from './client';

interface Params {
  client: AxiosInstance;
  idInstance: string;
  apiTokenInstance: string;
  chatId: string;
  idMessage?: string;
}

export async function readChat({
  client,
  idInstance,
  apiTokenInstance,
  chatId,
  idMessage,
}: Params): Promise<void> {
  const url = buildMethodUrl('readChat', idInstance, apiTokenInstance);
  await client.post(url, idMessage ? { chatId, idMessage } : { chatId });
}