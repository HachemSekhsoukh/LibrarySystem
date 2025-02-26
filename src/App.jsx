import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login from "./Pages/login";
import TestingSetting from "./Pages/Settings";
import PagesLayout from "./Layouts/PagesLayout";
import "./App.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Pages requiring the layout (after login) */}
      <Route element={<PagesLayout />}>
        <Route path="/settings" element={<TestingSetting />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
