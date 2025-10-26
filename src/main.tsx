import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPerformanceOptimizations } from './utils/preload'
import { TranslationProvider } from './contexts/TranslationContext'

// Initialize performance optimizations
initPerformanceOptimizations();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslationProvider>
      <App />
    </TranslationProvider>
  </StrictMode>,
)
