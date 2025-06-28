import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiUsers, FiBarChart2, FiShield, FiArrowRight } from 'react-icons/fi';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <div className="landing-header">
        <div className="landing-nav">
          <div className="landing-brand">
            <div className="brand-icon">🐛</div>
            <span className="brand-text">BugTracker</span>
          </div>
          <div className="landing-actions">
            <Link to="/login" className="btn btn-outline">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Streamline Your Bug Tracking
            <span className="hero-highlight"> Process</span>
          </h1>
          <p className="hero-subtitle">
            A comprehensive bug tracking system designed for modern development teams. 
            Track, manage, and resolve bugs efficiently with powerful features and intuitive design.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Free Trial
              <FiArrowRight />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="preview-content">
                <div className="preview-card">
                  <div className="preview-badge critical">Critical</div>
                  <div className="preview-title">Login page not loading</div>
                  <div className="preview-meta">
                    <span>Assigned to John Doe</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
                <div className="preview-card">
                  <div className="preview-badge medium">Medium</div>
                  <div className="preview-title">UI alignment issues</div>
                  <div className="preview-meta">
                    <span>Assigned to Sarah Smith</span>
                    <span>1 day ago</span>
                  </div>
                </div>
                <div className="preview-card">
                  <div className="preview-badge resolved">Resolved</div>
                  <div className="preview-title">Database timeout fixed</div>
                  <div className="preview-meta">
                    <span>Resolved by Mike Johnson</span>
                    <span>3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-features">
        <div className="container">
          <div className="features-header">
            <h2>Everything you need to manage bugs effectively</h2>
            <p>Powerful features designed for development teams of all sizes</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiAlertTriangle />
              </div>
              <h3>Comprehensive Bug Tracking</h3>
              <p>Report, track, and manage bugs with detailed information including severity, priority, and reproduction steps.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FiUsers />
              </div>
              <h3>Team Collaboration</h3>
              <p>Assign bugs to team members, track progress, and collaborate effectively with built-in communication tools.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FiBarChart2 />
              </div>
              <h3>Analytics & Insights</h3>
              <p>Get detailed analytics on bug trends, team performance, and project health with interactive charts and reports.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FiShield />
              </div>
              <h3>Secure & Reliable</h3>
              <p>Enterprise-grade security with role-based access control, data encryption, and reliable backup systems.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to improve your bug tracking?</h2>
            <p>Join thousands of development teams who trust BugTracker to manage their projects.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
                <FiArrowRight />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-icon">🐛</div>
              <span className="brand-text">BugTracker</span>
            </div>
            <div className="footer-links">
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 BugTracker. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 