import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import "./App.css";

// pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SlotsPage from './pages/Slots/SlotsPage.jsx';
import CaptainDashboard from "./pages/captain/CaptainDashboard";
import ChampionsTrophy from "./pages/captain/ChampionsTrophy";


import Booking from "./pages/booking/Booking.jsx";
import Gallery from "./pages/Gallery";
import CricketPlayerRegistration from "./pages/PlayerRegistration.jsx"
import AdminDashboardd from "./pages/AdminDashboard.jsx"
// protected route
import ProtectedRoute from "./pages/components/ProtectedRoute";
import  ContactUs  from "./pages/contact/contact_us.jsx";
import  PrivacyPolicy  from "./pages/contact/privacy_policy.jsx";
import  RefundPolicy  from "./pages/contact/refund_policy.jsx";
import  TermsAndConditions  from "./pages/contact/terms_and_conditions.jsx";

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
        <Route path="/admin/slots" element={<SlotsPage />} />
        <Route path="/trophyPlayer" element={<AdminDashboardd/>}/>
        {/* Team Captain Routes */}
        {/* <Route path="/captain" element={<ProtectedRoute role="teamCaptain"> <CaptainDashboard /></ProtectedRoute>}/> */}
        <Route path="/captain" element={<CaptainDashboard />} />
        <Route path="/ChampionsTrophy" element={<ChampionsTrophy />} />
        <Route path="/book-slots" element={<Booking />} />


        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
        <Route path="/playerRegistration" element={<CricketPlayerRegistration/>} />
        <Route path="/contact" element={< ContactUs/>}/>
        <Route path="/privacy" element={< PrivacyPolicy/>}/>
        <Route path="/refund" element={< RefundPolicy/>}/>
        <Route path="/terms" element={< TermsAndConditions/>}/>

      </Routes>

      {/* Footer har page par */}
 
    </>
  );
}

export default App;
