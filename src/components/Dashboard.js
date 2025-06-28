import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiClock, FiCheckCircle, FiTrendingUp, FiPlus, FiEye, FiUserCheck } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = ({ bugs = [], loading, currentUser }) => {
  const totalBugs = bugs.length;
  const openBugs = bugs.filter(bug => bug.status === 'Open').length;
  const inProgressBugs = bugs.filter(bug => bug.status === 'In Progress').length;
  const resolvedBugs = bugs.filter(bug => bug.status === 'Resolved').length;
  const criticalBugs = bugs.filter(bug => bug.severity === 'Critical').length;

  const recentBugs = bugs
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      case 'Closed': return 'status-closed';
      default: return '';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return '';
    }
  };

  // Only show Quick Actions if the current user is the reporter of any recent bug
  const isReporter = (bug) => {
    return (
      bug.reporter?.toLowerCase() === currentUser?.name?.toLowerCase() ||
      bug.reporter?.toLowerCase() === currentUser?.email?.toLowerCase()
    );
  };
  const showQuickActions = recentBugs.some(isReporter);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Loading bugs...</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track and manage your bugs efficiently</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FiAlertTriangle className="stat-icon" />
          <div className="stat-number">{totalBugs}</div>
          <div className="stat-label">Total Bugs</div>
        </div>
        
        <div className="stat-card">
          <FiClock className="stat-icon" />
          <div className="stat-number">{openBugs}</div>
          <div className="stat-label">Open Bugs</div>
        </div>
        
        <div className="stat-card">
          <FiTrendingUp className="stat-icon" />
          <div className="stat-number">{inProgressBugs}</div>
          <div className="stat-label">In Progress</div>
        </div>
        
        <div className="stat-card">
          <FiCheckCircle className="stat-icon" />
          <div className="stat-number">{resolvedBugs}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-content-section">
          <div className="section-header">
            <h2>Recent Bugs</h2>
            <Link to="/bugs" className="btn btn-primary">
              <FiEye />
              View All
            </Link>
          </div>
          
          <div className="bugs-list">
            {recentBugs.length > 0 ? (
              recentBugs.map(bug => (
                <div key={bug.id} className="bug-card">
                  <div className="bug-header">
                    <h3 className="bug-title">
                      <Link to={`/bugs/${bug.id}`}>#{bug.id} {bug.title}</Link>
                    </h3>
                    <div className="bug-badges">
                      <span className={`badge ${getSeverityColor(bug.severity)}`}>
                        {bug.severity}
                      </span>
                      <span className={`badge ${getStatusColor(bug.status)}`}>
                        {bug.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="bug-description">{bug.description}</p>
                  
                  <div className="bug-meta">
                    <span className="bug-assignee">Assigned to: {bug.assignedTo}</span>
                    <span className="bug-date">Created: {bug.createdAt}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🐛</div>
                <h3 className="empty-state-title">No bugs yet</h3>
                <p className="empty-state-description">
                  Start tracking bugs by creating your first bug report.
                </p>
                <Link to="/bugs/new" className="btn btn-primary">
                  <FiPlus />
                  Report Bug
                </Link>
              </div>
            )}
          </div>
        </div>

        {showQuickActions && (
          <div className="sidebar">
            <div className="card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <Link to="/bugs/new" className="btn btn-primary btn-block">
                  <FiPlus />
                  Report New Bug
                </Link>
                <Link to="/bugs" className="btn btn-secondary btn-block">
                  <FiEye />
                  View All Bugs
                </Link>
                <Link to="/my-bugs" className="btn btn-secondary btn-block">
                  <FiUserCheck />
                  My Bugs
                </Link>
                <Link to="/analytics" className="btn btn-secondary btn-block">
                  <FiTrendingUp />
                  View Analytics
                </Link>
              </div>
            </div>

            {criticalBugs > 0 && (
              <div className="card alert-card">
                <div className="alert-header">
                  <FiAlertTriangle className="alert-icon" />
                  <h3>Critical Bugs</h3>
                </div>
                <p>You have {criticalBugs} critical bugs that need immediate attention.</p>
                <Link to="/bugs?severity=Critical" className="btn btn-danger btn-block">
                  View Critical Bugs
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 