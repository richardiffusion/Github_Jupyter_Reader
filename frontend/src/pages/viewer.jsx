import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Github, ExternalLink, Download, Play, Square } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

export default function Viewer() {
  const urlParams = new URLSearchParams(window.location.search);
  const repoId = urlParams.get("repo");
  const notebookPath = urlParams.get("path");
  const [expandedCells, setExpandedCells] = useState(new Set());

  const { data: repository, isLoading } = useQuery({
    queryKey: ['repository', repoId],
    queryFn: async () => {
      const repos = await apiClient.entities.Repository.list();
      return repos.find(r => r.id === repoId);
    },
    enabled: !!repoId,
  });

  const notebook = repository?.notebooks?.find(nb => nb.path === notebookPath);

  const toggleCell = (index) => {
    const newExpanded = new Set(expandedCells);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCells(newExpanded);
  };

  const downloadNotebook = () => {
    if (!notebook) return;
    
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

  const renderCell = (cell, index) => {
    const isExpanded = expandedCells.has(index);
    
    if (cell.cell_type === "markdown") {
      const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
      return (
        <div key={index} className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            onClick={() => toggleCell(index)}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Markdown</span>
            </div>
            <div className="text-sm text-gray-500">
              {isExpanded ? 'Collapse' : 'Expand'}
            </div>
          </div>
          {isExpanded && (
            <div className="p-6 border-t border-gray-200">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{source}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (cell.cell_type === "code") {
      const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
      const outputs = cell.outputs || [];
      const hasOutputs = outputs.length > 0;
      
      return (
        <div key={index} className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            onClick={() => toggleCell(index)}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Code</span>
              {hasOutputs && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {outputs.length} output{outputs.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {isExpanded ? 'Collapse' : 'Expand'}
            </div>
          </div>
          
          {isExpanded && (
            <>
              <div className="border-t border-gray-200">
                <div className="bg-gray-900 p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                    <code>{source}</code>
                  </pre>
                </div>
              </div>
              
              {hasOutputs && (
                <div className="border-t border-gray-200">
                  <div className="p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Outputs:</h4>
                    <div className="space-y-3">
                      {outputs.map((output, outIdx) => {
                        if (output.output_type === "stream") {
                          const text = Array.isArray(output.text) ? output.text.join('') : output.text;
                          return (
                            <div key={outIdx} className="bg-white p-3 rounded border">
                              <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap text-green-600">
                                {text}
                              </pre>
                            </div>
                          );
                        }
                        if (output.output_type === "execute_result" || output.output_type === "display_data") {
                          if (output.data && output.data["text/plain"]) {
                            const text = Array.isArray(output.data["text/plain"]) 
                              ? output.data["text/plain"].join('') 
                              : output.data["text/plain"];
                            return (
                              <div key={outIdx} className="bg-white p-3 rounded border">
                                <pre className="text-sm text-gray-700 font-mono">
                                  {text}
                                </pre>
                              </div>
                            );
                          }
                          if (output.data && output.data["text/html"]) {
                            const html = Array.isArray(output.data["text/html"]) 
                              ? output.data["text/html"].join('') 
                              : output.data["text/html"];
                            return (
                              <div key={outIdx} className="bg-white p-3 rounded border">
                                <div dangerouslySetInnerHTML={{ __html: html }} />
                              </div>
                            );
                          }
                          if (output.data && output.data["image/png"]) {
                            const imageData = output.data["image/png"];
                            return (
                              <div key={outIdx} className="bg-white p-3 rounded border">
                                <img 
                                  src={`data:image/png;base64,${imageData}`} 
                                  alt="Output plot" 
                                  className="max-w-full h-auto"
                                />
                              </div>
                            );
                          }
                        }
                        if (output.output_type === "error") {
                          return (
                            <div key={outIdx} className="bg-red-50 p-3 rounded border border-red-200">
                              <pre className="text-sm text-red-700 font-mono">
                                <span className="font-bold">{output.ename}:</span> {output.evalue}
                                {output.traceback && (
                                  <div className="mt-2 text-red-600">
                                    {output.traceback.join('\n')}
                                  </div>
                                )}
                              </pre>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div key={index} className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm font-medium text-yellow-800">Unknown cell type: {cell.cell_type}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <Card className="p-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </Card>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notebook Not Found</h2>
          <Link to={createPageUrl("Library")}>
            <Button>Back to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cells = notebook.content?.cells || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link to={createPageUrl("Library")}>
                <Button variant="outline" size="icon" className="flex-shrink-0 rounded-xl">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {notebook.name}
                </h1>
                <p className="text-sm text-gray-500 truncate">{repository.repo_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={downloadNotebook}
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Download</span>
              </Button>
              <a
                href={repository.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  <span className="hidden md:inline">View on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Notebook Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Card className="bg-white shadow-xl border-2 border-gray-200">
          <div className="p-6 md:p-10">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Notebook Info</h3>
                  <p className="text-sm text-blue-700">
                    {cells.length} cells • Click on any cell to expand/collapse
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    const allExpanded = new Set(cells.map((_, idx) => idx));
                    setExpandedCells(allExpanded);
                  }}
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Expand All
                </Button>
              </div>
            </div>

            {cells.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>This notebook appears to be empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cells.map((cell, index) => renderCell(cell, index))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}