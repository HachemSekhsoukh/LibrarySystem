import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'; 
import { AuthProvider } from "./utils/privilegeContext";

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
      
)
