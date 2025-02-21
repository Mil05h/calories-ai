import type { API } from "./api";
import { IAPI } from "./interface";

export type { IAPI };

let api: API | null = null;

export const getAPI = async () => {
  if (api) {
    return api;
  }
  try {
    const { API } = await import("./api");
    api = new API();
    return api;
  } catch (error) {
    console.error("Failed to load API:", error);
    return null;
  }
};
