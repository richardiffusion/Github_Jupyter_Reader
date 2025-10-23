import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout'
import Library from './pages/library'
import Upload from './pages/upload'
import Viewer from './pages/viewer'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/library" element={<Library />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/viewer" element={<Viewer />} />
        {/* added a catch-all route */}
        <Route path="*" element={<Library />} />
      </Routes>
    </Layout>
  )
}

export default App