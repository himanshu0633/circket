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
  AppBar,
  Toolbar,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Badge
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
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";

import { motion } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Import your logo image
import logo from "../../assets/logo.png"; 

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
      setSlots(slotsData);
      
      // Prepare calendar events
      const events = slotsData.map(slot => {
        const slotDate = new Date(slot.slotDate);
        const startDateTime = new Date(slotDate);
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMinute);
        
        const endDateTime = new Date(slotDate);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute);
        
        return {
          id: slot._id,
          title: `${slot.startTime} - ${slot.endTime} (${slot.bookedCount || 0}/${slot.capacity})`,
          start: startDateTime,
          end: endDateTime,
          color: slot.isDisabled ? '#dc3545' : 
                 (slot.bookedCount >= slot.capacity ? '#28a745' : '#007bff'),
          extendedProps: {
            ...slot,
            date: slot.slotDate
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
      await API.patch(`/admin/slots/toggle/${slotId}`);
      showSnackbar("Slot status updated!");
      fetchSlots();
    } catch (err) {
      showSnackbar("Failed to update slot status", "error");
    }
  };

  /* ================= DELETE SLOT ================= */
  const deleteSlot = async (slotId) => {
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
    setTabValue(2); // Switch to date slots tab
  };

  const handleEventClick = (info) => {
    const slot = info.event.extendedProps;
    setEditingSlot(slot);
    slotFormik.setValues({
      slotDate: slot.slotDate.split('T')[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      isDisabled: slot.isDisabled
    });
    setSlotDialogOpen(true);
  };

  const handleBackToCalendar = () => {
    setShowDateSlots(false);
    setSelectedDate(null);
    setSelectedDateSlots([]);
    setTabValue(0);
  };

  /* ================= SNACKBAR HANDLER ================= */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
              <Typography color="textSecondary" gutterBottom variant="overline">
                {title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: `${color}20`,
                borderRadius: "50%",
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {icon}
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

  /* ================= MAIN RENDER ================= */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* CUSTOM HEADER */}
      <AppBar 
        position="static" 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: theme.shadows[3],
          mb: 4
        }}
      >
        <Toolbar>
          {/* Left: Logo */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <Box
              component="div"
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                mr: 2
              }}
            >
              <img src={logo} alt="Logo" style={{ width: "100px" }} />
            </Box>
          </Box>

          {/* Center: Tournament Title */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: 1,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              CDS Premier League
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.9,
                mt: 0.5,
                letterSpacing: 0.5,
                fontWeight: 500,
                color: 'white'
              }}
            >
              Ground Slots Management
            </Typography>
          </Box>

          {/* Right: Logout Button & Navigation */}
          <Box sx={{ flexGrow: 0, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => window.location.href = "/admin"}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Captains
            </Button>
            <Button
              variant="outlined"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT */}
      <Container maxWidth="xl">
        <Box p={3}>
          {/* DASHBOARD HEADER */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box mb={4}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Ground Slots Dashboard
              </Typography>
              <Typography variant="body1" color="textSecondary" mb={3}>
                Manage ground slots, timings, and availability
              </Typography>
            </Box>
          </motion.div>

          {/* SLOTS STATS */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Slots"
                  value={slots.length}
                  icon={<EventIcon sx={{ color: theme.palette.primary.main }} />}
                  color={theme.palette.primary.main}
                  index={0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Slots"
                  value={slots.filter(s => !s.isDisabled).length}
                  icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
                  color={theme.palette.success.main}
                  index={1}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Disabled Slots"
                  value={slots.filter(s => s.isDisabled).length}
                  icon={<DeleteIcon sx={{ color: theme.palette.error.main }} />}
                  color={theme.palette.error.main}
                  index={2}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Bookings"
                  value={slots.reduce((sum, slot) => sum + (slot.bookedCount || 0), 0)}
                  icon={<CalendarIcon sx={{ color: theme.palette.info.main }} />}
                  color={theme.palette.info.main}
                  index={3}
                />
              </Grid>
            </Grid>
          </motion.div>

          {/* TABS FOR DIFFERENT VIEWS */}
          <Card sx={{ mb: 4, borderRadius: 2, boxShadow: theme.shadows[3] }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  {showDateSlots && (
                    <IconButton onClick={handleBackToCalendar} sx={{ mr: 2 }}>
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  {showDateSlots 
                    ? `Slots for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                    : "Ground Slots Management"
                  }
                </Box>
              }
              action={
                !showDateSlots && (
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
                    >
                      Disable Date
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setBulkDialogOpen(true)}
                      startIcon={<ScheduleIcon />}
                    >
                      Generate Slots
                    </Button>
                
                  </Box>
                )
              }
            />
            <Divider />
            
            {/* TABS */}
            {!showDateSlots && (
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ px: 3, pt: 2 }}
              >
                <Tab label="Calendar View" />
                <Tab label="List View" />
              </Tabs>
            )}

            {/* CALENDAR VIEW TAB */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  height="auto"
                  dayMaxEvents={3}
                  editable={false}
                  selectable={true}
                  weekends={true}
                  slotMinTime="06:00:00"
                  slotMaxTime="23:00:00"
                  businessHours={{
                    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                    startTime: '06:00',
                    endTime: '23:00'
                  }}
                  eventContent={(eventInfo) => (
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {eventInfo.timeText}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {eventInfo.event.title}
                      </Typography>
                    </Box>
                  )}
                  eventClassNames={(eventInfo) => {
                    const slot = eventInfo.event.extendedProps;
                    if (slot.isDisabled) return 'disabled-slot';
                    if (slot.bookedCount >= slot.capacity) return 'full-slot';
                    return 'available-slot';
                  }}
                />
              </Box>
              
              {/* CALENDAR LEGEND */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, bgcolor: '#007bff', mr: 1 }} />
                      <Typography variant="caption">Available Slots</Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, bgcolor: '#28a745', mr: 1 }} />
                      <Typography variant="caption">Full Slots</Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, bgcolor: '#dc3545', mr: 1 }} />
                      <Typography variant="caption">Disabled Slots</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* LIST VIEW TAB */}
            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell><Typography fontWeight="bold">Date</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Time</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Bookings</Typography></TableCell>
                      
                      <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Booked Teams</Typography></TableCell>
                      <TableCell align="center"><Typography fontWeight="bold">Actions</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {slotLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : slots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <ScheduleIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                          <Typography>No slots found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      slots.map((slot) => (
                        <TableRow key={slot._id} hover>
                          <TableCell>
                            {new Date(slot.slotDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">
                              {slot.startTime} - {slot.endTime}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              badgeContent={slot.bookedCount || 0} 
                              color={
                                slot.bookedCount >= slot.capacity ? "error" : 
                                slot.bookedCount > 0 ? "warning" : "default"
                              }
                              sx={{ mr: 1 }}
                            />
                            {/* {slot.bookedCount || 0}  */}
                          </TableCell>
                          {/* <TableCell>{slot.capacity}</TableCell> */}
                          <TableCell>
                            <Chip
                              label={slot.isDisabled ? "Disabled" : 
                                     slot.bookedCount >= slot.capacity ? "Full" : "Available"}
                              color={
                                slot.isDisabled ? "error" : 
                                slot.bookedCount >= slot.capacity ? "success" : "primary"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {slot.bookedTeams && slot.bookedTeams.length > 0 ? (
                              <Box>
                                {slot.bookedTeams.map((team, idx) => (
                                  <Chip
                                    key={idx}
                                    label={team}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                No bookings
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
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
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={slot.isDisabled ? "Enable" : "Disable"}>
                                <IconButton
                                  size="small"
                                  color={slot.isDisabled ? "success" : "warning"}
                                  onClick={() => toggleSlotStatus(slot._id)}
                                >
                                  {slot.isDisabled ? <CheckCircleIcon /> : <DeleteIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => deleteSlot(slot._id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* DATE-SPECIFIC SLOTS VIEW */}
            {showDateSlots && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Date Summary Card */}
                  <Grid item xs={12}>
                    <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Selected Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                        <Typography variant="body2">
                          Total Slots: {selectedDateSlots.length} | 
                          Active: {selectedDateSlots.filter(s => !s.isDisabled).length} | 
                          Booked: {selectedDateSlots.reduce((sum, slot) => sum + (slot.bookedCount || 0), 0)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Date Slots Grid */}
                  {selectedDateSlots.map((slot) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={slot._id}>
                      <Card sx={{ 
                        height: '100%',
                        borderLeft: `4px solid ${
                          slot.isDisabled ? theme.palette.error.main :
                          slot.bookedCount >= slot.capacity ? theme.palette.success.main :
                          theme.palette.primary.main
                        }`
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {slot.startTime} - {slot.endTime}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              label={slot.isDisabled ? "Disabled" : 
                                     slot.bookedCount >= slot.capacity ? "Full" : "Available"}
                              color={
                                slot.isDisabled ? "error" : 
                                slot.bookedCount >= slot.capacity ? "success" : "primary"
                              }
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Bookings: {slot.bookedCount || 0} / {slot.capacity}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Status: {slot.isFull ? "Full" : "Has Capacity"}
                            </Typography>
                          </Box>

                          {slot.bookedTeams && slot.bookedTeams.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" fontWeight="bold" gutterBottom>
                                Booked Teams:
                              </Typography>
                              {slot.bookedTeams.map((team, idx) => (
                                <Chip
                                  key={idx}
                                  label={team}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          )}

                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
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
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={slot.isDisabled ? "Enable" : "Disable"}>
                              <IconButton
                                size="small"
                                color={slot.isDisabled ? "success" : "warning"}
                                onClick={() => toggleSlotStatus(slot._id)}
                              >
                                {slot.isDisabled ? <CheckCircleIcon /> : <DeleteIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteSlot(slot._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}

                  {selectedDateSlots.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <ScheduleIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          No slots found for this date
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                          Create new slots for this date
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
                          Add Slot for this Date
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Card>

          {/* CREATE/EDIT SLOT DIALOG */}
          <Dialog open={slotDialogOpen} onClose={() => setSlotDialogOpen(false)} maxWidth="sm" fullWidth>
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
                    />
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={slotFormik.values.isDisabled}
                          onChange={(e) => slotFormik.setFieldValue('isDisabled', e.target.checked)}
                        />
                      }
                      label="Disable this slot"
                    />
                  </Grid>
                </Grid>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSlotDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={slotFormik.submitForm}>
                {editingSlot ? "Update Slot" : "Create Slot"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* DISABLE DATE DIALOG */}
          <Dialog open={disableDateDialog} onClose={() => setDisableDateDialog(false)} maxWidth="xs" fullWidth>
            <DialogTitle>Disable Slots for Date</DialogTitle>
            <DialogContent dividers>
              <TextField
                type="date"
                fullWidth
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={disableDate.slotDate}
                onChange={(e) => setDisableDate({ ...disableDate, slotDate: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDisableDateDialog(false)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={disableSlotsByDate}>
                Disable
              </Button>
            </DialogActions>
          </Dialog>

          {/* GENERATE FUTURE SLOTS DIALOG */}
          <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Generate Future Slots</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={bulkSlotData.startDate}
                    onChange={(e) => setBulkSlotData({ ...bulkSlotData, startDate: e.target.value })}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    type="date"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={bulkSlotData.endDate}
                    onChange={(e) => setBulkSlotData({ ...bulkSlotData, endDate: e.target.value })}
                  />
                </Grid>

                <Grid item xs={6}>
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
                  />
                </Grid>

                <Grid item xs={6}>
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
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={generateFutureSlots}>
                Generate
              </Button>
            </DialogActions>
          </Dialog>

          {/* SNACKBAR */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
  );
}