function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

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
    return process.env.NTFY_URL;
  },
  get tlsEnabled() {
    return process.env.PINGU_TLS !== "0";
  },
  get tlsKeyPath() {
    return required("PINGU_TLS_KEY");
  },
  get tlsCertPath() {
    return required("PINGU_TLS_CERT");
  },
};
