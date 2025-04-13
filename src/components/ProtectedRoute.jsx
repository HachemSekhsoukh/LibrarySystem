import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { checkAuthStatus } from '../utils/api.js';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function verify() {
      const status = await checkAuthStatus();
      setAuthenticated(status.authenticated);
      setLoading(false);
    }
    verify();
  }, []);

  if (loading) return <div>Loading...</div>; // Show a spinner or loading screen

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;