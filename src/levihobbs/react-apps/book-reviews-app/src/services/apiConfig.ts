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

  // Check if we're in the C# website context
  if (typeof window !== 'undefined' && window.bookReviewsConfig) {
    const config = window.bookReviewsConfig;
    memoizedConfig = {
      useMock: config.standaloneMode, // standaloneMode: true = use mock, false = use real API
      baseUrl: config.standaloneMode ? '' : '' // Use same domain when not in standalone mode
    };
  } else {
    // Fallback to environment variables for standalone mode
    // Default to standalone mode (true) if no configuration is provided
    memoizedConfig = {
      useMock: import.meta.env.VITE_USE_MOCK !== 'false',
      baseUrl: import.meta.env.VITE_API_BASE_URL
    };
  }

  return memoizedConfig;
};
