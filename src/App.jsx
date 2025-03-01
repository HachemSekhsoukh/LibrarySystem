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
import Readers from "./Pages/readers";
import PagesLayout from "./Layouts/PagesLayout";
import "./App.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Pages requiring the layout (after login) */}
      <Route element={<PagesLayout />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/circulation/readers" element={<Readers />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
