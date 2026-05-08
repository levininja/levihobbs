export interface ApiConfig {
  useMock: boolean;
  baseUrl?: string;
}

declare global {
  interface Window {
    bookReviewsConfig?: {
      standaloneMode: boolean;
      startMode?: 'welcome' | 'search' | 'browse';
    };
  }
}

// Memoized configuration cache
let memoizedConfig: ApiConfig | null = null;

// Get configuration from window object (set by C# view) or environment variables
export const getApiConfig = (): ApiConfig => {
  // Return memoized config if available
  if (memoizedConfig) {
    return memoizedConfig;
  }

  const envUseMock = import.meta.env.VITE_USE_MOCK;

  // VITE_USE_MOCK=true: force mock regardless of window config
  if (envUseMock === 'true') {
    memoizedConfig = { useMock: true, baseUrl: '' };
    return memoizedConfig;
  }

  // VITE_USE_MOCK=false: explicit opt-in to real API, overrides window config
  if (envUseMock === 'false') {
    memoizedConfig = { useMock: false, baseUrl: import.meta.env.VITE_API_BASE_URL };
    return memoizedConfig;
  }

  // VITE_USE_MOCK not set: defer to window config (set by C# view)
  if (typeof window !== 'undefined' && window.bookReviewsConfig) {
    const config = window.bookReviewsConfig;
    memoizedConfig = { useMock: config.standaloneMode, baseUrl: '' };
    return memoizedConfig;
  }

  // No configuration at all: default to mock
  memoizedConfig = { useMock: true, baseUrl: '' };

  return memoizedConfig;
};
