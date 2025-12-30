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
  useTheme
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
  Group as GroupIcon
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";

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
  const viewDetails = (captain) => {
    setSelectedCaptain(captain);
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
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <Avatar
                                src={c.image ? `${API_BASE_URL}${c.image}` : ""}
                                sx={{ 
                                  width: 50, 
                                  height: 50,
                                  mr: 2,
                                  border: `2px solid ${c.paymentStatus === "Paid" ? theme.palette.success.main : theme.palette.warning.main}`
                                }}
                              />
                            </motion.div>
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

                <Grid item xs={12}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Upload Profile Image
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={e => handleImage(e.target.files[0])}
                    />
                  </Button>
                  
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                        <Avatar
                          src={preview}
                          sx={{
                            width: 100,
                            height: 100,
                            border: `3px solid ${theme.palette.primary.main}`,
                            boxShadow: theme.shadows[3]
                          }}
                        />
                        <Typography variant="caption" color="textSecondary" mt={1}>
                          Preview
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </Grid>
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