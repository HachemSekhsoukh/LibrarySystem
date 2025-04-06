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
import Readers from "./Pages/circulation/readers";
import Exemplaires from "./Pages/circulation/exemplaires";
import Administration from "./Pages/administration";
import Peb from "./Pages/circulation/peb";
import CirculationAdministration from "./Pages/circulation/administration";
import Catalogage from "./Pages/catalogage/catalogage";
import CatalogageAdministration from "./Pages/catalogage/administration";
import PagesLayout from "./Layouts/PagesLayout";
import LibraryHome from "./Pages/userSide/LibraryHome";
import BookDetail from "./Pages/userSide/BookDetail";
import "./App.css";
import ViewAll from "./Pages/userSide/viewAll";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Navigate to="/library" replace />} />
      <Route path="/library" element={<LibraryHome />} />
      <Route path="/book/:id" element={<BookDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/view-all" element={<ViewAll />} />

      {/* Pages requiring the layout (after login) */}
      <Route element={<PagesLayout />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="/circulation/readers" element={<Readers />} />
          <Route path="/circulation/transactions" element={<Navigate to="/circulation/exemplaires" replace />} />
          <Route path="/circulation/peb" element={<Peb />} />
          <Route path="/circulation/exemplaires" element={<Exemplaires />} />
          <Route path="/circulation/administration" element={<CirculationAdministration />} />
          <Route path="/catalogage/catalogage" element={<Catalogage />} />
          <Route path="/catalogage/administration" element={<CatalogageAdministration />} />
      </Route>
      <Route path="*" element={<Navigate to="/library" replace />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
