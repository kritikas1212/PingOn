import React, { useState, useMemo } from 'react';
import { ArrowUpRight, Clock, Globe, Shield, AlertTriangle, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import WebsiteDetailsModal from './WebsiteDetailsModal';
import { Website } from '../types';

type WebsiteCardProps = {
  website: Website;
  onDelete: () => void;
};

const WebsiteCard: React.FC<WebsiteCardProps> = React.memo(({ website, onDelete }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const faviconUrl = useMemo(() => 
    `https://www.google.com/s2/favicons?domain=${website.url}&sz=32`,
    [website.url]
  );

  const sslInfo = useMemo(() => {
    if (!website.sslInfo?.validTo) return null;
    
    const validTo = new Date(website.sslInfo.validTo);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'valid' | 'expiring' | 'expired' = 'valid';
    if (daysUntilExpiry <= 0) status = 'expired';
    else if (daysUntilExpiry <= 30) status = 'expiring';
    
    // Parse issuer information
    const issuerParts = website.sslInfo.issuer.split(' ');
    const certType = issuerParts.find(part => 
      /^(EV|OV|DV|SSL|TLS)$/i.test(part)
    ) || 'SSL';
    const issuerName = issuerParts.filter(part => 
      !/^(EV|OV|DV|SSL|TLS)$/i.test(part)
    ).join(' ');
    
    return { 
      daysUntilExpiry, 
      status,
      validTo: validTo.toLocaleDateString(),
      issuerName,
      certType
    };
  }, [website.sslInfo]);

  const sslDisplay = useMemo(() => {
    if (!website.url.startsWith('https://')) {
      return {
        icon: AlertTriangle,
        color: 'text-slate-400',
        text: 'No SSL (HTTP)',
        subText: 'Not Secure'
      };
    }
    
    if (!sslInfo) return { 
      icon: Shield, 
      color: 'text-slate-400', 
      text: 'Checking SSL...', 
      subText: null
    };
    
    switch (sslInfo.status) {
      case 'expired':
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          text: `SSL Expired (${sslInfo.validTo})`,
          subText: `${sslInfo.issuerName} ${sslInfo.certType}`
        };
      case 'expiring':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          text: `SSL expires in ${sslInfo.daysUntilExpiry}d`,
          subText: `${sslInfo.issuerName} ${sslInfo.certType}`
        };
      default:
        return {
          icon: Shield,
          color: 'text-emerald-400',
          text: `SSL Valid until ${sslInfo.validTo}`,
          subText: `${sslInfo.issuerName} ${sslInfo.certType}`
        };
    }
  }, [website.url, sslInfo]);

  const SSLIcon = sslDisplay.icon;

  return (
    <>
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 relative group transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={faviconUrl} 
              alt=""
              className="w-8 h-8 rounded-md bg-white/10 p-1"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PC9zdmc+';
              }}
            />
            <div>
              <h3 className="text-xl font-semibold mb-1">{website.name}</h3>
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="h-4 w-4" />
                <a 
                  href={website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {website.url}
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={website.status} />
            <button
              onClick={onDelete}
              className="text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
              title="Delete website"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Uptime</div>
            <div className="text-2xl font-bold tabular-nums">{website.uptime}%</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Response Time</div>
            <div className="text-2xl font-bold tabular-nums">{website.responseTime}ms</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <SSLIcon className={`h-4 w-4 ${sslDisplay.color}`} />
              <div className="text-slate-400 text-sm">SSL Certificate</div>
            </div>
            <div className={`text-sm font-medium ${sslDisplay.color}`}>
              {sslDisplay.text}
            </div>
            {sslDisplay.subText && (
              <div className="text-xs text-slate-400 mt-1 truncate">
                {sslDisplay.subText}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Last checked: {new Date(website.lastChecked).toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View Details
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isDetailsOpen && (
        <WebsiteDetailsModal
          website={website}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </>
  );
});

WebsiteCard.displayName = 'WebsiteCard';

export default WebsiteCard;