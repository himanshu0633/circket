import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  // State variables
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [verifying, setVerifying] = useState(false);
  const [showAllPlayersView, setShowAllPlayersView] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalCollection: 0
  });
  
  const [dashboardStats, setDashboardStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState({
    roleStats: [],
    categoryStats: [],
    monthlyStats: []
  });
  
  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  
  // Advanced filters for all players view
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    category: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Base URL for API calls
  const API_BASE_URL = 'https://backend.cdspremierleague.com/api';

  // Stats cards data
  const statsCards = [
    { 
      title: 'Total Registrations', 
      value: stats.total, 
      icon: '📋',
      color: '#667eea',
      description: 'All registered players'
    },
    { 
      title: 'Pending', 
      value: stats.pending, 
      icon: '⏳',
      color: '#ed8936',
      description: 'Awaiting verification'
    },
    { 
      title: 'Verified', 
      value: stats.verified, 
      icon: '✅',
      color: '#48bb78',
      description: 'Payment confirmed'
    },
    { 
      title: 'Rejected', 
      value: stats.rejected, 
      icon: '❌',
      color: '#f56565',
      description: 'Payment rejected'
    },
    { 
      title: 'Total Collection', 
      value: `₹${stats.totalCollection}`, 
      icon: '💰',
      color: '#9f7aea',
      description: 'Total registration fees'
    }
  ];

  // Fetch all players (not just pending) for admin view
  const fetchAllPlayers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First get dashboard stats
      const statsResponse = await axios.get(`${API_BASE_URL}/player/dashboard-stats`);
      
      if (statsResponse.data.success) {
        setDashboardStats(statsResponse.data.data);
        
        // Calculate basic stats from dashboard data
        const overview = statsResponse.data.data.overview;
        setStats({
          total: overview.totalPlayers,
          pending: overview.pendingPlayers,
          verified: overview.verifiedPlayers,
          rejected: overview.rejectedPlayers,
          totalCollection: overview.totalCollection
        });
        
        // Set detailed stats
        setDetailedStats({
          roleStats: statsResponse.data.data.roleStats || [],
          categoryStats: statsResponse.data.data.categoryStats || [],
          monthlyStats: statsResponse.data.data.monthlyStats || []
        });
      }
      
      // Fetch all players with pagination
      const playersResponse = await axios.get(`${API_BASE_URL}/player/all-players`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: filters.status !== 'all' ? filters.status : undefined,
          role: filters.role !== 'all' ? filters.role : undefined,
          category: filters.category !== 'all' ? filters.category : undefined
        }
      });
      
      if (playersResponse.data.success) {
        setAllPlayers(playersResponse.data.data);
        setCurrentPage(playersResponse.data.pagination.page);
        setTotalPages(playersResponse.data.pagination.pages);
      }
      
      // Fetch pending players for the pending-only view
      const pendingResponse = await axios.get(`${API_BASE_URL}/player/pending-registrations`);
      
      if (pendingResponse.data.success) {
        setPlayers(pendingResponse.data.data || []);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err.response || err.message);
      setError('Failed to connect to server. Using demo data.');
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  // Fetch players with advanced search
  const fetchPlayersWithFilters = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: itemsPerPage
      };
      
      // Add filters if they are set
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.role !== 'all') params.role = filters.role;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await axios.get(`${API_BASE_URL}/player/search`, { params });
      
      if (response.data.success) {
        setAllPlayers(response.data.data);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching filtered players:', error);
      setError('Failed to fetch filtered players');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate mock players with specific status
  const generateMockPlayersWithStatus = (status, count) => {
    const names = ['Aarav Sharma', 'Vivaan Patel', 'Aditya Singh', 'Vihaan Kumar', 'Arjun Gupta'];
    const roles = ['Batsman', 'Bowler', 'Allrounder', 'Wicket Keeper'];
    const categories = ['Junior', 'Senior', 'Veteran'];
    
    return Array.from({ length: count }, (_, i) => ({
      _id: `mock_${status}_${i + 1}`,
      name: names[i % names.length],
      email: `${status}${i + 1}@example.com`,
      phone: `98765${String(10000 + i).slice(1)}`,
      role: roles[i % roles.length],
      category: categories[i % categories.length],
      utrNumber: `UTR${status.toUpperCase().slice(0, 3)}${String(1000 + i).slice(1)}`,
      paymentStatus: status,
      paymentMethod: 'qr',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      verificationDate: status !== 'pending' ? new Date().toISOString() : null,
      verifiedBy: status !== 'pending' ? 'Admin' : null,
      profileLink: `https://example.com/profile/${status}${i + 1}`,
      teamPreference: i % 2 === 0 ? 'Team A' : 'Team B',
      notes: status === 'rejected' ? 'Payment not received' : null
    }));
  };

  // Use mock data for development
  const useMockData = () => {
    const mockPlayers = [
      ...generateMockPlayersWithStatus('pending', 8),
      ...generateMockPlayersWithStatus('verified', 15),
      ...generateMockPlayersWithStatus('rejected', 4)
    ];
    
    setPlayers(mockPlayers.filter(p => p.paymentStatus === 'pending'));
    setAllPlayers(mockPlayers);
    
    // Calculate stats
    setStats({
      total: mockPlayers.length,
      pending: mockPlayers.filter(p => p.paymentStatus === 'pending').length,
      verified: mockPlayers.filter(p => p.paymentStatus === 'verified').length,
      rejected: mockPlayers.filter(p => p.paymentStatus === 'rejected').length,
      totalCollection: mockPlayers.filter(p => p.paymentStatus === 'verified').length * 500
    });
    
    // Mock detailed stats
    setDetailedStats({
      roleStats: [
        { _id: 'Batsman', count: 10, verified: 7, pending: 2, rejected: 1 },
        { _id: 'Bowler', count: 8, verified: 5, pending: 2, rejected: 1 },
        { _id: 'Allrounder', count: 6, verified: 4, pending: 2, rejected: 0 },
        { _id: 'Wicket Keeper', count: 3, verified: 2, pending: 1, rejected: 0 }
      ],
      categoryStats: [
        { _id: 'Junior', count: 5 },
        { _id: 'Senior', count: 18 },
        { _id: 'Veteran', count: 4 }
      ],
      monthlyStats: [
        { month: '2024-01', count: 8 },
        { month: '2024-02', count: 12 },
        { month: '2024-03', count: 7 }
      ]
    });
  };

  // Handle verification
  const handleVerifyPayment = async () => {
    if (!selectedPlayer || !verificationStatus || !verifiedBy.trim()) {
      setError('Please select a status and enter your name');
      return;
    }

    try {
      setVerifying(true);
      
      // Skip API call for mock data
      if (selectedPlayer._id.startsWith('mock_')) {
        // Update mock data locally
        const updatedPlayer = {
          ...selectedPlayer,
          paymentStatus: verificationStatus,
          verifiedBy: verifiedBy.trim(),
          verificationDate: new Date().toISOString(),
          notes: verificationNotes || null
        };
        
        // Update both players arrays
        setPlayers(prevPlayers => 
          prevPlayers.map(player => 
            player._id === selectedPlayer._id ? updatedPlayer : player
          )
        );
        
        setAllPlayers(prevPlayers => 
          prevPlayers.map(player => 
            player._id === selectedPlayer._id ? updatedPlayer : player
          )
        );
        
        setSuccess(`Payment ${verificationStatus} successfully (mock data)`);
      } else {
        // Real API call
        const response = await axios.post(`${API_BASE_URL}/player/verify-payment`, {
          playerId: selectedPlayer._id,
          status: verificationStatus,
          verifiedBy: verifiedBy.trim(),
          notes: verificationNotes
        });

        if (response.data.success) {
          setSuccess(`Payment ${verificationStatus} successfully`);
          
          // Update local state
          const updatedPlayer = response.data.data;
          
          setPlayers(prevPlayers => 
            prevPlayers.map(player => 
              player._id === selectedPlayer._id ? updatedPlayer : player
            )
          );
          
          setAllPlayers(prevPlayers => 
            prevPlayers.map(player => 
              player._id === selectedPlayer._id ? updatedPlayer : player
            )
          );
        } else {
          setError(response.data.message || 'Verification failed');
          return;
        }
      }
      
      // Update stats
      setStats(prevStats => {
        const newStats = { ...prevStats };
        
        // Decrease from old status
        if (selectedPlayer.paymentStatus === 'pending') {
          newStats.pending--;
        } else if (selectedPlayer.paymentStatus === 'verified') {
          newStats.verified--;
          newStats.totalCollection -= 500;
        } else if (selectedPlayer.paymentStatus === 'rejected') {
          newStats.rejected--;
        }
        
        // Increase to new status
        if (verificationStatus === 'pending') {
          newStats.pending++;
        } else if (verificationStatus === 'verified') {
          newStats.verified++;
          newStats.totalCollection += 500;
        } else if (verificationStatus === 'rejected') {
          newStats.rejected++;
        }
        
        return newStats;
      });
      
      setShowVerifyModal(false);
      setSelectedPlayer(null);
      setVerificationStatus('');
      setVerifiedBy('');
      setVerificationNotes('');
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Handle status check
  const handleStatusCheck = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter search term');
      return;
    }

    try {
      setSearching(true);
      setError('');
      setSearchResults(null);
      
      const params = {};
      if (searchType === 'email') {
        params.email = searchTerm.trim();
      } else {
        params.utrNumber = searchTerm.trim();
      }
      
      const response = await axios.get(`${API_BASE_URL}/player/check-status`, { params });
      
      if (response.data.success) {
        setSearchResults(response.data.data);
        setSuccess('Registration found!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('No registration found with provided details');
      }
      
    } catch (err) {
      console.error('Error checking status:', err);
      if (err.response?.status === 404) {
        setError('No registration found with provided details');
      } else {
        setError('Failed to check status. Please try again.');
      }
    } finally {
      setSearching(false);
    }
  };

  // Handle advanced filter search
  const handleAdvancedSearch = () => {
    fetchPlayersWithFilters(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      role: 'all',
      category: 'all',
      search: '',
      startDate: '',
      endDate: ''
    });
    fetchAllPlayers();
  };

  // Export data to CSV
  const exportToCSV = () => {
    const playersToExport = showAllPlayersView ? allPlayers : players;
    
    if (playersToExport.length === 0) {
      setError('No data to export');
      return;
    }
    
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Category', 'UTR Number', 'Payment Status', 'Registered Date', 'Verified Date', 'Verified By', 'Team Preference'];
    const csvData = [
      headers.join(','),
      ...playersToExport.map(player => [
        `"${player.name || 'N/A'}"`,
        `"${player.email || 'N/A'}"`,
        `"${player.phone || 'N/A'}"`,
        `"${player.role || 'N/A'}"`,
        `"${player.category || 'N/A'}"`,
        `"${player.utrNumber || 'N/A'}"`,
        `"${player.paymentStatus || 'N/A'}"`,
        `"${player.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'N/A'}"`,
        `"${player.verificationDate ? new Date(player.verificationDate).toLocaleDateString() : 'Not Verified'}"`,
        `"${player.verifiedBy || 'N/A'}"`,
        `"${player.teamPreference || 'Not Specified'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cds-premier-league-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSuccess('Data exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Export to Excel via API
  const exportToExcel = async () => {
    try {
      // Build query parameters from filters
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      // Note: For production, you'll need to implement the actual API call
      // For now, we'll use CSV export as fallback
      exportToCSV();
      
      /*
      // Uncomment this for actual Excel export when backend is ready
      const response = await axios.get(
        `${API_BASE_URL}/player/export?${params}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cds-registrations-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Data exported to Excel successfully!');
      setTimeout(() => setSuccess(''), 3000);
      */
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export data');
    }
  };

  // Open verification modal
  const openVerifyModal = (player) => {
    setSelectedPlayer(player);
    setVerificationStatus(player.paymentStatus);
    setVerifiedBy('');
    setVerificationNotes(player.notes || '');
    setShowVerifyModal(true);
  };

  // Filter players based on active tab (for pending-only view)
  const filteredPlayers = players.filter(player => {
    if (activeTab === 'all') return true;
    return player.paymentStatus === activeTab;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not verified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return { background: '#f0fff4', color: '#22543d' };
      case 'pending': return { background: '#fffaf0', color: '#c05621' };
      case 'rejected': return { background: '#fff5f5', color: '#742a2a' };
      default: return { background: '#f7fafc', color: '#4a5568' };
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (showAllPlayersView) {
      fetchPlayersWithFilters(page);
    }
  };

  useEffect(() => {
    fetchAllPlayers();
  }, []);

  const styles = {
    adminDashboard: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      padding: '30px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '5px solid rgba(255,255,255,0.1)'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  };

  return (
    <div style={styles.adminDashboard}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '15px' }}>
              🏏 CDS Champions Trophy
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Admin Dashboard - Complete Player Management System</p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            background: 'rgba(255,255,255,0.1)', 
            padding: '10px 20px', 
            borderRadius: '50px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'white',
              color: '#667eea',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>Administrator</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Full System Access</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          padding: '30px',
          background: '#f7fafc'
        }}>
          {statsCards.map((stat, index) => (
            <div key={index} style={{
              background: 'white',
              padding: '25px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              ':hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <div style={{
                fontSize: '2.5rem',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${stat.color}20`,
                color: stat.color
              }}>
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#2d3748', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {stat.title}
                </h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '0.85rem', color: '#a0aec0', margin: '5px 0 0 0' }}>
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Statistics */}
        {detailedStats.roleStats.length > 0 && (
          <div style={{ padding: '0 30px' }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📊 Detailed Statistics
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Role Distribution */}
                <div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#4a5568', fontSize: '1rem' }}>Role Distribution</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {detailedStats.roleStats.map(role => (
                      <div key={role._id} style={{
                        background: '#f7fafc',
                        padding: '15px',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#2d3748' }}>{role._id}</div>
                          <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                            Total: {role.count} | ✓ {role.verified || 0} | ⏳ {role.pending || 0} | ✗ {role.rejected || 0}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: '#667eea'
                        }}>
                          {role.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Category Distribution */}
                <div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#4a5568', fontSize: '1rem' }}>Category Distribution</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {detailedStats.categoryStats.map(category => (
                      <div key={category._id} style={{
                        background: '#f7fafc',
                        padding: '15px',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>{category._id}</div>
                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: '#48bb78'
                        }}>
                          {category.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ padding: '30px' }}>
          {/* Messages */}
          {success && (
            <div style={{
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'slideIn 0.3s ease',
              background: '#c6f6d5',
              color: '#22543d',
              borderLeft: '5px solid #48bb78'
            }}>
              ✅ {success}
            </div>
          )}
          
          {error && (
            <div style={{
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'slideIn 0.3s ease',
              background: '#fed7d7',
              color: '#742a2a',
              borderLeft: '5px solid #f56565'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '2px solid #f7fafc'
          }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  background: !showAllPlayersView ? '#667eea' : '#e2e8f0',
                  color: !showAllPlayersView ? 'white' : '#4a5568',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => setShowAllPlayersView(false)}
              >
                ⏳ Pending Verification
              </button>
              
              <button
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  background: showAllPlayersView ? '#667eea' : '#e2e8f0',
                  color: showAllPlayersView ? 'white' : '#4a5568',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => setShowAllPlayersView(true)}
              >
                📋 All Players
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{
                  padding: '10px 20px',
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={exportToExcel}
              >
                📊 Export Excel
              </button>
              
              <button
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={fetchAllPlayers}
                disabled={loading}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>

          {/* Advanced Filters (for All Players view) */}
          {showAllPlayersView && (
            <div style={{
              background: '#f7fafc',
              padding: '25px',
              borderRadius: '15px',
              marginBottom: '30px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>Advanced Filters</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Status</label>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white'
                    }}
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Role</label>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white'
                    }}
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="all">All Roles</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="Wicket Keeper">Wicket Keeper</option>
                    <option value="Allrounder">Allrounder</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Category</label>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white'
                    }}
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="all">All Categories</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Veteran">Veteran</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Search</label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    placeholder="Search by name, email, phone, or UTR..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>From Date</label>
                  <input
                    type="date"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>To Date</label>
                  <input
                    type="date"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '10px 20px',
                    background: '#a0aec0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
                
                <button
                  style={{
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={handleAdvancedSearch}
                >
                  🔍 Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Quick Status Check */}
          <div style={{
            background: '#f7fafc',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '30px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>Quick Registration Lookup</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#4a5568' }}>Search by:</span>
                <select
                  style={{
                    padding: '10px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="email">Email</option>
                  <option value="utrNumber">UTR Number</option>
                </select>
              </div>
              
              <input
                type="text"
                style={{
                  flex: 1,
                  minWidth: '250px',
                  padding: '12px 20px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                placeholder={searchType === 'email' ? 'Enter email address' : 'Enter UTR number'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStatusCheck()}
              />
              
              <button
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.3s ease',
                  opacity: searching ? 0.6 : 1
                }}
                onClick={handleStatusCheck}
                disabled={searching}
              >
                {searching ? 'Searching...' : '🔍 Check Status'}
              </button>
            </div>

            {searchResults && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'white',
                borderRadius: '10px',
                border: '2px solid #e2e8f0'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Registration Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Name</div>
                    <div style={{ fontWeight: 600 }}>{searchResults.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Email</div>
                    <div>{searchResults.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#a0aec0' }}>UTR Number</div>
                    <div style={{ fontFamily: 'monospace' }}>{searchResults.utrNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Status</div>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '15px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      ...getStatusColor(searchResults.paymentStatus)
                    }}>
                      {searchResults.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Registered</div>
                    <div>{formatDate(searchResults.registeredAt)}</div>
                  </div>
                  {searchResults.verifiedBy && (
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Verified By</div>
                      <div>{searchResults.verifiedBy}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabs for Pending View */}
          {!showAllPlayersView && (
            <div style={{
              display: 'flex',
              gap: '10px',
              background: '#f7fafc',
              padding: '5px',
              borderRadius: '12px',
              marginBottom: '30px'
            }}>
              {['all', 'pending', 'verified', 'rejected'].map(tab => (
                <button
                  key={tab}
                  style={{
                    padding: '12px 25px',
                    border: 'none',
                    background: activeTab === tab ? 'white' : 'transparent',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    color: activeTab === tab ? '#667eea' : '#a0aec0',
                    boxShadow: activeTab === tab ? '0 3px 10px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab !== 'all' && (
                    <span style={{ marginLeft: '8px', fontSize: '0.8em' }}>
                      ({stats[tab]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Players Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#a0aec0' }}>
              <div style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p>Loading player data...</p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, color: '#2d3748' }}>
                  {showAllPlayersView ? 'All Registered Players' : 'Players for Verification'}
                  <span style={{ fontSize: '0.9rem', color: '#a0aec0', marginLeft: '10px' }}>
                    ({showAllPlayersView ? allPlayers.length : filteredPlayers.length} players)
                  </span>
                </h3>
                
                {showAllPlayersView && totalPages > 1 && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{
                        padding: '8px 15px',
                        border: 'none',
                        background: currentPage === 1 ? '#e2e8f0' : '#667eea',
                        color: currentPage === 1 ? '#a0aec0' : 'white',
                        borderRadius: '6px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ← Previous
                    </button>
                    
                    <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{
                        padding: '8px 15px',
                        border: 'none',
                        background: currentPage === totalPages ? '#e2e8f0' : '#667eea',
                        color: currentPage === totalPages ? '#a0aec0' : 'white',
                        borderRadius: '6px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>

              {/* Table */}
              {(showAllPlayersView ? allPlayers : filteredPlayers).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a0aec0' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
                  <h3>No players found</h3>
                  <p>No {showAllPlayersView ? 'players' : activeTab === 'all' ? '' : activeTab} registrations found</p>
                  {showAllPlayersView && (
                    <button
                      style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    background: 'white',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: '#f7fafc',
                          padding: '20px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#2d3748',
                          textTransform: 'uppercase',
                          fontSize: '0.85rem',
                          letterSpacing: '1px'
                        }}>Player Details</th>
                        
                        <th style={{
                          background: '#f7fafc',
                          padding: '20px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#2d3748',
                          textTransform: 'uppercase',
                          fontSize: '0.85rem',
                          letterSpacing: '1px'
                        }}>UTR & Payment</th>
                        
                        {showAllPlayersView && (
                          <th style={{
                            background: '#f7fafc',
                            padding: '20px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#2d3748',
                            textTransform: 'uppercase',
                            fontSize: '0.85rem',
                            letterSpacing: '1px'
                          }}>Category & Role</th>
                        )}
                        
                        <th style={{
                          background: '#f7fafc',
                          padding: '20px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#2d3748',
                          textTransform: 'uppercase',
                          fontSize: '0.85rem',
                          letterSpacing: '1px'
                        }}>Registration Timeline</th>
                        
                        <th style={{
                          background: '#f7fafc',
                          padding: '20px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#2d3748',
                          textTransform: 'uppercase',
                          fontSize: '0.85rem',
                          letterSpacing: '1px'
                        }}>Actions</th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {(showAllPlayersView ? allPlayers : filteredPlayers).map(player => (
                        <tr key={player._id} style={{ borderBottom: '1px solid #f7fafc' }}>
                          {/* Player Details Column */}
                          <td style={{ padding: '20px' }}>
                            <div style={{ fontWeight: 600, marginBottom: '5px', fontSize: '1.1rem' }}>
                              {player.name}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '3px' }}>
                              📧 {player.email}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '3px' }}>
                              📱 {player.phone}
                            </div>
                            {player.profileLink && (
                              <a 
                                href={player.profileLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  color: '#667eea',
                                  textDecoration: 'none',
                                  fontSize: '0.85rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                🔗 Profile Link
                              </a>
                            )}
                            {player.teamPreference && (
                              <div style={{ fontSize: '0.85rem', color: '#9f7aea', marginTop: '5px' }}>
                                🏏 Prefers: {player.teamPreference}
                              </div>
                            )}
                          </td>
                          
                          {/* UTR & Payment Column */}
                          <td style={{ padding: '20px' }}>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px' }}>
                              {player.utrNumber}
                            </div>
                            <div style={{ marginBottom: '5px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '5px 15px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                ...getStatusColor(player.paymentStatus)
                              }}>
                                {player.paymentStatus}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                              Method: {player.paymentMethod === 'qr' ? 'QR Code' : 'Bank Transfer'}
                            </div>
                            {player.verifiedBy && (
                              <div style={{ fontSize: '0.85rem', color: '#a0aec0', marginTop: '5px' }}>
                                Verified by: {player.verifiedBy}
                              </div>
                            )}
                            {player.notes && (
                              <div style={{ fontSize: '0.85rem', color: '#f56565', marginTop: '5px', fontStyle: 'italic' }}>
                                Note: {player.notes}
                              </div>
                            )}
                          </td>
                          
                          {/* Category & Role Column (only for All Players view) */}
                          {showAllPlayersView && (
                            <td style={{ padding: '20px' }}>
                              <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Category</div>
                                <div style={{ fontWeight: 600 }}>{player.category || 'Senior'}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Role</div>
                                <div style={{ fontWeight: 600, color: '#667eea' }}>{player.role}</div>
                              </div>
                            </td>
                          )}
                          
                          {/* Registration Timeline Column */}
                          <td style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '10px' }}>
                              <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Registered</div>
                              <div>{formatDate(player.createdAt)}</div>
                            </div>
                            {player.verificationDate && (
                              <div>
                                <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Verified</div>
                                <div>{formatDate(player.verificationDate)}</div>
                              </div>
                            )}
                          </td>
                          
                          {/* Actions Column */}
                          <td style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button
                                style={{
                                  background: '#48bb78',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 15px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  transition: 'background 0.3s ease'
                                }}
                                onClick={() => openVerifyModal(player)}
                                title="Verify/reject payment"
                              >
                                Verify/Update
                              </button>
                              <button
                                style={{
                                  background: '#4299e1',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 15px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  transition: 'background 0.3s ease'
                                }}
                                onClick={() => {
                                  // View details action
                                  setSearchResults({
                                    name: player.name,
                                    email: player.email,
                                    utrNumber: player.utrNumber,
                                    paymentStatus: player.paymentStatus,
                                    registeredAt: player.createdAt,
                                    verifiedBy: player.verifiedBy
                                  });
                                }}
                                title="View details"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          background: '#f7fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
          color: '#a0aec0'
        }}>
          <div>
            CDS Premier League Admin Dashboard • {new Date().toLocaleDateString('en-IN')}
          </div>
          <div>
            Total: {stats.total} players • Verified: {stats.verified} • Pending: {stats.pending}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>
              {selectedPlayer?.paymentStatus === 'pending' ? 'Verify Payment' : 'Update Status'} - {selectedPlayer?.name}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '5px' }}>UTR Number</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 600 }}>
                  {selectedPlayer?.utrNumber}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '5px' }}>Current Status</div>
                <span style={{
                  display: 'inline-block',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  ...getStatusColor(selectedPlayer?.paymentStatus)
                }}>
                  {selectedPlayer?.paymentStatus}
                </span>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '5px' }}>Change Status</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['verified', 'rejected', 'pending'].map(status => (
                    <button
                      key={status}
                      style={{
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        background: verificationStatus === status ? 
                                  (status === 'verified' ? '#48bb78' : 
                                   status === 'rejected' ? '#f56565' : '#ed8936') : 
                                  '#e2e8f0',
                        color: verificationStatus === status ? 'white' : '#4a5568',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setVerificationStatus(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '5px' }}>
                  Verified By (Your Name)
                </div>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="Enter your name"
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '5px' }}>
                  Notes (Optional)
                </div>
                <textarea
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Add any notes or remarks..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                style={{
                  padding: '12px 25px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#4a5568',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedPlayer(null);
                  setVerificationStatus('');
                  setVerifiedBy('');
                  setVerificationNotes('');
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  background: verificationStatus === 'verified' ? '#48bb78' : 
                            verificationStatus === 'rejected' ? '#f56565' : '#ed8936',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'white',
                  transition: 'all 0.3s ease',
                  opacity: (!verificationStatus || !verifiedBy.trim()) ? 0.6 : 1
                }}
                onClick={handleVerifyPayment}
                disabled={!verificationStatus || !verifiedBy.trim() || verifying}
              >
                {verifying ? 'Processing...' : `Mark as ${verificationStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 1200px) {
          .container {
            max-width: 100%;
            margin: 0 20px;
          }
        }
        
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-section {
            flex-direction: column;
          }
          
          .tabs {
            flex-wrap: wrap;
          }
          
          table {
            display: block;
            overflow-x: auto;
          }
          
          th, td {
            padding: 10px !important;
          }
        }
        
        @media (max-width: 480px) {
          .header h1 {
            font-size: 1.8rem;
          }
          
          .modal-content {
            padding: 20px;
            width: 95%;
          }
          
          button {
            padding: 8px 12px !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;