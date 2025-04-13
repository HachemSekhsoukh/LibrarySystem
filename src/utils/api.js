import { HOST_NAME } from '../constants';

// API Endpoints
const API_BASE_URL = 'http://127.0.0.1:5000/api';

/**
 * Fetches all resources from the API
 * @returns {Promise<Array>} - Array of all resources
 */
export const fetchAllResources = async () => {
  try {
    console.log('Fetching all resources from API...');
    const response = await fetch(`${API_BASE_URL}/resources`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} resources`, data);
    return data;
  } catch (error) {
    console.error('Error fetching all resources:', error);
    return [];
  }
};

/**
 * Fetches resources from the API with a limit
 * @param {number} limit - Maximum number of resources to fetch
 * @returns {Promise<Array>} - Array of resources
 */
export const fetchResources = async (limit = 20) => {
  try {
    const resources = await fetchAllResources();
    return resources.slice(0, limit);
  } catch (error) {
    console.error('Error fetching resources with limit:', error);
    return [];
  }
};

/**
 * Fetches a resource by ID
 * @param {string|number} id - The ID of the resource to fetch
 * @returns {Promise<Object|null>} - The resource object or null if not found
 */
export const fetchResourceById = async (id) => {
  try {
    console.log(`Fetching resource with ID: ${id}`);
    // First fetch all resources
    const resources = await fetchAllResources();
    
    // Find the resource with matching ID
    const resource = resources.find(r => r.id === parseInt(id));
    
    if (!resource) {
      console.error(`Resource with ID ${id} not found`);
      return null;
    }
    
    console.log(`Resource found:`, resource);
    return resource;
  } catch (error) {
    console.error(`Error fetching resource with ID ${id}:`, error);
    return null;
  }
};

/**
 * Fetches latest resources (books)
 * @param {number} limit - Maximum number of latest resources to fetch
 * @returns {Promise<Array>} - Array of latest resources
 */
export const fetchLatestResources = async (limit = 5) => {
  try {
    const resources = await fetchAllResources();
    console.log(`Fetched ${resources.length} resources for latest books`);
    
    if (!resources || resources.length === 0) {
      console.error('No resources found in the database for latest books');
      return [];
    }
    
    // For demo purposes, sort by receivingDate (descending) to get latest books
    const sortedResources = resources
      .sort((a, b) => {
        const dateA = new Date(a.receivingDate || '2000-01-01');
        const dateB = new Date(b.receivingDate || '2000-01-01');
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, limit);
    
    console.log(`Returning ${sortedResources.length} latest books from database`);
    return sortedResources;
  } catch (error) {
    console.error('Error fetching latest resources:', error);
    return [];
  }
};

/**
 * Fetches popular resources (books)
 * @param {number} limit - Maximum number of popular resources to fetch
 * @returns {Promise<Array>} - Array of popular resources
 */
export const fetchPopularResources = async (limit = 5) => {
  try {
    const resources = await fetchAllResources();
    console.log(`Fetched ${resources.length} resources for popular books`);
    
    if (!resources || resources.length === 0) {
      console.error('No resources found in the database for popular books');
      return [];
    }
    
    // For demo purposes, we'll just use status to determine popularity
    const sortedResources = resources
      .sort((a, b) => {
        const statusA = a.status || 0;
        const statusB = b.status || 0;
        return statusB - statusA; // Descending order
      })
      .slice(0, limit);
    
    console.log(`Returning ${sortedResources.length} popular books from database`);
    return sortedResources;
  } catch (error) {
    console.error('Error fetching popular resources:', error);
    return [];
  }
};

/**
 * Searches for resources based on a query string
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of matching resources
 */
export const searchResources = async (query) => {
  try {
    console.log('Searching resources for:', query);
    if (!query || query.trim() === '') {
      return [];
    }
    
    const resources = await fetchAllResources();
    
    if (!resources || resources.length === 0) {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Search through title, author and observation fields
    return resources.filter(resource => {
      const title = (resource.title || '').toLowerCase();
      const author = (resource.author || '').toLowerCase();
      const observation = (resource.observation || '').toLowerCase();
      const isbn = String(resource.isbn || '').toLowerCase();
      
      return title.includes(normalizedQuery) || 
             author.includes(normalizedQuery) || 
             observation.includes(normalizedQuery) ||
             isbn.includes(normalizedQuery);
    });
  } catch (error) {
    console.error('Error searching resources:', error);
    return [];
  }
}; 

/**
 * Logs in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object|null>} - User data or null on failure
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',  // Ensure cookies are sent with the request
    });

    if (!response.ok) {
      throw new Error('Invalid email or password');
    }

    const data = await response.json();
    console.log('Login successful:', data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

/**
 * Signs up a new user
 * @param {Object} userData - Object containing user details (name, email, password, etc.)
 * @returns {Promise<Object|null>} - Registered user data or null on failure
 */
export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const data = await response.json();
    console.log('Signup successful:', data);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    return null;
  }
};

/**
 * Logs out the current user
 * @returns {Promise<Object|null>} - Logout response data or null on failure
 */
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',  // Important: Include credentials (cookies)
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    const data = await response.json();
    console.log('Logout successful:', data);
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    return null;
  }
};

export const getUserInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Needed for HttpOnly cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('User info fetch error:', error);
    return null;
  }
};

export const updateUserInfo = async (updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Needed for HttpOnly cookies
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Failed to update user info');
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user info:", error);
    return null;
  }
};

// utils/api.js

export const updateUserPassword = async (oldPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/update-password`, {
      method: "PUT",
      credentials: "include", // Send cookies (JWT, etc.)
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Password update error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
};

export const fetchAllStaff = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // If you're using cookies for auth
    });

    const data = await response.json();

    if (data.success) {
      return data.staff;
    } else {
      console.error("Failed to fetch staff:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
}

// Assuming you're using fetch to make requests
export const addStaffMember = async (staffData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/staff/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(staffData),
    });
    console.log(response);
    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add staff member");
    }

    // Parse and return the response data
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error adding staff member:", error);
    return { success: false, message: error.message };
  }
};

export async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/user/status`, {
      method: 'GET',
      credentials: 'include', // VERY IMPORTANT: ensures cookies are sent
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Token is invalid or missing
      return { authenticated: false };
    }

    const data = await response.json();
    return data; // Should include { authenticated: true, email: ... }

  } catch (error) {
    console.error('Error checking auth status:', error);
    return { authenticated: false };
  }
}



export const fetchStaffTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/staff-types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch staff types");
    }

    const data = await response.json();
    
    // Since the API returns an array directly, we can return it as is
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch staff types", error);
    return [];
  }
};

export const addStaffType = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/staff-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add staff type");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to add staff type", error);
    return { success: false, message: error.message };
  }
};


export const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/stats`,{
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });
    console.log(res)
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};


export const fetchReaders = async () => {
  const response = await fetch(`${API_BASE_URL}/readers`);
  if (!response.ok) {
    throw new Error('Failed to fetch readers');
  }
  return await response.json();
};


export const fetchTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return await response.json();
};

export const createTransaction = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create transaction');
  }

  return await response.json();
};

export const fetchMonthlyBorrows = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/stats/monthly-borrows`,{
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });
    const data = await res.json();
    return data; // Expected: [{ month: "Jan", borrows: 40 }, ...]
  } catch (err) {
    console.error(err);
    return [];
  }
};
