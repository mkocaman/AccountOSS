import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Ant Design React 19 uyumluluk uyarısını suppress et
const originalWarn = console.warn
console.warn = (...args) => {
  if (args[0]?.includes?.('antd v5 support React is 16 ~ 18')) {
    return // Bu uyarıyı gösterme
  }
  originalWarn(...args)
}

// React Query client oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      cacheTime: 10 * 60 * 1000, // 10 dakika
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
