import { BrowserRouter } from 'react-router'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'
import { UserProvider } from './UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
)
