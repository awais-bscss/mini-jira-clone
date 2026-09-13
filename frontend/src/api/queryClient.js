import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,        // 1 minute — avoids redundant refetches
      gcTime: 5 * 60_000,       // 5 minutes garbage collection
      retry: 1,                 // retry once on failure
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,                 // no retry on mutations — let optimistic rollback handle it
    },
  },
});
