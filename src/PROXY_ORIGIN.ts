if (!window.origin) {
  throw new Error("Run this on the client");
}

export const PROXY_ORIGIN = window.origin;
