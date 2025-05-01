import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import Login from "./Pages/login";
import Settings from "./Pages/Settings";
import Unauthorized from "./Pages/unauthorized";
import Dashboard from "./Pages/dashboard";
import Logs from "./Pages/logs";
import Readers from "./Pages/circulation/readers";
import Exemplaires from "./Pages/circulation/exemplaires";
import Administration from "./Pages/administration";
import Late from "./Pages/circulation/late";
import CirculationAdministration from "./Pages/circulation/administration";
import Catalogage from "./Pages/catalogage/catalogage";
import CatalogageAdministration from "./Pages/catalogage/administration";
import PagesLayout from "./Layouts/PagesLayout";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute"; // Updated version with RBAC

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated Layout with Nested Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PagesLayout />}>
          <Route path="/settings" element={<Settings />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredPrivileges={["view_dashboard"]} />
            }
          >
            <Route index element={<Dashboard />} />
          </Route>

          <Route
            path="/logs"
            element={<ProtectedRoute requiredPrivileges={["view_logs"]} />}
          >
            <Route index element={<Logs />} />
          </Route>

          <Route
            path="/administration"
            element={
              <ProtectedRoute requiredPrivileges={["view_administration"]} />
            }
          >
            <Route index element={<Administration />} />
          </Route>

          <Route
            path="/circulation/readers"
            element={
              <ProtectedRoute requiredPrivileges={["view_circulation_readers"]} />
            }
          >
            <Route index element={<Readers />} />
          </Route>

          <Route
            path="/circulation/transactions"
            element={<Navigate to="/circulation/exemplaires" replace />}
          />

          <Route
            path="/circulation/late"
            element={
              <ProtectedRoute requiredPrivileges={["view_circulation_late"]} />
            }
          >
            <Route index element={<Late />} />
          </Route>

          <Route
            path="/circulation/exemplaires"
            element={
              <ProtectedRoute requiredPrivileges={["view_circulation_exemplaires"]} />
            }
          >
            <Route index element={<Exemplaires />} />
          </Route>

          <Route
            path="/circulation/administration"
            element={
              <ProtectedRoute requiredPrivileges={["view_circulation_administration"]} />
            }
          >
            <Route index element={<CirculationAdministration />} />
          </Route>

          <Route
            path="/catalogage/catalogage"
            element={
              <ProtectedRoute requiredPrivileges={["view_catalogage_catalogage"]} />
            }
          >
            <Route index element={<Catalogage />} />
          </Route>

          <Route
            path="/catalogage/administration"
            element={
              <ProtectedRoute requiredPrivileges={["view_catalogage_administration"]} />
            }
          >
            <Route index element={<CatalogageAdministration />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;