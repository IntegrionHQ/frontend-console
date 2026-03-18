'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  GitBranch, 
  Github, 
  Play, 
  ExternalLink, 
  Settings, 
  Clock, 
  Shield, 
  Activity,
  Code,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Sparkles
} from 'lucide-react';
import { useProjects } from '@/hooks';
import { useUser } from '@/app/store/global/context/userContext';
import { projectService } from '@/lib/api';
import type { Project } from '@/lib/api/types';

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getById(id);
        if (response.data) {
          setProject(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  const handleRunTests = async () => {
    if (!project || !user?.authCode) {
      setTestResult({
        success: false,
        message: 'Authentication token or project data missing.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await projectService.initiateTest({
        accessToken: user.authCode,
        repo: project.projectUrl,
        branch: project.projectBranch
      });

      if (response.code < 300) {
        setTestResult({
          success: true,
          message: 'Repository access validated and test sequence initiated successfully.'
        });
      } else {
        setTestResult({
          success: false,
          message: response.message || 'Failed to initiate tests.'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'An unexpected error occurred during test execution.'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <p className="mt-4 text-gray-500 font-aeonik-light">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold mt-4">Project not found</h2>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-6 text-black font-semibold flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-black tracking-tight">{project.projectName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-gray-100 text-gray-500">Active</span>
            </div>
            <p className="text-gray-500 font-aeonik-light mt-1">{project.projectDescription || 'No description provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <Settings size={18} className="text-gray-600" />
          </button>
          <button 
            onClick={handleRunTests}
            disabled={testing}
            className="bg-black hover:bg-neutral-800 px-6 py-2.5 rounded-md text-white flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4 fill-white" />
            )}
            <span className="text-sm font-semibold">Run Endpoints Test</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Test Status Banner */}
          {testResult && (
            <div className={`p-4 rounded-lg flex items-start gap-3 border ${testResult.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              {testResult.success ? <CheckCircle2 className="text-green-600 size-5 mt-0.5" /> : <AlertCircle className="text-red-600 size-5 mt-0.5" />}
              <div>
                <p className={`text-sm font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.success ? 'Success' : 'Execution Error'}
                </p>
                <p className={`text-xs mt-0.5 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Project Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Code size={16} className="text-gray-400" /> Repository Overview
              </h3>
              <a 
                href={project.projectUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Open in GitHub <ExternalLink size={10} />
              </a>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Status</p>
                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                  <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                  Synced
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Branch</p>
                <div className="flex items-center gap-2 text-sm text-black font-semibold">
                  <GitBranch size={14} />
                  {project.projectBranch}
                </div>
              </div>
              <div className="col-span-2 pt-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Repository URL</p>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-xs font-mono text-gray-600 break-all">
                  {project.projectUrl}
                </div>
              </div>
            </div>
          </div>

          {/* Activity/Logs Placeholder */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg tracking-tight px-1">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { label: 'Project Created', date: new Date(project.createdAt).toLocaleDateString(), icon: Plus, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Repository Synced', date: 'Just now', icon: Activity, color: 'text-green-500', bg: 'bg-green-50' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-all cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-md ${item.bg}`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">{item.label}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">{item.date}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-sm tracking-tight border-b border-gray-100 pb-3">Developer Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-neutral-100">
                  <Github size={16} className="text-neutral-700" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Git Provider</p>
                  <p className="text-xs font-semibold text-black">GitHub</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-neutral-100">
                  <Shield size={16} className="text-neutral-700" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visibility</p>
                  <p className="text-xs font-semibold text-black">Public Repository</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-neutral-100">
                  <Clock size={16} className="text-neutral-700" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Created At</p>
                  <p className="text-xs font-semibold text-black">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 text-white overflow-hidden relative group">
            <div className="relative z-10">
              <div className="p-2 bg-white/10 rounded-md w-fit mb-4">
                <Sparkles size={20} className="text-white" />
              </div>
              <h4 className="font-bold text-lg mb-2">Automate Tests</h4>
              <p className="text-xs text-white/60 font-aeonik-light leading-relaxed mb-6">
                Integrion automatically scans your repository to detect endpoints and generate relevant test cases for your development ecosystem.
              </p>
              <button 
                onClick={handleRunTests}
                className="w-full py-2.5 bg-white text-black text-sm font-bold rounded-md hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                Learn More
              </button>
            </div>
            {/* Background elements */}
            <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple icon for list
const ChevronRight = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default ProjectDetailPage;
