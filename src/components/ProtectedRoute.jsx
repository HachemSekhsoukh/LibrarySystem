import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { checkAuthStatus } from "../utils/api.js";
import { useAuth } from "../utils/privilegeContext"; // adjust path if needed

const ProtectedRoute = ({ requiredPrivileges = [] }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const { privileges } = useAuth();
  const location = useLocation();

  useEffect(() => {
    async function verify() {
      const status = await checkAuthStatus();
      setAuthenticated(status.authenticated);
      setLoading(false);
    }
    verify();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Not logged in
  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check privilege if required
  const hasAccess = requiredPrivileges.every((priv) =>
    privileges.includes(priv)
  );

  return hasAccess ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" replace state={{ from: location }} />
  );
};

export default ProtectedRoute;
