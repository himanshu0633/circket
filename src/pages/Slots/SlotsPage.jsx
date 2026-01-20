import React from "react";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import API from "../../api/axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  CardHeader,
  Divider,
  useTheme,
  Container,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Badge,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Avatar,
  AvatarGroup,
  CardActions,
  Collapse,
  IconButton as MuiIconButton
} from "@mui/material";

import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  ExitToApp as LogoutIcon,
  CalendarToday as CalendarIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Groups as GroupsIcon,
  AccessTime as TimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon
} from "@mui/icons-material";

import { motion } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ResponsiveHeader from "../components/AdminHeader";
import Footer from "../components/footer";
const API_BASE_URL = "http://localhost:4000";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const isDateBeforeToday = (dateString) => {
  if (!dateString) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Slot validation schema
const slotValidationSchema = yup.object({
  slotDate: yup.string().required("Date is required"),
  startTime: yup.string().required("Start time is required"),
  endTime: yup.string().required("End time is required")
});

export default function SlotsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  
  // Slot states
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  // Calendar view states
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDateSlots, setSelectedDateSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateSlots, setShowDateSlots] = useState(false);
  
  // Expanded slot states
  const [expandedSlot, setExpandedSlot] = useState(null);

  // Mobile menu states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Bulk slot states
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [disableDateDialog, setDisableDateDialog] = useState(false);

  const [bulkSlotData, setBulkSlotData] = useState({
    startDate: "",
    endDate: "",
    timeSlots: [
      { startTime: "09:00", endTime: "10:00" }
    ]
  });

  const [disableDate, setDisableDate] = useState({
    slotDate: ""
  });

  // Formik for slot form
  const slotFormik = useFormik({
    initialValues: {
      slotDate: "",
      startTime: "09:00",
      endTime: "10:00",
      isDisabled: false
    },
    validationSchema: slotValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      await saveSlot(values, resetForm);
    }
  });

  /* ================= LOGOUT FUNCTION ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  /* ================= FETCH SLOTS ================= */
  const fetchSlots = async () => {
  try {
    setSlotLoading(true);
    const res = await API.get("/admin/slots");
    const slotsData = res.data.data || [];
    
    // Filter out past slots
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredSlots = slotsData.filter(slot => {
      const slotDate = new Date(slot.slotDate);
      slotDate.setHours(0, 0, 0, 0);
      return slotDate >= today; // Only keep today and future slots
    });
    
    setSlots(filteredSlots);
    
    // Prepare calendar events - Only show future dates with slots
    const dateEvents = {};
    filteredSlots.forEach(slot => {
      const slotDate = new Date(slot.slotDate).toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      
      // Skip if date is in past
      if (slotDate < todayStr) return;
      
      if (!dateEvents[slotDate]) {
        dateEvents[slotDate] = {
          totalSlots: 0,
          activeSlots: 0,
          bookedCount: 0,
          disabledSlots: 0
        };
      }
      
      dateEvents[slotDate].totalSlots++;
      if (slot.isDisabled) {
        dateEvents[slotDate].disabledSlots++;
      } else {
        dateEvents[slotDate].activeSlots++;
      }
      dateEvents[slotDate].bookedCount += slot.bookedCount || 0;
    });
    
    const events = Object.keys(dateEvents).map(date => {
      const data = dateEvents[date];
      return {
        id: `date-${date}`,
        title: `${data.activeSlots} slots`,
        start: date,
        allDay: true,
        color: data.disabledSlots > 0 ? '#dc3545' : 
               data.activeSlots === 0 ? '#6c757d' : '#007bff',
        extendedProps: {
          date: date,
          totalSlots: data.totalSlots,
          activeSlots: data.activeSlots,
          bookedCount: data.bookedCount,
          disabledSlots: data.disabledSlots
        }
      };
    });
    
    setCalendarEvents(events);
  } catch (err) {
    showSnackbar("Failed to fetch slots", "error");
  } finally {
    setSlotLoading(false);
  }
};

  /* ================= SAVE SLOT ================= */
  const saveSlot = async (values, resetForm) => {
    try {
      const slotData = {
        slotDate: values.slotDate,
        startTime: values.startTime,
        endTime: values.endTime,
        capacity: 2,
        isDisabled: values.isDisabled
      };
      if (isDateBeforeToday(values.slotDate)) {
        showSnackbar("Cannot create/edit slots for past dates", "warning");
        return;
      }
      if (editingSlot) {
        await API.put(`/admin/slots/${editingSlot._id}`, slotData);
        showSnackbar("Slot updated successfully!");
      } else {
        await API.post("/admin/slots", slotData);
        showSnackbar("Slot created successfully!");
      }
      fetchSlots();
      resetForm();
      setSlotDialogOpen(false);
      setEditingSlot(null);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || "Failed to save slot", "error");
    }
  };

  /* ================= TOGGLE SLOT STATUS ================= */
  const toggleSlotStatus = async (slotId) => {
    try {
       const slot = slots.find(s => s._id === slotId);
      if (slot && isDateBeforeToday(slot.slotDate)) {
        showSnackbar("Cannot modify past slots", "warning");
        return;
      }

      await API.patch(`/admin/slots/toggle/${slotId}`);
      showSnackbar("Slot status updated!");
      fetchSlots();
    } catch (err) {
      showSnackbar("Failed to update slot status", "error");
    }
  };

  /* ================= DELETE SLOT ================= */
  const deleteSlot = async (slotId) => {
     const slot = slots.find(s => s._id === slotId);
    if (slot && isDateBeforeToday(slot.slotDate)) {
      showSnackbar("Cannot delete past slots", "warning");
      return;
    }
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await API.delete(`/admin/slots/${slotId}`);
        showSnackbar("Slot deleted successfully");
        fetchSlots();
      } catch (err) {
        showSnackbar("Failed to delete slot", "error");
      }
    }
  };

  /* ================= GENERATE FUTURE SLOTS ================= */
  const generateFutureSlots = async () => {
    try {
       if (isDateBeforeToday(bulkSlotData.startDate)) {
        showSnackbar("Cannot generate slots for past dates", "warning");
        return;
      }
      const bulkData = {
        ...bulkSlotData,
        capacity: 2
      };
      
      await API.post("/admin/slots/generate-future", bulkData);
      showSnackbar("Future slots generated successfully");
      setBulkDialogOpen(false);
      fetchSlots();
      
      // Reset bulk slot data
      setBulkSlotData({
        startDate: "",
        endDate: "",
        timeSlots: [
          { startTime: "09:00", endTime: "10:00" }
        ]
      });
    } catch (err) {
      showSnackbar(err?.response?.data?.message || "Failed to generate slots", "error");
    }
  };

  /* ================= DISABLE SLOTS BY DATE ================= */
  const disableSlotsByDate = async () => {
    try {
      if (isDateBeforeToday(disableDate.slotDate)) {
        showSnackbar("Cannot disable slots for past dates", "warning");
        return;
      }
      await API.post("/admin/slots/disable-by-date", disableDate);
      showSnackbar(`Slots disabled for ${disableDate.slotDate}`);
      setDisableDateDialog(false);
      fetchSlots();
      
      // Reset disable date data
      setDisableDate({
        slotDate: ""
      });
    } catch (err) {
      showSnackbar(err?.response?.data?.message || "Failed to disable slots", "error");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  /* ================= CALENDAR EVENT HANDLERS ================= */
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    setSelectedDate(clickedDate);
    
    // Filter slots for selected date
    const dateSlots = slots.filter(slot => {
      const slotDate = new Date(slot.slotDate).toISOString().split('T')[0];
      return slotDate === clickedDate;
    });
    
    setSelectedDateSlots(dateSlots);
    setShowDateSlots(true);
  };

  const handleEventClick = (info) => {
    const clickedDate = info.event.extendedProps.date;
    setSelectedDate(clickedDate);
    
    // Filter slots for selected date
    const dateSlots = slots.filter(slot => {
      const slotDate = new Date(slot.slotDate).toISOString().split('T')[0];
      return slotDate === clickedDate;
    });
    
    setSelectedDateSlots(dateSlots);
    setShowDateSlots(true);
  };

  const handleBackToCalendar = () => {
    setShowDateSlots(false);
    setSelectedDate(null);
    setSelectedDateSlots([]);
    setExpandedSlot(null);
  };

  /* ================= SLOT EXPAND HANDLER ================= */
  const handleExpandSlot = (slotId) => {
    setExpandedSlot(expandedSlot === slotId ? null : slotId);
  };

  /* ================= SNACKBAR HANDLER ================= */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  /* ================= RESPONSIVE NAVIGATION ================= */
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /* ================= STATS CARDS ================= */
  const StatCard = ({ title, value, icon, color, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      style={{
        width: '100%'
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${color}20, ${color}40)`,
        borderLeft: `4px solid ${color}`,
        borderRadius: '8px',
        padding: isMobile ? '12px' : '16px',
        height: isMobile ? '70px' : '90px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%'
        }}>
          <div>
            <div style={{
              color: '#666',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              {title}
            </div>
            <div style={{
              fontSize: isMobile ? '20px' : '28px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {value}
            </div>
          </div>
          <div style={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            padding: isMobile ? '6px' : '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '8px'
          }}>
            {React.cloneElement(icon, { 
              fontSize: isMobile ? "small" : "medium",
              style: { color: color }
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );

  /* ================= TAB PANEL COMPONENT ================= */
  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`slots-tabpanel-${index}`}
        aria-labelledby={`slots-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  };

  /* ================= DATE SLOT CARD COMPONENT ================= */
  const DateSlotCard = ({ slot }) => {
    const isExpanded = expandedSlot === slot._id;
    const isPastSlot = isDateBeforeToday(slot.slotDate);
    const borderColor = slot.isDisabled ? '#f44336' :
                       slot.bookedCount >= slot.capacity ? '#4caf50' :
                       '#1976d2';
    
    return (
      <div style={{
        marginBottom: '16px',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'white'
      }}>
        <div style={{ padding: '16px' }}>
          {/* Slot Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#333'
              }}>
                {slot.startTime} - {slot.endTime}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginTop: '4px'
              }}>
                Capacity: {slot.bookedCount || 0}/{slot.capacity}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                backgroundColor: slot.isDisabled ? '#ffebee' : 
                               slot.bookedCount >= slot.capacity ? '#e8f5e9' : '#e3f2fd',
                color: slot.isDisabled ? '#d32f2f' : 
                       slot.bookedCount >= slot.capacity ? '#2e7d32' : '#1976d2',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                border: `1px solid ${slot.isDisabled ? '#f44336' : 
                        slot.bookedCount >= slot.capacity ? '#4caf50' : '#1976d2'}`
              }}>
                {slot.isDisabled ? "Disabled" : 
                 slot.bookedCount >= slot.capacity ? "Full" : "Available"}
              </div>
              <MuiIconButton
                size="small"
                onClick={() => handleExpandSlot(slot._id)}
                style={{ padding: '4px' }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </MuiIconButton>
            </div>
          </div>
          
          {/* Booking Information (Always Visible) */}
          {slot.bookedTeams && slot.bookedTeams.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Booked Teams ({slot.bookedTeams.length}):
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {slot.bookedTeams.map((team, idx) => (
                  <div key={idx} style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f5f5f5',
                    color: '#666'
                  }}>
                    {team}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Expanded Details */}
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #eee'
            }}>
              {/* Booked Teams Details */}
              {slot.bookedTeams && slot.bookedTeams.length > 0 ? (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    Team Details:
                  </div>
                  <div>
                    {slot.bookedTeams.map((team, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <PersonIcon style={{ 
                          marginRight: '8px', 
                          color: '#1976d2', 
                          fontSize: '16px' 
                        }} />
                        <div style={{ fontSize: '14px', color: '#333' }}>{team}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px'
                }}>
                  No teams booked for this slot
                </div>
              )}
              
              {/* Slot Actions */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px'
              }}>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #1976d2',
                    backgroundColor: 'transparent',
                    color: '#1976d2',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.backgroundColor = '#1976d2';
                    e.currentTarget.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.backgroundColor = 'transparent';
                    e.currentTarget.color = '#1976d2';
                  }}
                  onClick={() => {
                    setEditingSlot(slot);
                    slotFormik.setValues({
                      slotDate: slot.slotDate.split('T')[0],
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                      isDisabled: slot.isDisabled
                    });
                    setSlotDialogOpen(true);
                  }}
                >
                  <EditIcon style={{ fontSize: '16px' }} />
                  Edit
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${slot.isDisabled ? '#2e7d32' : '#ff9800'}`,
                    backgroundColor: 'transparent',
                    color: slot.isDisabled ? '#2e7d32' : '#ff9800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.backgroundColor = slot.isDisabled ? '#2e7d32' : '#ff9800';
                    e.currentTarget.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.backgroundColor = 'transparent';
                    e.currentTarget.color = slot.isDisabled ? '#2e7d32' : '#ff9800';
                  }}
                  onClick={() => toggleSlotStatus(slot._id)}
                >
                  {slot.isDisabled ? <CheckCircleIcon style={{ fontSize: '16px' }} /> : <DeleteIcon style={{ fontSize: '16px' }} />}
                  {slot.isDisabled ? "Enable" : "Disable"}
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #f44336',
                    backgroundColor: 'transparent',
                    color: '#f44336',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.backgroundColor = '#f44336';
                    e.currentTarget.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.backgroundColor = 'transparent';
                    e.currentTarget.color = '#f44336';
                  }}
                  onClick={() => deleteSlot(slot._id)}
                >
                  <DeleteIcon style={{ fontSize: '16px' }} />
                  Delete
                </button>
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    );
  };

  return (
    <>
    <ResponsiveHeader 
              title="CDS Premier League"
              subtitle="Team Slots Management"
            />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >

      {/* MAIN CONTENT */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: isMobile ? '8px' : '16px 24px'
      }}>
        <div style={{
          padding: isMobile ? '8px' : '16px 24px'
        }}>
          {/* DASHBOARD HEADER */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              marginBottom: isMobile ? '16px' : '32px'
            }}>
              <div style={{
                fontSize: isMobile ? '20px' : '32px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '8px'
              }}>
                Ground Slots Calendar
              </div>
              <div style={{
                fontSize: isMobile ? '14px' : '16px',
                color: '#666',
                marginBottom: '24px'
              }}>
                Click on any date to view all slots for that day
              </div>
            </div>
          </motion.div>

          {/* SLOTS STATS - RESPONSIVE GRID */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 
                                    isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                  gap: isMobile ? '8px' : '16px',
                  marginBottom: isMobile ? '16px' : '32px'
                }}>
                <div>
                  <StatCard
                    title="Total Dates"
                    value={[...new Set(slots.map(slot => new Date(slot.slotDate).toISOString().split('T')[0]))].length}
                    icon={<CalendarIcon />}
                    color="#1976d2"
                    index={0}
                  />
                </div>
                
                <div>
                  <StatCard
                    title="Total Slots"
                    value={slots.filter(s => !isDateBeforeToday(s.slotDate)).length}
                    icon={<EventIcon />}
                    color="#2196f3"
                    index={1}
                  />
                </div>
                
                <div>
                  <StatCard
                    title="Active Slots"
                    value={slots.filter(s => !s.isDisabled && !isDateBeforeToday(s.slotDate)).length}
                    icon={<CheckCircleIcon />}
                    color="#4caf50"
                    index={2}
                  />
                </div>
                
                <div>
                  <StatCard
                    title="Bookings"
                    value={slots.reduce((sum, slot) => sum + (slot.bookedCount || 0), 0)}
                    icon={<GroupsIcon />}
                    color="#ff9800"
                    index={3}
                  />
                </div>
              </div>
            </motion.div>

          {/* MAIN CALENDAR AND SLOTS VIEW */}
          <div style={{
            marginBottom: '32px',
            borderRadius: isMobile ? '8px' : '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #eee'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                {showDateSlots && (
                  <IconButton onClick={handleBackToCalendar} style={{ marginRight: '16px' }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                {showDateSlots ? (
                  <div style={{
                    fontSize: isMobile ? '14px' : '18px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Slots for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : ''}
                  </div>
                ) : (
                  <div style={{
                    fontSize: isMobile ? '16px' : '20px',
                    fontWeight: '400',
                    color: '#666'
                  }}>
                    Calendar View - Click on any date
                  </div>
                )}
              </div>
              
              {!showDateSlots && !isMobile && (
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginLeft: 'auto'
                }}>
                  <Tooltip title="Refresh">
                    <IconButton onClick={fetchSlots} style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#f5f5f5'
                    }}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: '1px solid #f44336',
                      backgroundColor: 'transparent',
                      color: '#f44336',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setDisableDateDialog(true)}
                  >
                    <DeleteIcon style={{ fontSize: '18px' }} />
                    Disable Date
                  </button>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: '1px solid #2196f3',
                      backgroundColor: 'transparent',
                      color: '#2196f3',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setBulkDialogOpen(true)}
                  >
                    <ScheduleIcon style={{ fontSize: '18px' }} />
                    Generate Slots
                  </button>
                </div>
              )}
            </div>
            
            {/* MOBILE ACTION BUTTONS */}
            {!showDateSlots && isMobile && (
              <div style={{
                padding: '16px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                borderBottom: '1px solid #eee'
              }}>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #f44336',
                    backgroundColor: 'transparent',
                    color: '#f44336',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => setDisableDateDialog(true)}
                >
                  <DeleteIcon style={{ fontSize: '14px' }} />
                  Disable Date
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #2196f3',
                    backgroundColor: 'transparent',
                    color: '#2196f3',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => setBulkDialogOpen(true)}
                >
                  <ScheduleIcon style={{ fontSize: '14px' }} />
                  Generate
                </button>
                <IconButton onClick={fetchSlots} size="small" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f5f5f5'
                }}>
                  <RefreshIcon style={{ fontSize: '18px' }} />
                </IconButton>
              </div>
            )}

            {/* CALENDAR VIEW */}
            {!showDateSlots ? (
              <div style={{ 
                padding: isMobile ? '8px' : '16px' 
              }}>
                {/* Calendar */}
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"  
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: isMobile ? '' : 'dayGridMonth,dayGridWeek'
                  }}
                  events={calendarEvents}
                  dateClick={(info) => {
                    const clickedDate = new Date(info.dateStr);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (clickedDate < today) {
                      showSnackbar("Cannot view slots for past dates", "warning");
                      return;
                    }
                    handleDateClick(info);
                  }}
                  eventClick={(info) => {
                    const clickedDate = new Date(info.event.extendedProps.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (clickedDate < today) {
                      showSnackbar("Cannot view slots for past dates", "warning");
                      return;
                    }
                    handleEventClick(info);
                  }}
                  height="auto"
                  editable={false}
                  selectable={true}
                  weekends={true}
                  dayMaxEvents={3}
                  // Disable past dates in calendar
                  validRange={{
                    start: new Date().toISOString().split('T')[0]
                  }}
                  // Custom styling for past dates
                  dayCellClassNames={(arg) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const cellDate = new Date(arg.date);
                    cellDate.setHours(0, 0, 0, 0);
                    
                    if (cellDate < today) {
                      return ['fc-past-date-disabled'];
                    }
                    return [];
                  }}
                  eventContent={(eventInfo) => {
                    const eventDate = new Date(eventInfo.event.startStr);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (eventDate < today) {
                      return null; // Don't show events for past dates
                    }
                    
                    const hasBookings = eventInfo.event.extendedProps.bookedCount > 0;
                    
                    return (
                      <div style={{ padding: '4px' }}>
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '4px',
                            borderRadius: '4px',
                            backgroundColor: hasBookings ? '#1976d2' : '#4caf50',
                            color: 'white',
                            minHeight: isMobile ? '20px' : 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isMobile ? (
                            <div style={{
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}>
                              {eventInfo.event.extendedProps.bookedCount || 0}
                            </div>
                          ) : (
                            <div style={{
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}>
                              {eventInfo.event.extendedProps.bookedCount || 0} bookings
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                
                {/* Calendar Legend */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px'
                  }}>
                    Calendar Legend:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#007bff',
                        borderRadius: '4px',
                        marginRight: '8px'
                      }} />
                      <div style={{ fontSize: '12px', color: '#666' }}>Available Dates</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#6c757d',
                        borderRadius: '4px',
                        marginRight: '8px'
                      }} />
                      <div style={{ fontSize: '12px', color: '#666' }}>No Active Slots</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#dc3545',
                        borderRadius: '4px',
                        marginRight: '8px'
                      }} />
                      <div style={{ fontSize: '12px', color: '#666' }}>Disabled Dates</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#28a745',
                        borderRadius: '4px',
                        marginRight: '8px'
                      }} />
                      <div style={{ fontSize: '12px', color: '#666' }}>Fully Booked</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SELECTED DATE SLOTS VIEW */
              <div style={{
                padding: isMobile ? '8px' : '16px 24px'
              }}>
                {/* Date Summary Card */}
                <div style={{
                  marginBottom: '24px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isMobile ? '18px' : '24px',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        opacity: 0.9
                      }}>
                        Click on any slot to expand and view booking details
                      </div>
                    </div>
                    
                    <div style={{
                      marginTop: isMobile ? '16px' : '0'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '24px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold'
                          }}>
                            {selectedDateSlots.length}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            opacity: 0.9
                          }}>
                            Total Slots
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#81c784'
                          }}>
                            {selectedDateSlots.filter(s => !s.isDisabled).length}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            opacity: 0.9
                          }}>
                            Active Slots
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#ffb74d'
                          }}>
                            {selectedDateSlots.reduce((sum, slot) => sum + (slot.bookedCount || 0), 0)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            opacity: 0.9
                          }}>
                            Total Bookings
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '16px',
                    paddingBottom: '0'
                  }}>
                    <button
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: 'white',
                        color: '#1976d2',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => {
                        setEditingSlot(null);
                        slotFormik.resetForm();
                        slotFormik.setValues({
                          slotDate: selectedDate,
                          startTime: "09:00",
                          endTime: "10:00",
                          isDisabled: false
                        });
                        setSlotDialogOpen(true);
                      }}
                    >
                      <AddIcon style={{ fontSize: '18px' }} />
                      Add New Slot
                    </button>
                  </div>
                </div>

                {/* Slots List */}
                {slotLoading ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '64px 0'
                  }}>
                    <CircularProgress />
                  </div>
                ) : selectedDateSlots.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px 0'
                  }}>
                    <ScheduleIcon style={{
                      fontSize: '60px',
                      color: '#bdbdbd',
                      marginBottom: '16px'
                    }} />
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>
                      No slots found for this date
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '24px'
                    }}>
                      Create the first slot for this date
                    </div>
                    <button
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto'
                      }}
                      onClick={() => {
                        setEditingSlot(null);
                        slotFormik.resetForm();
                        slotFormik.setValues({
                          slotDate: selectedDate,
                          startTime: "09:00",
                          endTime: "10:00",
                          isDisabled: false
                        });
                        setSlotDialogOpen(true);
                      }}
                    >
                      <AddIcon style={{ fontSize: '18px' }} />
                      Create First Slot
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Filter Options */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid #1976d2',
                        backgroundColor: 'transparent',
                        color: '#1976d2',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        All Slots ({selectedDateSlots.length})
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid #4caf50',
                        backgroundColor: 'transparent',
                        color: '#4caf50',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        Active ({selectedDateSlots.filter(s => !s.isDisabled).length})
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid #f44336',
                        backgroundColor: 'transparent',
                        color: '#f44336',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        Disabled ({selectedDateSlots.filter(s => s.isDisabled).length})
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid #ff9800',
                        backgroundColor: 'transparent',
                        color: '#ff9800',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        Booked ({selectedDateSlots.filter(s => (s.bookedCount || 0) > 0).length})
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid #9e9e9e',
                        backgroundColor: 'transparent',
                        color: '#9e9e9e',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        Past ({selectedDateSlots.filter(s => isDateBeforeToday(s.slotDate)).length})
                      </div>
                    </div>

                    {/* Slots Cards */}
                    <div>
                      {selectedDateSlots.map((slot) => (
                        <DateSlotCard key={slot._id} slot={slot} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CREATE/EDIT SLOT DIALOG - RESPONSIVE */}
          <Dialog 
            open={slotDialogOpen} 
            onClose={() => setSlotDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle>
              {editingSlot ? "Edit Slot" : "Create New Slot"}
            </DialogTitle>
            <DialogContent dividers>
              <form onSubmit={slotFormik.handleSubmit}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '16px'
                }}>
                  <div style={{ gridColumn: 'span 12' }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Slot Date
                      </label>
                      <input
                        type="date"
                        name="slotDate"
                        value={slotFormik.values.slotDate}
                        onChange={slotFormik.handleChange}
                        onBlur={slotFormik.handleBlur}
                        style={{
                          padding: '12px',
                          borderRadius: '4px',
                          border: `1px solid ${
                            slotFormik.touched.slotDate && slotFormik.errors.slotDate ? '#f44336' : '#ddd'
                          }`,
                          fontSize: '14px'
                        }}
                      />
                      {slotFormik.touched.slotDate && slotFormik.errors.slotDate && (
                        <div style={{
                          fontSize: '12px',
                          color: '#f44336'
                        }}>
                          {slotFormik.errors.slotDate}
                        </div>
                      )}
                      {isDateBeforeToday(slotFormik.values.slotDate) && (
                        <div style={{
                          padding: '8px',
                          borderRadius: '4px',
                          backgroundColor: '#fff3cd',
                          border: '1px solid #ffeaa7',
                          marginTop: '8px'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#856404'
                          }}>
                            Cannot create/edit slots for past dates
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 6' }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={slotFormik.values.startTime}
                        onChange={slotFormik.handleChange}
                        onBlur={slotFormik.handleBlur}
                        style={{
                          padding: '12px',
                          borderRadius: '4px',
                          border: `1px solid ${
                            slotFormik.touched.startTime && slotFormik.errors.startTime ? '#f44336' : '#ddd'
                          }`,
                          fontSize: '14px'
                        }}
                      />
                      {slotFormik.touched.startTime && slotFormik.errors.startTime && (
                        <div style={{
                          fontSize: '12px',
                          color: '#f44336'
                        }}>
                          {slotFormik.errors.startTime}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 6' }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={slotFormik.values.endTime}
                        onChange={slotFormik.handleChange}
                        onBlur={slotFormik.handleBlur}
                        style={{
                          padding: '12px',
                          borderRadius: '4px',
                          border: `1px solid ${
                            slotFormik.touched.endTime && slotFormik.errors.endTime ? '#f44336' : '#ddd'
                          }`,
                          fontSize: '14px'
                        }}
                      />
                      {slotFormik.touched.endTime && slotFormik.errors.endTime && (
                        <div style={{
                          fontSize: '12px',
                          color: '#f44336'
                        }}>
                          {slotFormik.errors.endTime}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 12' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={slotFormik.values.isDisabled}
                        onChange={(e) => slotFormik.setFieldValue('isDisabled', e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px'
                        }}
                      />
                      <span style={{
                        fontSize: '14px',
                        color: '#333'
                      }}>
                        Disable this slot
                      </span>
                    </label>
                  </div>
                </div>
              </form>
            </DialogContent>
            <DialogActions>
              {isMobile && (
                <button
                  onClick={() => setSlotDialogOpen(false)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CloseIcon />
                </button>
              )}
              <button
                onClick={() => setSlotDialogOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#333',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={slotFormik.submitForm}
                disabled={isDateBeforeToday(slotFormik.values.slotDate)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isDateBeforeToday(slotFormik.values.slotDate) ? '#ccc' : '#1976d2',
                  color: 'white',
                  fontSize: '14px',
                  cursor: isDateBeforeToday(slotFormik.values.slotDate) ? 'not-allowed' : 'pointer',
                  opacity: isDateBeforeToday(slotFormik.values.slotDate) ? 0.6 : 1
                }}
              >
                {editingSlot ? "Update" : "Create"}
              </button>
            </DialogActions>
          </Dialog>

          {/* DISABLE DATE DIALOG */}
          <Dialog 
            open={disableDateDialog} 
            onClose={() => setDisableDateDialog(false)} 
            maxWidth="xs" 
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle>Disable Slots for Date</DialogTitle>
            <DialogContent dividers>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Date
                </label>
                <input
                  type="date"
                  value={disableDate.slotDate}
                  onChange={(e) => setDisableDate({ ...disableDate, slotDate: e.target.value })}
                  style={{
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>
              {isDateBeforeToday(disableDate.slotDate) && (
                <div style={{
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  marginTop: '16px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#856404'
                  }}>
                    Cannot disable slots for past dates
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <button
                onClick={() => setDisableDateDialog(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#333',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={disableSlotsByDate}
                disabled={isDateBeforeToday(disableDate.slotDate)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isDateBeforeToday(disableDate.slotDate) ? '#ccc' : '#f44336',
                  color: 'white',
                  fontSize: '14px',
                  cursor: isDateBeforeToday(disableDate.slotDate) ? 'not-allowed' : 'pointer',
                  opacity: isDateBeforeToday(disableDate.slotDate) ? 0.6 : 1
                }}
              >
                Disable
              </button>
            </DialogActions>
          </Dialog>

          {/* GENERATE FUTURE SLOTS DIALOG */}
          <Dialog 
            open={bulkDialogOpen} 
            onClose={() => setBulkDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle>Generate Future Slots</DialogTitle>
            <DialogContent dividers>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '16px'
              }}>
                <div style={{ gridColumn: 'span 6' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={bulkSlotData.startDate}
                      onChange={(e) => setBulkSlotData({ ...bulkSlotData, startDate: e.target.value })}
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  {isDateBeforeToday(bulkSlotData.startDate) && (
                    <div style={{
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffeaa7',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#856404'
                      }}>
                        Start date cannot be in the past
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: 'span 6' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={bulkSlotData.endDate}
                      onChange={(e) => setBulkSlotData({ ...bulkSlotData, endDate: e.target.value })}
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 6' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={bulkSlotData.timeSlots[0].startTime}
                      onChange={(e) =>
                        setBulkSlotData({
                          ...bulkSlotData,
                          timeSlots: [{ ...bulkSlotData.timeSlots[0], startTime: e.target.value }]
                        })
                      }
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 6' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={bulkSlotData.timeSlots[0].endTime}
                      onChange={(e) =>
                        setBulkSlotData({
                          ...bulkSlotData,
                          timeSlots: [{ ...bulkSlotData.timeSlots[0], endTime: e.target.value }]
                        })
                      }
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <button
                onClick={() => setBulkDialogOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#333',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={generateFutureSlots}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Generate
              </button>
            </DialogActions>
          </Dialog>

          {/* SNACKBAR */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ 
              vertical: isMobile ? "top" : "bottom", 
              horizontal: isMobile ? "center" : "right" 
            }}
            style={{
              position: 'fixed',
              zIndex: 9999
            }}
          >
            <div
              style={{
                padding: '16px',
                borderRadius: '4px',
                backgroundColor: snackbar.severity === 'error' ? '#f44336' : 
                               snackbar.severity === 'warning' ? '#ff9800' : 
                               snackbar.severity === 'info' ? '#2196f3' : '#4caf50',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {snackbar.message}
            </div>
          </Snackbar>
        </div>
      </div>
    </motion.div>
    <Footer />
    </>
  );
}