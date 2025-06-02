import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import LibraryHome from "./Pages/LibraryHome";
import BookDetail from "./Pages/BookDetail";
import UserLogin from "./Pages/Login";
import UserSignUp from "./Pages/Signup";
import ViewAll from "./Pages/viewAll";
import History from "./Pages/History";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./Pages/Profile";
import "./App.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/sign-up" element={<UserSignUp />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/library" replace />} />
        <Route path="/library" element={<LibraryHome />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/view-all" element={<ViewAll />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback route — send unauthenticated users to login */}
      <Route path="*" element={<Navigate to="/user/login" replace />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
