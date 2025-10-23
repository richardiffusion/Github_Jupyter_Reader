import React, { useState } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Upload, FileCode, Github, Calendar, Download } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Library() {
  const { data: repositories, isLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => apiClient.entities.Repository.list("-created_date"),
    initialData: [],
  });

  const allNotebooks = repositories.flatMap(repo => 
    (repo.notebooks || []).map(notebook => ({
      ...notebook,
      repo_name: repo.repo_name,
      repo_url: repo.repo_url,
      repo_id: repo.id,
      created_date: repo.created_date
    }))
  );

  const handleDownload = (notebook, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const contentStr = JSON.stringify(notebook.content, null, 2);
    const blob = new Blob([contentStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = notebook.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Github Jupyter Library
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Browse and read your Jupyter notebooks from GitHub repositories
          </p>
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg px-8 py-6 text-lg">
              <Download className="w-5 h-5 mr-2" />
              Import New Repository
            </Button>
          </Link>
        </div>

        {/* Stats Bar */}
        {!isLoading && allNotebooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Github className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Repositories</p>
                  <p className="text-3xl font-bold text-gray-900">{repositories.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Notebooks</p>
                  <p className="text-3xl font-bold text-gray-900">{allNotebooks.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Last Updated</p>
                  <p className="text-lg font-bold text-gray-900">
                    {format(new Date(repositories[0]?.created_date || new Date()), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notebooks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : allNotebooks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Notebooks Yet</h2>
            <p className="text-gray-600 mb-8">
              Import your first GitHub repository to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNotebooks.map((notebook, index) => (
              <motion.div
                key={`${notebook.repo_id}-${notebook.path}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={`${createPageUrl("Viewer")}?repo=${notebook.repo_id}&path=${encodeURIComponent(notebook.path)}`}
                  className="block group"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <FileCode className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-purple-700 transition-colors">
                          {notebook.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{notebook.repo_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Github className="w-3 h-3" />
                      <span className="truncate">{notebook.path}</span>
                    </div>

                    {/* Download Button */}
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDownload(notebook, e)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}