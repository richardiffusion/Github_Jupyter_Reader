import express from 'express';
import { storage } from '../data/storage.js';
import { GitHubService } from '../utils/github.js';

const router = express.Router();

// Get all repositories
router.get('/', (req, res) => {
  try {
    console.log('GET /api/repositories called');
    const { sort } = req.query;
    const repositories = storage.repositories.findAll(sort);
    console.log(`Returning ${repositories.length} repositories`);
    res.json(repositories);
  } catch (error) {
    console.error('Error in GET /api/repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new repository
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/repositories called with body:', req.body);
    const { repo_url, repo_name } = req.body;
    
    if (!repo_url) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    // Fetch GitHub URL info
    const repoInfo = GitHubService.extractRepoInfo(repo_url);
    const actualRepoName = repo_name || `${repoInfo.username}/${repoInfo.repo}`;

    console.log(`Processing repository: ${actualRepoName}`);

    // Use Tree API to find notebooks
    const notebookResult = await GitHubService.findNotebooksInRepo(repo_url);
    
    if (notebookResult.error) {
      console.error('Error finding notebooks:', notebookResult.error);
      return res.status(400).json({ error: notebookResult.error });
    }

    console.log(`Found ${notebookResult.notebooks.length} notebooks`);

    if (!notebookResult.notebooks || notebookResult.notebooks.length === 0) {
      return res.status(400).json({ error: 'No Jupyter notebooks found in this repository' });
    }

    // Create repository entry
    const repository = storage.repositories.create({
      repo_url,
      repo_name: actualRepoName,
      notebooks: notebookResult.notebooks
    });

    console.log(`Created repository with ID: ${repository.id}`);
    res.status(201).json(repository);
  } catch (error) {
    console.error('Error in POST /api/repositories:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get a specific repository by ID
router.get('/:id', (req, res) => {
  try {
    const repository = storage.repositories.findById(req.params.id);
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.json(repository);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a repository
router.put('/:id', (req, res) => {
  try {
    const repository = storage.repositories.update(req.params.id, req.body);
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.json(repository);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a repository
router.delete('/:id', (req, res) => {
  try {
    const repository = storage.repositories.delete(req.params.id);
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    res.json({ message: 'Repository deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;