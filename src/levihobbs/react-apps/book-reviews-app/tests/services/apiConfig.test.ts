import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

async function getConfig() {
  const { getApiConfig } = await import('../../src/services/apiConfig');
  return getApiConfig();
}

describe('getApiConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.defineProperty(window, 'bookReviewsConfig', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('env var override (highest priority)', () => {
    it('returns useMock=true when VITE_USE_MOCK=true even if standaloneMode=false', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true');
      Object.defineProperty(window, 'bookReviewsConfig', {
        value: { standaloneMode: false },
        writable: true,
        configurable: true,
      });
      const config = await getConfig();
      expect(config.useMock).toBe(true);
    });

    it('returns useMock=true when VITE_USE_MOCK=true and no window config', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true');
      const config = await getConfig();
      expect(config.useMock).toBe(true);
    });
  });

  describe('window config (when env var is not true)', () => {
    it('returns useMock=false when VITE_USE_MOCK=false and standaloneMode=false', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'false');
      Object.defineProperty(window, 'bookReviewsConfig', {
        value: { standaloneMode: false },
        writable: true,
        configurable: true,
      });
      const config = await getConfig();
      expect(config.useMock).toBe(false);
    });

    it('returns useMock=false when VITE_USE_MOCK=false even if standaloneMode=true', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'false');
      Object.defineProperty(window, 'bookReviewsConfig', {
        value: { standaloneMode: true },
        writable: true,
        configurable: true,
      });
      const config = await getConfig();
      expect(config.useMock).toBe(false);
    });
  });

  describe('window config (env var not set)', () => {
    it('returns useMock=true when VITE_USE_MOCK unset and standaloneMode=true', async () => {
      Object.defineProperty(window, 'bookReviewsConfig', {
        value: { standaloneMode: true },
        writable: true,
        configurable: true,
      });
      const config = await getConfig();
      expect(config.useMock).toBe(true);
    });

    it('returns useMock=false when VITE_USE_MOCK unset and standaloneMode=false', async () => {
      Object.defineProperty(window, 'bookReviewsConfig', {
        value: { standaloneMode: false },
        writable: true,
        configurable: true,
      });
      const config = await getConfig();
      expect(config.useMock).toBe(false);
    });
  });

  describe('fallback (no window config, env var not set)', () => {
    it('returns useMock=false with baseUrl when VITE_USE_MOCK=false and no window config', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'false');
      vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5000/api');
      const config = await getConfig();
      expect(config.useMock).toBe(false);
      expect(config.baseUrl).toBe('http://localhost:5000/api');
    });

    it('returns useMock=true when VITE_USE_MOCK is empty and no window config', async () => {
      vi.stubEnv('VITE_USE_MOCK', '');
      const config = await getConfig();
      expect(config.useMock).toBe(true);
    });
  });

  describe('memoization', () => {
    it('returns the same object reference on repeated calls', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true');
      const { getApiConfig } = await import('../../src/services/apiConfig');
      const first = getApiConfig();
      const second = getApiConfig();
      expect(first).toBe(second);
    });
  });
});
