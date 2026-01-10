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
  Divider,
  alpha,
  useTheme,
  Container,
  AppBar,
  Toolbar
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
  Group as GroupIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";

// Import your logo image
import logo from "../../assets/logo.png"; 

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

// Validation schema for captain
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

export default function CaptainsPage() {
  const theme = useTheme();
  
  // Captain states
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
  
  // Team details states
  const [captainTeams, setCaptainTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [teamTabValue, setTeamTabValue] = useState(0);

  // Formik for captain form
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

  /* ================= LOGOUT FUNCTION ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

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

  /* ================= PAYMENT HANDLER ================= */
  // const markPaid = async (captain) => {
  //   try {
  //     const id = captain._id || captain.id || captain.userId;
      
  //     if (!id) {
  //       showSnackbar("Cannot update payment: No valid ID found for captain", "error");
  //       return;
  //     }
      
  //     await API.put(`/admin/updatePayment/${id}`, { status: "Paid" });
  //     showSnackbar("Payment status updated to Paid");
  //     fetchCaptains();
  //   } catch (err) {
  //     const errorMsg = err?.response?.data?.message || 
  //                      err?.message || 
  //                      "Failed to update payment status";
  //     showSnackbar(errorMsg, "error");
  //   }
  // };

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
              Team Captains Management
            </Typography>
          </Box>

          {/* Right: Logout Button & Navigation */}
          <Box sx={{ flexGrow: 0, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => window.location.href = "/admin/slots"}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Slots
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
                Team Captains Dashboard
              </Typography>
              <Typography variant="body1" color="textSecondary" mb={3}>
                Manage all team captains, payments, and team details
              </Typography>
            </Box>
          </motion.div>

          {/* STATS CARDS */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
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
              {/* <Grid item xs={12} sm={6} md={4}>
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
              </Grid> */}
            </Grid>
          </motion.div>

          {/* CREATE BUTTON & SEARCH */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
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
                  />
                </Grid>
                <Grid item xs={12} md={6} display="flex" justifyContent="flex-end" gap={2}>
                  <Tooltip title="Refresh Data">
                    <IconButton onClick={fetchCaptains}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
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

          {/* CAPTAINS TABLE */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[3] }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell><Typography fontWeight="bold">Captain</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Contact</Typography></TableCell>
                  {/* <TableCell><Typography fontWeight="bold">Payment Status</Typography></TableCell> */}
                  <TableCell align="center"><Typography fontWeight="bold">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <AnimatePresence>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <CircularProgress size={50} />
                        <Typography variant="body2" color="textSecondary" mt={2}>
                          Loading captains...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <GroupIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          No captains found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((c, index) => (
                      <motion.tr
                        key={c._id || index}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        whileHover={{ backgroundColor: alpha(theme.palette.primary.light, 0.05) }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={c.image} sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                              {c.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="bold">{c.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {(c._id || "N/A").toString().substring(0, 8)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography>{c.email}</Typography>
                          <Typography variant="body2" color="textSecondary">{c.phoneNo}</Typography>
                        </TableCell>
                        {/* <TableCell>
                          <Chip
                            label={c.paymentStatus || "Pending"}
                            color={c.paymentStatus === "Paid" ? "success" : "warning"}
                            variant="outlined"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell> */}
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            {/* <Tooltip title="Mark as Paid">
                              <IconButton
                                color="success"
                                disabled={c.paymentStatus === "Paid"}
                                onClick={() => markPaid(c)}
                                size="small"
                              >
                                <PaidIcon />
                              </IconButton>
                            </Tooltip> */}
                            <Tooltip title="View Details">
                              <IconButton color="info" onClick={() => viewDetails(c)} size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                color="error"
                                onClick={() => handleDelete(c._id)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
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
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                page={page}
                onChange={(e, v) => setPage(v)}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* CREATE CAPTAIN DIALOG */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Create New Captain</Typography>
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
                      />
                    </Grid>
                  ))}
                </Grid>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={formik.submitForm}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Captain"}
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