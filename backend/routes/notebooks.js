import express from 'express';
import { storage } from '../data/storage.js';

const router = express.Router();

// Fetch notebooks for a specific repository
router.get('/:repoId', (req, res) => {
  try {
    const repository = storage.repositories.findById(req.params.repoId);
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    
    res.json(repository.notebooks || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch content for a specific notebook
router.get('/:repoId/:notebookPath', (req, res) => {
  try {
    const repository = storage.repositories.findById(req.params.repoId);
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    
    const notebookPath = decodeURIComponent(req.params.notebookPath);
    const notebook = (repository.notebooks || []).find(nb => nb.path === notebookPath);
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;