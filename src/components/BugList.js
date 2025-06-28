import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiGitBranch, FiCheckCircle, FiClock, FiUser } from 'react-icons/fi';
import './BugList.css';
import { bugAPI } from '../services/api';

// Simple toast component
function Toast({ message, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="toast-notification">{message}</div>
  );
}

const BugList = ({ bugs = [], setBugs, onUpdateBug, onDeleteBug, currentUser, loading, fetchBugs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assignedToMeFilter, setAssignedToMeFilter] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [requestingBugId, setRequestingBugId] = useState(null);
  const [toast, setToast] = useState(null);

  // Sample users for assignment (in real app, this would come from API)
  const availableUsers = [
    { name: 'John Doe', role: 'Developer' },
    { name: 'Sarah Smith', role: 'QA Tester' },
    { name: 'Mike Johnson', role: 'Team Lead' },
    { name: 'Lisa Chen', role: 'Developer' },
    { name: 'Alex Brown', role: 'Developer' }
  ];

  const filteredAndSortedBugs = useMemo(() => {
    let filtered = bugs.filter(bug => {
      const matchesSearch =
        (bug.title && bug.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bug.description && bug.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bug.assignedTo && bug.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'All' || bug.status === statusFilter;
      const matchesSeverity = severityFilter === 'All' || bug.severity === severityFilter;
      const matchesPriority = priorityFilter === 'All' || bug.priority === priorityFilter;
      const matchesAssignment = !assignedToMeFilter || (
        currentUser && bug.assignedTo && (
          (currentUser.name && bug.assignedTo.toLowerCase() === currentUser.name.toLowerCase()) ||
          (currentUser.email && bug.assignedTo.toLowerCase() === currentUser.email.toLowerCase())
        )
      );
      
      return matchesSearch && matchesStatus && matchesSeverity && matchesPriority && matchesAssignment;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [bugs, searchTerm, statusFilter, severityFilter, priorityFilter, sortBy, sortOrder, assignedToMeFilter, currentUser, refreshFlag]);

  if (loading) {
    return (
      <div className="bug-list-page">
        <div className="page-header">
          <h1 className="page-title">Bug Management</h1>
          <p className="page-subtitle">Loading bugs...</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bugs...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (bugId, newStatus) => {
    setUpdatingStatus(bugId);
    try {
      await onUpdateBug(bugId, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      // You could show a toast notification here
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAssignmentChange = async (bugId, assignedTo) => {
    try {
      await onUpdateBug(bugId, { assignedTo });
    } catch (error) {
      console.error('Error updating assignment:', error);
      // You could show a toast notification here
    }
  };

  const handleDelete = async (bugId) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await onDeleteBug(bugId);
      } catch (error) {
        console.error('Error deleting bug:', error);
        // You could show a toast notification here
      }
    }
  };

  const canAssignBugs = () => {
    return currentUser?.role === 'Team Lead' || currentUser?.role === 'Project Manager';
  };

  const canUpdateStatus = (bug) => {
    // Users can update status if they're assigned to the bug or have management roles
    return bug.assignedTo === currentUser?.name || 
           currentUser?.role === 'Team Lead' || 
           currentUser?.role === 'Project Manager';
  };

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'badge-urgent';
      case 'Normal': return 'badge-normal';
      case 'Low': return 'badge-low-priority';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <FiClock />;
      case 'In Progress': return <FiClock />;
      case 'Resolved': return <FiCheckCircle />;
      case 'Closed': return <FiCheckCircle />;
      default: return <FiClock />;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Open': return 'In Progress';
      case 'In Progress': return 'Resolved';
      case 'Resolved': return 'Closed';
      default: return 'Open';
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case 'Open': return 'Start Work';
      case 'In Progress': return 'Mark Resolved';
      case 'Resolved': return 'Close Bug';
      default: return 'Reopen';
    }
  };

  const getNextStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case 'Open': return 'btn-primary';
      case 'In Progress': return 'btn-success';
      case 'Resolved': return 'btn-secondary';
      default: return 'btn-primary';
    }
  };

  // Helper to check if current user is reporter
  const isReporter = (bug) =>
    (bug.reporter && currentUser?.name && bug.reporter.toLowerCase() === currentUser.name.toLowerCase()) ||
    (bug.reporter && currentUser?.email && bug.reporter.toLowerCase() === currentUser.email.toLowerCase());

  // Helper to check if current user already requested
  const getUserRequest = (bug) =>
    (bug.requests || []).find(req =>
      (req.author && currentUser?.name && req.author.toLowerCase() === currentUser.name.toLowerCase()) ||
      (req.author && currentUser?.email && req.author.toLowerCase() === currentUser.email.toLowerCase())
    );

  // Handler to request work
  const handleRequestWork = async (bugId) => {
    setRequestingBugId(bugId);
    const bug = bugs.find(b => b.id === bugId);
    const userRequest = getUserRequest(bug);
    if (userRequest) {
      setToast('You have already requested to work on this bug.');
      setRequestingBugId(null);
      return;
    }
    try {
      await bugAPI.addRequest(bugId, { content: 'Requesting to work on this bug.' }, localStorage.getItem('token'));
      // Optimistically update local state
      if (typeof setBugs === 'function') {
        setBugs(prevBugs => prevBugs.map(bug =>
          bug.id === bugId
            ? {
                ...bug,
                requests: [
                  ...(bug.requests || []),
                  {
                    author: currentUser?.name || currentUser?.email,
                    status: 'pending',
                    content: 'Requesting to work on this bug.',
                    timestamp: new Date().toISOString()
                  }
                ]
              }
            : bug
        ));
      }
      if (typeof fetchBugs === 'function') {
        fetchBugs();
      } else {
        setRefreshFlag(f => !f);
      }
      setToast('Request sent successfully!');
    } catch (error) {
      setToast('Failed to request work: ' + error.message);
    } finally {
      setRequestingBugId(null);
    }
  };

  return (
    <div className="bug-list-page">
      <div className="page-header">
        <h1 className="page-title">Bug Management</h1>
        <p className="page-subtitle">Track, filter, and manage all reported bugs</p>
      </div>

      <div className="filters-bar">
        <div className="filters-grid">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Priority</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="createdAt">Date Created</option>
              <option value="updatedAt">Last Updated</option>
              <option value="title">Title</option>
              <option value="severity">Severity</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" aria-hidden="true">&nbsp;</label>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="assignedToMe"
                className="form-checkbox"
                checked={assignedToMeFilter}
                onChange={(e) => setAssignedToMeFilter(e.target.checked)}
              />
              <label htmlFor="assignedToMe">Assigned to me</label>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="actions-left">
          <div className="results-bar">
            <span className="results-count">
              <span className="results-count-number">{filteredAndSortedBugs.length}</span> BUG{filteredAndSortedBugs.length !== 1 ? 'S' : ''} FOUND
            </span>
          </div>
        </div>
        <div className="actions-right">
          <Link to="/bugs/new" className="btn btn-primary">
            <FiPlus />
            Report New Bug
          </Link>
        </div>
      </div>

      <div className="bugs-container">
        {filteredAndSortedBugs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🐞</div>
            <h3 className="empty-state-title">No bugs found</h3>
            <p className="empty-state-description">
              {searchTerm || statusFilter !== 'All' || severityFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your filters to see more results.'
                : 'No bugs have been reported yet. Be the first to report a bug!'}
            </p>
            {!searchTerm && statusFilter === 'All' && severityFilter === 'All' && priorityFilter === 'All' && (
              <Link to="/bugs/new" className="btn btn-primary">
                <FiPlus />
                Report First Bug
              </Link>
            )}
          </div>
        ) : (
          <div className="bugs-grid">
            {filteredAndSortedBugs.map(bug => {
              const userRequest = getUserRequest(bug);
              const isAssignedToCurrentUser = bug.assignedTo && (
                bug.assignedTo.toLowerCase() === (currentUser?.name?.toLowerCase() || '') ||
                bug.assignedTo.toLowerCase() === (currentUser?.email?.toLowerCase() || '')
              );
              const isAssignedToOther = bug.assignedTo && !isAssignedToCurrentUser;
              const isReporter = (bug.reporter && currentUser?.name && bug.reporter.toLowerCase() === currentUser.name.toLowerCase()) ||
                                 (bug.reporter && currentUser?.email && bug.reporter.toLowerCase() === currentUser.email.toLowerCase());
              return (
                <div key={bug.id} className="bug-card">
                  <div className="bug-header">
                    <div className="bug-title-section">
                      <h3 className="bug-title">
                        <Link to={`/bugs/${bug.id}`} className="bug-title-link">
                          {bug.title}
                        </Link>
                      </h3>
                      <div className="bug-badges">
                        <span className={`badge ${getSeverityColor(bug.severity)}`}>
                          {bug.severity}
                        </span>
                        <span className={`badge ${getPriorityColor(bug.priority)}`}>
                          {bug.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="bug-description">
                    {bug.description.length > 150
                      ? `${bug.description.substring(0, 150)}...`
                      : bug.description}
                  </p>

                  <div className="bug-meta">
                    <div className="bug-meta-item">
                      <span className="meta-label">Status:</span>
                      <span className={`status-badge ${getStatusColor(bug.status)}`}>
                        {getStatusIcon(bug.status)}
                        {bug.status}
                      </span>
                    </div>
                    
                    <div className="bug-meta-item">
                      <span className="meta-label">Assigned to:</span>
                      <div className="assignment-section">
                        {canAssignBugs() ? (
                          <select
                            value={bug.assignedTo || ''}
                            onChange={(e) => handleAssignmentChange(bug.id, e.target.value)}
                            className="assignment-select"
                          >
                            <option value="">Unassigned</option>
                            {availableUsers.map(user => (
                              <option key={user.name} value={user.name}>
                                {user.name} ({user.role})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="assigned-to">
                            <FiUser />
                            {bug.assignedTo || 'Unassigned'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bug-meta-item">
                      <span className="meta-label">Reporter:</span>
                      <span className="reporter">{bug.reporter}</span>
                    </div>

                    <div className="bug-meta-item">
                      <span className="meta-label">Created:</span>
                      <span className="date">{bug.createdAt ? new Date(bug.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>

                  {bug.version && (
                    <div className="bug-version-info">
                      <FiGitBranch />
                      <span>v{bug.version}</span>
                      {bug.commitHash && (
                        <>
                          <span className="commit-hash">#{bug.commitHash.substring(0, 7)}</span>
                        </>
                      )}
                      {bug.branch && (
                        <span className="branch-name">({bug.branch})</span>
                      )}
                    </div>
                  )}

                  <div className="bug-footer">
                    {canUpdateStatus(bug) ? (
                      <button
                        onClick={() => handleStatusChange(bug.id, getNextStatus(bug.status))}
                        className={`btn btn-sm ${getNextStatusColor(bug.status)}`}
                        disabled={updatingStatus === bug.id}
                      >
                        {updatingStatus === bug.id ? 'Updating...' : getNextStatusLabel(bug.status)}
                      </button>
                    ) : <div />}
                    <div className="footer-actions-right">
                      {currentUser?.name === bug.reporter && (
                        <button
                          onClick={() => handleDelete(bug.id)}
                          className="btn btn-sm btn-danger"
                          title="Delete bug"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Assigned badge/request status and View button aligned */}
                  <div className="bug-card-footer">
                    {(() => {
                      const isAssignedToCurrentUser = bug.assignedTo && (
                        bug.assignedTo.toLowerCase() === (currentUser?.name?.toLowerCase() || '') ||
                        bug.assignedTo.toLowerCase() === (currentUser?.email?.toLowerCase() || '')
                      );
                      const isAssignedToOther = bug.assignedTo && !isAssignedToCurrentUser;
                      const isReporter = (bug.reporter && currentUser?.name && bug.reporter.toLowerCase() === currentUser.name.toLowerCase()) ||
                                         (bug.reporter && currentUser?.email && bug.reporter.toLowerCase() === currentUser.email.toLowerCase());
                      if (isReporter) {
                        return null;
                      }
                      if (isAssignedToCurrentUser) {
                        return <span className="assigned-badge">Assigned to you</span>;
                      } else if (isAssignedToOther) {
                        return <span className="assigned-badge"><span className="assigned-tag">Already assigned</span></span>;
                      } else if (userRequest) {
                        return <span className={`request-status-badge ${userRequest.status}`}>{userRequest.status.charAt(0).toUpperCase() + userRequest.status.slice(1)}</span>;
                      } else {
                        return (
                          <button className="btn btn-primary btn-sm" onClick={() => handleRequestWork(bug.id)} disabled={requestingBugId === bug.id}>
                            {requestingBugId === bug.id ? 'Requesting...' : 'Request to work'}
                          </button>
                        );
                      }
                    })()}
                    <Link to={`/bugs/${bug.id}`} className="btn btn-sm btn-outline">
                      <FiEye />
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BugList; 