import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import Login from "./Pages/login";
import Settings from "./Pages/Settings";
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
import ProtectedRoute from "./components/ProtectedRoute"; // Import your protected route

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes (requires token) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PagesLayout />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="/circulation/readers" element={<Readers />} />
          <Route
            path="/circulation/transactions"
            element={<Navigate to="/circulation/exemplaires" replace />}
          />
          <Route path="/circulation/late" element={<Late />} />
          <Route path="/circulation/exemplaires" element={<Exemplaires />} />
          <Route
            path="/circulation/administration"
            element={<CirculationAdministration />}
          />
          <Route path="/catalogage/catalogage" element={<Catalogage />} />
          <Route
            path="/catalogage/administration"
            element={<CatalogageAdministration />}
          />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/library" replace />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;