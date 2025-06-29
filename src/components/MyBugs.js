import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiUser, FiClock, FiMessageSquare, FiCheck, FiX } from 'react-icons/fi';
import './MyBugs.css';
import { bugAPI } from '../services/api';

const MyBugs = ({ bugs = [], currentUser, onUpdateBug, users = [] }) => {
  const navigate = useNavigate();
  const [selectedBug, setSelectedBug] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequestBug, setSelectedRequestBug] = useState(null);
  const [assignedBugs, setAssignedBugs] = useState([]);

  // Filter bugs uploaded by current user (case-insensitive, checks both name and email, with null checks)
  const myBugs = bugs.filter(
    bug =>
      (bug.reporter && currentUser?.name && bug.reporter.toLowerCase() === currentUser.name.toLowerCase()) ||
      (bug.reporter && currentUser?.email && bug.reporter.toLowerCase() === currentUser.email.toLowerCase())
  );
  
  // Get developers (users with role "Developer") - with fallback
  const developers = users?.filter(user => user.role === "Developer") || [];

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const bugs = await bugAPI.getAssignedBugs(localStorage.getItem('token'));
        setAssignedBugs(bugs);
      } catch (e) {
        setAssignedBugs([]);
      }
    };
    fetchAssigned();
  }, []);

  const handleAssignBug = async (bugId) => {
    if (selectedDeveloper) {
      try {
        await onUpdateBug(bugId, { 
          assignedTo: selectedDeveloper,
          status: 'Assigned'
        });
        setShowAssignmentModal(false);
        setSelectedDeveloper('');
        setSelectedBug(null);
      } catch (error) {
        console.error('Error assigning bug:', error);
        // You could show a toast notification here
      }
    }
  };

  const handleRequestWork = (bug) => {
    setSelectedRequestBug(bug);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (selectedRequestBug) {
      try {
        // Add a request comment to the bug
        const requestComment = {
          id: Date.now(),
          author: currentUser.name,
          content: `Requesting permission to work on this bug. I have experience with similar issues and can help resolve this efficiently.`,
          timestamp: new Date().toLocaleString(),
          type: 'request',
          status: 'pending'
        };

        // Update bug with the request
        const updatedBug = {
          ...selectedRequestBug,
          workRequests: [...(selectedRequestBug.workRequests || []), requestComment]
        };
        
        await onUpdateBug(selectedRequestBug.id, updatedBug);
        setShowRequestModal(false);
        setSelectedRequestBug(null);
      } catch (error) {
        console.error('Error submitting work request:', error);
        // You could show a toast notification here
      }
    }
  };

  const handleApproveRequest = async (bugId, requestId) => {
    try {
      const bug = bugs.find(b => b.id === bugId);
      if (bug) {
        const updatedRequests = bug.workRequests?.map(req => 
          req.id === requestId ? { ...req, status: 'approved' } : req
        ) || [];
        
        await onUpdateBug(bugId, { 
          workRequests: updatedRequests,
          assignedTo: bug.workRequests?.find(req => req.id === requestId)?.author,
          status: 'Assigned'
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      // You could show a toast notification here
    }
  };

  const handleRejectRequest = async (bugId, requestId) => {
    try {
      const bug = bugs.find(b => b.id === bugId);
      if (bug) {
        const updatedRequests = bug.workRequests?.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' } : req
        ) || [];
        
        await onUpdateBug(bugId, { workRequests: updatedRequests });
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      // You could show a toast notification here
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'status-open';
      case 'Assigned': return 'status-assigned';
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

  return (
    <div className="my-bugs-page">
      <div className="page-header">
        <h1 className="page-title">My Bugs</h1>
        <p className="page-subtitle">Manage bugs you've uploaded and assigned work</p>
      </div>

      <div className="my-bugs-container">
        {/* Bugs I Uploaded */}
        <div className="bugs-section">
          <div className="section-header">
            <h2>Bugs I Uploaded ({myBugs.length})</h2>
            <button 
              onClick={() => navigate('/bugs/new')} 
              className="btn btn-primary"
            >
              <FiPlus />
              Report New Bug
            </button>
          </div>

          {myBugs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🐛</div>
              <h3>No bugs uploaded yet</h3>
              <p>Start by reporting your first bug to track issues effectively.</p>
              <button 
                onClick={() => navigate('/bugs/new')} 
                className="btn btn-primary"
              >
                Report Your First Bug
              </button>
            </div>
          ) : (
            <div className="bugs-grid">
              {myBugs.map(bug => (
                <div key={bug.id} className="bug-card">
                  <div className="bug-header">
                    <h3 className="bug-title">{bug.title}</h3>
                    <div className="bug-badges">
                      <span className={`badge ${getStatusColor(bug.status)}`}>
                        {bug.status}
                      </span>
                      <span className={`badge ${getSeverityColor(bug.severity)}`}>
                        {bug.severity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bug-meta">
                    <div className="meta-item">
                      <FiUser />
                      <span>Assigned: {bug.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="meta-item">
                      <FiClock />
                      <span>Created: {bug.createdAt}</span>
                    </div>
                  </div>

                  <div className="bug-description">
                    {bug.description.substring(0, 100)}...
                  </div>

                  {/* Work Requests */}
                  {bug.workRequests && bug.workRequests.length > 0 && (
                    <div className="work-requests">
                      <h4>Work Requests</h4>
                      {bug.workRequests.map(request => (
                        <div key={request.id} className={`request-item ${request.status}`}>
                          <div className="request-content">
                            <strong>{request.author}</strong> wants to work on this bug
                            <p>{request.content}</p>
                            <small>{request.timestamp}</small>
                          </div>
                          {request.status === 'pending' && (
                            <div className="request-actions">
                              <button 
                                onClick={() => handleApproveRequest(bug.id, request.id)}
                                className="btn btn-success btn-sm"
                              >
                                <FiCheck />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectRequest(bug.id, request.id)}
                                className="btn btn-danger btn-sm"
                              >
                                <FiX />
                                Reject
                              </button>
                            </div>
                          )}
                          {request.status === 'approved' && (
                            <span className="badge badge-success">Approved</span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="badge badge-danger">Rejected</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bug-actions">
                    <button 
                      onClick={() => navigate(`/bugs/${bug.id}`)}
                      className="btn btn-secondary"
                    >
                      <FiEye />
                      View Details
                    </button>
                    {!bug.assignedTo && (
                      <button 
                        onClick={() => {
                          setSelectedBug(bug);
                          setShowAssignmentModal(true);
                        }}
                        className="btn btn-primary"
                      >
                        <FiUser />
                        Assign Developer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bugs Assigned to Me */}
        <div className="bugs-section">
          <div className="section-header">
            <h2>Bugs Assigned to Me ({assignedBugs.length})</h2>
          </div>

          {assignedBugs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🐛</div>
              <h3>No bugs assigned to you</h3>
              <p>You'll see bugs here once they're assigned to you.</p>
            </div>
          ) : (
            <div className="bugs-grid">
              {assignedBugs.map(bug => (
                <div key={bug.id} className="bug-card">
                  <div className="bug-header">
                    <h3 className="bug-title">{bug.title}</h3>
                    <div className="bug-badges">
                      <span className={`badge ${getStatusColor(bug.status)}`}>
                        {bug.status}
                      </span>
                      <span className={`badge ${getSeverityColor(bug.severity)}`}>
                        {bug.severity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bug-meta">
                    <div className="meta-item">
                      <FiUser />
                      <span>Reporter: {bug.reporter}</span>
                    </div>
                    <div className="meta-item">
                      <FiClock />
                      <span>Created: {bug.createdAt}</span>
                    </div>
                  </div>

                  <div className="bug-description">
                    {bug.description.substring(0, 100)}...
                  </div>

                  <div className="bug-actions">
                    <button 
                      onClick={() => navigate(`/bugs/${bug.id}`)}
                      className="btn btn-primary"
                    >
                      <FiEye />
                      View & Work
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && selectedBug && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Assign Developer</h3>
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="btn btn-icon"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-content">
              <p>Assign "{selectedBug.title}" to a developer:</p>
              <select 
                value={selectedDeveloper}
                onChange={(e) => setSelectedDeveloper(e.target.value)}
                className="form-select"
              >
                <option value="">Select a developer...</option>
                {developers.map(dev => (
                  <option key={dev.id} value={dev.name}>
                    {dev.name} ({dev.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleAssignBug(selectedBug.id)}
                className="btn btn-primary"
                disabled={!selectedDeveloper}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Work Modal */}
      {showRequestModal && selectedRequestBug && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Request to Work on Bug</h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="btn btn-icon"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-content">
              <p>You're requesting to work on: <strong>{selectedRequestBug.title}</strong></p>
              <p>This request will be sent to {selectedRequestBug.reporter} for approval.</p>
              <p>Once approved, you'll be assigned to this bug and can start working on it.</p>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowRequestModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitRequest}
                className="btn btn-primary"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBugs; 