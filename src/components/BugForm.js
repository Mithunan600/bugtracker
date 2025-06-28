import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import './BugForm.css';
import { bugAPI } from '../services/api';

const BugForm = ({ onSubmit, currentUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    priority: 'Normal',
    reporter: currentUser?.name || currentUser?.email || '',
    reproductionSteps: '',
    version: '',
    commitHash: '',
    branch: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Update reporter when currentUser changes
  useEffect(() => {
    if (currentUser?.name) {
      setFormData(prev => ({
        ...prev,
        reporter: currentUser.name
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const attachment = await bugAPI.uploadFile(file, localStorage.getItem('token'));
        setAttachments(prev => [...prev, { ...attachment, id: Date.now() + Math.random() }]);
      } catch (err) {
        alert('File upload failed: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.severity) errors.severity = 'Severity is required';
    if (!formData.priority) errors.priority = 'Priority is required';
    if (!formData.reporter.trim()) errors.reporter = 'Reporter is required';
    if (!formData.reproductionSteps.trim()) errors.reproductionSteps = 'Reproduction Steps are required';
    if (!formData.version.trim()) errors.version = 'Version is required';
    if (!formData.commitHash.trim()) errors.commitHash = 'Commit Hash is required';
    if (!formData.branch.trim()) errors.branch = 'Branch is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const bugData = {
        ...formData,
        status: 'Open',
        reporter: currentUser?.name || currentUser?.email || '',
        attachments: attachments.map(att => {
          const { id, ...rest } = att;
          return rest;
        })
      };
      await onSubmit(bugData);
      navigate('/bugs');
    } catch (error) {
      console.error('Error submitting bug:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bug-form-page">
      <div className="page-header">
        <h1 className="page-title">Report New Bug</h1>
        <p className="page-subtitle">Submit a detailed bug report with all necessary information</p>
      </div>

      <div className="form-container">
        <div className="form-header">
          <button 
            onClick={() => navigate('/bugs')} 
            className="btn btn-secondary"
          >
            <FiArrowLeft />
            Back to Bugs
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bug-form">
          <div className="form-grid">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="title">Bug Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Brief description of the bug"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Detailed description of the bug, including what you expected to happen and what actually happened"
                  required
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="severity">Severity *</label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Assignment & Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reporter">Reporter</label>
                  <input
                    type="text"
                    id="reporter"
                    name="reporter"
                    value={formData.reporter}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Your name"
                    readOnly={!!currentUser?.name}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reproductionSteps">Reproduction Steps</label>
                <textarea
                  id="reproductionSteps"
                  name="reproductionSteps"
                  value={formData.reproductionSteps}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Step-by-step instructions to reproduce the bug"
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Version Control</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="version">Version</label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., v2.1.0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="branch">Branch</label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., main, develop"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="commitHash">Commit Hash</label>
                <input
                  type="text"
                  id="commitHash"
                  name="commitHash"
                  value={formData.commitHash}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., abc123def"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Attachments</h3>
              
              <div className="form-group">
                <label className="form-label">Upload Files</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <FiUpload className="upload-icon" />
                    <span>Click to upload files or drag and drop</span>
                    <span className="file-types">Screenshots, logs, videos (max 10MB each)</span>
                  </label>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="attachments-list">
                  <h4>Uploaded Files</h4>
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="attachment-item">
                      <div className="attachment-info">
                        <span className="attachment-name">{attachment.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        className="remove-attachment"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/bugs')}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <FiSave />
              {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugForm; 