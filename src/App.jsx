import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import "./App.css";
// new pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CaptainDashboard from "./pages/captain/CaptainDashboard";

// protected route
import ProtectedRoute from "./pages/components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Team Captain Routes */}
        <Route
          path="/captain" element={<ProtectedRoute role="teamCaptain"> <CaptainDashboard /></ProtectedRoute>}/>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
