let timer: ReturnType<typeof setInterval> | undefined;

self.onmessage = (event: MessageEvent) => {
  if (event.data !== "start" || timer !== undefined) return;
  // Always tick, including version zero and an initially empty local queue.
  // Reads happen serially in useGameState and remain gated by repository animations.
  timer = setInterval(() => {
    self.postMessage({ type: "UPDATE_READY" });
  }, 300);
};
export {};
