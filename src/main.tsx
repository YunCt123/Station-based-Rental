import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPerformanceOptimizations } from './utils/preload'
import { TranslationProvider } from './contexts/TranslationContext'
import { Toaster } from '@/components/ui/sonner'

// Initialize performance optimizations
initPerformanceOptimizations();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslationProvider>
      <App />
      <Toaster position="top-right" richColors />
    </TranslationProvider>
  </StrictMode>,
)
