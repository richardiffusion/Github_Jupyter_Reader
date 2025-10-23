import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Create axios instance with GitHub headers
const createGitHubClient = () => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Jupyter-Notebook-Reader'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  return axios.create({ headers });
};

const githubClient = createGitHubClient();

export class GitHubService {
  // Fetch info from GitHub URL
  static extractRepoInfo(url) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL. Please use format: https://github.com/username/repository');
    }
    return {
      username: match[1],
      repo: match[2].replace(/\.git$/, '')
    };
  }

  // Fetch repository info
  static async getRepoInfo(username, repo) {
    try {
      const response = await githubClient.get(`https://api.github.com/repos/${username}/${repo}`);
      return response.data;
    } catch (error) {
      console.error('Error getting repo info:', error.message);
      throw new Error(`Unable to access repository: ${error.response?.data?.message || error.message}`);
    }
  }

  // Use search API to find notebooks
  static async findNotebooksInRepo(repoUrl) {
    try {
      console.log(`=== Searching for notebooks in: ${repoUrl} ===`);
      
      const { username, repo } = this.extractRepoInfo(repoUrl);
      console.log(`Username: ${username}, Repo: ${repo}`);

      // Fetch repository info
      const repoInfo = await this.getRepoInfo(username, repo);
      console.log(`Repository found: ${repoInfo.full_name}, Default branch: ${repoInfo.default_branch}`);

      // Use search API to find .ipynb files
      const searchUrl = `https://api.github.com/search/code?q=extension:ipynb+repo:${username}/${repo}`;
      console.log(`Search URL: ${searchUrl}`);
      
      const searchResponse = await githubClient.get(searchUrl);
      const items = searchResponse.data.items || [];
      
      console.log(`Found ${items.length} notebook files`);
      
      if (items.length === 0) {
        return { notebooks: [], error: 'No Jupyter notebooks found in this repository' };
      }

      // Show found files
      items.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.path}`);
      });

      // Process the first 15 notebook files
      const notebooks = [];
      for (const item of items.slice(0, 15)) {
        try {
          console.log(`Processing: ${item.path}`);

          // Fetch file content
          const contentResponse = await axios.get(
            `https://raw.githubusercontent.com/${username}/${repo}/${repoInfo.default_branch}/${item.path}`,
            {
              headers: {
                'User-Agent': 'Jupyter-Notebook-Reader'
              }
            }
          );
          
          let parsedContent;
          try {
            parsedContent = typeof contentResponse.data === 'string' 
              ? JSON.parse(contentResponse.data) 
              : contentResponse.data;
            console.log(`✓ Successfully parsed: ${item.path}`);
          } catch (parseError) {
            console.error(`✗ Failed to parse: ${item.path} - ${parseError.message}`);
            continue;
          }
          
          notebooks.push({
            name: item.name,
            path: item.path,
            content: parsedContent
          });
          
        } catch (fileError) {
          console.error(`✗ Failed to process: ${item.path} - ${fileError.message}`);
        }

        // Short delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      console.log(`Successfully processed ${notebooks.length} notebooks`);
      
      if (notebooks.length === 0) {
        return { 
          notebooks: [], 
          error: 'Found notebook files but could not process any of them. This might be due to file size limits or parsing errors.' 
        };
      }
      
      return { notebooks };
      
    } catch (error) {
      console.error('=== ERROR in findNotebooksInRepo ===');
      console.error('Error:', error.message);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', error.response.data);
        
        if (error.response.status === 403) {
          return { 
            notebooks: [], 
            error: 'GitHub API rate limit exceeded. Please try again later or add a GitHub Personal Access Token.' 
          };
        }
        
        if (error.response.status === 404) {
          return { 
            notebooks: [], 
            error: 'Repository not found or access denied. Make sure the repository exists and is public.' 
          };
        }
      }
      
      return { 
        notebooks: [], 
        error: `Failed to search repository: ${error.message}` 
      };
    }
  }
}