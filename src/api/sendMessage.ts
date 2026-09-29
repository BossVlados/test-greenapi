import type { AxiosInstance } from 'axios';
import { buildMethodUrl } from './client';
import type { SendMessageRequest, SendMessageResponse } from '../types';

interface Params {
  client: AxiosInstance;
  idInstance: string;
  apiTokenInstance: string;
  payload: SendMessageRequest;
}

export async function sendMessage({
  client,
  idInstance,
  apiTokenInstance,
  payload,
}: Params): Promise<SendMessageResponse> {
  const url = buildMethodUrl('sendMessage', idInstance, apiTokenInstance);
  const { data } = await client.post<SendMessageResponse>(url, payload);
  return data;
}