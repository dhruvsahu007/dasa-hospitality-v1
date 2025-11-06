import React from 'react'
import ReactDOM from 'react-dom/client'
import Agent from './Agent.jsx'
import './index.css'

// Reset body and root styles for agent dashboard
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.overflow = 'hidden'
const root = document.getElementById('root')
if (root) {
  root.style.width = '100%'
  root.style.height = '100vh'
  root.style.margin = '0'
  root.style.padding = '0'
  root.style.textAlign = 'left'
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Agent />
  </React.StrictMode>,
)
