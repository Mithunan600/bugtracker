// API configuration for Vercel deployment
// Replace this URL with your Railway backend URL after deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-railway-backend-url.railway.app/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Authentication API calls
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role
      }),
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
    return handleResponse(response);
  },
};

// Bug API calls
export const bugAPI = {
  // Get all bugs
  getAllBugs: async (token) => {
    const response = await fetch(`${API_BASE_URL}/bugs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Get bug by ID
  getBugById: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Create new bug
  createBug: async (bugData, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bugData),
    });
    return handleResponse(response);
  },

  // Update bug
  updateBug: async (id, bugData, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bugData),
    });
    return handleResponse(response);
  },

  // Delete bug
  deleteBug: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete bug');
    }
    // No response body expected
    return true;
  },

  // Add comment to bug
  addComment: async (bugId, comment, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    });
    return handleResponse(response);
  },

  // Add work request to bug
  addWorkRequest: async (bugId, workRequest, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}/work-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workRequest),
    });
    return handleResponse(response);
  },

  // Update work request status
  updateWorkRequest: async (bugId, reqIndex, status, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}/work-requests/${reqIndex}?status=${status}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Add request to bug
  addRequest: async (bugId, request, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  },

  // Get all requests for a bug
  getRequests: async (bugId, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}/requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Update work request status (approve/reject)
  updateRequest: async (bugId, reqIndex, status, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}/requests/${reqIndex}?status=${status}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Get all bugs assigned to the current user
  getAssignedBugs: async (token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/assigned`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Get all comments for a bug
  getComments: async (bugId, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}/comments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Download file
  downloadFile: async (filename, token) => {
    const response = await fetch(`${API_BASE_URL}/bugs/files/${filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  },

  // Upload file
  uploadFile: async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/bugs/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error('File upload failed');
    }
    return response.json();
  },
};

// User profile APIs
export const getUserByEmail = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/${email}`);
  return handleResponse(response);
};
export const updateUserByEmail = async (email, data) => {
  const response = await fetch(`${API_BASE_URL}/users/${email}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};
export const getBugsWorkingOn = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/${email}/bugs/working-on`);
  return handleResponse(response);
};
export const getBugsWorkedOn = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/${email}/bugs/worked-on`);
  return handleResponse(response);
}; 