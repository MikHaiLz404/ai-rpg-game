/**
 * Request Deduplication Utility
 *
 * Prevents rapid-fire API calls by deduplicating requests with identical parameters
 * within a configurable time window. This protects the AI backend from being
 * overwhelmed by duplicate requests while still allowing legitimate rapid calls
 * with different parameters.
 *
 * How it works:
 * 1. Requests are hashed (action + relevant params) to create a unique key
 * 2. If a request with the same key is already pending, the pending promise is returned
 * 3. If a request with the same key completed recently (within window), cached result is returned
 * 4. Otherwise, the request proceeds and result is cached
 *
 * The deduplication window is short (5 seconds) to allow legitimate rapid interactions
 * (e.g., user clicking different gods) while preventing spam (e.g., user rapidly clicking same button).
 */

// Simple non-crypto hash for performance - good enough for deduplication keys
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

interface CachedResult<T> {
  result: T;
  timestamp: number;
}

interface DedupeOptions {
  /** Time window in ms for caching results (default: 5000ms) */
  cacheWindowMs?: number;
  /** Maximum number of entries in cache (default: 100) */
  maxCacheSize?: number;
}

export class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private cachedResults = new Map<string, CachedResult<any>>();
  private cacheWindowMs: number;
  private maxCacheSize: number;

  constructor(options: DedupeOptions = {}) {
    this.cacheWindowMs = options.cacheWindowMs ?? 5000; // 5 seconds default
    this.maxCacheSize = options.maxCacheSize ?? 100;
  }

  /**
   * Generate a deduplication key from request parameters.
   * Override this method to customize which params are included in the key.
   */
  generateKey(action: string, params: Record<string, any>): string {
    // Sort keys for consistent hashing
    const relevantParams: Record<string, any> = {};
    const keys = Object.keys(params).sort();

    for (const key of keys) {
      const value = params[key];
      // Skip internal/react-specific fields and functions
      if (typeof value === 'function') continue;
      if (value === undefined || value === null) continue;
      // Include primitive values and serializable objects
      if (typeof value === 'object') {
        try {
          JSON.stringify(value); // Test serializability
          relevantParams[key] = value;
        } catch {
          // Skip non-serializable
        }
      } else {
        relevantParams[key] = value;
      }
    }

    const serialized = JSON.stringify({ action, ...relevantParams });
    return simpleHash(serialized);
  }

  /**
   * Get or create a deduplicated request.
   * If a similar request is already pending, returns the existing promise.
   * If a similar request completed recently, returns a promise that resolves immediately with cached result.
   *
   * @param key Unique key for this request
   * @param requestFn Function that performs the actual request
   * @returns Promise that resolves to the result
   */
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      // Return existing promise - caller will wait for the same result
      return pending.promise as Promise<T>;
    }

    // Check if we have a recent cached result
    const cached = this.cachedResults.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheWindowMs) {
      // Return cached result immediately
      return cached.result;
    }

    // Create new request
    const promise = this.executeAndCache<T>(key, requestFn);

    // Store pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  private async executeAndCache<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    try {
      const result = await requestFn();

      // Cache the result
      this.cachedResults.set(key, {
        result,
        timestamp: Date.now(),
      });

      // Clean up old entries if cache is too large
      if (this.cachedResults.size > this.maxCacheSize) {
        this.cleanupExpiredCache();
      }

      return result;
    } finally {
      // Remove from pending regardless of success/failure
      this.pendingRequests.delete(key);
    }
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cachedResults.entries()) {
      if (now - cached.timestamp >= this.cacheWindowMs) {
        this.cachedResults.delete(key);
      }
    }

    // If still too large after cleanup, remove oldest entries
    if (this.cachedResults.size > this.maxCacheSize) {
      const entries = Array.from(this.cachedResults.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
      for (const [key] of toRemove) {
        this.cachedResults.delete(key);
      }
    }
  }

  /**
   * Clear all pending requests and cached results.
   * Useful for testing or when the client state changes significantly.
   */
  clear(): void {
    this.pendingRequests.clear();
    this.cachedResults.clear();
  }

  /**
   * Get the number of pending requests (for monitoring/debugging).
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Get the number of cached results (for monitoring/debugging).
   */
  getCacheSize(): number {
    return this.cachedResults.size;
  }
}

// Global deduplicator instance for the /api/narrate route
// Using separate instances per route allows different cache windows if needed
export const narrativeDeduplicator = new RequestDeduplicator({
  cacheWindowMs: 5000, // 5 second window for narrative requests
  maxCacheSize: 50,
});

// Global deduplicator instance for the /api/prophecy route
export const prophecyDeduplicator = new RequestDeduplicator({
  cacheWindowMs: 10000, // 10 second window for prophecy (daily event)
  maxCacheSize: 10,
});
