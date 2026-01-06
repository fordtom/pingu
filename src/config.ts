export const config = {
  get port() {
    return Number(process.env.PINGU_PORT ?? process.env.PORT ?? 8000);
  },
  get timeoutMs() {
    return Number(process.env.PINGU_TIMEOUT_MS ?? 60 * 60 * 1000); // 1 hour
  },
  get host() {
    return process.env.PINGU_HOST ?? "0.0.0.0";
  },
  get ntfyUrl() {
    return process.env.PINGU_NTFY_URL ?? "http://localhost:9000/pingu";
  },
};
