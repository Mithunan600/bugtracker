import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiPlus, FiBarChart2, FiMenu, FiX, FiUser, FiLogOut, FiChevronDown, FiUserCheck } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ currentUser, onLogout, modeSwitchButton }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/bugs', label: 'Bugs', icon: FiList },
    { path: '/my-bugs', label: 'My Bugs', icon: FiUserCheck },
    { path: '/bugs/new', label: 'New Bug', icon: FiPlus },
    { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    onLogout();
    setIsUserMenuOpen(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Team Lead':
        return 'role-lead';
      case 'Project Manager':
        return 'role-manager';
      case 'QA Tester':
        return 'role-qa';
      default:
        return 'role-developer';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">🐛</div>
          <span className="brand-text">BugTracker</span>
        </Link>
        {/* Move navbar-menu here so it is always present */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}> 
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="navbar-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* Desktop actions: user, mode switch */}
        <div className="navbar-actions">
          <div className="navbar-mode-switch">{modeSwitchButton}</div>
          <div className="navbar-user">
            <div className="user-menu">
              <button 
                className="user-menu-toggle" 
                onClick={toggleUserMenu}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
              >
                <div className="user-avatar">
                  <FiUser />
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser?.name}</span>
                  <span className={`user-role ${getRoleColor(currentUser?.role)}`}> 
                    {currentUser?.role}
                  </span>
                </div>
                <FiChevronDown className={`chevron ${isUserMenuOpen ? 'rotated' : ''}`} />
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link to={`/users/${currentUser?.email}`} className="user-dropdown-header" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="user-dropdown-header">
                      <div className="user-avatar-large">
                        <FiUser />
                      </div>
                      <div className="user-details">
                        <span className="user-name-large">{currentUser?.name}</span>
                        <span className="user-email">{currentUser?.email}</span>
                        <span className={`user-role-large ${getRoleColor(currentUser?.role)}`}>
                          {currentUser?.role}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="user-dropdown-divider"></div>
                  <button className="user-dropdown-item" onClick={handleLogout}>
                    <FiLogOut className="dropdown-icon" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile actions: hamburger, mode switch, user */}
        <div className="navbar-mobile-actions">
          <button className="navbar-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="navbar-mode-switch">{modeSwitchButton}</div>
          <div className="navbar-user">
            <div className="user-menu">
              <button 
                className="user-menu-toggle" 
                onClick={toggleUserMenu}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
              >
                <div className="user-avatar">
                  <FiUser />
                </div>
                <FiChevronDown className={`chevron ${isUserMenuOpen ? 'rotated' : ''}`} />
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link to={`/users/${currentUser?.email}`} className="user-dropdown-header" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="user-dropdown-header">
                      <div className="user-avatar-large">
                        <FiUser />
                      </div>
                      <div className="user-details">
                        <span className="user-name-large">{currentUser?.name}</span>
                        <span className="user-email">{currentUser?.email}</span>
                        <span className={`user-role-large ${getRoleColor(currentUser?.role)}`}>
                          {currentUser?.role}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="user-dropdown-divider"></div>
                  <button className="user-dropdown-item" onClick={handleLogout}>
                    <FiLogOut className="dropdown-icon" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 