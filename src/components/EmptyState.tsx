import React from 'react';
import { Globe } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-slate-800/50 rounded-full p-6 mb-6">
        <Globe className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No websites monitored yet</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Start by adding your first website to monitor its status and performance.
      </p>
    </div>
  );
};

export default EmptyState;