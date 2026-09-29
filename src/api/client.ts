import axios, { type AxiosInstance } from 'axios';

const BASE_URL = 'https://api.green-api.com/v3';

export function createApiClient(idInstance: string, apiTokenInstance: string): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    params: {},
    timeout: 20_000,
    validateStatus: (status) => status >= 200 && status < 400,
  });
}

export const buildMethodUrl = (
  method: string,
  idInstance: string,
  apiTokenInstance: string,
  extra = ''
): string =>
  `/waInstance${idInstance}/${method}/${apiTokenInstance}${extra ? `/${extra}` : ''}`;