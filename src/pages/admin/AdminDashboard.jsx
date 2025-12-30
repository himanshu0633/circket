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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Pagination,
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
  alpha,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Tabs,
  Tab,
  CardActions,
  Switch,
  FormControlLabel
} from "@mui/material";

import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as PaidIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Sports as SportsIcon,
  Person as PersonIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Paid as PaymentIcon,
  AccessTime as TimeIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = "http://localhost:4000";
const ITEMS_PER_PAGE = 5;

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

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (custom) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.05,
      type: "spring",
      stiffness: 100
    }
  }),
  exit: { opacity: 0, x: 20 }
};

// Validation schema
const validationSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name too short"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNo: yup
    .string()
    .matches(/^\d{10}$/, "Must be 10 digits")
    .required("Phone number is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
});

export default function AdminDashboard() {
  const theme = useTheme();
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0
  });
  const [expandedCaptain, setExpandedCaptain] = useState(null);
  
  // New states for team details
  const [captainTeams, setCaptainTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false); // Added this missing state
  const [teamPlayers, setTeamPlayers] = useState([]); // Added this state for team players
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [teamTabValue, setTeamTabValue] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Formik form
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phoneNo: "",
      password: ""
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await createCaptain(values, resetForm);
    }
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  /* ================= STATS CALCULATION ================= */
  const calculateStats = (data) => {
    const total = data.length;
    const paid = data.filter(c => c.paymentStatus === "Paid").length;
    const pending = total - paid;
    setStats({ total, paid, pending });
  };

  /* ================= FETCH CAPTAINS ================= */
  const fetchCaptains = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/myTeamCaptains");
      const captainsData = res.data.captains || [];
      setCaptains(captainsData);
      calculateStats(captainsData);
      
      // Debug: Log first captain data
      if (captainsData.length > 0) {
        console.log("First captain data:", captainsData[0]);
        console.log("Captain IDs:", captainsData.map(c => ({ 
          id: c._id, 
          name: c.name,
          hasId: !!c._id 
        })));
      }
    } catch (err) {
      showSnackbar("Failed to fetch captains", "error");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptains();
  }, []);

  /* ================= SNACKBAR HANDLER ================= */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  /* ================= IMAGE HANDLER ================= */
  const handleImage = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      showSnackbar("Please select a valid image file", "error");
    }
  };

  /* ================= CREATE CAPTAIN ================= */
  const createCaptain = async (formData, resetForm) => {
    try {
      setCreating(true);

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (image) data.append("image", image);

      await API.post("/admin/createTeamCaptain", data);

      showSnackbar("Captain created successfully!");
      resetForm();
      setImage(null);
      setPreview("");
      fetchCaptains();
      setOpenDialog(false);
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || "Failed to create captain",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  /* ================= PAYMENT HANDLER - FIXED ================= */
  const markPaid = async (captain) => {
    try {
      // Get ID with multiple fallback options
      const id = captain._id || captain.id || captain.userId;
      
      // Validate ID
      if (!id) {
        showSnackbar("Cannot update payment: No valid ID found for captain", "error");
        console.error("No ID found for captain:", captain);
        return;
      }
      
      console.log("Updating payment for ID:", id);
      
      await API.put(`/admin/updatePayment/${id}`, { status: "Paid" });
      showSnackbar("Payment status updated to Paid");
      fetchCaptains();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 
                       err?.message || 
                       "Failed to update payment status";
      showSnackbar(errorMsg, "error");
      console.error("Payment update error:", {
        error: err,
        response: err?.response,
        captain
      });
    }
  };

  /* ================= DELETE HANDLER ================= */
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this captain?")) {
      try {
        await API.delete(`/admin/deleteCaptain/${id}`);
        showSnackbar("Captain deleted successfully");
        fetchCaptains();
      } catch (err) {
        showSnackbar("Failed to delete captain", "error");
      }
    }
  };

  /* ================= VIEW DETAILS ================= */
  const viewDetails = async (captain) => {
    try {
      setSelectedCaptain(captain);
      setTeamsLoading(true);
      setDetailsDialogOpen(true);
      
      // Fetch captain teams
      const res = await API.get(`/admin/captain/${captain._id}/team`);
      
      if (res.data.team) {
        setCaptainTeams([
          {
            ...res.data.team,
            players: res.data.members || []
          }
        ]);
      } else {
        setCaptainTeams([]);
      }
      
    } catch (err) {
      showSnackbar("Failed to fetch team details", "error");
      console.error("Fetch teams error:", err);
    } finally {
      setTeamsLoading(false);
    }
  };

  /* ================= FETCH TEAM PLAYERS ================= */
  const fetchTeamPlayers = async (teamId) => {
    try {
      // You can implement this if you have an API endpoint for team players
      // For now, we'll use the players data from captainTeams
      const team = captainTeams.find(t => t._id === teamId);
      if (team && team.players) {
        setTeamPlayers(team.players);
      } else {
        setTeamPlayers([]);
      }
    } catch (err) {
      console.error("Error fetching team players:", err);
      setTeamPlayers([]);
    }
  };

  /* ================= DOWNLOAD TEAMS PDF ================= */
  const downloadTeamsPDF = () => {
    if (!selectedCaptain || captainTeams.length === 0) return;
    
    const doc = new jsPDF();
    
    // PDF Header
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147);
    doc.text(`${selectedCaptain.name}'s Teams Report`, 105, 20, null, null, 'center');
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Captain Email: ${selectedCaptain.email}`, 105, 30, null, null, 'center');
    doc.text(`Phone: ${selectedCaptain.phoneNo}`, 105, 36, null, null, 'center');
    doc.text(`Total Teams: ${captainTeams.length}`, 105, 42, null, null, 'center');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 48, null, null, 'center');
    
    // Teams Table
    const tableColumn = ["Team ID", "Team Name", "Sport", "Players", "Created Date"];
    const tableRows = captainTeams.map((team, index) => [
      index + 1,
      team.teamName || "Unnamed Team",
      team.sportType || "Not Specified",
      team.players ? team.players.length : 0,
      new Date(team.createdAt).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 53, 147] }
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    }
    
    doc.save(`${selectedCaptain.name}_Teams_Report.pdf`);
    showSnackbar("PDF downloaded successfully!");
  };

  /* ================= FILTER & PAGINATION ================= */
  const filtered = captains.filter(
    c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNo?.includes(search)
  );

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => setPage(1), [search]);

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

  /* ================= TEAM STATS CALCULATION ================= */
  const calculateTeamStats = () => {
    if (captainTeams.length === 0) return null;
    
    const totalTeams = captainTeams.length;
    const activeTeams = captainTeams.filter(t => t.isActive).length;
    const totalPlayers = captainTeams.reduce((sum, team) => sum + (team.players?.length || 0), 0);
    const avgPlayers = Math.round(totalPlayers / totalTeams);
    
    // Count by sport type
    const sportsCount = {};
    captainTeams.forEach(team => {
      const sport = team.sportType || 'Other';
      sportsCount[sport] = (sportsCount[sport] || 0) + 1;
    });
    
    return {
      totalTeams,
      activeTeams,
      totalPlayers,
      avgPlayers,
      sportsCount
    };
  };

  const teamStats = calculateTeamStats();

  /* ================= HANDLE TEAM TAB CHANGE ================= */
  const handleTeamTabChange = (event, newValue) => {
    setTeamTabValue(newValue);
  };

  /* ================= HANDLE TEAM SELECTION ================= */
  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
    fetchTeamPlayers(teamId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box p={3}>
        {/* HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <DashboardIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.primary.main }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage your team captains efficiently
              </Typography>
            </Box>
            <Box flexGrow={1} />
            <Tooltip title="Refresh">
              <IconButton onClick={fetchCaptains} sx={{ ml: 2 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </motion.div>

        {/* STATS CARDS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Captains"
                value={stats.total}
                icon={<GroupIcon sx={{ color: theme.palette.primary.main }} />}
                color={theme.palette.primary.main}
                index={0}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Paid"
                value={stats.paid}
                icon={<PaidIcon sx={{ color: theme.palette.success.main }} />}
                color={theme.palette.success.main}
                index={1}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Pending Payment"
                value={stats.pending}
                icon={<FilterIcon sx={{ color: theme.palette.warning.main }} />}
                color={theme.palette.warning.main}
                index={2}
              />
            </Grid>
          </Grid>
        </motion.div>

        {/* CREATE BUTTON & SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search captains by name, email, or phone"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: theme.shadows[2]
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: theme.shadows[6]
                      }
                    }}
                  >
                    Add New Captain
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* TABLE */}
        <div>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: theme.shadows[3],
              transition: "box-shadow 0.3s",
              "&:hover": {
                boxShadow: theme.shadows[6]
              }
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell>
                    <Typography fontWeight="bold">Captain</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">Contact</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">Payment Status</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold">Actions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <AnimatePresence>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <CircularProgress size={50} />
                          <Typography variant="body2" color="textSecondary" mt={2}>
                            Loading captains...
                          </Typography>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <GroupIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            No captains found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {search ? "Try a different search term" : "Add your first captain"}
                          </Typography>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((c, index) => (
                      <motion.tr
                        key={c._id || c.id || index}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        whileHover={{ 
                          backgroundColor: alpha(theme.palette.primary.light, 0.05),
                          transition: { duration: 0.2 }
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src={c.image || ""}
                              sx={{ mr: 2, bgcolor: theme.palette.primary.main }}
                            >
                              {c.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="bold">{c.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {(c._id || c.id || "N/A").toString().substring(0, 8)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography>{c.email}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {c.phoneNo}
                          </Typography>
                        </TableCell>
                        <TableCell> 
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Chip
                              label={c.paymentStatus || "Pending"}
                              color={c.paymentStatus === "Paid" ? "success" : "warning"}
                              variant="outlined"
                              sx={{ 
                                fontWeight: "bold",
                                borderRadius: 1
                              }}
                            />
                          </motion.div>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <Tooltip title="Mark as Paid">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <IconButton
                                  color="success"
                                  disabled={c.paymentStatus === "Paid"}
                                  onClick={() => markPaid(c)}
                                  size="small"
                                >
                                  <PaidIcon />
                                </IconButton>
                              </motion.div>
                            </Tooltip>
                            
                            <Tooltip title="View Details">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <IconButton
                                  color="info"
                                  onClick={() => viewDetails(c)}
                                  size="small"
                                >
                                  <ViewIcon />
                                </IconButton>
                              </motion.div>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <IconButton 
                                  color="error"
                                  onClick={() => {
                                    const id = c._id || c.id;
                                    if (id) handleDelete(id);
                                    else showSnackbar("Cannot delete: No ID found", "error");
                                  }}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </motion.div>
                            </Tooltip>  
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
          {filtered.length > ITEMS_PER_PAGE && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                  page={page}
                  onChange={(e, v) => setPage(v)}
                  color="primary"
                  size="large"
                  shape="rounded"
                />
              </Box>
            </motion.div>
          )}
        </div>

        {/* CREATE CAPTAIN DIALOG */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          TransitionProps={{
            timeout: 300
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">
                <PersonAddIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Create New Captain
              </Typography>
              <IconButton onClick={() => setOpenDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent dividers>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                {["name", "email", "phoneNo", "password"].map((field) => (
                  <Grid item xs={12} key={field}>
                    <TextField
                      fullWidth
                      name={field}
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      type={field === "password" ? "password" : "text"}
                      value={formik.values[field]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched[field] && Boolean(formik.errors[field])}
                      helperText={formik.touched[field] && formik.errors[field]}
                      variant="outlined"
                    />
                  </Grid>
                ))}

              
              </Grid>
            </form>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={formik.submitForm}
              variant="contained"
              disabled={creating || !formik.isValid}
              startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {creating ? "Creating..." : "Create Captain"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* TEAM DETAILS DIALOG */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={teamTabValue === 1 && selectedTeam}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                {teamTabValue === 1 && selectedTeam ? (
                  <IconButton 
                    onClick={() => setSelectedTeam(null)}
                    size="small"
                  >
                    <ArrowBackIcon />
                  </IconButton>
                ) : null}
                <Box display="flex" alignItems="center">
                  <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Box>
                    <Typography variant="h6">
                      {selectedCaptain?.name}'s Teams
                      <Typography variant="caption" sx={{ ml: 2, color: "text.secondary" }}>
                        ({captainTeams.length} teams)
                      </Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCaptain?.email} • {selectedCaptain?.phoneNo}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => viewDetails(selectedCaptain)}
                  size="small"
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadTeamsPDF}
                  disabled={captainTeams.length === 0}
                  size="small"
                >
                  Download PDF
                </Button>
                <IconButton onClick={() => setDetailsDialogOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent dividers>
            {teamsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading teams...</Typography>
              </Box>
            ) : captainTeams.length === 0 ? (
              <Box textAlign="center" py={4}>
                <SportsIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  No teams found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  This captain hasn't created any teams yet.
                </Typography>
              </Box>
            ) : (
              <>
                {!selectedTeam ? (
                  <>
                    {/* Tabs for Teams and Stats */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                      <Tabs value={teamTabValue} onChange={handleTeamTabChange}>
                        <Tab label="Teams List" />
                        <Tab label="Statistics" />
                      </Tabs>
                    </Box>

                    {/* Teams List Tab */}
                    {teamTabValue === 0 && (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                              <TableCell><Typography fontWeight="bold">Team Name</Typography></TableCell>                              <TableCell><Typography fontWeight="bold">Players</Typography></TableCell>
                              <TableCell><Typography fontWeight="bold">Created On</Typography></TableCell>
                              <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                              <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {captainTeams.map((team) => (
                              <TableRow key={team._id} hover>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <SportsIcon sx={{ mr: 2, color: "action.active" }} />
                                    <Typography fontWeight="medium">{team.teamName}</Typography>
                                  </Box>
                                </TableCell>
                            
                                <TableCell>
                                  <Button
                                    variant="text"
                                    startIcon={<PersonIcon />}
                                    onClick={() => handleTeamSelect(team._id)}
                                    size="small"
                                  >
                                    {team.players?.length || 0} players
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  {new Date(team.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={team.isActive ? "Active" : "Inactive"} 
                                    size="small"
                                    color={team.isActive ? "success" : "default"}
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleTeamSelect(team._id)}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {/* Statistics Tab */}
                    {teamTabValue === 1 && teamStats && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Grid container spacing={3}>
                          {/* Team Statistics Cards */}
                          <Grid item xs={12} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <SportsIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                                <Typography color="textSecondary" variant="body2">Total Teams</Typography>
                                <Typography variant="h4" fontWeight="bold">{teamStats.totalTeams}</Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                                <Typography color="textSecondary" variant="body2">Active Teams</Typography>
                                <Typography variant="h4" fontWeight="bold">{teamStats.activeTeams}</Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <GroupIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                                <Typography color="textSecondary" variant="body2">Total Players</Typography>
                                <Typography variant="h4" fontWeight="bold">{teamStats.totalPlayers}</Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ textAlign: 'center' }}>
                                <PersonIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                                <Typography color="textSecondary" variant="body2">Avg Players/Team</Typography>
                                <Typography variant="h4" fontWeight="bold">{teamStats.avgPlayers}</Typography>
                              </CardContent>
                            </Card>
                          </Grid>

                          {/* Sport Distribution */}
                          <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6" gutterBottom>Sport Distribution</Typography>
                                {Object.entries(teamStats.sportsCount).map(([sport, count]) => (
                                  <Box key={sport} display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>{sport}</Typography>
                                    <Typography fontWeight="bold">{count} teams</Typography>
                                  </Box>
                                ))}
                              </CardContent>
                            </Card>
                          </Grid>

                          {/* Recent Teams */}
                          <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6" gutterBottom>Recent Teams</Typography>
                                <List>
                                  {captainTeams.slice(0, 3).map((team) => (
                                    <ListItem key={team._id}>
                                      <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                          <SportsIcon />
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={team.teamName}
                                        secondary={`${team.sportType} • ${team.players?.length || 0} players`}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </motion.div>
                    )}
                  </>
                ) : (
                  // Team Players View
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Team Players
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {captainTeams.find(t => t._id === selectedTeam)?.teamName} • 
                      {captainTeams.find(t => t._id === selectedTeam)?.sportType}
                    </Typography>
                    
                    {teamPlayers.length === 0 ? (
                      <Box textAlign="center" py={4}>
                        <PersonIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                        <Typography variant="h6" color="textSecondary">
                          No players found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          This team has no players yet.
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {teamPlayers.map((player, index) => (
                          <ListItem key={player._id || index} divider>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                {player.name?.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                              primary={player.name}
                              secondary={
                                <>
                                  <Box display="block">{player.email}</Box>
                                  <Box display="block">{player.mobile}</Box>
                                </>
                              }
                            />

                            <Chip label={player.role || "Player"} size="small" />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            {selectedTeam ? (
              <Button 
                startIcon={<ArrowBackIcon />}
                onClick={() => setSelectedTeam(null)}
              >
                Back to Teams
              </Button>
            ) : null}
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
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
    </motion.div>
  );
}