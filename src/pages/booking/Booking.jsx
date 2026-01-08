import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Calendar, Clock, MapPin, Users, CalendarDays, Loader2, Download, Grid, List, AlertCircle, User, LogOut, Home, AlertTriangle } from 'lucide-react';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import '../booking/Booking.css';

const SlotBooking = () => {
  const navigate = useNavigate();
  
  // State declarations
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bookingLoading, setBookingLoading] = useState({});
  const [slotView, setSlotView] = useState('grid');
  const [teamBookings, setTeamBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Use refs to track loading state
  const isFetchingTeamData = useRef(false);
  const isFetchingBookings = useRef(false);

  // Get current user from localStorage
  useEffect(() => {
    console.log('🔄 [FRONTEND] Step 1: Getting current user from localStorage');
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log(`🔑 Token exists: ${!!token}`);
    console.log(`👤 User exists: ${!!user}`);
    
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('👤 [FRONTEND] Parsed user data:', {
          id: parsedUser._id,
          name: parsedUser.name,
          email: parsedUser.email,
          role: parsedUser.role
        });
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('❌ [FRONTEND] Error parsing user data:', error);
        showNotification('error', 'Error loading user data. Please login again.');
        handleLogout();
      }
    } else {
      console.warn('⚠️ [FRONTEND] No user found in localStorage');
      showNotification('error', 'Please login to access booking');
      setTimeout(() => navigate('/login'), 1000);
    }
  }, []);

  // Notification function
  const showNotification = useCallback((type, message) => {
    console.log(`📢 [FRONTEND] Notification: ${type} - ${message}`);
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  }, []);

  // Test captain existence function
  const testCaptainExistence = useCallback(async () => {
    if (!currentUser?._id) return;
    
    try {
      console.log('🔍 [FRONTEND] Testing captain existence for:', currentUser._id);
      const res = await API.get(`/bookings/test-captain/${currentUser._id}`);
      console.log('✅ [FRONTEND] Test result:', res.data);
      
      if (res.data.exists) {
        console.log(`🎯 Captain verified: ${res.data.user.name}`);
        return true;
      } else {
        console.warn('⚠️ Captain not found in database');
        showNotification('error', 'Your account was not found in database. Please contact support.');
        return false;
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Test failed:', error);
      return false;
    }
  }, [currentUser, showNotification]);

  // Fetch team bookings
  const fetchTeamBookings = useCallback(async (teamId) => {
    if (isFetchingBookings.current) {
      console.log('⏸️ [FRONTEND] Bookings fetch already in progress');
      return;
    }

    console.log('🔄 [FRONTEND] Fetching team bookings for team:', teamId);
    
    try {
      isFetchingBookings.current = true;
      setLoadingBookings(true);
      
      if (!teamId) {
        console.warn('⚠️ [FRONTEND] No team ID provided');
        return;
      }
      
      const res = await API.get(`/bookings/team/${teamId}`);
      console.log(`✅ [FRONTEND] Found ${res.data.bookings?.length || 0} bookings`);
      
      if (res.data.success) {
        setTeamBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("❌ [FRONTEND] Failed to fetch bookings:", err);
      if (err.response?.status === 401) {
        showNotification('error', 'Session expired. Please login again.');
        handleLogout();
      }
    } finally {
      setLoadingBookings(false);
      isFetchingBookings.current = false;
    }
  }, [showNotification]);

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    if (isFetchingTeamData.current) {
      console.log('⏸️ [FRONTEND] Team data fetch already in progress');
      return;
    }

    console.log('🔄 [FRONTEND] Fetching team data');
    
    try {
      isFetchingTeamData.current = true;
      setLoading(true);
      
      const response = await API.get('/team/my-team');
      console.log('✅ [FRONTEND] Team API response:', response.data);
      
      if (response.data.success) {
        console.log('🏢 [FRONTEND] Team data received:', response.data.team);
        setTeam(response.data.team);
        setMembers(response.data.members || []);
        
        // Fetch team bookings
        if (response.data.team?._id) {
          console.log('🆔 [FRONTEND] Team ID found:', response.data.team._id);
          fetchTeamBookings(response.data.team._id);
        }
      } else {
        console.warn('⚠️ [FRONTEND] Team API returned success: false');
        showNotification('error', response.data.message || 'Failed to load team data');
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Error fetching team:', error);
      
      if (error.response?.status === 401) {
        showNotification('error', 'Session expired. Please login again.');
        handleLogout();
      } else {
        showNotification('error', 
          error.response?.data?.message || 
          'Failed to fetch team data. Please try again.'
        );
      }
    } finally {
      setLoading(false);
      isFetchingTeamData.current = false;
    }
  }, [fetchTeamBookings, showNotification]);

  // Initial data fetch
  useEffect(() => {
    console.log('🚀 [FRONTEND] Initial data fetch');
    if (currentUser) {
      fetchTeamData();
    }
  }, [currentUser, fetchTeamData]);

  // Fetch slots by date
  const fetchSlotsByDate = useCallback(async (date) => {
    console.log(`🔄 [FRONTEND] Fetching slots for date: ${date}`);
    
    try {
      const res = await API.get(`/slots/by-date?date=${date}`);
      
      if (res.data.success) {
        const slotsWithRemaining = res.data.data.map(slot => ({
          ...slot,
          remaining: slot.capacity - (slot.bookedCount || 0)
        }));
        console.log(`📊 [FRONTEND] Total slots found: ${slotsWithRemaining.length}`);
        setSlots(slotsWithRemaining);
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Error fetching slots:', err);
      
      if (err.response?.status === 401) {
        showNotification('error', 'Session expired. Please login again.');
        handleLogout();
      } else {
        showNotification("error", "Failed to load slots. Please try again.");
      }
    }
  }, [showNotification]);

  // Fetch slots when date changes
  useEffect(() => {
    if (currentUser) {
      fetchSlotsByDate(selectedDate);
    }
  }, [selectedDate, currentUser, fetchSlotsByDate]);

  // Book slot function - FIXED VERSION
  const handleBookSlot = async (slotId) => {
    console.log(`🔄 [FRONTEND] Starting booking for slot: ${slotId}`);
    
    // Pre-flight checks
    if (!currentUser) {
      showNotification("error", "Please login as team captain");
      return;
    }

    if (!team?._id) {
      showNotification("error", "Create team first");
      navigate('/team');
      return;
    }

    if (members.length < 7) {
      showNotification("error", "Need at least 7 players to book a slot");
      return;
    }

    // Check captain existence before booking
    const captainVerified = await testCaptainExistence();
    if (!captainVerified) {
      showNotification('error', 'Cannot verify your account. Please contact support.');
      return;
    }

    setBookingLoading(prev => ({ ...prev, [slotId]: true }));

    try {
      // Prepare booking data
      const bookingData = {
        teamId: team._id
        // captainId is now taken from token in backend
      };
      
      console.log('📦 [FRONTEND] Booking payload:', bookingData);
      console.log('👤 [FRONTEND] Current user ID (from token):', currentUser._id);
      
      // Make API call
      const res = await API.post(`/bookings/book/${slotId}`, bookingData);
      console.log('✅ [FRONTEND] Booking API response:', res.data);

      if (res.data.success) {
        console.log('🎉 [FRONTEND] Booking successful!');
        showNotification("success", "Slot booked successfully!");
        
        // Update local slots state
        setSlots(prevSlots => 
          prevSlots.map(slot => {
            if (slot._id === slotId) {
              const newBookedCount = (slot.bookedCount || 0) + 1;
              const newRemaining = slot.capacity - newBookedCount;
              
              return {
                ...slot,
                bookedTeams: [...(slot.bookedTeams || []), team.teamName],
                bookedCount: newBookedCount,
                remaining: newRemaining,
                isFull: newRemaining <= 0
              };
            }
            return slot;
          })
        );
        
        // Refresh data
        setTimeout(() => {
          fetchSlotsByDate(selectedDate);
          if (team?._id) {
            fetchTeamBookings(team._id);
          }
        }, 1000);

      } else {
        // Handle backend error message
        const errorMsg = res.data.message || "Booking failed";
        console.warn('⚠️ [FRONTEND] Booking API success false:', errorMsg);
        
        let userFriendlyMessage = errorMsg;
        if (errorMsg.includes('Captain not found')) {
          userFriendlyMessage = "Your account was not found. Please login again.";
          setTimeout(() => handleLogout(), 2000);
        } else if (errorMsg.includes('already booked')) {
          userFriendlyMessage = "Your team has already booked this slot";
        } else if (errorMsg.includes('Slot is already full')) {
          userFriendlyMessage = "This slot is already full";
        } else if (errorMsg.includes('Only team captain can book')) {
          userFriendlyMessage = "Only team captain can book slots";
        }
        
        showNotification("error", userFriendlyMessage);
      }

    } catch (err) {
      console.error('❌ [FRONTEND] Booking error:', err);
      console.error('📊 [FRONTEND] Error response:', err.response?.data);
      console.error('🔢 [FRONTEND] Error status:', err.response?.status);
      
      let errorMessage = "Booking failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        if (errorMessage.includes('Captain not found')) {
          errorMessage = "Your account was not found. Please login again.";
          setTimeout(() => handleLogout(), 2000);
        } else if (errorMessage.includes('already booked')) {
          errorMessage = "Your team has already booked this slot";
        } else if (errorMessage.includes('Slot is already full')) {
          errorMessage = "This slot is already full";
        }
      }
      
      showNotification("error", errorMessage);
      
    } finally {
      console.log('🏁 [FRONTEND] Booking process completed');
      setBookingLoading(prev => ({ ...prev, [slotId]: false }));
    }
  };

  // Cancel booking - FIXED VERSION
  const handleCancelBooking = async (bookingId) => {
    console.log(`🔄 [FRONTEND] Starting cancellation for booking: ${bookingId}`);
    
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      console.log('❌ [FRONTEND] Cancellation cancelled by user');
      return;
    }

    try {
      const res = await API.delete(`/bookings/cancel/${bookingId}`);
      console.log('✅ [FRONTEND] Cancel API response:', res.data);
      
      if (res.data.success) {
        console.log('✅ [FRONTEND] Booking cancelled successfully');
        showNotification("success", "Booking cancelled successfully!");
        
        // Refresh data
        fetchSlotsByDate(selectedDate);
        if (team?._id) {
          fetchTeamBookings(team._id);
        }
      } else {
        // Handle backend error
        showNotification("error", res.data.message || "Cancellation failed");
      }
      
    } catch (err) {
      console.error('❌ [FRONTEND] Cancel booking error:', err);
      console.error('📊 [FRONTEND] Error response:', err.response?.data);
      console.error('🔢 [FRONTEND] Error status:', err.response?.status);
      
      let errorMessage = "Cancellation failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        if (errorMessage.includes('not authorized')) {
          errorMessage = "You are not authorized to cancel this booking";
        } else if (errorMessage.includes('Booking not found')) {
          errorMessage = "Booking not found or already cancelled";
        }
      }
      
      showNotification("error", errorMessage);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format slot date
  const formatSlotDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Logout function
  const handleLogout = () => {
    console.log('🔒 [FRONTEND] Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('info', 'Logged out successfully');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // Export bookings to PDF
  const exportBookingsToPDF = () => {
    if (!team || teamBookings.length === 0) {
      showNotification('error', 'No bookings available to export');
      return;
    }

    try {
      setIsExporting(true);
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('Team Bookings Report', pageWidth / 2, 25, { align: 'center' });
      
      // Team info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(team.teamName, pageWidth / 2, 35, { align: 'center' });
      
      // Generated date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 42, { align: 'center' });
      
      // Team information section
      let yPos = 55;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Team Information', 20, yPos);
      
      yPos += 12;
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(20, yPos - 2, pageWidth - 20, yPos - 2);
      
      yPos += 5;
      doc.setFontSize(11);
      
      const teamInfo = [
        ['Team Name:', team.teamName],
        ['Total Players:', team.totalPlayers],
        ['Active Bookings:', teamBookings.length],
        ['Captain:', currentUser?.name || 'You']
      ];
      
      teamInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 70, yPos);
        yPos += 8;
      });
      
      // Booking history table
      yPos += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Booking History', 20, yPos);
      
      yPos += 12;
      doc.setDrawColor(59, 130, 246);
      doc.line(20, yPos - 2, pageWidth - 20, yPos - 2);
      
      const tableData = teamBookings.map((booking, index) => [
        index + 1,
        formatDate(booking.slotId?.slotDate),
        `${booking.slotId?.startTime} - ${booking.slotId?.endTime}`,
        booking.groundId?.name || "Main Ground",
        booking.bookingStatus,
        booking.paymentStatus,
        formatDate(booking.createdAt)
      ]);
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['#', 'Date', 'Time', 'Ground', 'Status', 'Payment', 'Booked On']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: [51, 65, 85]
        }
      });
      
      // Footer
      const finalY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text('Generated by SportsHub Booking System', pageWidth / 2, finalY, { align: 'center' });
      
      // Save PDF
      const fileName = `${team.teamName.replace(/\s+/g, '_')}_Bookings_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      showNotification('success', 'Bookings PDF exported successfully!');
      
    } catch (error) {
      console.error('❌ [FRONTEND] Error generating PDF:', error);
      showNotification('error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Custom Header Component
  const Header = () => (
    <header className="booking-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('/dashboard')}>
            <Home size={28} />
            <span className="logo-text">SportsHub</span>
          </div>
          <h1>Slot Booking</h1>
        </div>
        
        <div className="header-right">
          {currentUser && (
            <div className="user-info">
              <User size={20} />
              <div className="user-details">
                <span className="user-name">{currentUser.name || 'Captain'}</span>
                <span className="user-role">Team Captain</span>
              </div>
            </div>
          )}
          
          <div className="header-actions">
            <button 
              className="btn-header btn-dashboard"
              onClick={() => navigate('/dashboard')}
              title="Dashboard"
            >
              Dashboard
            </button>
            <button 
              className="btn-header btn-team"
              onClick={() => navigate('/team')}
              title="Team Management"
            >
              My Team
            </button>
            {debugMode && (
              <button 
                className="btn-header btn-debug"
                onClick={testCaptainExistence}
                title="Test Captain Verification"
              >
                Test Captain
              </button>
            )}
            <button 
              className="btn-header btn-debug-toggle"
              onClick={() => setDebugMode(!debugMode)}
              title="Toggle Debug Mode"
            >
              {debugMode ? '🔧 Debug ON' : '🔧 Debug'}
            </button>
            <button 
              className="btn-header btn-logout"
              onClick={handleLogout}
              title="Logout"
              disabled={isExporting}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // Slot Card Component
  const SlotCard = ({ slot, onBook }) => {
    const isSlotBookable = !slot.isFull && 
      team?._id && 
      members.length >= 7 &&
      !slot.bookedTeams?.includes(team?.teamName);

    const isAlreadyBooked = slot.bookedTeams?.includes(team?.teamName);
    const bookedCount = slot.bookedCount || 0;
    const remaining = slot.remaining || (slot.capacity - bookedCount);

    return (
      <div className={`slot-card ${slot.isFull ? 'full' : ''} ${isAlreadyBooked ? 'booked' : ''}`}>
        <div className="slot-card-header">
          <div className="slot-time">
            <Clock size={16} />
            <span>{slot.startTime} - {slot.endTime}</span>
          </div>
          <div className="slot-date">
            <Calendar size={16} />
            <span>{formatSlotDate(slot.slotDate)}</span>
          </div>
        </div>
        
        <div className="slot-card-body">
          <div className="slot-info">
            <div className="info-item">
              <MapPin size={14} />
              <span>{slot.groundId?.name || "Main Ground"}</span>
            </div>
            <div className="info-item">
              <Users size={14} />
              <span>Capacity: {slot.capacity} teams</span>
            </div>
          </div>
          
          <div className="slot-availability">
            <div className="availability-meter">
              <div 
                className="meter-fill"
                style={{ 
                  width: `${(bookedCount / slot.capacity) * 100}%`,
                  backgroundColor: slot.isFull ? '#ef4444' : '#10b981'
                }}
              ></div>
            </div>
            <div className="availability-info">
              <span className="booked-count">{bookedCount} booked</span>
              <span className="remaining">{remaining} available</span>
            </div>
          </div>
          
          {slot.bookedTeams && slot.bookedTeams.length > 0 && (
            <div className="booked-teams">
              <p className="teams-label">Booked by:</p>
              <div className="team-tags">
                {slot.bookedTeams.slice(0, 3).map((teamName, idx) => (
                  <span key={idx} className={`team-tag ${teamName === team?.teamName ? 'my-team' : ''}`}>
                    {teamName}
                  </span>
                ))}
                {slot.bookedTeams.length > 3 && (
                  <span className="team-tag more-teams">
                    +{slot.bookedTeams.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="slot-card-footer">
          {isAlreadyBooked ? (
            <button className="btn btn-success booked-btn" disabled>
              ✓ Already Booked
            </button>
          ) : slot.isFull ? (
            <button className="btn btn-danger" disabled>
              <AlertTriangle size={16} /> Fully Booked
            </button>
          ) : isSlotBookable ? (
            <button 
              className="btn btn-primary"
              onClick={() => onBook(slot._id)}
              disabled={bookingLoading[slot._id]}
            >
              {bookingLoading[slot._id] ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Booking...
                </>
              ) : 'Book Slot'}
            </button>
          ) : (
            <button className="btn btn-secondary" disabled>
              {members.length < 7 ? 'Requires 7+ Players' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Booking Card Component
  const BookingCard = ({ booking }) => {
    return (
      <div className="booking-card">
        <div className="booking-header">
          <div className="booking-date">
            <CalendarDays size={18} />
            <span>{formatDate(booking.slotId?.slotDate)}</span>
          </div>
          <span className={`booking-status ${booking.bookingStatus}`}>
            {booking.bookingStatus}
          </span>
        </div>
        
        <div className="booking-details">
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">
              {booking.slotId?.startTime} - {booking.slotId?.endTime}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Ground:</span>
            <span className="detail-value">
              {booking.groundId?.name || "Main Ground"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Status:</span>
            <span className={`payment-status ${booking.paymentStatus}`}>
              {booking.paymentStatus}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Booked On:</span>
            <span className="detail-value">
              {formatDate(booking.createdAt)}
            </span>
          </div>
        </div>
        
        {booking.bookingStatus === 'confirmed' && (
          <div className="booking-actions">
            <button
              className="btn btn-danger"
              onClick={() => handleCancelBooking(booking._id)}
              disabled={isExporting}
            >
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading booking data...</p>
      </div>
    );
  }

  return (
    <div className="slot-booking-page">
      {/* Header */}
      <Header />

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Debug Info (only in debug mode) */}
      {debugMode && currentUser && (
        <div className="debug-info">
          <div className="debug-content">
            <h4>🔧 Debug Information</h4>
            <p><strong>User ID:</strong> {currentUser._id}</p>
            <p><strong>User Name:</strong> {currentUser.name}</p>
            <p><strong>User Role:</strong> {currentUser.role}</p>
            <p><strong>Team:</strong> {team ? team.teamName : 'No team'}</p>
            <p><strong>Members:</strong> {members.length} (Need: 7+)</p>
            <p><strong>Bookings:</strong> {teamBookings.length}</p>
            <p><strong>Slots Available:</strong> {slots.length}</p>
          </div>
        </div>
      )}

      {/* Loading overlay for PDF export */}
      {isExporting && (
        <div className="export-loading-overlay">
          <div className="export-loading-content">
            <div className="export-spinner"></div>
            <p>Generating PDF...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="booking-main-content">
        <div className="booking-section-header">
          <h2>Book Practice Slots</h2>
          <div className="slot-controls">
            <div className="date-picker">
              <label>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              />
            </div>
            <div className="view-toggle">
              <button 
                className={`view-btn ${slotView === 'grid' ? 'active' : ''}`}
                onClick={() => setSlotView('grid')}
                disabled={isExporting}
              >
                <Grid size={16} />
                Grid
              </button>
              <button 
                className={`view-btn ${slotView === 'list' ? 'active' : ''}`}
                onClick={() => setSlotView('list')}
                disabled={isExporting}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Team Info Banner */}
        {team ? (
          <div className="team-info-banner">
            <div className="team-banner-content">
              <h3>📋 Booking for: <span className="team-name-highlight">{team.teamName}</span></h3>
              <p>You are booking slots as the team captain</p>
              <div className="team-stats">
                <span className="stat-item">
                  <strong>{members.length}</strong> players
                </span>
                <span className="stat-item">
                  <strong>{teamBookings.length}</strong> active bookings
                </span>
                <span className="stat-item">
                  <strong>7</strong> players required
                </span>
              </div>
              {teamBookings.length > 0 && (
                <button 
                  className="btn btn-primary btn-export"
                  onClick={exportBookingsToPDF}
                  disabled={isExporting}
                >
                  <Download size={18} />
                  {isExporting ? 'Exporting...' : 'Export Bookings PDF'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="no-team-banner">
            <div className="no-team-content">
              <AlertCircle size={32} />
              <h3>No Team Found</h3>
              <p>You need to create a team first before booking slots.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/team')}
                disabled={isExporting}
              >
                Create Team First
              </button>
            </div>
          </div>
        )}

        {/* Team Requirements Check */}
        {team && members.length < 7 && (
          <div className="warning-alert">
            <AlertCircle size={20} />
            <div className="warning-content">
              <p>You need at least <strong>7 players</strong> in your team to book a slot.</p>
              <p>Currently you have <strong>{members.length} players</strong>.</p>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/team')}
            >
              Add Players
            </button>
          </div>
        )}

        {/* Your Bookings Section */}
        {team && teamBookings.length > 0 && (
          <div className="your-bookings-section">
            <div className="section-header">
              <h3>Your Bookings ({teamBookings.length})</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => fetchTeamBookings(team._id)}
                disabled={loadingBookings}
              >
                {loadingBookings ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="bookings-container">
              {loadingBookings ? (
                <div className="loading-bookings">
                  <Loader2 className="animate-spin" size={24} />
                  <p>Loading bookings...</p>
                </div>
              ) : (
                teamBookings.map(booking => (
                  <BookingCard key={booking._id} booking={booking} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Available Slots */}
        <div className="available-slots-section">
          <div className="section-header">
            <h3>Available Slots for {formatSlotDate(selectedDate)}</h3>
            <div className="slots-header-right">
              <span className="slots-count">{slots.length} slots available</span>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => fetchSlotsByDate(selectedDate)}
              >
                Refresh Slots
              </button>
            </div>
          </div>
          <div className={`slots-container ${slotView}`}>
            {slots.length === 0 ? (
              <div className="empty-slots">
                <div className="empty-icon">📅</div>
                <h4>No slots available</h4>
                <p className="subtext">Try selecting a different date</p>
              </div>
            ) : (
              slots.map(slot => (
                <SlotCard 
                  key={slot._id}
                  slot={slot}
                  onBook={handleBookSlot}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotBooking;