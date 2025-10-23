# Github Jupyter Reader

A web application for importing, viewing, and downloading Jupyter notebooks directly from GitHub repositories. This Jupyter reader provides a beautiful interface to browse, read, and organize your Jupyter notebooks without leaving your browser. A quick way to browse all the Jupyter files(.ipynb) from a repository.

This project is built on React + Vite + Tailwind CSS and Node.js.

Main Page
<img width="2500" height="1185" alt="image" src="https://github.com/user-attachments/assets/8cb839f3-b93a-4b4a-88ff-23e8efa9098f" />

More pictures at the bottom.

## ✨ Features

- **🔍 Smart GitHub Integration** - Automatically discover and import Jupyter notebooks from any public GitHub repository
- **📚 Organized Library** - Beautiful grid layout to browse all your imported notebooks with repository information
- **👀 Rich Notebook Viewer** - Clean, responsive notebook viewer with syntax highlighting and collapsible cells
- **💾 One-Click Downloads** - Download original `.ipynb` files for offline use
- **💫 Real-time Stats** - Track your repository and notebook counts in real-time
- **👀👀Run Code** - Run code as viewing .ipynb in library(without downloading)

## 🚀 Quick Start

### Installation
1. **Clone the repository**
```bash
git clone https://github.com/richardiffusion/Github_Jupyter_Reader.git
cd github_jupyter_reader
```
2. **Install Dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd backend
npm install
```
3. **Start Development Servers**
```
# Terminal 1 - Start backend (Port 3001)
cd backend
npm start

# Terminal 2 - Start frontend (Port 3000)
cd frontend
npm run dev
```

Navigate to http://localhost:3000 to check website in development

Note: 
GITHUB_TOKEN=your_github_token_here in .env in backend folder
Please replace 'your-github-token-here' with your actual GitHub token.
This token is necessary for authenticating requests to the GitHub API.
Do not share this token publicly to avoid unauthorized access to your GitHub account.
For more information on generating a GitHub token, visit: www.github.com/settings/tokens

4. **Start Production Deployment**
```bash
# Build the frontend
cd frontend
npm run build

# Start production server
cd backend
npm start
```
The application will be available at http://localhost:3001

## 🛠 Technology Stack
**Frontend**
React 18 - UI framework
Vite - Build tool and dev server
Tailwind CSS - Styling and design system
React Router - Client-side routing
React Query - Data fetching and state management (to be updated)
Framer Motion - Animations
Lucide React - Icons

**Backend**
Node.js - Runtime environment
Express.js - Web framework
GitHub REST API - Repository and file access
CORS - Cross-origin resource sharing

## Special Note:
Due to the limited speed and access of Github Access Token, the maximum processing file per request has been set to 15. If you want to change this limit, please visit github.js in backend/utils folder, and change the following codes.
```javascript
// Process the first 15 notebook files
const notebooks = [];
  for (const item of items.slice(0, 15)) { // change this number to the maximum number of files you want the token to process per request
    try {
      console.log(`Processing: ${item.path}`);
      ...
```

## Visual Images
### Import Repository
<img width="1467" height="1090" alt="image" src="https://github.com/user-attachments/assets/ce0defec-49cd-4b50-981f-0a8184f92030" />

### Backend Processing
<img width="744" height="145" alt="image" src="https://github.com/user-attachments/assets/0cc11707-61b2-4596-a731-21a0e8394bb4" />

### Library (after importing)
<img width="2487" height="1437" alt="image" src="https://github.com/user-attachments/assets/a6b22ed8-292b-4a92-a2c2-e85f82d4b7a3" />

### Browse Jupyter Notebook
<img width="2499" height="1056" alt="image" src="https://github.com/user-attachments/assets/a9d77646-edb2-47c3-aaf5-3f8392ab3ebf" />

### Expand All Cells
<img width="1744" height="1344" alt="image" src="https://github.com/user-attachments/assets/4db4e041-5702-4dc5-9335-710ad7fa5f21" />

### Run Code
<img width="1212" height="1222" alt="image" src="https://github.com/user-attachments/assets/33a74d9d-8093-411f-a459-b7c8010f4095" />

### Quick Stats
<img width="394" height="198" alt="image" src="https://github.com/user-attachments/assets/dbee43c5-1ee3-4751-92c9-9892d4990ab8" />


