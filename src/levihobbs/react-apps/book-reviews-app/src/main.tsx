import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './scss/common.scss'
import './scss/book-card.scss'
import './scss/book-review-reader.scss'
import './scss/search-bar.scss'

createRoot(document.getElementById('book-reviews-app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
