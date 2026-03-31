import { create } from 'zustand';

interface ApiUrlState {
  url: string;
  setUrl: (url: string) => void;
  reset: () => void;
}

export const useApiUrlStore = create<ApiUrlState>((set) => {
  let initialUrl = 'http://localhost:3000';

  if (typeof window !== 'undefined') {
    initialUrl =
      localStorage.getItem('apiBaseUrl') ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:3000';
  }

  return {
    url: initialUrl,
    setUrl: (url) => {
      localStorage.setItem('apiBaseUrl', url);
      set({ url });
    },
    reset: () => {
      localStorage.removeItem('apiBaseUrl');
      const defaultUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      set({ url: defaultUrl });
    },
  };
});
