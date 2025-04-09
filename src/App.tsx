import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, Github } from 'lucide-react';
import WebsiteCard from './components/WebsiteCard';
import StatusBadge from './components/StatusBadge';
import AddWebsiteModal from './components/AddWebsiteModal';
import { Website } from './types';
import EmptyState from './components/EmptyState';
import { useMonitoring } from './hooks/useMonitoring';

function App() {
  const [websites, setWebsites] = useState<Website[]>(() => {
    try {
      const saved = localStorage.getItem('websites');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load websites from localStorage:', error);
      return [];
    }
  });

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  }));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isMonitoring } = useMonitoring(websites, setWebsites);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('websites', JSON.stringify(websites));
    } catch (error) {
      console.error('Failed to save websites to localStorage:', error);
    }
  }, [websites]);

  const handleAddWebsite = useCallback((website: Pick<Website, 'name' | 'url'>) => {
    const newWebsite: Website = {
      ...website,
      id: Date.now(),
      lastChecked: new Date().toISOString(),
      status: 'operational',
      responseTime: 0,
      uptime: 100,
      checks: []
    };

    setWebsites(prevWebsites => [...prevWebsites, newWebsite]);
    setIsModalOpen(false);
  }, []);

  const handleDeleteWebsite = useCallback((id: number) => {
    setWebsites(prevWebsites => prevWebsites.filter(w => w.id !== id));
  }, []);

  const overallStatus = websites.length > 0
    ? websites.every(w => w.status === 'operational') ? 'operational' : 'degraded'
    : 'operational';

  const averageUptime = websites.length > 0
    ? Math.round((websites.reduce((acc, curr) => acc + curr.uptime, 0) / websites.length) * 100) / 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <header className="border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20"></div>
                <div className="relative bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl p-2">
                  <svg
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                    <path d="M3 19h18" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
                  StatusWatch
                </h1>
                <a
                  href="https://github.com/sioaeko/statuswatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full border border-slate-700/50 hover:border-slate-600"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-slate-400" />
              <span className="text-slate-400 tabular-nums">
                {currentTime}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {websites.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-medium mb-2">System Status</h3>
                <StatusBadge status={overallStatus} />
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-medium mb-2">Average Uptime</h3>
                <p className="text-3xl font-bold text-blue-400">{averageUptime}%</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-medium mb-2">Monitored Services</h3>
                <p className="text-3xl font-bold text-purple-400">{websites.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {websites.map(website => (
                <WebsiteCard 
                  key={website.id} 
                  website={website} 
                  onDelete={() => handleDeleteWebsite(website.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 transition-colors px-6 py-3 rounded-full font-medium shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Website
        </button>
      </main>

      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWebsite}
      />
    </div>
  );
}

export default App;