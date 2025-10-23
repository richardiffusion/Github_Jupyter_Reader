// Simple Local Storage, In-Memory Implementation
let repositories = [];
let nextId = 1;

export const storage = {
  // Repository-related operations
  repositories: {
    findAll: (sort = '-created_date') => {
      let result = [...repositories];
      
      if (sort.startsWith('-')) {
        const field = sort.slice(1);
        result.sort((a, b) => new Date(b[field]) - new Date(a[field]));
      } else {
        result.sort((a, b) => new Date(a[sort]) - new Date(b[sort]));
      }
      
      return result;
    },
    
    findById: (id) => {
      return repositories.find(repo => repo.id === id);
    },
    
    create: (data) => {
      const newRepo = {
        id: String(nextId++),
        ...data,
        created_date: new Date().toISOString()
      };
      repositories.push(newRepo);
      return newRepo;
    },
    
    update: (id, data) => {
      const index = repositories.findIndex(repo => repo.id === id);
      if (index !== -1) {
        repositories[index] = { ...repositories[index], ...data };
        return repositories[index];
      }
      return null;
    },
    
    delete: (id) => {
      const index = repositories.findIndex(repo => repo.id === id);
      if (index !== -1) {
        return repositories.splice(index, 1)[0];
      }
      return null;
    }
  }
};