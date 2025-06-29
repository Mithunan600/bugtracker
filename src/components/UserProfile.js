import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiSave, FiX, FiMail, FiUser, FiBriefcase, FiCheckCircle, FiClock } from 'react-icons/fi';
import { getUserByEmail, updateUserByEmail, getBugsWorkingOn, getBugsWorkedOn } from '../services/api';
import './UserProfile.css';

const UserProfile = ({ currentUser, token }) => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', role: '' });
  const [workingOn, setWorkingOn] = useState([]);
  const [workedOn, setWorkedOn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isCurrentUser = currentUser?.email === email;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const userRes = await getUserByEmail(email);
        // Defensive: if userRes.data is null/undefined, treat as not found
        if (!userRes || !userRes.id) {
          setUser(null);
          setError('User not found');
        } else {
          setUser(userRes);
          setEditForm({
            name: userRes.name || '',
            role: userRes.role || ''
          });
          try {
            const working = await getBugsWorkingOn(email);
            setWorkingOn(Array.isArray(working) ? working : (working?.data || []));
          } catch {
            setWorkingOn([]);
          }
          try {
            const worked = await getBugsWorkedOn(email);
            setWorkedOn(Array.isArray(worked) ? worked : (worked?.data || []));
          } catch {
            setWorkedOn([]);
          }
        }
      } catch (e) {
        setUser(null);
        setError('User not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditForm({ name: user?.name || '', role: user?.role || '' });
    setEditMode(false);
  };
  const handleChange = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    // Validate form data
    if (!editForm.name.trim()) {
      setError('Name is required');
      setSaving(false);
      return;
    }
    
    if (!editForm.role.trim()) {
      setError('Role is required');
      setSaving(false);
      return;
    }
    
    try {
      if (!token) {
        throw new Error('Authentication token not available');
      }
      const res = await updateUserByEmail(email, editForm, token);
      setUser(res);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      // Update the current user in localStorage and parent component if it's the current user
      if (isCurrentUser) {
        const updatedUser = { ...currentUser, ...editForm };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        // Trigger a page reload to update the navbar and other components
        window.location.reload();
      }
    } catch (e) {
      console.error('Error updating profile:', e);
      if (e.message.includes('401') || e.message.includes('403')) {
        setError('Authentication failed. Please log in again.');
      } else if (e.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="user-profile-page"><div className="loading-spinner"></div></div>;
  if (error || !user) return <div className="user-profile-page"><div className="error-message">{error || 'User not found'}</div></div>;

  return (
    <div className="user-profile-page">
      {error && (
        <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="success-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a' }}>
          {success}
        </div>
      )}
      <div className="profile-header">
        <FiUser className="profile-icon" />
        <div className="profile-info">
          <h2>{editMode ? (
            <input 
              name="name" 
              value={editForm.name || ''} 
              onChange={handleChange} 
              className="profile-input" 
              placeholder="Enter your name"
              maxLength={50}
            />
          ) : (user?.name || <span style={{color:'#aaa'}}>(No Name)</span>)}</h2>
          <div className="profile-email"><FiMail /> {user?.email || <span style={{color:'#aaa'}}>(No Email)</span>}</div>
          <div className="profile-role">
            {editMode ? (
              <select 
                name="role" 
                value={editForm.role || ''} 
                onChange={handleChange} 
                className="profile-input"
              >
                <option value="">Select a role</option>
                <option value="Developer">Developer</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Project Manager">Project Manager</option>
                <option value="QA Tester">QA Tester</option>
              </select>
            ) : (user?.role || <span style={{color:'#aaa'}}>(No Role)</span>)}
          </div>
        </div>
        {isCurrentUser && !editMode && (
          <button className="btn btn-secondary" onClick={handleEdit}><FiEdit /> Edit Profile</button>
        )}
        {isCurrentUser && editMode && (
          <div className="profile-edit-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}><FiSave /> Save</button>
            <button className="btn btn-danger" onClick={handleCancel}><FiX /> Cancel</button>
          </div>
        )}
      </div>

      <div className="profile-bugs-section">
        <h3><FiBriefcase /> Working On</h3>
        {(!Array.isArray(workingOn) || workingOn.length === 0) ? <div className="empty-bugs">No bugs currently assigned.</div> : (
          <ul className="profile-bug-list">
            {workingOn.map(bug => (
              <li key={bug?.id || bug?._id || Math.random()} onClick={() => bug?.id && navigate(`/bugs/${bug.id}`)} className="profile-bug-card">
                <div className="bug-title">{bug?.title || <span style={{color:'#aaa'}}>(No Title)</span>}</div>
                <div className="bug-meta"><FiClock /> {bug?.status || <span style={{color:'#aaa'}}>(No Status)</span>}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="profile-bugs-section">
        <h3><FiCheckCircle /> Worked On</h3>
        {(!Array.isArray(workedOn) || workedOn.length === 0) ? <div className="empty-bugs">No bugs worked on yet.</div> : (
          <ul className="profile-bug-list">
            {workedOn.map(bug => (
              <li key={bug?.id || bug?._id || Math.random()} onClick={() => bug?.id && navigate(`/bugs/${bug.id}`)} className="profile-bug-card">
                <div className="bug-title">{bug?.title || <span style={{color:'#aaa'}}>(No Title)</span>}</div>
                <div className="bug-meta"><FiCheckCircle /> {bug?.status || <span style={{color:'#aaa'}}>(No Status)</span>}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 