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
       const slot = allSlots.find(s => s._id === slotId);
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
     const slot = allSlots.find(s => s._id === slotId);
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
    >
      <Card
        sx={{
          height: "100%",
          background: `linear-gradient(135deg, ${color}20, ${color}40)`,
          borderLeft: `4px solid ${color}`,
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "caption" : "overline"}>
                {title}
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"} component="div" fontWeight="bold">
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: `${color}20`,
                borderRadius: "50%",
                p: isMobile ? 1 : 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {React.cloneElement(icon, { fontSize: isMobile ? "small" : "medium" })}
            </Box>
          </Box>
        </CardContent>
      </Card>
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
    return (
      <Card sx={{ 
        mb: 2,
        borderLeft: `4px solid ${
          slot.isDisabled ? theme.palette.error.main :
          slot.bookedCount >= slot.capacity ? theme.palette.success.main :
          theme.palette.primary.main
        }`
      }}>
        <CardContent sx={{ p: 2 }}>
          {/* Slot Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box>
              <Typography variant="h6" component="div">
                {slot.startTime} - {slot.endTime}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Capacity: {slot.bookedCount || 0}/{slot.capacity}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={slot.isDisabled ? "Disabled" : 
                       slot.bookedCount >= slot.capacity ? "Full" : "Available"}
                color={
                  slot.isDisabled ? "error" : 
                  slot.bookedCount >= slot.capacity ? "success" : "primary"
                }
                size="small"
              />
              <MuiIconButton
                size="small"
                onClick={() => handleExpandSlot(slot._id)}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </MuiIconButton>
            </Box>
          </Box>
          
          {/* Booking Information (Always Visible) */}
          {slot.bookedTeams && slot.bookedTeams.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Booked Teams ({slot.bookedTeams.length}):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {slot.bookedTeams.map((team, idx) => (
                  <Chip
                    key={idx}
                    label={team}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Expanded Details */}
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box mt={2} pt={2} borderTop={1} borderColor="divider">
              {/* Booked Teams Details */}
              {slot.bookedTeams && slot.bookedTeams.length > 0 ? (
                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Team Details:
                  </Typography>
                  <Box>
                    {slot.bookedTeams.map((team, idx) => (
                      <Box key={idx} display="flex" alignItems="center" mb={1}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main', fontSize: 16 }} />
                        <Typography variant="body2">{team}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" mb={2}>
                  No teams booked for this slot
                </Typography>
              )}
              
              {/* Slot Actions */}
              <Box display="flex" gap={1} mt={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
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
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={slot.isDisabled ? <CheckCircleIcon /> : <DeleteIcon />}
                  color={slot.isDisabled ? "success" : "warning"}
                  onClick={() => toggleSlotStatus(slot._id)}
                >
                  {slot.isDisabled ? "Enable" : "Disable"}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => deleteSlot(slot._id)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
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
    >


      {/* MAIN CONTENT */}
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box p={{ xs: 1, sm: 2, md: 3 }}>
          {/* DASHBOARD HEADER */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box mb={{ xs: 2, sm: 3, md: 4 }}>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" gutterBottom>
                Ground Slots Calendar
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color="textSecondary" mb={3}>
                Click on any date to view all slots for that day
              </Typography>
            </Box>
          </motion.div>

          {/* SLOTS STATS - RESPONSIVE GRID */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} mb={{ xs: 2, sm: 3, md: 4 }}>
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  title="Total Dates"
                  value={[...new Set(slots.map(slot => new Date(slot.slotDate).toISOString().split('T')[0]))].length}
                  icon={<CalendarIcon sx={{ color: theme.palette.primary.main }} />}
                  color={theme.palette.primary.main}
                  index={0}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  title="Total Slots"
                  value={slots.filter(s => !isDateBeforeToday(s.slotDate)).length}
                  icon={<EventIcon sx={{ color: theme.palette.info.main }} />}
                  color={theme.palette.info.main}
                  index={1}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  title="Active Slots"
                  value={slots.filter(s => !s.isDisabled && !isDateBeforeToday(s.slotDate)).length}
                  icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
                  color={theme.palette.success.main}
                  index={2}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <StatCard
                  title="Total Bookings"
                  value={slots.reduce((sum, slot) => sum + (slot.bookedCount || 0), 0)}
                  icon={<GroupsIcon sx={{ color: theme.palette.warning.main }} />}
                  color={theme.palette.warning.main}
                  index={3}
                />
              </Grid>
            </Grid>
          </motion.div>

          {/* MAIN CALENDAR AND SLOTS VIEW */}
          <Card sx={{ 
            mb: 4, 
            borderRadius: { xs: 1, sm: 2 }, 
            boxShadow: theme.shadows[3],
            overflow: 'hidden'
          }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  {showDateSlots && (
                    <IconButton onClick={handleBackToCalendar} sx={{ mr: 2 }}>
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  {showDateSlots 
                    ? `Slots for ${selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : ''}`
                    : "Calendar View - Click on any date"
                  }
                </Box>
              }
              action={
                !showDateSlots && !isMobile && (
                  <Box display="flex" gap={2}>
                    <Tooltip title="Refresh">
                      <IconButton onClick={fetchSlots}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="outlined"
                      onClick={() => setDisableDateDialog(true)}
                      startIcon={<DeleteIcon />}
                      size={isTablet ? "small" : "medium"}
                    >
                      Disable Date
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setBulkDialogOpen(true)}
                      startIcon={<ScheduleIcon />}
                      size={isTablet ? "small" : "medium"}
                    >
                      Generate Slots
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setEditingSlot(null);
                        slotFormik.resetForm();
                        setSlotDialogOpen(true);
                      }}
                      startIcon={<AddIcon />}
                      size={isTablet ? "small" : "medium"}
                    >
                      Add Slot
                    </Button>
                  </Box>
                )
              }
            />
            <Divider />
            
            {/* MOBILE ACTION BUTTONS */}
            {!showDateSlots && isMobile && (
              <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <IconButton onClick={fetchSlots} size="small">
                  <RefreshIcon />
                </IconButton>
                <Button
                  variant="outlined"
                  onClick={() => setDisableDateDialog(true)}
                  startIcon={<DeleteIcon />}
                  size="small"
                >
                  Disable Date
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setBulkDialogOpen(true)}
                  startIcon={<ScheduleIcon />}
                  size="small"
                >
                  Generate
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setEditingSlot(null);
                    slotFormik.resetForm();
                    setSlotDialogOpen(true);
                  }}
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Add Slot
                </Button>
              </Box>
            )}

            {/* CALENDAR VIEW */}
            {!showDateSlots ? (
              <Box sx={{ p: { xs: 0, sm: 1, md: 2 } }}>
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
    
    return (
      <Box sx={{ p: 1 }}>
        <Box sx={{ 
          textAlign: 'center',
          p: 0.5,
          borderRadius: 1,
          backgroundColor: eventInfo.event.backgroundColor,
          color: 'white'
        }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: isMobile ? '0.6rem' : '0.75rem' }}>
            {eventInfo.event.extendedProps.activeSlots} slots
          </Typography>
          {eventInfo.event.extendedProps.bookedCount > 0 && (
            <Typography variant="caption" display="block" sx={{ fontSize: isMobile ? '0.5rem' : '0.65rem' }}>
              {eventInfo.event.extendedProps.bookedCount} bookings
            </Typography>
          )}
        </Box>
      </Box>
    );
  }}
/>
                
                {/* Calendar Legend */}
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Calendar Legend:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: '#007bff', borderRadius: '4px', mr: 1 }} />
                        <Typography variant="caption">Available Dates</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: '#6c757d', borderRadius: '4px', mr: 1 }} />
                        <Typography variant="caption">No Active Slots</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: '#dc3545', borderRadius: '4px', mr: 1 }} />
                        <Typography variant="caption">Disabled Dates</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: '#28a745', borderRadius: '4px', mr: 1 }} />
                        <Typography variant="caption">Fully Booked</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ) : (
              /* SELECTED DATE SLOTS VIEW */
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                {/* Date Summary Card */}
                <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"}>
                      <Box>
                        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" gutterBottom>
                          {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                        <Typography variant="body2">
                          Click on any slot to expand and view booking details
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: isMobile ? 2 : 0 }}>
                        <Grid container spacing={2}>
                          <Grid item>
                            <Box textAlign="center">
                              <Typography variant="h4" fontWeight="bold">
                                {selectedDateSlots.length}
                              </Typography>
                              <Typography variant="caption">Total Slots</Typography>
                            </Box>
                          </Grid>
                          <Grid item>
                            <Box textAlign="center">
                              <Typography variant="h4" fontWeight="bold" color="success.light">
                                {selectedDateSlots.filter(s => !s.isDisabled).length}
                              </Typography>
                              <Typography variant="caption">Active Slots</Typography>
                            </Box>
                          </Grid>
                          <Grid item>
                            <Box textAlign="center">
                              <Typography variant="h4" fontWeight="bold" color="warning.light">
                                {selectedDateSlots.reduce((sum, slot) => sum + (slot.bookedCount || 0), 0)}
                              </Typography>
                              <Typography variant="caption">Total Bookings</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      size={isMobile ? "small" : "medium"}
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
                      Add New Slot
                    </Button>
                  </CardActions>
                </Card>

                {/* Slots List */}
                {slotLoading ? (
                  <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                  </Box>
                ) : selectedDateSlots.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <ScheduleIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No slots found for this date
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      Create the first slot for this date
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
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
                      Create First Slot
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    {/* Filter Options */}
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      <Chip
                        label={`All Slots (${selectedDateSlots.length})`}
                        color="primary"
                        variant="outlined"
                        clickable
                      />
                      <Chip
                        label={`Active (${selectedDateSlots.filter(s => !s.isDisabled).length})`}
                        color="success"
                        variant="outlined"
                        clickable
                      />
                      <Chip
                        label={`Disabled (${selectedDateSlots.filter(s => s.isDisabled).length})`}
                        color="error"
                        variant="outlined"
                        clickable
                      />
                      <Chip
                        label={`Booked (${selectedDateSlots.filter(s => (s.bookedCount || 0) > 0).length})`}
                        color="warning"
                        variant="outlined"
                        clickable
                      />
                      <Chip
                                                label={`Past (${selectedDateSlots.filter(s => isDateBeforeToday(s.slotDate)).length})`}
                                                sx={{ backgroundColor: theme.palette.grey[300] }}
                                                variant="outlined"
                                                clickable
                                              />
                    </Box>

                    {/* Slots Cards */}
                    <Box>
                      {selectedDateSlots.map((slot) => (
                        <DateSlotCard key={slot._id} slot={slot} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Card>

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
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Slot Date"
                      name="slotDate"
                      InputLabelProps={{ shrink: true }}
                      value={slotFormik.values.slotDate}
                      onChange={slotFormik.handleChange}
                      onBlur={slotFormik.handleBlur}
                      error={slotFormik.touched.slotDate && Boolean(slotFormik.errors.slotDate)}
                      helperText={slotFormik.touched.slotDate && slotFormik.errors.slotDate}
                      size={isMobile ? "small" : "medium"}
                    />
                    {isDateBeforeToday(slotFormik.values.slotDate) && (
                                            <Alert severity="warning" sx={{ mt: 1 }}>
                                              Cannot create/edit slots for past dates
                                            </Alert>
                                          )}
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Start Time"
                      name="startTime"
                      InputLabelProps={{ shrink: true }}
                      value={slotFormik.values.startTime}
                      onChange={slotFormik.handleChange}
                      onBlur={slotFormik.handleBlur}
                      error={slotFormik.touched.startTime && Boolean(slotFormik.errors.startTime)}
                      helperText={slotFormik.touched.startTime && slotFormik.errors.startTime}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="End Time"
                      name="endTime"
                      InputLabelProps={{ shrink: true }}
                      value={slotFormik.values.endTime}
                      onChange={slotFormik.handleChange}
                      onBlur={slotFormik.handleBlur}
                      error={slotFormik.touched.endTime && Boolean(slotFormik.errors.endTime)}
                      helperText={slotFormik.touched.endTime && slotFormik.errors.endTime}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={slotFormik.values.isDisabled}
                          onChange={(e) => slotFormik.setFieldValue('isDisabled', e.target.checked)}
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label="Disable this slot"
                    />
                  </Grid>
                </Grid>
              </form>
            </DialogContent>
            <DialogActions>
              {isMobile && (
                <IconButton onClick={() => setSlotDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              )}
              <Button onClick={() => setSlotDialogOpen(false)} size={isMobile ? "small" : "medium"}>
                Cancel
              </Button>
              <Button variant="contained" onClick={slotFormik.submitForm} size={isMobile ? "small" : "medium"} disabled={isDateBeforeToday(slotFormik.values.slotDate)}>
                {editingSlot ? "Update" : "Create"}
              </Button>
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
              <TextField
                type="date"
                fullWidth
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={disableDate.slotDate}
                onChange={(e) => setDisableDate({ ...disableDate, slotDate: e.target.value })}
                size={isMobile ? "small" : "medium"}
              />
               {isDateBeforeToday(disableDate.slotDate) && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                  Cannot disable slots for past dates
                                </Alert>
                              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDisableDateDialog(false)} size={isMobile ? "small" : "medium"}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={disableSlotsByDate} size={isMobile ? "small" : "medium"} disabled={isDateBeforeToday(disableDate.slotDate)}>
                Disable
              </Button>
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={bulkSlotData.startDate}
                    onChange={(e) => setBulkSlotData({ ...bulkSlotData, startDate: e.target.value })}
                    size={isMobile ? "small" : "medium"}
                  /> 
                   {isDateBeforeToday(bulkSlotData.startDate) && (
                                        <Alert severity="warning" sx={{ mt: 1 }}>
                                          Start date cannot be in the past
                                        </Alert>
                                      )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={bulkSlotData.endDate}
                    onChange={(e) => setBulkSlotData({ ...bulkSlotData, endDate: e.target.value })}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    type="time"
                    label="Start Time"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={bulkSlotData.timeSlots[0].startTime}
                    onChange={(e) =>
                      setBulkSlotData({
                        ...bulkSlotData,
                        timeSlots: [{ ...bulkSlotData.timeSlots[0], startTime: e.target.value }]
                      })
                    }
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    type="time"
                    label="End Time"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={bulkSlotData.timeSlots[0].endTime}
                    onChange={(e) =>
                      setBulkSlotData({
                        ...bulkSlotData,
                        timeSlots: [{ ...bulkSlotData.timeSlots[0], endTime: e.target.value }]
                      })
                    }
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBulkDialogOpen(false)} size={isMobile ? "small" : "medium"}>
                Cancel
              </Button>
              <Button variant="contained" onClick={generateFutureSlots} size={isMobile ? "small" : "medium"}>
                Generate
              </Button>
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
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </motion.div>
    <Footer />
    </>
  );
}