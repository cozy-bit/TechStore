import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { ThemeBootstrap } from './components/ThemeBootstrap'
import { BackendEventsBootstrap } from './components/BackendEventsBootstrap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeBootstrap />
      <BackendEventsBootstrap />
      <App />
    </BrowserRouter>
  </StrictMode>
)
