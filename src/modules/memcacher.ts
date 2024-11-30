class MemoryCache {
  private static instance: MemoryCache;
  private cache: Map<string, unknown>;
  private times: Map<string, number>;
  private locks: Map<string, Int32Array>;

  private constructor() {
    this.cache = new Map<string, unknown>();
    this.times = new Map<string, number>();
    this.locks = new Map<string, Int32Array>();
  }

  public static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  public async set<T>(key: string, value: T): Promise<void> {
    if (!this.locks.has(key)) {
      this.locks.set(key, new Int32Array(new SharedArrayBuffer(4)));
    }
    console.log(`setting cache: ${key} | ${value}`);
    const lock = this.locks.get(key)!;

    const lockValue = Atomics.compareExchange(lock, 0, 0, 1);
    if (lockValue !== 0) {
      console.warn(`Store function is already in progress for key: ${key}`);
      return;
    }

    try {
      console.log(`Storing value for key: ${key}`);
      this.cache.set(key, value);
      this.times.set(key, Date.now());
    } finally {
      Atomics.store(lock, 0, 0);
    }
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  public getTime(key: string): number | undefined {
    return this.times.get(key);
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public delete(key: string): boolean {
    if (this.locks.has(key)) {
      this.locks.delete(key); // Clean up lock
    }
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.times.clear();
    this.locks.clear();
  }
}

export default MemoryCache;
