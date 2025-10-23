import express from 'express';
import cors from 'cors';
import repositoryRoutes from './routes/repositories.js';
import notebookRoutes from './routes/notebooks.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 

// Load environment variables
dotenv.config();

// Get __dirname equivalent (in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Backend Startup Info ===');
console.log('GitHub Token configured:', !!process.env.GITHUB_TOKEN);
console.log('GitHub Token length:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.length : 0);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.use('/api/repositories', repositoryRoutes);
app.use('/api/notebooks', notebookRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({ 
    status: 'OK', 
    message: 'Jupyter Notebook Reader API is running',
    githubStatus: process.env.GITHUB_TOKEN ? 'Token configured' : 'No GitHub token'
  });
});

// Test GitHub integration endpoint
app.get('/api/test-github', async (req, res) => {
  try {
    const { repo } = req.query;
    if (!repo) {
      return res.status(400).json({ error: 'repo parameter is required' });
    }
    
    console.log(`Testing GitHub integration with repo: ${repo}`);
    
    // Get GitHub Service
    const { GitHubService } = await import('./utils/github.js');
    const result = await GitHubService.findNotebooksInRepo(`https://github.com/${repo}`);
    
    res.json({
      repo,
      result
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Static frontend file: frontend/dist
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
console.log('Frontend dist path:', frontendDistPath);

// Check if frontend build exists
if (fs.existsSync(frontendDistPath)) {
  console.log('Frontend build found, serving static files');
  app.use(express.static(frontendDistPath));
} else {
  console.warn('Frontend build not found at:', frontendDistPath);
  console.warn('Please run "npm run build" in the frontend directory');
}

// For all other requests, return the frontend application (supporting frontend routing)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend build not found',
      message: 'Please run "npm run build" in the frontend directory first',
      expectedPath: indexPath
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`GitHub Token: ${process.env.GITHUB_TOKEN ? 'Configured' : 'Not configured'}`);
  console.log(`Max notebooks to process: ${process.env.MAX_NOTEBOOKS_TO_PROCESS || 15}`);
  console.log(`Serving frontend from: ${frontendDistPath}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  / - Frontend application`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  GET  /api/test-github?repo=username/repo - Test GitHub integration`);
  console.log(`  GET  /api/repositories - List repositories`);
  console.log(`  POST /api/repositories - Create repository`);
  console.log(`  GET  /api/notebooks/:repoId - Get notebooks for repository`);
});