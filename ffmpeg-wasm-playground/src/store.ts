import { createFFmpeg } from "@ffmpeg/ffmpeg";
import { readable, writable } from "svelte/store";

function createLog() {
  const { subscribe, update } = writable<{ date: Date; message: string }[]>([]);

  function push(message: string) {
    update((log) => [...log, { date: new Date(), message }]);
  }

  function pushError(error: unknown) {
    if (error instanceof Error) push(error.toString());
    throw error;
  }

  return { subscribe, push, pushError };
}

export const log = createLog();

export const progressRatio = writable(0);

export const ffmpeg = readable(
  createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@^0.10.0/dist/ffmpeg-core.js",
    log: true,
    logger: ({ type, message }) => log.push(`[${type}] ${message}`),
    progress: ({ ratio }) => progressRatio.set(ratio),
  })
);

export const isReady = writable(false);

export const file = writable<File | null>(null);

export const outputFileName = writable<string | undefined>(undefined);
