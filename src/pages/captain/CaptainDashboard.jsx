import React, { useState, useEffect, useCallback } from 'react';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/logo.png';
import { Calendar, Clock, MapPin, Users, ChevronRight, CalendarDays, Loader2, LogOut, User, Shield } from 'lucide-react';
import API from '../../api/axios';


const TeamManagement = () => {
  // State declarations
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [formData, setFormData] = useState({
    teamName: '',
    totalPlayers: 11,
  });
  const [playerData, setPlayerData] = useState([{
    name: '',
    mobile: '',
    role: 'Batsman',
    dateOfBirth: '',
    email: ''
  }]);
  const [editMember, setEditMember] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bookingLoading, setBookingLoading] = useState({});
  const [activeTab, setActiveTab] = useState('team');
  const [slotView, setSlotView] = useState('grid');
  const [teamBookings, setTeamBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const roles = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Captain'];


  const user = localStorage.getItem('user');
  useEffect(() => {
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [user]);

  // Enhanced token validation
  // const validateAuth = async () => {
  //   const token = localStorage.getItem('token');
  //   const userData = localStorage.getItem('user');
    
  //   if (!token || !userData) {
  //     showNotification('error', 'Session expired. Please login again.');
  //     setTimeout(() => {
  //       window.location.href = '/login';
  //     }, 2000);
  //     return false;
  //   }

  //   try {
  //     // Verify token with backend
  //     const response = await axios.get(`${API}/auth/verify`, {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });

  //     if (!response.data.success) {
  //       throw new Error('Invalid token');
  //     }

  //     return true;
  //   } catch (error) {
  //     console.error('Auth validation failed:', error);
  //     localStorage.removeItem('token');
  //     localStorage.removeItem('user');
  //     showNotification('error', 'Session expired. Please login again.');
  //     setTimeout(() => {
  //       window.location.href = '/login';
  //     }, 2000);
  //     return false;
  //   }
  // };

  // Get authorization token with validation
  // const getAuthToken = async () => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     showNotification('error', 'Please login first');
  //     setTimeout(() => {
  //       window.location.href = '/login';
  //     }, 1500);
  //     return null;
  //   }

  //   // const isValid = await validateAuth();
  //   return isValid ? token : null;
  // };

  // Get current user with validation
  // const getCurrentUser = () => {
  //   const userData = localStorage.getItem('user');
  //   if (userData) {
  //     try {
  //       const user = JSON.parse(userData);
  //       // Ensure user has required fields
  //       if (!user._id || !user.email) {
  //         throw new Error('Invalid user data');
  //       }
  //       return user;
  //     } catch (error) {
  //       console.error('Error parsing user data:', error);
  //       handleLogout();
  //       return null;
  //     }
  //   }
  //   return null;
  // };

  // Enhanced notification function
  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  }, []);

  // Initialize user and auth
  // useEffect(() => {
  //   const initAuth = async () => {
  //     try {
  //       setAuthChecking(true);
  //       const user =  localStorage.getItem('user');
  //       if (!user) {
  //         window.location.href = '/login';
  //         return;
  //       }

  //       const isValid = await validateAuth();
  //       if (!isValid) {
  //         window.location.href = '/login';
  //         return;
  //       }

  //       setCurrentUser(user);
  //       setAuthChecking(false);
  //     } catch (error) {
  //       console.error('Auth initialization failed:', error);
  //       handleLogout();
  //     }
  //   };

  //   initAuth();
  // }, [showNotification]);

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
    
      const response = await ;
      
      if (response.data.success) {
        setTeam(response.data.team);
        setMembers(response.data.members || []);
        
        // Fetch team bookings if team exists
        if (response.data.team?._id) {
          fetchTeamBookings();
        }
      }
    } catch (error) {
      console.error('Error fetching team:', error);
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
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    // if (!authChecking) {
      fetchTeamData();
    // }
  }, [fetchTeamData, authChecking]);

  // Fetch slots by date
  const fetchSlotsByDate = useCallback(async (date) => {
    try {
    

      const res = await API.get(`/slots/by-date?date=${date}`);


      if (res.data.success) {
        // Calculate remaining slots for each slot
        const slotsWithRemaining = res.data.data.map(slot => ({
          ...slot,
          remaining: slot.capacity - (slot.bookedCount || 0)
        }));
        setSlots(slotsWithRemaining);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        showNotification("error", "Failed to load slots");
      }
    }
  }, [showNotification]);

  // Fetch team bookings
  const fetchTeamBookings = useCallback(async () => {
    try {
      if (!team?._id) return;
      
      setLoadingBookings(true);
    
     const res = await API.get(`/bookings/team/${team._id}`);


      if (res.data.success) {
        setTeamBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoadingBookings(false);
    }
  }, [team, showNotification]);

  // Enhanced book slot function with proper error handling
  const handleBookSlot = async (slotId) => {
    try {
      // Validate auth first
    

      // Check if user is captain
      if (!currentUser) {
        showNotification("error", "Please login as team captain");
        return;
      }

      // Check if team exists
      if (!team?._id) {
        showNotification("error", "Create team first");
        return;
      }

      // Check if team has enough players
      if (members.length < 7) {
        showNotification("error", "Need at least 7 players to book a slot");
        return;
      }

      // Set loading state for this specific slot
      setBookingLoading(prev => ({ ...prev, [slotId]: true }));

      const res = await API.post(
  `/bookings/book/${slotId}`,
  {
    teamId: team._id,
    captainId: currentUser._id
  }
);


      if (res.data.success) {
        showNotification("success", "Slot booked successfully!");
        
        // Update local state immediately
        setSlots(prevSlots => 
          prevSlots.map(slot => {
            if (slot._id === slotId) {
              const newBookedCount = (slot.bookedCount || 0) + 1;
              const newRemaining = slot.capacity - newBookedCount;
              const newIsFull = newRemaining <= 0;
              
              return {
                ...slot,
                bookedTeams: [...(slot.bookedTeams || []), team.teamName],
                bookedCount: newBookedCount,
                remaining: newRemaining,
                isFull: newIsFull
              };
            }
            return slot;
          })
        );
        
        // Refresh data from server
        setTimeout(() => {
          fetchSlotsByDate(selectedDate);
          fetchTeamBookings();
        }, 500);
      }

    } catch (err) {
      console.error('Booking error:', err);
      
      let errorMessage = "Booking failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // Handle specific errors
        if (err.response.data.message.includes('captain not found')) {
          errorMessage = "Your account was not found. Please login again.";
          setTimeout(() => {
            handleLogout();
          }, 2000);
        } else if (err.response.data.message.includes('Slot not available')) {
          errorMessage = "This slot is no longer available";
        } else if (err.response.data.message.includes('already booked')) {
          errorMessage = "Your team has already booked this slot";
        } else if (err.response.data.message.includes('already full')) {
          errorMessage = "This slot is already full";
        }
      }
      
      showNotification("error", errorMessage);
      
      // Refresh slots to get updated data
      fetchSlotsByDate(selectedDate);
      
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
        fetchTeamBookings();
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      showNotification(
        "error",
        err.response?.data?.message || "Cancellation failed"
      );
    }
  };

  // Create team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
     
      // Ensure captain is set
      const captainId = currentUser?._id;
      if (!captainId) {
        showNotification('error', 'Cannot identify captain. Please login again.');
        return;
      }

      const response = await API.get('/team/my-team');


      if (response.data.success) {
        setTeam(response.data.team);
        showNotification('success', 'Team created successfully!');
        setShowCreateTeamModal(false);
        setFormData({ teamName: '', totalPlayers: 11 });
        fetchTeamData(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating team:', error);
      showNotification('error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create team'
      );
    }
  };

  // Add players
  const handleAddPlayers = async (e) => {
    e.preventDefault();
    try {
      const token = await getAuthToken();
      if (!token) return;

      if (!team || !team._id) {
        showNotification('error', 'No team found. Please create a team first.');
        return;
      }

      // Validate all required fields
      const invalidPlayers = playerData.filter(player => !player.name || !player.mobile);
      if (invalidPlayers.length > 0) {
        showNotification('error', 'Name and Mobile are required for all players');
        return;
      }

const response = await API.get('/team/my-team');


      if (response.data.success) {
        await fetchTeamData();
        showNotification('success', 'Players added successfully!');
        setShowAddPlayersModal(false);
        setPlayerData([{
          name: '',
          mobile: '',
          role: 'Batsman',
          dateOfBirth: '',
          email: ''
        }]);
      }
    } catch (error) {
      console.error('Error adding players:', error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Failed to add players';
      showNotification('error', errorMsg);
    }
  };

  // Update member
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Validate required fields
      if (!editMember.name || !editMember.mobile) {
        showNotification('error', 'Name and Mobile are required');
        return;
      }
const response = await API.put(
  `/team/member/${editMember._id}`,
  editMember
);


      if (response.data.success) {
        await fetchTeamData();
        showNotification('success', 'Member updated successfully!');
        setShowEditModal(false);
        setEditMember(null);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      showNotification('error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update member'
      );
    }
  };

  // Delete member
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await API.delete(
  `/team/member/${memberId}`
);


      if (response.data.success) {
        await fetchTeamData();
        showNotification('success', 'Member deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      showNotification('error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete member'
      );
    }
  };

  // Add player form row
  const addPlayerRow = () => {
    setPlayerData([...playerData, {
      name: '',
      mobile: '',
      role: 'Batsman',
      dateOfBirth: '',
      email: ''
    }]);
  };

  // Remove player form row
  const removePlayerRow = (index) => {
    if (playerData.length === 1) return;
    const newData = [...playerData];
    newData.splice(index, 1);
    setPlayerData(newData);
  };

  // Update player data
  const updatePlayerData = (index, field, value) => {
    const newData = [...playerData];
    newData[index][field] = value;
    setPlayerData(newData);
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

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
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
      window.location.href = '/login';
    }, 1000);
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!team) {
      showNotification('error', 'No team data available');
      return;
    }

    try {
      setIsExporting(true);
      
      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(team.teamName, pageWidth / 2, 25, { align: 'center' });
      
      // Add subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text('Team Management Report', pageWidth / 2, 35, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 42, { align: 'center' });
      
      // Add team info section
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
        ['Players Added:', members.length],
        ['Available Slots:', team.totalPlayers - members.length],
        ['Status:', team.status || 'Pending'],
        ['Created Date:', formatDate(team.createdAt)],
        ['Captain:', currentUser?.name || currentUser?.email || 'You']
      ];
      
      teamInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 75, yPos);
        yPos += 8;
      });
      
      // Add members section
      if (members.length > 0) {
        yPos += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Team Members', 20, yPos);
        
        yPos += 12;
        doc.setDrawColor(59, 130, 246);
        doc.line(20, yPos - 2, pageWidth - 20, yPos - 2);
        
        yPos += 5;
        
        // Prepare table data
        const tableData = members.map((member, index) => [
          index + 1,
          member.name,
          member.role,
          member.mobile || '-',
          member.email || '-',
          member.status || 'Pending'
        ]);
        
        // Add table using autoTable
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Name', 'Role', 'Mobile', 'Email', 'Status']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 58, 138],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11
          },
          styles: {
            fontSize: 10,
            cellPadding: 5,
            textColor: [51, 65, 85],
            lineColor: [229, 231, 235],
            lineWidth: 0.5
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 45 },
            2: { cellWidth: 35 },
            3: { cellWidth: 40 },
            4: { cellWidth: 55 },
            5: { cellWidth: 30, halign: 'center' }
          },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto',
          didDrawPage: function(data) {
            // Footer
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
      } else {
        // No members message
        yPos += 20;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128);
        doc.text('No team members added yet', pageWidth / 2, yPos, { align: 'center' });
      }
      
      // Add footer note
      const finalY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text('Generated by Team Management System', pageWidth / 2, finalY, { align: 'center' });
      
      // Save PDF
      doc.save(`${team.teamName.replace(/\s+/g, '_')}_Team_Report_${new Date().getTime()}.pdf`);
      showNotification('success', 'PDF exported successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to JSON
  const exportToJSON = () => {
    if (!team) {
      showNotification('error', 'No team data available');
      return;
    }

    try {
      setIsExporting(true);
      
      const teamData = {
        team: team,
        members: members,
        exportedAt: new Date().toISOString(),
        captain: currentUser
      };
      
      const dataStr = JSON.stringify(teamData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${team.teamName.replace(/\s+/g, '_')}_Team_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Team data exported as JSON!');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      showNotification('error', 'Failed to export JSON');
    } finally {
      setIsExporting(false);
    }
  };

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

  // if (authChecking) {
  //   return (
  //     <div className="loading-container">
  //       <div className="spinner"></div>
  //       <p>Verifying your session...</p>
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="team-management">
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

      {/* Header */}
      <div className="team-header">
        <div className="header-left">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="header-logo" />
          </div>
          <div className="tournament-info">
            <h1 className="tournament-title">CDS Premier League</h1>
            <p className="tournament-subtitle">Team Management Portal</p>
          </div>
        </div>
        
        <div className="header-center">
          {currentUser && (
            <div className="user-info-card">
              <div className="user-avatar">
                <User size={24} />
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser.name || currentUser.email}</span>
                <span className="user-role captain-badge-header">
                  <Shield size={14} /> Team Captain
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="header-right">
          <button 
            className="btn btn-logout"
            onClick={handleLogout}
            disabled={isExporting}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="navigation-tabs">
        <button 
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
          disabled={isExporting}
        >
          🏏 Team Management
        </button>
        
        {/* Show Book Slots tab only if user has a team */}
        {team && (
          <button 
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bookings');
              fetchSlotsByDate(selectedDate);
            }}
            disabled={isExporting}
          >
            📅 Book Slots
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'team' ? (
          <>
            {/* Header Actions */}
            <div className="header-actions">
              {!team ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateTeamModal(true)}
                  disabled={isExporting}
                >
                  Create Team
                </button>
              ) : (
                <>
                  <div className="action-group">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowAddPlayersModal(true)}
                      disabled={isExporting}
                    >
                      Add Players
                    </button>
                    <button 
                      className="btn btn-info"
                      onClick={() => {
                        setActiveTab('bookings');
                        fetchSlotsByDate(selectedDate);
                      }}
                      disabled={isExporting}
                    >
                      Book Slots
                    </button>
                  </div>
                  <div className="export-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={exportToPDF}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={exportToJSON}
                      disabled={isExporting}
                    >
                      Export JSON
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Team Info Card */}
            {team && (
              <div className="team-info-card">
                <div className="team-info-header">
                  <h2>{team.teamName}</h2>
                  <span className={`status-badge ${team.status?.toLowerCase() || 'pending'}`}>
                    {team.status || 'Pending'}
                  </span>
                </div>
                <div className="team-info-details">
                  <div className="info-item">
                    <span className="label">Team Name:</span>
                    <span className="value">{team.teamName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Total Players:</span>
                    <span className="value">{team.totalPlayers || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Players Added:</span>
                    <span className="value">{members.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Available Slots:</span>
                    <span className="value">{(team.totalPlayers || 0) - members.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Created Date:</span>
                    <span className="value">{formatDate(team.createdAt)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Captain:</span>
                    <span className="value captain-name">
                      {currentUser?.name || currentUser?.email || 'You'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members Section */}
            {team && (
              <div className="team-members-section">
                <div className="section-header">
                  <h3>Team Members ({members.length})</h3>
                  {members.length > 0 && (
                    <div className="view-toggle">
                      <span className="toggle-label">View:</span>
                      <button 
                        className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                        disabled={isExporting}
                      >
                        Table
                      </button>
                      <button 
                        className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewMode('cards')}
                        disabled={isExporting}
                      >
                        Cards
                      </button>
                    </div>
                  )}
                </div>
                
                {members.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <p>No players added yet.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddPlayersModal(true)}
                      disabled={isExporting}
                    >
                      Add Players
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Table View */}
                    {viewMode === 'table' && (
                      <div className="members-table-container">
                        <table className="members-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Role</th>
                              <th>Mobile</th>
                              <th>Email</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((member, index) => (
                              <tr key={member._id}>
                                <td>{index + 1}</td>
                                <td>
                                  <div className="member-name-cell">
                                    {member.name}
                                    {member.role === 'Captain' && (
                                      <span className="captain-badge">©</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span className={`role-badge ${member.role?.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {member.role}
                                  </span>
                                </td>
                                <td>{member.mobile || '-'}</td>
                                <td>{member.email || '-'}</td>
                                <td>
                                  <span className={`status-badge ${member.status?.toLowerCase() || 'pending'}`}>
                                    {member.status || 'Pending'}
                                  </span>
                                </td>
                                <td>
                                  <div className="action-buttons">
                                    <button
                                      className="btn-icon edit"
                                      onClick={() => {
                                        setEditMember(member);
                                        setShowEditModal(true);
                                      }}
                                      title="Edit"
                                      disabled={isExporting}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      className="btn-icon delete"
                                      onClick={() => handleDeleteMember(member._id)}
                                      title="Delete"
                                      disabled={isExporting}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Card View */}
                    {viewMode === 'cards' && (
                      <div className="members-card-container">
                        {members.map((member, index) => (
                          <div key={member._id} className="member-card">
                            <div className="card-header">
                              <div className="member-info">
                                <span className="member-number">{index + 1}</span>
                                <div>
                                  <h4 className="member-name">
                                    {member.name}
                                    {member.role === 'Captain' && (
                                      <span className="captain-badge-card">© Captain</span>
                                    )}
                                  </h4>
                                  <span className={`role-badge ${member.role?.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {member.role}
                                  </span>
                                </div>
                              </div>
                              <span className={`status-badge ${member.status?.toLowerCase() || 'pending'}`}>
                                {member.status || 'Pending'}
                              </span>
                            </div>
                            
                            <div className="card-details">
                              <div className="detail-item">
                                <span className="detail-label">Mobile:</span>
                                <span className="detail-value">{member.mobile || '-'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{member.email || '-'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Added:</span>
                                <span className="detail-value">{formatDate(member.createdAt)}</span>
                              </div>
                            </div>
                            
                            <div className="card-actions">
                              <button
                                className="btn-icon edit"
                                onClick={() => {
                                  setEditMember(member);
                                  setShowEditModal(true);
                                }}
                                title="Edit"
                                disabled={isExporting}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn-icon delete"
                                onClick={() => handleDeleteMember(member._id)}
                                title="Delete"
                                disabled={isExporting}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* No Team State */}
            {!team && (
              <div className="no-team-state">
                <div className="empty-state-card">
                  <div className="empty-icon">🏏</div>
                  <h3>No Team Created Yet</h3>
                  <p>Create your team to start managing players and participate in tournaments.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateTeamModal(true)}
                    disabled={isExporting}
                  >
                    Create Your First Team
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Slot Booking Section */
          <div className="slot-booking-section">
            <div className="section-header">
              <h2>Book Practice Slots</h2>
              <div className="slot-controls">
                <div className="date-picker">
                  <label>Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      fetchSlotsByDate(e.target.value);
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
                    Grid
                  </button>
                  <button 
                    className={`view-btn ${slotView === 'list' ? 'active' : ''}`}
                    onClick={() => setSlotView('list')}
                    disabled={isExporting}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Team Info Banner */}
            {team && (
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
                  </div>
                </div>
              </div>
            )}

            {/* Team Requirements Check */}
            {team && members.length < 7 && (
              <div className="warning-alert">
                ⚠️ You need at least <strong>7 players</strong> in your team to book a slot. 
                Currently you have {members.length} players.
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowAddPlayersModal(true)}
                >
                  Add Players
                </button>
              </div>
            )}

            {/* Your Bookings Section */}
            {teamBookings.length > 0 && (
              <div className="your-bookings-section">
                <h3>Your Bookings ({teamBookings.length})</h3>
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
              <h3>Available Slots for {formatSlotDate(selectedDate)}</h3>
              <div className={`slots-container ${slotView}`}>
                {slots.length === 0 ? (
                  <div className="empty-slots">
                    <div className="empty-icon">📅</div>
                    <p>No slots available for selected date</p>
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
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Team</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowCreateTeamModal(false)}
                disabled={isExporting}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  required
                  value={formData.teamName}
                  onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                  placeholder="Enter team name"
                  disabled={isExporting}
                />
              </div>
              <div className="form-group">
                <label>Total Players *</label>
                <select
                  required
                  value={formData.totalPlayers}
                  onChange={(e) => setFormData({...formData, totalPlayers: parseInt(e.target.value)})}
                  disabled={isExporting}
                >
                  {[11, 12, 13, 14, 15, 16].map(num => (
                    <option key={num} value={num}>{num} players</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateTeamModal(false)}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isExporting}
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Players Modal */}
      {showAddPlayersModal && team && (
        <div className="modal-overlay">
          <div className="modal wide-modal">
            <div className="modal-header">
              <h3>Add Players to Team</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowAddPlayersModal(false)}
                disabled={isExporting}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddPlayers}>
              <div className="players-form">
                {playerData.map((player, index) => (
                  <div key={index} className="player-form-row">
                    <div className="row-header">
                      <h4>Player {index + 1}</h4>
                      {index > 0 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removePlayerRow(index)}
                          disabled={isExporting}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          required
                          value={player.name}
                          onChange={(e) => updatePlayerData(index, 'name', e.target.value)}
                          placeholder="Enter player name"
                          disabled={isExporting}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mobile *</label>
                        <input
                          type="tel"
                          required
                          value={player.mobile}
                          onChange={(e) => updatePlayerData(index, 'mobile', e.target.value)}
                          placeholder="Enter mobile number"
                          disabled={isExporting}
                        />
                      </div>
                      <div className="form-group">
                        <label>Role *</label>
                        <select
                          required
                          value={player.role}
                          onChange={(e) => updatePlayerData(index, 'role', e.target.value)}
                          disabled={isExporting}
                        >
                          {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={player.email}
                          onChange={(e) => updatePlayerData(index, 'email', e.target.value)}
                          placeholder="Enter email"
                          disabled={isExporting}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={addPlayerRow}
                  disabled={isExporting}
                >
                  + Add Another Player
                </button>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddPlayersModal(false)}
                    disabled={isExporting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isExporting}
                  >
                    Add Players
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editMember && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Player</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowEditModal(false)}
                disabled={isExporting}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateMember}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={editMember.name}
                  onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                  disabled={isExporting}
                />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input
                  type="tel"
                  required
                  value={editMember.mobile}
                  onChange={(e) => setEditMember({...editMember, mobile: e.target.value})}
                  disabled={isExporting}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  required
                  value={editMember.role}
                  onChange={(e) => setEditMember({...editMember, role: e.target.value})}
                  disabled={isExporting}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editMember.email}
                  onChange={(e) => setEditMember({...editMember, email: e.target.value})}
                  disabled={isExporting}
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isExporting}
                >
                  Update Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;