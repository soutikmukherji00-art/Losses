import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LayerVisibilityProvider } from './presenter/LayerVisibilityContext.jsx'
import './styles/tokens.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LayerVisibilityProvider>
      <App />
    </LayerVisibilityProvider>
  </React.StrictMode>,
)
