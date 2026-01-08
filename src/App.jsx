import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import "./App.css";

// pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Gallery from "./pages/Gallery";

// protected route
import ProtectedRoute from "./pages/components/ProtectedRoute";

// common components
import Header from "./pages/components/header";
import Footer from "./pages/components/footer";

function App() {
  return (
    <>
      {/* Header har page par */}
      <Header />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Protected Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer har page par */}
      <Footer />
    </>
  );
}

export default App;
