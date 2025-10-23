import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Upload, Library, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Library",
    url: createPageUrl("Library"),
    icon: Library,
  },
  {
    title: "Import Repository",
    url: createPageUrl("Import"),
    icon: Download,
  },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --color-primary: 139 92 246;
          --color-secondary: 236 72 153;
          --color-accent: 251 191 36;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Sidebar className="border-r border-orange-200 bg-white/80 backdrop-blur-sm w-72">
          {/* Simple Frontpage Layout */}
          <SidebarHeader className="border-b border-orange-200 p-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 text-lg truncate">
                  Notebook Library
                </h2>
                <p className="text-xs text-gray-600 truncate">
                  Your Jupyter Collection
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 rounded-xl mb-2 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm' 
                            : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Data Section */}
            <StatsSection />
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-purple-100 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">Notebook Library</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

// Data Section
function StatsSection() {
  const { data: repositories = [], isLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => apiClient.entities.Repository.list("-created_date"),
    initialData: [],
  });

  const totalRepositories = repositories.length;
  const totalNotebooks = repositories.reduce((total, repo) => 
    total + (repo.notebooks?.length || 0), 0
  );

  if (isLoading) {
    return (
      <div className="mt-6 px-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-blue-200 rounded w-1/2"></div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 bg-blue-200 rounded w-1/3"></div>
                <div className="h-3 bg-blue-200 rounded w-1/6"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-blue-200 rounded w-1/3"></div>
                <div className="h-3 bg-blue-200 rounded w-1/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 px-3">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
        <h3 className="font-semibold text-gray-900 text-xs mb-2">Quick Stats</h3>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>Repositories:</span>
            <span className="font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded text-xs">
              {totalRepositories}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Notebooks:</span>
            <span className="font-semibold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded text-xs">
              {totalNotebooks}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}