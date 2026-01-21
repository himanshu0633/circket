import React, { useState, useEffect } from 'react'
import './ChampionsTrophy.css'

const ChampionsTrophy = () => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const staticData = {
    "success": true,
    "data": [
      {
        "name": "Testing",
        "email": "mohalicds@gmail.com",
        "phone": "9875929764",
        "profileLink": "https://cricheroes.com/player-profile/1572929/Pepsi",
        "role": "Allrounder",
      },
      {
        "name": "Mohit",
        "email": "mohit@gmail.com",
        "phone": "9876543212",
        "profileLink": "https://cricheroes.com/player-profile/1572929/Pepsi",
        "role": "Batsmen",
      }
    ]
  }

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setPlayers(staticData.data)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="champions-trophy-container">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>CDS Champions Trophy Player</h1>
          </div>
          <div className="admin-badge">
            <div className="admin-icon">A</div>
            <div className="admin-info">
              <h3>Administrator</h3>
              <p>Full System Access</p>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading">Loading player data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="champions-trophy-container">
      {/* Header matching the image */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>CDS Champions Trophy Player</h1>
        </div>
        <div className="admin-badge">
          <div className="admin-icon">A</div>
          <div className="admin-info">
            <h3>Administrator</h3>
            <p>Full System Access</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="content-container">
        <div className="content-header">
          <h2>Player Management</h2>
        </div>

        <div className="table-container">
          <table className="players-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Profile Link</th>
              </tr> 
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index}>
                  <td></td>
                  <td data-label="Name">{player.name}</td>
                  <td data-label="Email">{player.email}</td>
                  <td data-label="Phone">{player.phone}</td>
                  <td data-label="Role">{player.role}</td>
                  <td data-label="Profile Link">
                    <a 
                      href={player.profileLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      View Profile
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="summary-card">
        <div className="summary-info">
          <div className="player-count">{players.length}</div>
          <div className="summary-text">
            <h3>Total Players</h3>
            <p>Currently registered in the system</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChampionsTrophy