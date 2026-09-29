import type { AxiosInstance } from 'axios';
import { buildMethodUrl } from './client';
import type { GetSettingsResponse } from '../types';

interface Params {
  client: AxiosInstance;
  idInstance: string;
  apiTokenInstance: string;
}

export async function getSettings({
  client,
  idInstance,
  apiTokenInstance,
}: Params): Promise<GetSettingsResponse> {
  const url = buildMethodUrl('getSettings', idInstance, apiTokenInstance);
  const { data } = await client.get<GetSettingsResponse>(url);
  return data;
}