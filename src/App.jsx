import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import "./App.css";

// pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CaptainDashboard from "./pages/captain/CaptainDashboard";
import Booking from "./pages/booking/Booking.jsx";
import Gallery from "./pages/Gallery";
// protected route
import ProtectedRoute from "./pages/components/ProtectedRoute";

// common components


function App() {
  return (
    <>
      {/* Header har page par */}


      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/gallery" element={<Gallery />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        {/* Team Captain Routes */}
        {/* <Route path="/captain" element={<ProtectedRoute role="teamCaptain"> <CaptainDashboard /></ProtectedRoute>}/> */}
        <Route path="/captain" element={<CaptainDashboard />} />
        <Route path="/book-slots" element={<Booking />} />
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer har page par */}
 
    </>
  );
}

export default App;
