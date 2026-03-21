if (typeof window === "undefined") {
  throw new Error(
    "PROXY_URL_BASE is only available in the browser environment",
  );
}

export const PROXY_URL_BASE = `${window.location.origin}/api/electric`;
