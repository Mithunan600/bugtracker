import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiUser, FiClock, FiTag, FiCheckCircle, FiX, FiDownload, FiEye } from 'react-icons/fi';
import './BugDetail.css';
import { bugAPI } from '../services/api';

const BACKEND_FILE_URL = 'http://localhost:8081/api/bugs/files/';

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return <div className="toast-notification">{message}</div>;
}

const BugDetail = ({ bugs, onUpdateBug, onDeleteBug, currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [dynamicRequests, setDynamicRequests] = useState([]);
  const [dynamicComments, setDynamicComments] = useState([]);
  const [approveLoadingIdx, setApproveLoadingIdx] = useState(null);
  const [toast, setToast] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentToast, setCommentToast] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteToast, setDeleteToast] = useState(null);

  const bug = bugs.find(b => String(b.id) === String(id));

  // Define isReporter immediately after bug and currentUser are available
  const isReporter = bug ? (
    (bug?.reporter && currentUser?.name && bug.reporter.toLowerCase() === currentUser.name.toLowerCase()) ||
    (bug?.reporter && currentUser?.email && bug.reporter.toLowerCase() === currentUser.email.toLowerCase())
  ) : false;

  // Check if current user is assigned to this bug
  const isAssignee = bug ? (
    (bug?.assignedTo && currentUser?.name && bug.assignedTo.toLowerCase() === currentUser.name.toLowerCase()) ||
    (bug?.assignedTo && currentUser?.email && bug.assignedTo.toLowerCase() === currentUser.email.toLowerCase())
  ) : false;

  useEffect(() => {
    if (!bug) return;
    
    const fetchRequests = async () => {
      try {
        const reqs = await bugAPI.getRequests(bug.id, localStorage.getItem('token'));
        setDynamicRequests(reqs);
      } catch (e) {
        setDynamicRequests([]);
      }
    };
    fetchRequests();
    // eslint-disable-next-line
  }, [bug?.id]);

  useEffect(() => {
    if (!bug) return;
    
    const fetchComments = async () => {
      try {
        const comments = await bugAPI.getComments(bug.id, localStorage.getItem('token'));
        setDynamicComments(comments);
      } catch (e) {
        setDynamicComments([]);
      }
    };
    fetchComments();
    // eslint-disable-next-line
  }, [bug?.id]);

  // Guard: If bug is not found, show not found message and return early
  if (!bug) {
    return (
      <div className="bug-detail-page">
        <div className="page-header">
          <h1 className="page-title">Bug Not Found</h1>
          <p className="page-subtitle">This bug does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDeleteBug(bug.id);
      setDeleteToast('Bug deleted successfully!');
      setTimeout(() => {
        setDeleteLoading(false);
        navigate('/bugs');
      }, 1200);
    } catch (error) {
      setDeleteToast('Error deleting bug: ' + error.message);
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdateBug(bug.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      // You could show a toast notification here
    }
  };

  const handleAssignTo = async (assignee) => {
    try {
      await onUpdateBug(bug.id, { assignedTo: assignee });
    } catch (error) {
      console.error('Error updating assignment:', error);
      // You could show a toast notification here
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await bugAPI.addComment(bug.id, { content: newComment }, localStorage.getItem('token'));
      setNewComment('');
      setCommentToast('Comment added successfully!');
      // Refresh comments
      const comments = await bugAPI.getComments(bug.id, localStorage.getItem('token'));
      setDynamicComments(comments);
    } catch (error) {
      setCommentToast('Failed to add comment: ' + error.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      priority: bug.priority,
      reproductionSteps: bug.reproductionSteps || '',
      version: bug.version || '',
      commitHash: bug.commitHash || '',
      branch: bug.branch || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdateBug(bug.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating bug:', error);
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

  // Work request logic
  const workRequests = dynamicRequests || [];
  const userRequest = workRequests.find(
    req =>
      (req.author && currentUser?.name && req.author.toLowerCase() === currentUser.name.toLowerCase()) ||
      (req.author && currentUser?.email && req.author.toLowerCase() === currentUser.email.toLowerCase())
  );

  // Handler to request work
  const handleRequestWork = async () => {
    const newRequest = {
      author: currentUser?.name || currentUser?.email,
      status: 'pending',
      timestamp: new Date().toISOString(),
      content: 'Requesting to work on this bug.'
    };
    try {
      await bugAPI.addRequest(bug.id, newRequest, localStorage.getItem('token'));
      // Refetch requests after submitting
      const reqs = await bugAPI.getRequests(bug.id, localStorage.getItem('token'));
      setDynamicRequests(reqs);
    } catch (error) {
      alert('Failed to request work: ' + error.message);
    }
  };

  // Handler to approve/reject work request
  const handleApproveRequest = async (reqIndex) => {
    setApproveLoadingIdx(reqIndex);
    try {
      await bugAPI.updateRequest(bug.id, reqIndex, 'approved', localStorage.getItem('token'));
      setToast('Request approved!');
      // Refetch requests
      const reqs = await bugAPI.getRequests(bug.id, localStorage.getItem('token'));
      setDynamicRequests(reqs.filter(r => r.status === 'approved'));
    } catch (error) {
      setToast('Failed to approve request: ' + error.message);
    } finally {
      setApproveLoadingIdx(null);
    }
  };
  const handleRejectRequest = async (reqIndex) => {
    try {
      await bugAPI.updateRequest(bug.id, reqIndex, 'rejected', localStorage.getItem('token'));
      // Refresh requests and bug details
      window.location.reload();
    } catch (error) {
      alert('Failed to reject request: ' + error.message);
    }
  };

  // Handle opening files securely with token
  const handleOpenFile = async (filePath) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BACKEND_FILE_URL}${encodeURIComponent(filePath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        alert('Failed to open file');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      alert('Failed to open file');
    }
  };

  // Handle downloading files securely with token
  const handleDownloadFile = async (filePath) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BACKEND_FILE_URL}${encodeURIComponent(filePath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        alert('Failed to download file');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filePath.split('/').pop() || filePath.split('\\').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download file');
    }
  };

  // Get file extension for icon display
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'txt': return '📄';
      case 'zip':
      case 'rar': return '📦';
      default: return '📎';
    }
  };

  return (
    <div className="bug-detail-page">
      <div className="page-header">
        <button onClick={() => navigate('/bugs')} className="btn btn-secondary">
          <FiArrowLeft />
          Back to Bugs
        </button>
        <div className="header-actions">
          {(currentUser?.name === bug.reporter || currentUser?.email === bug.reporter) && (
            <>
              <button onClick={handleEdit} className="btn btn-primary">
                <FiEdit />
                Edit
              </button>
              <button onClick={handleDelete} className="btn btn-danger" disabled={deleteLoading} style={{ minWidth: 90 }}>
                <FiTrash2 />
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bug-detail-container">
        <div className="bug-main-content">
          <div className="bug-header">
            <div className="bug-title-section">
              <h1 className="bug-title">#{bug.id} {bug.title}</h1>
              <div className="bug-badges">
                <span className={`badge ${getStatusColor(bug.status)}`}>
                  {bug.status}
                </span>
                <span className={`badge ${getSeverityColor(bug.severity)}`}>
                  {bug.severity}
                </span>
                <span className="badge badge-priority">
                  {bug.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="bug-meta-grid">
            <div className="meta-item">
              <FiUser />
              <div>
                <label>Reporter</label>
                <span>{bug.reporter}</span>
              </div>
            </div>
            <div className="meta-item">
              <FiUser />
              <div>
                <label>Assigned To</label>
                <span>{bug.assignedTo || 'Unassigned'}</span>
              </div>
            </div>
            <div className="meta-item">
              <FiClock />
              <div>
                <label>Created</label>
                <span>{bug.createdAt ? new Date(bug.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            <div className="meta-item">
              <FiClock />
              <div>
                <label>Updated</label>
                <span>{bug.updatedAt ? new Date(bug.updatedAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            {bug.version && (
              <div className="meta-item">
                <FiTag />
                <div>
                  <label>Version</label>
                  <span>{bug.version}</span>
                </div>
              </div>
            )}
            {bug.commitHash && (
              <div className="meta-item">
                <FiTag />
                <div>
                  <label>Commit</label>
                  <span>{bug.commitHash}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bug-sections">
            <div className="bug-section">
              <h3>Description</h3>
              <p>{bug.description}</p>
            </div>

            {bug.reproductionSteps && (
              <div className="bug-section">
                <h3>Steps to Reproduce</h3>
                <pre>{bug.reproductionSteps}</pre>
              </div>
            )}

            {bug.attachments && bug.attachments.length > 0 && (
              <div className="bug-section">
                <h3>Attachments</h3>
                <div className="attachments-list">
                  {bug.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-item">
                      <div className="attachment-info">
                        <span className="file-icon">{getFileIcon(attachment.originalName || attachment.filename)}</span>
                        <span className="file-name">{attachment.originalName || attachment.filename}</span>
                        <span className="file-size">{attachment.size ? (attachment.size / 1024).toFixed(1) + ' KB' : ''}</span>
                      </div>
                      <div className="attachment-actions">
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handleOpenFile(attachment.filename)}
                          title="Open file"
                        >
                          <FiEye />
                          Open
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleDownloadFile(attachment.filename)}
                          title="Download file"
                        >
                          <FiDownload />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bug-section">
              <h3>Comments</h3>
              <div className="bug-comments-section">
                <h4>Comments</h4>
                <form onSubmit={handleAddComment} className="add-comment-form">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={commentLoading}>
                    {commentLoading ? 'Adding...' : 'Add Comment'}
                  </button>
                </form>
                {dynamicComments.length === 0 ? (
                  <div className="no-comments">No comments yet.</div>
                ) : (
                  <ul className="comments-list">
                    {dynamicComments.map((comment, idx) => (
                      <li key={idx} className="comment-item">
                        <div><strong><Link to={`/users/${comment.author}`}>{comment.author}</Link></strong> <span>{comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}</span></div>
                        <div>{comment.content}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar">
          {isReporter ? (
            <>
              <div className="sidebar-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <div className="action-group">
                    <label>Change Status</label>
                    <select 
                      value={bug.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="form-select"
                    >
                      <option value="Open">Open</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="action-group">
                    <label>Assign To</label>
                    <select 
                      value={bug.assignedTo || ''}
                      onChange={(e) => handleAssignTo(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Unassigned</option>
                      <option value="John Doe">John Doe</option>
                      <option value="Sarah Smith">Sarah Smith</option>
                      <option value="Mike Johnson">Mike Johnson</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Work requests list for reporter */}
              <div className="work-requests-list">
                <h4>Work Requests</h4>
                {dynamicRequests.length === 0 && (
                  <div className="no-requests">
                    <span>There are currently no work requests for this bug.</span>
                  </div>
                )}
                {dynamicRequests.filter(r => !dynamicRequests.some(req => req.status === 'approved') || r.status === 'approved').map((req, idx) => (
                  <div key={idx} className={`request-item ${req.status}`}>
                    <div><strong>{req.author}</strong> - {req.status}</div>
                    <div>{req.content}</div>
                    <div>{new Date(req.timestamp).toLocaleString()}</div>
                    {req.status === 'pending' && approveLoadingIdx !== idx && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleApproveRequest(idx)} disabled={approveLoadingIdx === idx}>
                          {approveLoadingIdx === idx ? 'Approving...' : 'Approve'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRejectRequest(idx)} disabled={approveLoadingIdx === idx}>Reject</button>
                      </>
                    )}
                    {req.status === 'pending' && approveLoadingIdx === idx && (
                      <button className="btn btn-success btn-sm" disabled>Approving...</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (bug.status && bug.status.toLowerCase() === 'open') ? (
            isAssignee ? (
              <div className="assigned-to-you-card">
                <FiCheckCircle className="assigned-to-you-icon" />
                <div className="assigned-to-you-text">This bug has been assigned to you.</div>
              </div>
            ) : bug.assignedTo ? (
              <div className="assigned-message"><FiCheckCircle style={{ color: '#38b2ac', fontSize: '1.3em' }} /> This bug has been assigned to <b>{bug.assignedTo}</b>.</div>
            ) : (
              <div className="work-request-card">
                {userRequest ? (
                  <div className="request-status-card-centered">
                    <span className="request-status-label-centered">Your request status:</span>
                    <span className={`request-status-badge-centered ${userRequest.status}`}>{userRequest.status.charAt(0).toUpperCase() + userRequest.status.slice(1)}</span>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={handleRequestWork}>
                    Request to work on this bug
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="sidebar-empty">No actions available.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Bug</h3>
              <button onClick={() => setIsEditing(false)} className="btn btn-icon">
                <FiX />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="form-textarea"
                  rows="4"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Severity</label>
                  <select
                    value={editForm.severity}
                    onChange={(e) => setEditForm({...editForm, severity: e.target.value})}
                    className="form-select"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                    className="form-select"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Steps to Reproduce</label>
                <textarea
                  value={editForm.reproductionSteps}
                  onChange={(e) => setEditForm({...editForm, reproductionSteps: e.target.value})}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Bug</h3>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-icon">
                <FiX />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this bug?</p>
              <p><strong>"{bug.title}"</strong></p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                <FiTrash2 />
                Delete Bug
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Toast notification for comments */}
      {commentToast && <Toast message={commentToast} onClose={() => setCommentToast(null)} />}

      {/* Toast notification for delete */}
      {deleteToast && <Toast message={deleteToast} onClose={() => setDeleteToast(null)} />}
    </div>
  );
};

export default BugDetail; 