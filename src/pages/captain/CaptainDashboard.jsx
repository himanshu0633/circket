import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import CaptainHeader from '../../component/Captain.header';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import '../../pages/captain/CaptainDashboard.css'; 

const TeamManagement = () => {
  const navigate = useNavigate();
  
  // State declarations
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [formData, setFormData] = useState({
    teamName: '',
    totalPlayers: 11,
  });
  const [playerData, setPlayerData] = useState([{
    name: '',
    mobile: '',
    role: 'Batsman',
    dateOfBirth: '',
    email: ''
  }]);
  const [editMember, setEditMember] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const roles = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Captain'];

  // Get current user
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Notification function
  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  }, []);

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/team/my-team');
      
      if (response.data.success) {
        setTeam(response.data.team);
        setMembers(response.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        showNotification('error', 
          error.response?.data?.message || 
          error.response?.data?.error || 
          'Failed to fetch team data'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // Create team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const captainId = currentUser?._id;
      if (!captainId) {
        showNotification('error', 'Cannot identify captain. Please login again.');
        return;
      }

      const response = await API.post('/team/create-team', {
        teamName: formData.teamName,
        totalPlayers: formData.totalPlayers
      });

      if (response.data.success) {
        setTeam(response.data.team);
        showNotification('success', 'Team created successfully!');
        setShowCreateTeamModal(false);
        setFormData({ teamName: '', totalPlayers: 11 });
        fetchTeamData();
      }
    } catch (error) {
      console.error('Error creating team:', error);
      showNotification('error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create team'
      );
    }
  };

  // Add players
  const handleAddPlayers = async (e) => {
    e.preventDefault();
    try {
      if (!team || !team._id) {
        showNotification('error', 'No team found. Please create a team first.');
        return;
      }

      // Validate all required fields
      const invalidPlayers = playerData.filter(player => !player.name || !player.mobile);
      if (invalidPlayers.length > 0) {
        showNotification('error', 'Name and Mobile are required for all players');
        return;
      }

      const response = await API.post('/team/add-players', {
        teamId: team._id,
        players: playerData
      });

      if (response.data.success) {
        await fetchTeamData();
        showNotification('success', 'Players added successfully!');
        setShowAddPlayersModal(false);
        setPlayerData([{
          name: '',
          mobile: '',
          role: 'Batsman',
          dateOfBirth: '',
          email: ''
        }]);
      }
    } catch (error) {
      console.error('Error adding players:', error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Failed to add players';
      showNotification('error', errorMsg);
    }
  };

  // Update member
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!editMember.name || !editMember.mobile) {
        showNotification('error', 'Name and Mobile are required');
        return;
      }
      
      const response = await API.put(
        `/team/member/${editMember._id}`,
        editMember
      );

      if (response.data.success) {
        await fetchTeamData();
        showNotification('success', 'Member updated successfully!');
        setShowEditModal(false);
        setEditMember(null);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      showNotification('error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update member'
      );
    }
  };

  // Delete member
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    try {
      const response = await API.delete(
        `/team/member/${memberId}`
      );

      if (response.data.success) {
        await fetchTeamData();
        showNotification('success', 'Member deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      showNotification('error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete member'
      );
    }
  };

  // Add player form row
  const addPlayerRow = () => {
    setPlayerData([...playerData, {
      name: '',
      mobile: '',
      role: 'Batsman',
      dateOfBirth: '',
      email: ''
    }]);
  };

  // Remove player form row
  const removePlayerRow = (index) => {
    if (playerData.length === 1) return;
    const newData = [...playerData];
    newData.splice(index, 1);
    setPlayerData(newData);
  };

  // Update player data
  const updatePlayerData = (index, field, value) => {
    const newData = [...playerData];
    newData[index][field] = value;
    setPlayerData(newData);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('info', 'Logged out successfully');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!team) {
      showNotification('error', 'No team data available');
      return;
    }

    try {
      setIsExporting(true);
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(team.teamName, pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text('CDS Premier League', pageWidth / 2, 35, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 42, { align: 'center' });
      
      let yPos = 55;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Team Information', 20, yPos);
      
      yPos += 12;
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(20, yPos - 2, pageWidth - 20, yPos - 2);
      
      yPos += 5;
      doc.setFontSize(11);
      
      const teamInfo = [
        ['Team Name:', team.teamName],
        ['Total Players:', team.totalPlayers],
        ['Players Added:', members.length],
        ['Available Slots:', team.totalPlayers - members.length],
        ['Status:', team.status || 'Pending'],
        ['Created Date:', formatDate(team.createdAt)],
        ['Captain:', currentUser?.name || currentUser?.email || 'You']
      ];
      
      teamInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 75, yPos);
        yPos += 8;
      });
      
      if (members.length > 0) {
        yPos += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Team Members', 20, yPos);
        
        yPos += 12;
        doc.setDrawColor(59, 130, 246);
        doc.line(20, yPos - 2, pageWidth - 20, yPos - 2);
        
        yPos += 5;
        
        const tableData = members.map((member, index) => [
          index + 1,
          member.name,
          member.role,
          member.mobile || '-',
          member.email || '-',
          member.status || 'Pending'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Name', 'Role', 'Mobile', 'Email', 'Status']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 58, 138],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11
          },
          styles: {
            fontSize: 10,
            cellPadding: 5,
            textColor: [51, 65, 85],
            lineColor: [229, 231, 235],
            lineWidth: 0.5
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 45 },
            2: { cellWidth: 35 },
            3: { cellWidth: 40 },
            4: { cellWidth: 55 },
            5: { cellWidth: 30, halign: 'center' }
          },
          margin: { left: 20, right: 50 },
          tableWidth: 'auto',
          didDrawPage: function(data) {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            doc.text(
              `Page ${data.pageNumber} of ${pageCount}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            );
          }
        });
      } else {
        yPos += 20;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128);
        doc.text('No team members added yet', pageWidth / 2, yPos, { align: 'center' });
      }
      
      const finalY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text('Generated by CDS Premier League', pageWidth / 2, finalY, { align: 'center' });
      
      doc.save(`${team.teamName.replace(/\s+/g, '_')}_Team_Report_${new Date().getTime()}.pdf`);
      showNotification('success', 'PDF exported successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

 
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading team data...</p>
      </div>
    );
  }

  return (
    <>
     <CaptainHeader 
        currentUser={currentUser}
        onLogout={handleLogout}
        isExporting={isExporting}
      />
    
    <div className="team-management">
      {/* Header Component */}
     

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Loading overlay for PDF export */}
      {isExporting && (
        <div className="export-loading-overlay">
          <div className="export-loading-content">
            <div className="export-spinner"></div>
            <p>Generating PDF...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Header Actions */}
        <div className="header-actions">
          {!team ? (
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateTeamModal(true)}
              disabled={isExporting}
            >
              Create Team
            </button>
          ) : (
            <>
              <div className="action-group">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAddPlayersModal(true)}
                  disabled={isExporting}
                >
                  Add Players
                </button>
              </div>
              <div className="export-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={exportToPDF}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
              
              </div>
            </>
          )}
        </div>

        {/* Team Info Card */}
        {team && (
          <div className="team-info-card">
            <div className="team-info-header">
              <h2>{team.teamName}</h2>
              <span className={`status-badge ${team.status?.toLowerCase() || 'pending'}`}>
                {team.status || 'Pending'}
              </span>
            </div>
            <div className="team-info-details">
              <div className="info-item">
                <span className="label">Team Name:</span>
                <span className="value">{team.teamName}</span>
              </div>
              <div className="info-item">
                <span className="label">Total Players:</span>
                <span className="value">{team.totalPlayers || 0}</span>
              </div>
              <div className="info-item">
                <span className="label">Players Added:</span>
                <span className="value">{members.length}</span>
              </div>
              <div className="info-item">
                <span className="label">Available Slots:</span>
                <span className="value">{(team.totalPlayers || 0) - members.length}</span>
              </div>
              <div className="info-item">
                <span className="label">Created Date:</span>
                <span className="value">{formatDate(team.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="label">Captain:</span>
                <span className="value captain-name">
                  {currentUser?.name || currentUser?.email || 'You'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Team Members Section */}
        {team && (
          <div className="team-members-section">
            <div className="section-header">
              <h3>Team Members ({members.length})</h3>
              {members.length > 0 && (
                <div className="view-toggle">
                  <span className="toggle-label">View:</span>
                  <button 
                    className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    disabled={isExporting}
                  >
                    Table
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                    disabled={isExporting}
                  >
                    Cards
                  </button>
                </div>
              )}
            </div>
            
            {members.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No players added yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddPlayersModal(true)}
                  disabled={isExporting}
                >
                  Add Players
                </button>
              </div>
            ) : (
              <>
                {/* Table View */}
                {viewMode === 'table' && (
                  <div className="members-table-container">
                    <table className="members-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Mobile</th>
                          <th>Email</th>
                          {/* <th>Status</th> */}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member, index) => (
                          <tr key={member._id}>
                            <td>{index + 1}</td>
                            <td>
                              <div className="member-name-cell">
                                {member.name}
                                {member.role === 'Captain' && (
                                  <span className="captain-badge">©</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`role-badge ${member.role?.toLowerCase().replace(/\s+/g, '-')}`}>
                                {member.role}
                              </span>
                            </td>
                            <td>{member.mobile || '-'}</td>
                            <td>{member.email || '-'}</td>
                            {/* <td>
                              <span className={`status-badge ${member.status?.toLowerCase() || 'pending'}`}>
                                {member.status || 'Pending'}
                              </span>
                            </td> */}
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-icon edit"
                                  onClick={() => {
                                    setEditMember(member);
                                    setShowEditModal(true);
                                  }}
                                  title="Edit"
                                  disabled={isExporting}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn-icon delete"
                                  onClick={() => handleDeleteMember(member._id)}
                                  title="Delete"
                                  disabled={isExporting}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Card View */}
                {viewMode === 'cards' && (
                  <div className="members-card-container">
                    {members.map((member, index) => (
                      <div key={member._id} className="member-card">
                        <div className="card-header">
                          <div className="member-info">
                            <span className="member-number">{index + 1}</span>
                            <div>
                              <h4 className="member-name">
                                {member.name}
                                {member.role === 'Captain' && (
                                  <span className="captain-badge-card">© Captain</span>
                                )}
                              </h4>
                              <span className={`role-badge ${member.role?.toLowerCase().replace(/\s+/g, '-')}`}>
                                {member.role}
                              </span>
                            </div>
                          </div>
                          <span className={`status-badge ${member.status?.toLowerCase() || 'pending'}`}>
                            {member.status || 'Pending'}
                          </span>
                        </div>
                        
                        <div className="card-details">
                          <div className="detail-item">
                            <span className="detail-label">Mobile:</span>
                            <span className="detail-value">{member.mobile || '-'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{member.email || '-'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Added:</span>
                            <span className="detail-value">{formatDate(member.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <button
                            className="btn-icon edit"
                            onClick={() => {
                              setEditMember(member);
                              setShowEditModal(true);
                            }}
                            title="Edit"
                            disabled={isExporting}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteMember(member._id)}
                            title="Delete"
                            disabled={isExporting}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* No Team State */}
        {!team && (
          <div className="no-team-state">
            <div className="empty-state-card">
              <div className="empty-icon">🏏</div>
              <h3>No Team Created Yet</h3>
              <p>Create your team to start managing players and participate in tournaments.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateTeamModal(true)}
                disabled={isExporting}
              >
                Create Your First Team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Team</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowCreateTeamModal(false)}
                disabled={isExporting}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  required
                  value={formData.teamName}
                  onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                  placeholder="Enter team name"
                  disabled={isExporting}
                />
              </div>
              <div className="form-group">
                <label>Total Players *</label>
                <select
                  required
                  value={formData.totalPlayers}
                  onChange={(e) => setFormData({...formData, totalPlayers: parseInt(e.target.value)})}
                  disabled={isExporting}
                >
                  {[11, 12, 13, 14, 15, 16].map(num => (
                    <option key={num} value={num}>{num} players</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateTeamModal(false)}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isExporting}
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Players Modal */}
      {showAddPlayersModal && team && (
        <div className="modal-overlay">
          <div className="modal wide-modal">
            <div className="modal-header">
              <h3>Add Players to Team</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowAddPlayersModal(false)}
                disabled={isExporting}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddPlayers}>
              <div className="players-form">
                {playerData.map((player, index) => (
                  <div key={index} className="player-form-row">
                    <div className="row-header">
                      <h4>Player {index + 1}</h4>
                      {index > 0 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removePlayerRow(index)}
                          disabled={isExporting}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          required
                          value={player.name}
                          onChange={(e) => updatePlayerData(index, 'name', e.target.value)}
                          placeholder="Enter player name"
                          disabled={isExporting}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mobile *</label>
                        <input
                          type="tel"
                          required
                          value={player.mobile}
                          onChange={(e) => updatePlayerData(index, 'mobile', e.target.value)}
                          placeholder="Enter mobile number"
                          disabled={isExporting}
                        />
                      </div>
                      <div className="form-group">
                        <label>Role *</label>
                        <select
                          required
                          value={player.role}
                          onChange={(e) => updatePlayerData(index, 'role', e.target.value)}
                          disabled={isExporting}
                        >
                          {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={player.email}
                          onChange={(e) => updatePlayerData(index, 'email', e.target.value)}
                          placeholder="Enter email"
                          disabled={isExporting}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={addPlayerRow}
                  disabled={isExporting}
                >
                  + Add Another Player
                </button>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddPlayersModal(false)}
                    disabled={isExporting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isExporting}
                  >
                    Add Players
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editMember && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Player</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowEditModal(false)}
                disabled={isExporting}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateMember}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={editMember.name}
                  onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                  disabled={isExporting}
                />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input
                  type="tel"
                  required
                  value={editMember.mobile}
                  onChange={(e) => setEditMember({...editMember, mobile: e.target.value})}
                  disabled={isExporting}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  required
                  value={editMember.role}
                  onChange={(e) => setEditMember({...editMember, role: e.target.value})}
                  disabled={isExporting}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editMember.email}
                  onChange={(e) => setEditMember({...editMember, email: e.target.value})}
                  disabled={isExporting}
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isExporting}
                >
                  Update Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default TeamManagement;