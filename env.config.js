// Environment configuration for the bug tracker application
const config = {
  // Backend API URL - will be updated after Railway deployment
  API_URL: process.env.REACT_APP_API_URL || 'https://bugtracker-backend-production.up.railway.app/api',
  
  // Development mode
  IS_DEV: process.env.NODE_ENV === 'development',
  
  // Production mode
  IS_PROD: process.env.NODE_ENV === 'production',

  REACT_APP_API_BASE_URL: 'https://bugtracker-production-3c60.up.railway.app', // Set your production backend URL here
};

export default config; 