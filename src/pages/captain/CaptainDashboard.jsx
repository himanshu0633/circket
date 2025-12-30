import React, { useState, useEffect } from 'react';
import axios from 'axios';


const API_BASE_URL = 'http://localhost:4000/api';

const TeamManagement = () => {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  const roles = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Captain'];

  // Get authorization token
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('error', 'Please login first');
      return null;
    }
    return token;
  };

  // Fetch team data
  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/team/my-team`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setTeam(response.data.team);
        setMembers(response.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      showNotification('error', 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch team data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  // Create team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.post(
        `${API_BASE_URL}/team/create-team`, 
        formData, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setTeam(response.data.team);
        showNotification('success', 'Team created successfully!');
        setShowCreateTeamModal(false);
        setFormData({ teamName: '', totalPlayers: 11 });
        fetchTeamData(); // Refresh data
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
      const token = getAuthToken();
      if (!token) return;

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

      const response = await axios.post(
        `${API_BASE_URL}/team/add-players`, 
        {
          teamId: team._id,
          players: playerData
        }, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
      const token = getAuthToken();
      if (!token) return;

      // Validate required fields
      if (!editMember.name || !editMember.mobile) {
        showNotification('error', 'Name and Mobile are required');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/team/member/${editMember._id}`, 
        editMember, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
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
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.delete(
        `${API_BASE_URL}/team/member/${memberId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
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

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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
    <div className="team-management">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="team-header">
        <h1>Team Management</h1>
        <div className="header-actions">
          {!team ? (
            <button 
              className="btn-primary"
              onClick={() => setShowCreateTeamModal(true)}
            >
              Create Team
            </button>
          ) : (
            <>
              <button 
                className="btn-secondary"
                onClick={() => setShowAddPlayersModal(true)}
              >
                Add Players
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  // Export team data as JSON
                  const teamData = {
                    team: team,
                    members: members
                  };
                  const dataStr = JSON.stringify(teamData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${team.teamName.replace(/\s+/g, '_')}_team.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  showNotification('success', 'Team data exported successfully!');
                }}
              >
                Export Team
              </button>
            </>
          )}
        </div>
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
              <span className="label">Total Slots:</span>
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
          </div>
        </div>
      )}

      {/* Team Members Table */}
      {team && (
        <div className="team-members-section">
          <h3>Team Members ({members.length})</h3>
          {members.length === 0 ? (
            <div className="empty-state">
              <p>No players added yet. Click "Add Players" to add team members.</p>
            </div>
          ) : (
            <div className="members-table-container">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Mobile</th>
                    <th>Email</th>
                   
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member._id}>
                      <td>{index + 1}</td>
                      <td>{member.name}</td>
                      <td>
                        <span className={`role-badge ${member.role?.toLowerCase().replace('-', '') || 'player'}`}>
                          {member.role || 'Player'}
                        </span>
                      </td>
                      <td>{member.mobile || '-'}</td>
                      <td>{member.email || '-'}</td>
                     
                      <td>
                        <span className={`status-badge ${member.status?.toLowerCase() || 'pending'}`}>
                          {member.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon edit"
                            onClick={() => {
                              setEditMember(member);
                              setShowEditModal(true);
                            }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteMember(member._id)}
                            title="Delete"
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
        </div>
      )}

      {/* No Team State */}
      {!team && (
        <div className="no-team-state">
          <div className="empty-state-card">
            <h3>No Team Created Yet</h3>
            <p>Create your team to start managing players and participate in tournaments.</p>
            <button 
              className="btn-primary"
              onClick={() => setShowCreateTeamModal(true)}
            >
              Create Your First Team
            </button>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Team</h3>
              <button className="close-btn" onClick={() => setShowCreateTeamModal(false)}>
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
                />
              </div>
              <div className="form-group">
                <label>Total Players *</label>
                <select
                  required
                  value={formData.totalPlayers}
                  onChange={(e) => setFormData({...formData, totalPlayers: parseInt(e.target.value)})}
                >
                  {[11, 12, 13, 14, 15, 16].map(num => (
                    <option key={num} value={num}>{num} players</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateTeamModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
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
              <button className="close-btn" onClick={() => setShowAddPlayersModal(false)}>
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
                          className="btn-danger"
                          onClick={() => removePlayerRow(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          required
                          value={player.name}
                          onChange={(e) => updatePlayerData(index, 'name', e.target.value)}
                          placeholder="Enter player name"
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
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Role *</label>
                        <select
                          required
                          value={player.role}
                          onChange={(e) => updatePlayerData(index, 'role', e.target.value)}
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
                        />
                      </div>
                    </div>

               
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={addPlayerRow}>
                  + Add Another Player
                </button>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddPlayersModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
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
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
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
                />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input
                  type="tel"
                  required
                  value={editMember.mobile}
                  onChange={(e) => setEditMember({...editMember, mobile: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  required
                  value={editMember.role}
                  onChange={(e) => setEditMember({...editMember, role: e.target.value})}
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
                />
              </div>
       
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;