import type { API } from './api';
import { IAPI } from './interface';

export type { IAPI };

let api: API | null = null;

export async function getAPI() {
  if (api) {
    return api;
  }
  const { API } = await import('./api');
  api = new API();
  return api;
} 