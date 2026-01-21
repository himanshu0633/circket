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
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  Groups as GroupsIcon,
  AccessTime as AccessTimeIcon
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/footer";
import ResponsiveHeader from "../components/AdminHeader";

const API_BASE_URL = "http://localhost:4000";
const ITEMS_PER_PAGE = 5;

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

const CaptainDetailsDialog = ({ 
  open, 
  onClose, 
  captain, 
  team, 
  members, 
  loading 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  if (!captain) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'active': return 'success';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        style: {
          borderRadius: isMobile ? 0 : 8,
          margin: isMobile ? 0 : 16,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle style={{ paddingBottom: 8, background: 'linear-gradient(45deg, #2196f320, #9c27b020)' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              src={captain.image} 
              style={{ width: 48, height: 48, backgroundColor: '#2196f3' }}
            >
              {captain.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                {captain.name}
              </Typography>
              <Typography variant="body2" style={{ color: '#666' }}>
                Team Captain
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers style={{ padding: isMobile ? 16 : 24, maxHeight: '70vh' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24, borderRadius: 8, height: '100%' }}>
                <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PersonIcon /> Captain Information
                </Typography>
                <Divider style={{ marginBottom: 16 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" flexWrap="wrap" style={{ marginBottom: 8 }}>
                      <EmailIcon style={{ marginRight: 8, color: '#666', fontSize: 20 }} />
                      <Typography variant="body2" style={{ color: '#666', minWidth: '70%' }}>
                        Email:
                      </Typography>
                      <Typography variant="body1" style={{ fontWeight: 650, wordBreak: 'break-all' }}>
                        {captain.email}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" style={{ marginBottom: 8 }}>
                      <PhoneIcon style={{ marginRight: 8, color: '#666', fontSize: 20 }} />
                      <Typography variant="body2" style={{ color: '#666', minWidth: 120 }}>
                        Phone:
                      </Typography>
                      <Typography variant="body1" style={{ fontWeight: 650 }}>
                        {captain.phoneNo}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" style={{ marginBottom: 8 }}>
                      <PaymentIcon style={{ marginRight: 8, color: '#666', fontSize: 20 }} />
                      <Typography variant="body2" style={{ color: '#666', minWidth: 120 }}>
                        Payment Status:
                      </Typography>
                      <Chip 
                        label={captain.paymentStatus || 'Pending'} 
                        size="small" 
                        color={getStatusColor(captain.paymentStatus)}
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <AccessTimeIcon style={{ marginRight: 8, color: '#666', fontSize: 20 }} />
                      <Typography variant="body2" style={{ color: '#666', minWidth: 120 }}>
                        Created:
                      </Typography>
                      <Typography variant="body1" style={{ fontWeight: 650 }}>
                        {formatDate(captain.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24, borderRadius: 8, height: '100%' }}>
                <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <SportsIcon /> Team Details
                </Typography>
                <Divider style={{ marginBottom: 16 }} />
                
                {team ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h5" style={{ fontWeight: 'bold', color: '#2196f3', marginBottom: 8 }}>
                        {team.teamName}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" style={{ marginBottom: 8 }}>
                        <GroupsIcon style={{ marginRight: 8, color: '#666', fontSize: 20 }} />
                        <Typography variant="body2" style={{ color: '#666' }}>
                          Total Players:
                        </Typography>
                        <Typography variant="body1" style={{ fontWeight: 700, marginLeft: 8 }}>
                          {team.totalPlayers}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" style={{ marginBottom: 8 }}>
                        <PeopleIcon style={{ marginRight: 8, color: '#666', fontSize: 20 }} />
                        <Typography variant="body2" style={{ color: '#666' }}>
                          Current:
                        </Typography>
                        <Typography variant="body1" style={{ fontWeight: 700, marginLeft: 8 }}>
                          {team.currentPlayers}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" style={{ color: '#666', marginRight: 8 }}>
                            Status:
                          </Typography>
                          <Chip 
                            label={team.status} 
                            size="small" 
                            color={getStatusColor(team.status)}
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" style={{ color: '#666' }}>
                          Created: {formatDate(team.createdAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box textAlign="center" style={{ paddingTop: 32, paddingBottom: 32 }}>
                    <GroupsIcon style={{ fontSize: 60, color: '#bdbdbd', marginBottom: 16 }} />
                    <Typography variant="h6" style={{ color: '#666', marginBottom: 8 }}>
                      No Team Created
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666' }}>
                      This captain hasn't created a team yet
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper style={{ padding: 24, borderRadius: 8 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 16 }}>
                  <Typography variant="h6" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PeopleIcon /> Team Members ({members?.length || 0})
                  </Typography>
                  {team && (
                    <Chip 
                      label={`${team.currentPlayers}/${team.totalPlayers} Players`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
                <Divider style={{ marginBottom: 24 }} />

                {members && members.length > 0 ? (
                  <TableContainer style={{ 
                    borderRadius: 4,
                    border: '1px solid #e0e0e0',
                    maxHeight: 300,
                    overflow: 'auto'
                  }}>
                    <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                      <TableHead>
                        <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Player Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Joined Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {members.map((member, index) => (
                          <TableRow 
                            key={member._id} 
                            hover
                            style={{ 
                              backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(33, 150, 243, 0.05)'
                            }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar 
                                  style={{ 
                                    width: 32, 
                                    height: 32, 
                                    marginRight: 8,
                                    backgroundColor: '#2196f3',
                                    fontSize: 14
                                  }}
                                >
                                  {member.name?.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">{member.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {member.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{member.mobile}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={member.role} 
                                size="small"
                                variant="outlined"
                                style={{ 
                                  borderColor: '#2196f3',
                                  color: '#2196f3'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {formatDate(member.createdAt)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box textAlign="center" style={{ paddingTop: 32, paddingBottom: 32 }}>
                    <PeopleIcon style={{ fontSize: 60, color: '#bdbdbd', marginBottom: 16 }} />
                    <Typography variant="h6" style={{ color: '#666', marginBottom: 8 }}>
                      No Members Added
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666' }}>
                      {team ? 'This team has no members yet' : 'No team created yet'}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions style={{ padding: 16, background: '#f5f5f5' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          size={isMobile ? "small" : "medium"}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function CaptainsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');
  
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
  
  const [teamData, setTeamData] = useState({
    team: null,
    members: []
  });
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedCaptainForAction, setSelectedCaptainForAction] = useState(null);

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

  const calculateStats = (data) => {
    const total = data.length;
    const paid = data.filter(c => c.paymentStatus === "Paid").length;
    const pending = total - paid;
    setStats({ total, paid, pending });
  };

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

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

  const viewDetails = async (captain) => {
    try {
      setSelectedCaptain(captain);
      setTeamsLoading(true);
      setDetailsDialogOpen(true);
      
      const res = await API.get(`/admin/captain/${captain._id}/team`);
      
      if (res.data.success) {
        setSelectedCaptain(res.data.captain);
        setTeamData({
          team: res.data.team,
          members: res.data.members || []
        });
      }
      
    } catch (err) {
      showSnackbar("Failed to fetch team details", "error");
      console.error("Fetch teams error:", err);
    } finally {
      setTeamsLoading(false);
    }
  };

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

  const StatCard = ({ title, value, icon, color, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      style={{ width: "100%" }}
    >
      <Card
        style={{
          width: "100%",
          minHeight: 100,
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(135deg, ${color}20, ${color}40)`,
          borderLeft: `4px solid ${color}`,
          borderRadius: 8,
        }}
      >
        <CardContent style={{ width: "100%", padding: 16 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="overline" style={{ fontSize: "0.75rem", whiteSpace: "nowrap", color: "#666" }}>
                {title}
              </Typography>
              <Typography fontWeight="bold" style={{ fontSize: "1.4rem" }}>
                {value}
              </Typography>
            </Box>
            <Box style={{ width: 50, height: 50, borderRadius: "50%", backgroundColor: `${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {React.cloneElement(icon, {
                style: { fontSize: 26, color }
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const MobileCaptainCard = ({ captain, index }) => (
    <motion.div variants={itemVariants} initial="hidden" animate="visible" custom={index}>
      <Card style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" style={{ flex: 1 }}>
                <Avatar 
                  src={captain.image} 
                  style={{ marginRight: 16, width: 50, height: 50, backgroundColor: '#2196f3' }}
                >
                  {captain.name?.charAt(0)}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Typography variant="h6" style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {captain.name}
                  </Typography>
                  <Typography variant="caption" style={{ color: '#666', whiteSpace: 'nowrap' }}>
                    ID: {(captain._id || "N/A").toString().substring(0, 6)}...
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, captain)}>
                <MoreIcon />
              </IconButton>
            </Box>

            <Stack spacing={1}>
              <Box display="flex" alignItems="center">
                <EmailIcon style={{ marginRight: 8, fontSize: 16, color: '#666' }} />
                <Typography variant="body2" noWrap style={{ flex: 1 }}>
                  {captain.email}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <PhoneIcon style={{ marginRight: 8, fontSize: 16, color: '#666' }} />
                <Typography variant="body2">
                  {captain.phoneNo}
                </Typography>
              </Box>
            </Stack>

            <Box display="flex" justifyContent="space-between" style={{ paddingTop: 8 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={() => viewDetails(captain)}
                style={{ marginRight: 8, flex: 1 }}
              >
                View
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(captain._id)}
                style={{ marginLeft: 8, flex: 1 }}
              >
                Delete
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

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

        <Container maxWidth="xl" style={{ paddingLeft: isMobile ? 8 : 16, paddingRight: isMobile ? 8 : 16 }}>
          <Box style={{ paddingTop: isMobile ? 16 : 24, paddingBottom: isMobile ? 16 : 24 }}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <Box style={{ marginBottom: isMobile ? 24 : 32 }}>
                <Typography variant={isMobile ? "h5" : "h4"} style={{ fontWeight: "bold", marginBottom: 8 }}>
                  Team Captains Dashboard
                </Typography>
                <Typography variant="body1" style={{ color: "#666", marginBottom: 24 }}>
                  Manage all team captains, payments, and team details
                </Typography>
              </Box>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={isMobile ? 2 : 3} style={{ marginBottom: 32 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Total Captains"
                    value={stats.total}
                    icon={<GroupIcon />}
                    color="#2196f3"
                    index={0}
                  />
                </Grid>
              </Grid>
            </motion.div>

            <Card style={{ marginBottom: 24, borderRadius: 8 }}>
              <CardContent style={{ padding: isMobile ? 16 : 24 }}>
                <Grid container spacing={2} alignItems="center" wrap={isMobile ? "nowrap" : "wrap"}>
                  <Grid item xs={12} style={{ marginLeft: 8, flexGrow: isMobile ? 1 : 0 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search captains..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <SearchIcon style={{ marginRight: 8, color: "#757575" }} />
                        )
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenDialog(true)}
                      style={{ whiteSpace: "nowrap", paddingLeft: 16, paddingRight: 16, height: 40 }}
                    >
                      Add
                    </Button>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={fetchCaptains}
                      size="small"
                      style={{ border: "1px solid #e0e0e0", borderRadius: 4 }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {!isMobile && (
              <TableContainer component={Paper} style={{ borderRadius: 8, overflow: 'auto', maxHeight: '60vh' }}>
                <Table>
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell style={{ width: '25%' }}>
                        <Typography fontWeight="bold">Captain</Typography>
                      </TableCell>
                      <TableCell style={{ width: '40%' }}>
                        <Typography fontWeight="bold">Contact</Typography>
                      </TableCell>
                      <TableCell align="center" style={{ width: '35%' }}>
                        <Typography fontWeight="bold">Actions</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <AnimatePresence>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" style={{ paddingTop: 64, paddingBottom: 64 }}>
                            <CircularProgress size={50} />
                            <Typography variant="body2" style={{ color: '#666', marginTop: 16 }}>
                              Loading captains...
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : paginated.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" style={{ paddingTop: 64, paddingBottom: 64 }}>
                            <GroupIcon style={{ fontSize: 60, color: "#bdbdbd", marginBottom: 16 }} />
                            <Typography variant="h6" style={{ color: "#666", marginBottom: 8 }}>
                              No captains found
                            </Typography>
                            <Typography variant="body2" style={{ color: "#666" }}>
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
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar 
                                  src={c.image} 
                                  style={{ marginRight: 16, width: 48, height: 48 }}
                                >
                                  {c.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography fontWeight="bold" noWrap>
                                    {c.name}
                                  </Typography>
                                  <Typography variant="caption" style={{ color: '#666' }} noWrap>
                                    ID: {(c._id || "N/A").toString().substring(0, 8)}...
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap>{c.email}</Typography>
                              <Typography variant="body2" style={{ color: '#666' }}>{c.phoneNo}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                                <Tooltip title="View Details">
                                  <IconButton 
                                    color="info" 
                                    onClick={() => viewDetails(c)} 
                                    size="medium"
                                    style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    color="error"
                                    onClick={() => handleDelete(c._id)}
                                    size="medium"
                                    style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}
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

            {isMobile && (
              <Box>
                <AnimatePresence>
                  {loading ? (
                    <Box display="flex" flexDirection="column" alignItems="center" style={{ paddingTop: 64, paddingBottom: 64 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" style={{ color: '#666', marginTop: 16 }}>
                        Loading captains...
                      </Typography>
                    </Box>
                  ) : paginated.length === 0 ? (
                    <Box textAlign="center" style={{ paddingTop: 64, paddingBottom: 64 }}>
                      <GroupIcon style={{ fontSize: 60, color: "#bdbdbd", marginBottom: 16 }} />
                      <Typography variant="h6" style={{ color: "#666", marginBottom: 8 }}>
                        No captains found
                      </Typography>
                      <Typography variant="body2" style={{ color: "#666", marginBottom: 24 }}>
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

            {filtered.length > ITEMS_PER_PAGE && (
              <Box display="flex" justifyContent="center" style={{ marginTop: 24 }}>
                <Pagination
                  count={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                  page={page}
                  onChange={(e, v) => setPage(v)}
                  color="primary"
                  size={isMobile ? "small" : "large"}
                  siblingCount={isMobile ? 0 : 1}
                  boundaryCount={isMobile ? 1 : 2}
                />
              </Box>
            )}

            <Dialog 
              open={openDialog} 
              onClose={() => setOpenDialog(false)} 
              maxWidth="sm" 
              fullWidth
              fullScreen={isMobile}
              PaperProps={{
                style: {
                  borderRadius: isMobile ? 0 : 8,
                  margin: isMobile ? 0 : 16
                }
              }}
            >
              <DialogTitle style={{ paddingBottom: 8 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant={isMobile ? "h6" : "h5"}>
                    Create New Captain
                  </Typography>
                  <IconButton onClick={() => setOpenDialog(false)} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers style={{ paddingTop: 16 }}>
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
                      />
                    ))}
                  </Stack>
                </form>
              </DialogContent>
              <DialogActions style={{ padding: 16 }}>
                <Button onClick={() => setOpenDialog(false)} size={isMobile ? "small" : "medium"} style={{ minWidth: 80 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={formik.submitForm}
                  disabled={creating}
                  size={isMobile ? "small" : "medium"}
                  style={{ minWidth: 120 }}
                >
                  {creating ? (
                    <>
                      <CircularProgress size={16} style={{ marginRight: 8 }} />
                      Creating...
                    </>
                  ) : (
                    "Create Captain"
                  )}
                </Button>
              </DialogActions>
            </Dialog>

            <CaptainDetailsDialog
              open={detailsDialogOpen}
              onClose={() => setDetailsDialogOpen(false)}
              captain={selectedCaptain}
              team={teamData.team}
              members={teamData.members}
              loading={teamsLoading}
            />

            <Menu
              anchorEl={actionMenuAnchor}
              open={Boolean(actionMenuAnchor)}
              onClose={handleActionMenuClose}
              PaperProps={{
                style: {
                  minWidth: 180,
                  borderRadius: 4
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
                  <DeleteIcon fontSize="small" style={{ color: '#f44336' }} />
                </ListItemIcon>
                <ListItemText style={{ color: '#f44336' }}>Delete</ListItemText>
              </MenuItem>
            </Menu>

            <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                variant="filled"
                style={{ width: '100%', borderRadius: 4 }}
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