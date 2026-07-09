/**
 * In-memory response cache keyed by request URL. PokéAPI data is immutable,
 * so we cache indefinitely for the session. Also de-dupes in-flight requests
 * so concurrent callers for the same URL share one network round-trip.
 */
const store = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function getCached<T>(url: string): T | undefined {
  return store.get(url) as T | undefined;
}

export function setCached<T>(url: string, value: T): void {
  store.set(url, value);
}

export function getInflight<T>(url: string): Promise<T> | undefined {
  return inflight.get(url) as Promise<T> | undefined;
}

export function setInflight<T>(url: string, promise: Promise<T>): void {
  inflight.set(url, promise as Promise<unknown>);
}

export function clearInflight(url: string): void {
  inflight.delete(url);
}

export function clearCache(): void {
  store.clear();
  inflight.clear();
}
