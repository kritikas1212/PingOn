import React from 'react';

type StatusBadgeProps = {
  status: 'operational' | 'degraded' | 'down';
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'down':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
      <span className="relative flex h-2 w-2 mr-2 mt-1">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'operational' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'operational' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
      </span>
      {getStatusText()}
    </span>
  );
};

export default StatusBadge;