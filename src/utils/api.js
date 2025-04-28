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

export const fetchUserTypes = async () => {
  try {
    console.log("Fetching user types from:", `${API_BASE_URL}/user-types`);
    const response = await fetch(`${API_BASE_URL}/user-types`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user types: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched user types data:", data);
    return data;
  } catch (error) {
    console.error('Error fetching user types:', error);
    throw error;
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
      credentials: 'include',
      body: JSON.stringify({ email, password }),
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

/**
 * Logs in a student with email and password
 * @param {string} email - Student's email
 * @param {string} password - Student's password
 * @returns {Promise<Object|null>} - Student data or null on failure
 */
export const loginStudent = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    console.log(response)

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
 * Signs up a new student
 * @param {Object} studentData - Object containing student details (name, email, password, etc.)
 * @returns {Promise<Object|null>} - Registered student data or null on failure
 */
export const signupStudent = async (studentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
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
 * Logs out the current student
 * @returns {Promise<Object|null>} - Logout response data or null on failure
 */
export const logoutStudent = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/logout`, {
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
  try {
    console.log("Fetching readers from:", `${API_BASE_URL}/readers`);
    const response = await fetch(`${API_BASE_URL}/readers`);
    if (!response.ok) {
      throw new Error(`Failed to fetch readers: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched readers data:", data);
    return data.map(reader => ({
      id: reader.id,
      name: reader.name,
      dob: reader.birthDate,
      email: reader.email,
      phone: reader.phone,
      type: reader.type,
      status: reader.status
    }));
  } catch (error) {
    console.error('Error fetching readers:', error);
    throw error;
  }
};


export const fetchTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {credentials: 'include'});
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
    credentials: 'include',
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

// api.js

export const fetchMostBorrowedBooks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats/most-borrowed-books`,{
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });
    const data = await response.json();
    return data; // Returning the list of most borrowed books
  } catch (error) {
    console.error("Error fetching most borrowed books:", error);
    return [];
  }
};
// Reader-related API calls
export const fetchReaderTransactions = async (readerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/transactions?reader_id=${readerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reader transactions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reader transactions:', error);
    throw error;
  }
};

export const addReader = async (readerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/add-readers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readerData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add reader');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding reader:', error);
    throw error;
  }
};

export const updateReader = async (readerId, readerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/readers/${readerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readerData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update reader');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating reader:', error);
    throw error;
  }
};

export const deleteReader = async (readerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/readers/${readerId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete reader');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting reader:', error);
    throw error;
  }
};

export const updateReaderStatus = async (readerId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/update-readers/${readerId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update reader status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating reader status:', error);
    throw error;
  }
};

export const fetchPendingReaders = async () => {
  try {
    console.log("Fetching pending readers from:", `${API_BASE_URL}api/pending-readers`);
    const response = await fetch(`${API_BASE_URL}api/pending-readers`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pending readers: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched pending readers data:", data);
    return data.map(reader => ({
      id: reader.id,
      name: reader.name,
      dob: reader.birthDate,
      email: reader.email,
      phone: reader.phone,
      type: reader.type,
      status: reader.status
    }));
  } catch (error) {
    console.error('Error fetching pending readers:', error);
    throw error;
  }
};

export const fetchReaderHistory = async (userId) => {
  try {
    const url = `${API_BASE_URL}/history?user_id=${userId}`;
    console.log("Fetching reader history from:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reader history: ${response.status} ${response.statusText}`);
    }
    
    const historyData = await response.json();
    return processHistoryData(historyData);
  } catch (error) {
    console.error('Error fetching reader history:', error);
    throw error;
  }
};

// Helper function to process history data
const processHistoryData = (historyData) => {
    console.log("Processing history data:", historyData);
    
    // If the data is already in the correct format, return it directly
    if (Array.isArray(historyData) && historyData.length > 0 && historyData[0].reservation_id) {
        console.log("Data already in correct format, returning as is");
        return historyData;
    }

    // Group by reservation ID
    const groupedByReservation = historyData.reduce((acc, record) => {
        if (!acc[record.h_res_id]) {
            acc[record.h_res_id] = [];
        }
        acc[record.h_res_id].push(record);
        return acc;
    }, {});

    console.log("Grouped by reservation:", groupedByReservation);

    // Process each group
    const processed = Object.values(groupedByReservation).map(group => {
        // Sort by date
        group.sort((a, b) => new Date(a.h_date) - new Date(b.h_date));

        // Find the relevant records
        const reservation = group.find(r => r.h_status === 0);
        const borrow = group.find(r => r.h_status === 1);
        const returnRecord = group.find(r => r.h_status === 2);
        const lateRecord = group.find(r => r.h_status === 4);

        const processedRecord = {
            id: group[0].h_id,
            reservation_id: group[0].h_res_id,
            document_title: reservation?.Reservation?.Resource?.r_title || 'Unknown Resource',
            reservation_date: reservation?.h_date || null,
            borrow_date: borrow?.h_date || null,
            due_date: borrow?.due_date || null,
            return_date: returnRecord?.h_date || null,
            status: getStatus(borrow, returnRecord, lateRecord),
            is_late: lateRecord !== undefined
        };

        console.log("Processed record:", processedRecord);
        return processedRecord;
    });

    console.log("Final processed data:", processed);
    return processed;
};

// Helper function to determine the current status
const getStatus = (borrow, returnRecord, lateRecord) => {
    if (returnRecord) return 'Returned';
    if (lateRecord) return 'Late';
    if (borrow) return 'Borrowed';
    return 'Reserved';
};

export const fetchResourceHistory = async (resourceId) => {
  try {
    const url = `${API_BASE_URL}/api/resource-history?resource_id=${resourceId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch resource history: ${response.status} ${response.statusText}`);
    }
    
    const historyData = await response.json();
    return processHistoryData(historyData);
  } catch (error) {
    console.error('Error fetching resource history:', error);
    throw error;
  }
};

export const fetchResourceTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-types`);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource types: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching resource types:', error);
    throw error;
  }
};

export const addResourceType = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to add resource type: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding resource type:', error);
    throw error;
  }
};

export const updateResourceType = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update resource type: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating resource type:', error);
    throw error;
  }
};

export const deleteResourceType = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-types/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete resource type: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting resource type:', error);
    throw error;
  }
};

export const fetchLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // In case authentication is required
    });

    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }

    const data = await response.json();
    return data.logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

