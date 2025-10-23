// API server base URL
const API_BASE_URL = 'http://localhost:3001/api';

export const apiClient = {
  entities: {
    Repository: {
      list: async (sort = '-created_date') => {
        try {
          console.log('Fetching repositories from:', `${API_BASE_URL}/repositories?sort=${sort}`);
          const response = await fetch(`${API_BASE_URL}/repositories?sort=${sort}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Fetched repositories:', data);
          return data;
        } catch (error) {
          console.error('Error fetching repositories:', error);
          // Return Empty Array on Error
          return [];
        }
      },
      
      create: async (data) => {
        try {
          console.log('Creating repository with data:', data);
          const response = await fetch(`${API_BASE_URL}/repositories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('Repository created:', result);
          return result;
        } catch (error) {
          console.error('Error creating repository:', error);
          throw error;
        }
      }
    }
  }
};