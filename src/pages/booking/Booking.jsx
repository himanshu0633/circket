import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Calendar, Clock, MapPin, Users, CalendarDays, Loader2, Download, Grid, List, AlertCircle, User, LogOut, Home } from 'lucide-react';
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

  // Use refs to track loading state and prevent infinite loops
  const isFetchingTeamData = useRef(false);
  const isFetchingBookings = useRef(false);

  // Get current user from localStorage
  useEffect(() => {
    console.log('🔄 [FRONTEND] Step 1: Getting current user from localStorage');
    const user = localStorage.getItem('user');
    
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('👤 [FRONTEND] Parsed user data:', parsedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('❌ [FRONTEND] Error parsing user data:', error);
      }
    } else {
      console.warn('⚠️ [FRONTEND] No user found in localStorage');
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

  // Fetch team bookings - FIXED VERSION (no dependency on team)
  const fetchTeamBookings = useCallback(async (teamId) => {
    if (isFetchingBookings.current) {
      console.log('⏸️ [FRONTEND] Bookings fetch already in progress');
      return;
    }

    console.log('🔄 [FRONTEND] Step 4: Fetching team bookings');
    
    try {
      isFetchingBookings.current = true;
      
      if (!teamId) {
        console.warn('⚠️ [FRONTEND] No team ID provided');
        return;
      }
      
      console.log(`🌐 [FRONTEND] Making API call: GET /bookings/team/${teamId}`);
      setLoadingBookings(true);
      const res = await API.get(`/bookings/team/${teamId}`);
      console.log('✅ [FRONTEND] Bookings API response:', res.data);
      
      if (res.data.success) {
        console.log(`📅 [FRONTEND] Team bookings count: ${res.data.bookings?.length || 0}`);
        setTeamBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("❌ [FRONTEND] Failed to fetch bookings:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      console.log('🏁 [FRONTEND] Bookings fetch completed');
      setLoadingBookings(false);
      isFetchingBookings.current = false;
    }
  }, []); // No dependencies to prevent re-renders

  // Fetch team data - FIXED VERSION
  const fetchTeamData = useCallback(async () => {
    if (isFetchingTeamData.current) {
      console.log('⏸️ [FRONTEND] Team data fetch already in progress');
      return;
    }

    console.log('🔄 [FRONTEND] Step 2: Fetching team data');
    
    try {
      isFetchingTeamData.current = true;
      setLoading(true);
      
      console.log('🌐 [FRONTEND] Making API call: GET /team/my-team');
      const response = await API.get('/team/my-team');
      console.log('✅ [FRONTEND] Team API response:', response.data);
      
      if (response.data.success) {
        console.log('🏢 [FRONTEND] Team data received:', response.data.team);
        setTeam(response.data.team);
        setMembers(response.data.members || []);
        
        // Fetch team bookings if team exists
        if (response.data.team?._id) {
          console.log('🆔 [FRONTEND] Team ID found:', response.data.team._id);
          // Call fetchTeamBookings directly with team ID
          fetchTeamBookings(response.data.team._id);
        }
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Error fetching team:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        showNotification('error', 
          error.response?.data?.message || 
          error.response?.data?.error || 
          'Failed to fetch team data'
        );
      }
    } finally {
      console.log('🏁 [FRONTEND] Team fetch completed');
      setLoading(false);
      isFetchingTeamData.current = false;
    }
  }, [showNotification, fetchTeamBookings]);

  // Initial data fetch
  useEffect(() => {
    console.log('🚀 [FRONTEND] Initial data fetch');
    fetchTeamData();
  }, []); // Empty dependency array - run only once on mount

  // Fetch slots by date - SIMPLIFIED VERSION
  const fetchSlotsByDate = useCallback(async (date) => {
    console.log(`🔄 [FRONTEND] Fetching slots for date: ${date}`);
    
    try {
      console.log(`🌐 [FRONTEND] Making API call: GET /slots/by-date?date=${date}`);
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
        handleLogout();
      } else {
        showNotification("error", "Failed to load slots");
      }
    }
  }, [showNotification]);

  // Fetch slots when date changes
  useEffect(() => {
    fetchSlotsByDate(selectedDate);
  }, [selectedDate]);

  // Book slot function
  const handleBookSlot = async (slotId) => {
    console.log(`🔄 [FRONTEND] Booking slot: ${slotId}`);
    
    try {
      if (!currentUser) {
        showNotification("error", "Please login as team captain");
        return;
      }

      if (!team?._id) {
        showNotification("error", "Create team first");
        return;
      }

      if (members.length < 7) {
        showNotification("error", "Need at least 7 players to book a slot");
        return;
      }

      setBookingLoading(prev => ({ ...prev, [slotId]: true }));

      const bookingData = {
        teamId: team._id,
        captainId: currentUser._id
      };
      
      console.log('📦 [FRONTEND] Booking payload:', bookingData);
      
      const res = await API.post(
        `/bookings/book/${slotId}`,
        bookingData
      );

      if (res.data.success) {
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
        
        // Refresh data after delay
        setTimeout(() => {
          fetchSlotsByDate(selectedDate);
          if (team?._id) {
            fetchTeamBookings(team._id);
          }
        }, 1000);

      }

    } catch (err) {
      console.error('❌ [FRONTEND] Booking error:', err);
      
      let errorMessage = "Booking failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      showNotification("error", errorMessage);
      
    } finally {
      setBookingLoading(prev => ({ ...prev, [slotId]: false }));
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await API.delete(`/bookings/cancel/${bookingId}`);
      
      if (res.data.success) {
        showNotification("success", "Booking cancelled successfully!");
        fetchSlotsByDate(selectedDate);
        if (team?._id) {
          fetchTeamBookings(team._id);
        }
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Cancel booking error:', err);
      showNotification(
        "error",
        err.response?.data?.message || "Cancellation failed"
      );
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('info', 'Logged out successfully');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // Export bookings to PDF (same as before)
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
      
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('Team Bookings Report', pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(team.teamName, pageWidth / 2, 35, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 42, { align: 'center' });
      
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
        ['Captain:', currentUser?.name || currentUser?.email || 'You']
      ];
      
      teamInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 70, yPos);
        yPos += 8;
      });
      
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
          textColor: [51, 65, 85],
          lineColor: [229, 231, 235],
          lineWidth: 0.5
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto',
        didDrawPage: function(data) {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.setTextColor(107, 114, 128);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });
      
      const finalY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text('Generated by Team Management System', pageWidth / 2, finalY, { align: 'center' });
      
      doc.save(`${team.teamName.replace(/\s+/g, '_')}_Bookings_Report_${new Date().getTime()}.pdf`);
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
                  width: `${(bookedCount / slot.capacity) * 100}%` 
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
              ❌ Fully Booked
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
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                }}
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
            <span className="slots-count">{slots.length} slots available</span>
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