import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

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

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-title">
            <h1>
              <span className="header-icon">🏏</span>
              CDS Champions Trophy
            </h1>
            <p className="header-subtitle">Admin Dashboard - Complete Player Management System</p>
          </div>
          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>
            <div className="admin-info">
              <div className="admin-name">Administrator</div>
              <div className="admin-role">Full System Access</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {statsCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-description">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Statistics */}
        {detailedStats.roleStats.length > 0 && (
          <div className="detailed-stats-section">
            <div className="detailed-stats-card">
              <h3 className="section-title">
                <span className="section-icon">📊</span>
                Detailed Statistics
              </h3>
              
              <div className="stats-details-grid">
                {/* Role Distribution */}
                <div className="stat-detail-group">
                  <h4 className="stat-group-title">Role Distribution</h4>
                  <div className="stat-items-list">
                    {detailedStats.roleStats.map(role => (
                      <div key={role._id} className="stat-item">
                        <div className="stat-item-content">
                          <div className="stat-item-label">{role._id}</div>
                          <div className="stat-item-subtext">
                            Total: {role.count} | ✓ {role.verified || 0} | ⏳ {role.pending || 0} | ✗ {role.rejected || 0}
                          </div>
                        </div>
                        <div className="stat-item-count">
                          {role.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Category Distribution */}
                <div className="stat-detail-group">
                  <h4 className="stat-group-title">Category Distribution</h4>
                  <div className="stat-items-list">
                    {detailedStats.categoryStats.map(category => (
                      <div key={category._id} className="stat-item">
                        <div className="stat-item-label">{category._id}</div>
                        <div className="stat-item-count category-count">
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
        <div className="main-content">
          {/* Messages */}
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              {success}
            </div>
          )}
          
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* View Toggle */}
          <div className="view-toggle-section">
            <div className="view-toggle-buttons">
              <button
                className={`view-toggle-btn ${!showAllPlayersView ? 'active' : ''}`}
                onClick={() => setShowAllPlayersView(false)}
              >
                <span className="btn-icon">⏳</span>
                Pending Verification
              </button>
              
              <button
                className={`view-toggle-btn ${showAllPlayersView ? 'active' : ''}`}
                onClick={() => setShowAllPlayersView(true)}
              >
                <span className="btn-icon">📋</span>
                All Players
              </button>
            </div>
            
            <div className="action-buttons">
              <button
                className="action-btn export-btn"
                onClick={exportToExcel}
              >
                <span className="btn-icon">📊</span>
                Export Excel
              </button>
              
              <button
                className="action-btn refresh-btn"
                onClick={fetchAllPlayers}
                disabled={loading}
              >
                <span className="btn-icon">🔄</span>
                Refresh Data
              </button>
            </div>
          </div>

          {/* Advanced Filters (for All Players view) */}
          {showAllPlayersView && (
            <div className="advanced-filters-card">
              <h3 className="section-title">Advanced Filters</h3>
              
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Status</label>
                  <select
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">Role</label>
                  <select
                    className="filter-select"
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
                
                <div className="filter-group">
                  <label className="filter-label">Category</label>
                  <select
                    className="filter-select"
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
              
              <div className="search-filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Search</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Search by name, email, phone, or UTR..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">From Date</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">To Date</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="filter-actions">
                <button
                  className="filter-clear-btn"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
                
                <button
                  className="filter-apply-btn"
                  onClick={handleAdvancedSearch}
                >
                  <span className="btn-icon">🔍</span>
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Quick Status Check */}
          <div className="quick-search-card">
            <h3 className="section-title">Quick Registration Lookup</h3>
            <div className="search-controls">
              <div className="search-type-selector">
                <span className="search-label">Search by:</span>
                <select
                  className="search-select"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="email">Email</option>
                  <option value="utrNumber">UTR Number</option>
                </select>
              </div>
              
              <input
                type="text"
                className="search-input"
                placeholder={searchType === 'email' ? 'Enter email address' : 'Enter UTR number'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStatusCheck()}
              />
              
              <button
                className="search-btn"
                onClick={handleStatusCheck}
                disabled={searching}
              >
                <span className="btn-icon">🔍</span>
                {searching ? 'Searching...' : 'Check Status'}
              </button>
            </div>

            {searchResults && (
              <div className="search-results-card">
                <h4 className="results-title">Registration Details</h4>
                <div className="results-grid">
                  <div className="result-field">
                    <div className="field-label">Name</div>
                    <div className="field-value">{searchResults.name}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">Email</div>
                    <div className="field-value">{searchResults.email}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">UTR Number</div>
                    <div className="field-value utr-number">{searchResults.utrNumber}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">Status</div>
                    <span 
                      className="status-badge"
                      style={getStatusColor(searchResults.paymentStatus)}
                    >
                      {searchResults.paymentStatus}
                    </span>
                  </div>
                  <div className="result-field">
                    <div className="field-label">Registered</div>
                    <div className="field-value">{formatDate(searchResults.registeredAt)}</div>
                  </div>
                  {searchResults.verifiedBy && (
                    <div className="result-field">
                      <div className="field-label">Verified By</div>
                      <div className="field-value">{searchResults.verifiedBy}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabs for Pending View */}
          {!showAllPlayersView && (
            <div className="tabs-container">
              {['all', 'pending', 'verified', 'rejected'].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab !== 'all' && (
                    <span className="tab-count">
                      ({stats[tab]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Players Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading player data...</p>
            </div>
          ) : (
            <div className="players-table-container">
              {/* Table Header */}
              <div className="table-header">
                <h3 className="table-title">
                  {showAllPlayersView ? 'All Registered Players' : 'Players for Verification'}
                  <span className="table-subtitle">
                    ({showAllPlayersView ? allPlayers.length : filteredPlayers.length} players)
                  </span>
                </h3>
                
                {showAllPlayersView && totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn prev-btn"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      ← Previous
                    </button>
                    
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      className="pagination-btn next-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>

              {/* Table */}
              {(showAllPlayersView ? allPlayers : filteredPlayers).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No players found</h3>
                  <p>No {showAllPlayersView ? 'players' : activeTab === 'all' ? '' : activeTab} registrations found</p>
                  {showAllPlayersView && (
                    <button
                      className="clear-filters-btn"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="players-table">
                    <thead>
                      <tr>
                        <th className="table-header-cell">Player Details</th>
                        <th className="table-header-cell">UTR & Payment</th>
                        
                        {showAllPlayersView && (
                          <th className="table-header-cell">Category & Role</th>
                        )}
                        
                        <th className="table-header-cell">Registration Timeline</th>
                        <th className="table-header-cell">Actions</th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {(showAllPlayersView ? allPlayers : filteredPlayers).map(player => (
                        <tr key={player._id} className="table-row">
                          {/* Player Details Column */}
                          <td 
                            className="table-cell player-details-cell"
                            data-label="Player Details"
                          >
                            <div className="player-name">
                              {player.name}
                            </div>
                            <div className="player-info">
                              <span className="info-icon">📧</span> {player.email}
                            </div>
                            <div className="player-info">
                              <span className="info-icon">📱</span> {player.phone}
                            </div>
                            {player.profileLink && (
                              <a 
                                href={player.profileLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="profile-link"
                              >
                                <span className="link-icon">🔗</span>
                                Profile Link
                              </a>
                            )}
                            {player.teamPreference && (
                              <div className="team-preference">
                                <span className="preference-icon">🏏</span>
                                Prefers: {player.teamPreference}
                              </div>
                            )}
                          </td>
                          
                          {/* UTR & Payment Column */}
                          <td 
                            className="table-cell payment-cell"
                            data-label="Payment Details"
                          >
                            <div className="utr-number-display">
                              {player.utrNumber}
                            </div>
                            <div className="status-badge-container">
                              <span 
                                className="status-badge table-badge"
                                style={getStatusColor(player.paymentStatus)}
                              >
                                {player.paymentStatus}
                              </span>
                            </div>
                            <div className="payment-method">
                              Method: {player.paymentMethod === 'qr' ? 'QR Code' : 'Bank Transfer'}
                            </div>
                            {player.verifiedBy && (
                              <div className="verified-by">
                                Verified by: {player.verifiedBy}
                              </div>
                            )}
                            {player.notes && (
                              <div className="player-notes">
                                Note: {player.notes}
                              </div>
                            )}
                          </td>
                          
                          {/* Category & Role Column (only for All Players view) */}
                          {showAllPlayersView && (
                            <td 
                              className="table-cell category-cell"
                              data-label="Role & Category"
                            >
                              <div className="category-group">
                                <div className="field-label-small">Category</div>
                                <div className="field-value">{player.category || 'Senior'}</div>
                              </div>
                              <div className="role-group">
                                <div className="field-label-small">Role</div>
                                <div className="field-value role-value">{player.role}</div>
                              </div>
                            </td>
                          )}
                          
                          {/* Registration Timeline Column */}
                          <td 
                            className="table-cell timeline-cell"
                            data-label="Timeline"
                          >
                            <div className="timeline-group">
                              <div className="field-label-small">Registered</div>
                              <div className="field-value">{formatDate(player.createdAt)}</div>
                            </div>
                            {player.verificationDate && (
                              <div className="timeline-group">
                                <div className="field-label-small">Verified</div>
                                <div className="field-value">{formatDate(player.verificationDate)}</div>
                              </div>
                            )}
                          </td>
                          
                          {/* Actions Column */}
                          <td 
                            className="table-cell actions-cell"
                            data-label="Actions"
                          >
                            <div className="action-buttons-group">
                              <button
                                className="action-btn verify-btn"
                                onClick={() => openVerifyModal(player)}
                                title="Verify/reject payment"
                              >
                                Verify/Update
                              </button>
                              <button
                                className="action-btn view-btn"
                                onClick={() => {
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
        <div className="dashboard-footer">
          <div className="footer-left">
            CDS Premier League Admin Dashboard • {new Date().toLocaleDateString('en-IN')}
          </div>
          <div className="footer-right">
            Total: {stats.total} players • Verified: {stats.verified} • Pending: {stats.pending}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2 className="modal-title">
        Verify Payment
      </h2>
      
      <div className="modal-body">
        {/* Change Status Section */}
        <div className="modal-section">
          <div className="modal-field-label">Change Status</div>
          <div className="status-options">
            <button
              className={`status-option-btn ${verificationStatus === 'pending' ? 'active pending' : ''}`}
              onClick={() => setVerificationStatus('pending')}
            >
              Pending
            </button>
            <button
              className={`status-option-btn ${verificationStatus === 'verified' ? 'active verified' : ''}`}
              onClick={() => setVerificationStatus('verified')}
            >
              Verified
            </button>
            <button
              className={`status-option-btn ${verificationStatus === 'rejected' ? 'active rejected' : ''}`}
              onClick={() => setVerificationStatus('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>
        
        {/* UTR Number Section */}
        <div className="modal-section">
          <div className="modal-field-label">UTR Number</div>
          <div className="modal-utr-display">
            {selectedPlayer?.utrNumber || '2334455675646523'}
          </div>
        </div>
        
        {/* Current Status Section */}
        <div className="modal-section">
          <div className="modal-field-label">Current Status</div>
          <div className="current-status-display">
            <span className="modal-status-badge pending">
              {selectedPlayer?.paymentStatus || 'pending'}
            </span>
          </div>
        </div>
        
        {/* Verified By field */}
        <div className="modal-section">
          <div className="modal-field-label">
            Verified By (Your Name)
          </div>
          <input
            type="text"
            className="modal-input"
            placeholder="Enter your name"
            value={verifiedBy}
            onChange={(e) => setVerifiedBy(e.target.value)}
          />
        </div>
        
        {/* Notes field */}
        <div className="modal-section">
          <div className="modal-field-label">
            Notes (Optional)
          </div>
          <textarea
            className="modal-textarea"
            placeholder="Add any notes or remarks..."
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
          />
        </div>
      </div>
      
      {/* Modal actions at the bottom */}
      <div className="modal-actions">
        <button
          className="modal-btn cancel-btn"
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
          className={`modal-btn confirm-btn ${verificationStatus || 'pending'}`}
          onClick={handleVerifyPayment}
          disabled={!verifiedBy.trim() || verifying}
        >
          {verifying ? 'Processing...' : `Mark as ${verificationStatus || 'pending'}`}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminDashboard;