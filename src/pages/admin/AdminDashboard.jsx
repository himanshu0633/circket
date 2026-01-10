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
  useMediaQuery,
  Container,
  Menu,
  MenuItem,
  Stack,
  ListItemIcon,
  ListItemText
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
  People as PeopleIcon,
  SportsSoccer as SportsIcon,
  MoreVert as MoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/footer";
import ResponsiveHeader from "../components/AdminHeader"; // Import the new header

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
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
  
  // Mobile menu states
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedCaptainForAction, setSelectedCaptainForAction] = useState(null);

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

  /* ================= MOBILE ACTION MENU ================= */
  const handleActionMenuOpen = (event, captain) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedCaptainForAction(captain);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedCaptainForAction(null);
  };

  const handleAction = (action) => {
    if (selectedCaptainForAction) {
      switch(action) {
        case 'view':
          viewDetails(selectedCaptainForAction);
          break;
        case 'delete':
          handleDelete(selectedCaptainForAction._id);
          break;
        default:
          break;
      }
    }
    handleActionMenuClose();
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

  /* ================= RESPONSIVE COMPONENTS ================= */
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
          minHeight: { xs: 120, sm: 140 },
          background: `linear-gradient(135deg, ${color}20, ${color}40)`,
          borderLeft: `4px solid ${color}`,
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: { xs: "none", sm: "translateY(-4px)" },
            boxShadow: { xs: theme.shadows[1], sm: theme.shadows[8] }
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography 
                color="textSecondary" 
                gutterBottom 
                variant="overline"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
              >
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: `${color}20`,
                borderRadius: "50%",
                p: { xs: 1, sm: 1.5 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 }
              }}
            >
              {React.cloneElement(icon, { 
                sx: { 
                  fontSize: { xs: 20, sm: 24 },
                  color: color 
                } 
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const MobileCaptainCard = ({ captain, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <Card sx={{ 
        mb: 2, 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: theme.shadows[2]
      }}>
        <CardContent>
          <Stack spacing={2}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" flex={1}>
                <Avatar 
                  src={captain.image} 
                  sx={{ 
                    mr: 2, 
                    width: 50, 
                    height: 50,
                    bgcolor: theme.palette.primary.main 
                  }}
                >
                  {captain.name?.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold" noWrap>
                    {captain.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    ID: {(captain._id || "N/A").toString().substring(0, 6)}...
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={(e) => handleActionMenuOpen(e, captain)}
              >
                <MoreIcon />
              </IconButton>
            </Box>

            {/* Contact Info */}
            <Stack spacing={1}>
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" noWrap flex={1}>
                  {captain.email}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {captain.phoneNo}
                </Typography>
              </Box>
            </Stack>

            {/* Actions */}
            <Box display="flex" justifyContent="space-between" pt={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={() => viewDetails(captain)}
                fullWidth
                sx={{ mr: 1 }}
              >
                View
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(captain._id)}
                fullWidth
                sx={{ ml: 1 }}
              >
                Delete
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  /* ================= MAIN RENDER ================= */
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* RESPONSIVE HEADER */}
        <ResponsiveHeader 
          title="CDS Premier League"
          subtitle="Team Captains Management"
        />

        {/* MAIN CONTENT */}
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Box py={{ xs: 2, sm: 3 }}>
            {/* DASHBOARD HEADER */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box mb={{ xs: 3, sm: 4 }}>
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ px: { xs: 1, sm: 0 } }}
                >
                  Team Captains Dashboard
                </Typography>
                <Typography 
                  variant="body1" 
                  color="textSecondary" 
                  mb={3}
                  sx={{ 
                    px: { xs: 1, sm: 0 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Manage all team captains, payments, and team details
                </Typography>
              </Box>
            </motion.div>

            {/* STATS CARDS */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Total Captains"
                    value={stats.total}
                    icon={<GroupIcon />}
                    color={theme.palette.primary.main}
                    index={0}
                  />
                </Grid>
               
              </Grid>
            </motion.div>

            {/* CREATE BUTTON & SEARCH */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: { xs: 1, sm: 2 },
              boxShadow: { xs: theme.shadows[1], sm: theme.shadows[3] }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      placeholder="Search captains..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                      }}
                      sx={{ 
                        '& .MuiInputBase-root': {
                          borderRadius: { xs: 1, sm: 2 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={2} 
                      justifyContent="flex-end"
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                      <Tooltip title="Refresh Data">
                        <IconButton 
                          onClick={fetchCaptains}
                          size={isMobile ? "small" : "medium"}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        fullWidth={isMobile}
                        sx={{
                          px: { xs: 2, sm: 4 },
                          py: { xs: 1, sm: 1.5 },
                          borderRadius: 2,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          "&:hover": {
                            transform: { xs: "none", sm: "scale(1.05)" },
                            boxShadow: { xs: theme.shadows[4], sm: theme.shadows[6] }
                          }
                        }}
                      >
                        <Typography variant={isMobile ? "body2" : "body1"}>
                          Add New Captain
                        </Typography>
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* DESKTOP TABLE VIEW */}
            {!isMobile && (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: theme.shadows[3],
                  overflow: 'auto',
                  maxHeight: { md: '60vh', lg: '70vh' }
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ width: { md: '30%', lg: '25%' } }}>
                        <Typography fontWeight="bold" fontSize={{ xs: '0.875rem', md: '1rem' }}>
                          Captain
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: { md: '35%', lg: '40%' } }}>
                        <Typography fontWeight="bold" fontSize={{ xs: '0.875rem', md: '1rem' }}>
                          Contact
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ width: { md: '35%', lg: '35%' } }}>
                        <Typography fontWeight="bold" fontSize={{ xs: '0.875rem', md: '1rem' }}>
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <AnimatePresence>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                            <CircularProgress size={isMobile ? 40 : 50} />
                            <Typography variant="body2" color="textSecondary" mt={2}>
                              Loading captains...
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : paginated.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                            <GroupIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                              No captains found
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Try adjusting your search or add a new captain
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
                                <Avatar 
                                  src={c.image} 
                                  sx={{ 
                                    mr: 2, 
                                    width: { xs: 40, md: 48 },
                                    height: { xs: 40, md: 48 }
                                  }}
                                >
                                  {c.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography fontWeight="bold" noWrap>
                                    {c.name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary" noWrap>
                                    ID: {(c._id || "N/A").toString().substring(0, 8)}...
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap>{c.email}</Typography>
                              <Typography variant="body2" color="textSecondary">{c.phoneNo}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                                <Tooltip title="View Details">
                                  <IconButton 
                                    color="info" 
                                    onClick={() => viewDetails(c)} 
                                    size={isMobile ? "small" : "medium"}
                                    sx={{ 
                                      bgcolor: alpha(theme.palette.info.main, 0.1),
                                      '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                                    }}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    color="error"
                                    onClick={() => handleDelete(c._id)}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{ 
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                    }}
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
            )}

            {/* MOBILE CARD VIEW */}
            {isMobile && (
              <Box>
                <AnimatePresence>
                  {loading ? (
                    <Box display="flex" flexDirection="column" alignItems="center" py={8}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="textSecondary" mt={2}>
                        Loading captains...
                      </Typography>
                    </Box>
                  ) : paginated.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <GroupIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No captains found
                      </Typography>
                      <Typography variant="body2" color="textSecondary" mb={3}>
                        Try adjusting your search or add a new captain
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                      >
                        Add New Captain
                      </Button>
                    </Box>
                  ) : (
                    paginated.map((captain, index) => (
                      <MobileCaptainCard 
                        key={captain._id || index}
                        captain={captain}
                        index={index}
                      />
                    ))
                  )}
                </AnimatePresence>
              </Box>
            )}

            {/* PAGINATION */}
            {filtered.length > ITEMS_PER_PAGE && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                  page={page}
                  onChange={(e, v) => setPage(v)}
                  color="primary"
                  size={isMobile ? "small" : "large"}
                  siblingCount={isMobile ? 0 : 1}
                  boundaryCount={isMobile ? 1 : 2}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Box>
            )}

            {/* CREATE CAPTAIN DIALOG */}
            <Dialog 
              open={openDialog} 
              onClose={() => setOpenDialog(false)} 
              maxWidth="sm" 
              fullWidth
              fullScreen={isMobile}
              PaperProps={{
                sx: {
                  borderRadius: isMobile ? 0 : 2,
                  maxHeight: isMobile ? '100%' : '80%',
                  overflow: 'hidden'
                }
              }}
            >
              <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant={isMobile ? "h6" : "h5"}>
                    Create New Captain
                  </Typography>
                  <IconButton 
                    onClick={() => setOpenDialog(false)} 
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers sx={{ pt: 2 }}>
                <form onSubmit={formik.handleSubmit}>
                  <Stack spacing={2}>
                    {["name", "email", "phoneNo", "password"].map((field) => (
                      <TextField
                        key={field}
                        fullWidth
                        name={field}
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        type={field === "password" ? "password" : "text"}
                        size={isMobile ? "small" : "medium"}
                        value={formik.values[field]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched[field] && Boolean(formik.errors[field])}
                        helperText={formik.touched[field] && formik.errors[field]}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </form>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button 
                  onClick={() => setOpenDialog(false)}
                  size={isMobile ? "small" : "medium"}
                  sx={{ minWidth: 80 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={formik.submitForm}
                  disabled={creating}
                  size={isMobile ? "small" : "medium"}
                  sx={{ minWidth: 120 }}
                >
                  {creating ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Creating...
                    </>
                  ) : (
                    "Create Captain"
                  )}
                </Button>
              </DialogActions>
            </Dialog>

            {/* ACTION MENU FOR MOBILE */}
            <Menu
              anchorEl={actionMenuAnchor}
              open={Boolean(actionMenuAnchor)}
              onClose={handleActionMenuClose}
              PaperProps={{
                sx: {
                  minWidth: 180,
                  borderRadius: 1,
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <MenuItem onClick={() => handleAction('view')}>
                <ListItemIcon>
                  <ViewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Details</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleAction('delete')}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
              </MenuItem>
            </Menu>

            {/* SNACKBAR */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ 
                vertical: isMobile ? "bottom" : "bottom", 
                horizontal: isMobile ? "center" : "right" 
              }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                variant="filled"
                sx={{ 
                  width: '100%',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  borderRadius: 1
                }}
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