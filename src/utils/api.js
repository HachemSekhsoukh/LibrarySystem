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