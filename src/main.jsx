import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'; 
import { UserProvider } from './utils/userContext.jsx'; // import context

createRoot(document.getElementById('root')).render(
    <UserProvider>
      <App />
    </UserProvider>
)
