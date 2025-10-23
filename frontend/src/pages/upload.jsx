import React, { useState } from "react";
import { apiClient } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, Upload, Download, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function UploadPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (url) => {
      setIsProcessing(true);
      setError(null);
      setProgress("Validating repository URL...");

      const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!repoMatch) {
        throw new Error("Invalid GitHub URL. Please use format: https://github.com/username/repository");
      }

      const repoName = `${repoMatch[1]}/${repoMatch[2]}`.replace(/\.git$/, '');
      
      setProgress("Searching for Jupyter notebooks...");
      
      console.log('Creating repository with:', { repo_url: url, repo_name: repoName });
      
      // Automatically create the repository entry
      const repository = await apiClient.entities.Repository.create({
        repo_url: url,
        repo_name: repoName
      });

      return repository;
    },
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      setProgress("Complete! Redirecting to library...");
      setTimeout(() => {
        navigate(createPageUrl("Library"));
      }, 1000);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setError(error.message);
      setIsProcessing(false);
      setProgress("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError("Please enter a repository URL");
      return;
    }
    uploadMutation.mutate(repoUrl);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Library")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import Repository</h1>
            <p className="text-gray-600 mt-1">Fetch Jupyter notebooks from GitHub</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-purple-200 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Github className="w-6 h-6 text-white" />
                </div>
                GitHub Repository
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="repo-url" className="text-lg font-medium">
                    Repository URL
                  </Label>
                  <Input
                    id="repo-url"
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={isProcessing}
                    className="h-12 text-lg"
                  />
                  <p className="text-sm text-gray-500">
                    Enter the full GitHub repository URL containing Jupyter notebooks
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isProcessing && progress && (
                  <Alert className="border-purple-200 bg-purple-50">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <AlertDescription className="ml-2">{progress}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Import Repository
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  How it works
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Paste your GitHub repository URL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>We'll automatically find all Jupyter notebook files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Browse and read them in your library</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}