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

  // Captain Details Dialog Component
  const CaptainDetailsDialog = ({ 
    open, 
    onClose, 
    captain, 
    team, 
    members, 
    loading 
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
          position: 'relative'
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar 
                src={captain.image} 
                sx={{ 
                  width: 48, 
                  height: 48,
                  bgcolor: theme.palette.primary.main
                }}
              >
                {captain.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {captain.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Team Captain
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, maxHeight: '70vh', overflow: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Captain Details Section */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon /> Captain Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                          Email:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {captain.email}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                          Phone:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {captain.phoneNo}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <PaymentIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
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
                        <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                          Created:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(captain.createdAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Team Details Section */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsIcon /> Team Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {team ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                          {team.teamName}
                        </Typography>
                      </Grid>

                    

                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <GroupsIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                          <Typography variant="body2" color="textSecondary">
                            Total Players:
                          </Typography>
                          <Typography variant="body1" fontWeight={500} sx={{ ml: 1 }}>
                            {team.totalPlayers}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <PeopleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                          <Typography variant="body2" color="textSecondary">
                            Current:
                          </Typography>
                          <Typography variant="body1" fontWeight={500} sx={{ ml: 1 }}>
                            {team.currentPlayers}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                              Status:
                            </Typography>
                            <Chip 
                              label={team.status} 
                              size="small" 
                              color={getStatusColor(team.status)}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            Created: {formatDate(team.createdAt)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <GroupsIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No Team Created
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        This captain hasn't created a team yet
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Team Members Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  <Divider sx={{ mb: 3 }} />

                  {members && members.length > 0 ? (
                    <TableContainer sx={{ 
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
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
                              sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.primary.light, 0.05)
                              }}
                            >
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Avatar 
                                    sx={{ 
                                      width: 32, 
                                      height: 32, 
                                      mr: 1,
                                      bgcolor: theme.palette.primary.main,
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
                                  sx={{ 
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main
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
                    <Box textAlign="center" py={4}>
                      <PeopleIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No Members Added
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {team ? 'This team has no members yet' : 'No team created yet'}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, background: theme.palette.grey[50] }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          >
            Close
          </Button>
          {/* {team && (
            <Button 
              variant="contained"
              size={isMobile ? "small" : "medium"}
              onClick={() => {
                console.log('Manage team clicked for:', team._id);
              }}
            >
              Manage Team
            </Button>
          )} */}
        </DialogActions>
      </Dialog>
    );
  };

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
    const [teamData, setTeamData] = useState({
      team: null,
      members: []
    });
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
    style={{ width: "100%" }}
  >
    <Card
      sx={{
        width: "100%",
        minHeight: { xs: 90, sm: 100 },  
        display: "flex",
        alignItems: "center",
        background: `linear-gradient(135deg, ${color}20, ${color}40)`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ width: "100%", p: { xs: 1.5, sm: 2 } }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* LEFT TEXT */}
          <Box>
            <Typography
              variant="overline"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.75rem" }, 
              whiteSpace: "nowrap"
            }}
              color="textSecondary"
            >
              {title}
            </Typography>

            <Typography
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.2rem", sm: "1.4rem" } }}
            >
              {value}
            </Typography>
          </Box>

          {/* RIGHT ICON */}
          <Box
            sx={{
              width: { xs: 40, sm: 50 },
              height: { xs: 40, sm: 50 },
              borderRadius: "50%",
              backgroundColor: `${color}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,          // ✅ icon never shrink
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: { xs: 20, sm: 26 },
                color,
              },
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
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Paid Captains"
                      value={stats.paid}
                      icon={<PaidIcon />}
                      color={theme.palette.success.main}
                      index={1}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Pending Payments"
                      value={stats.pending}
                      icon={<FilterIcon />}
                      color={theme.palette.warning.main}
                      index={2}
                    />
                  </Grid>
                </Grid>
              </motion.div>

            {/* CREATE BUTTON & SEARCH */}
            <Card
                sx={{ 
                  mb: 3,
                  borderRadius: { xs: 1, sm: 2 },
                  boxShadow: { xs: theme.shadows[1], sm: theme.shadows[3] }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    wrap={{ xs: "nowrap", sm: "wrap" }}   // ⭐ KEY FIX
                  >

                    {/* SEARCH */}
                    <Grid
                      item
                      xs={12}
                      ml={2}                             // ⭐ desktop width control
                      sx={{ flexGrow: { xs: 1, sm: 0 } }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search captains..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                          )
                        }}
                      />
                    </Grid>

                    {/* ADD BUTTON */}
                    <Grid item>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{
                          whiteSpace: "nowrap",
                          px: 2,
                          height: 40
                        }}
                      >
                        Add
                      </Button>
                    </Grid>

                    {/* REFRESH */}
                    <Grid item>
                      <IconButton
                        onClick={fetchCaptains}
                        size="small"
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
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

              {/* CAPTAIN DETAILS DIALOG */}
              <CaptainDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                captain={selectedCaptain}
                team={teamData.team}
                members={teamData.members}
                loading={teamsLoading}
              />

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