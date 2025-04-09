import React, { useMemo } from 'react';
import { X, Clock, Activity, Shield, AlertTriangle, Lock, Calendar, Building2, Globe2 } from 'lucide-react';
import { Website } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type WebsiteDetailsModalProps = {
  website: Website;
  isOpen: boolean;
  onClose: () => void;
};

const WebsiteDetailsModal: React.FC<WebsiteDetailsModalProps> = ({ website, isOpen, onClose }) => {
  if (!isOpen) return null;

  const chartData = useMemo(() => {
    return (website.checks || []).map(check => ({
      time: new Date(check.timestamp).toLocaleTimeString(),
      responseTime: check.responseTime,
    })).reverse();
  }, [website.checks]);

  const sslStatus = useMemo(() => {
    if (!website.sslInfo) return null;
    
    const validTo = new Date(website.sslInfo.validTo);
    const daysUntilExpiry = Math.ceil(
      (validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    return {
      daysUntilExpiry,
      isExpired: daysUntilExpiry <= 0,
      isExpiringSoon: daysUntilExpiry > 0 && daysUntilExpiry <= 30,
      isValid: daysUntilExpiry > 30
    };
  }, [website.sslInfo]);

  const getStatusColor = (status: typeof sslStatus) => {
    if (!status) return 'text-slate-400';
    if (status.isExpired) return 'text-red-400';
    if (status.isExpiringSoon) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-4xl h-[80vh] overflow-hidden relative">
        <div className="sticky top-0 bg-slate-800 z-10 p-6 pb-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={`https://www.google.com/s2/favicons?domain=${website.url}&sz=32`}
                alt=""
                className="w-8 h-8 rounded-md bg-white/10 p-1"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PC9zdmc+';
                }}
              />
              <div>
                <h2 className="text-2xl font-bold">{website.name}</h2>
                <a 
                  href={website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  {website.url}
                </a>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(80vh-88px)]">
          {website.sslInfo && (
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-lg ${
                  sslStatus?.isExpired ? 'bg-red-500/10' :
                  sslStatus?.isExpiringSoon ? 'bg-yellow-500/10' :
                  'bg-emerald-500/10'
                }`}>
                  {sslStatus?.isExpired ? (
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  ) : sslStatus?.isExpiringSoon ? (
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <Shield className="h-6 w-6 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">SSL Certificate</h3>
                  <p className={`text-sm ${getStatusColor(sslStatus)}`}>
                    {sslStatus?.isExpired ? 'Certificate has expired' :
                     sslStatus?.isExpiringSoon ? `Expires in ${sslStatus.daysUntilExpiry} days` :
                     'Certificate is valid'}
                  </p>
                </div>
                <div className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium ${
                  sslStatus?.isExpired ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  sslStatus?.isExpiringSoon ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {website.sslInfo.issuer}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <h4 className="font-medium">Validity Period</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Valid From</p>
                          <p className="font-medium mt-1">
                            {new Date(website.sslInfo.validFrom).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-sm">Valid Until</p>
                          <p className={`font-medium mt-1 ${getStatusColor(sslStatus)}`}>
                            {new Date(website.sslInfo.validTo).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="relative pt-2">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-700">
                          {sslStatus && (
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, (sslStatus.daysUntilExpiry / 365) * 100))}%`
                              }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                sslStatus.isExpired ? 'bg-red-400' :
                                sslStatus.isExpiringSoon ? 'bg-yellow-400' :
                                'bg-emerald-400'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {website.sslInfo.details && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-purple-400" />
                        <h4 className="font-medium">Certificate Details</h4>
                      </div>
                      <div className="space-y-3">
                        {website.sslInfo.details.commonName && (
                          <div className="bg-slate-900/50 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1">Common Name (CN)</p>
                            <p className="font-medium text-sm">{website.sslInfo.details.commonName}</p>
                          </div>
                        )}
                        {website.sslInfo.details.organization && (
                          <div className="bg-slate-900/50 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1">Organization (O)</p>
                            <p className="font-medium text-sm">{website.sslInfo.details.organization}</p>
                          </div>
                        )}
                        {website.sslInfo.details.organizationalUnit && (
                          <div className="bg-slate-900/50 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1">Organizational Unit (OU)</p>
                            <p className="font-medium text-sm">{website.sslInfo.details.organizationalUnit}</p>
                          </div>
                        )}
                        {website.sslInfo.details.country && (
                          <div className="bg-slate-900/50 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1">Country (C)</p>
                            <p className="font-medium text-sm">{website.sslInfo.details.country}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className={`h-5 w-5 ${getStatusColor(sslStatus)}`} />
                      <h4 className="font-medium">Security Status</h4>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      sslStatus?.isExpired ? 'border-red-500/20 bg-red-500/10' :
                      sslStatus?.isExpiringSoon ? 'border-yellow-500/20 bg-yellow-500/10' :
                      'border-emerald-500/20 bg-emerald-500/10'
                    }`}>
                      <div className="flex items-start gap-3">
                        {sslStatus?.isExpired ? (
                          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                        ) : sslStatus?.isExpiringSoon ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        ) : (
                          <Shield className="h-5 w-5 text-emerald-400 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-medium ${getStatusColor(sslStatus)}`}>
                            {sslStatus?.isExpired ? 'Certificate Has Expired' :
                             sslStatus?.isExpiringSoon ? 'Certificate Expiring Soon' :
                             'Certificate Valid'}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            {sslStatus?.isExpired ?
                              'This certificate has expired and is no longer valid. The connection is not secure.' :
                              sslStatus?.isExpiringSoon ?
                              `This certificate will expire in ${sslStatus.daysUntilExpiry} days. Plan to renew it to maintain security.` :
                              'This certificate is valid and the connection is secure.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe2 className="h-5 w-5 text-emerald-400" />
                      <h4 className="font-medium">Certificate Timeline</h4>
                    </div>
                    <div className="relative pt-2">
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700"></div>
                      <div className="space-y-6">
                        <div className="relative pl-8">
                          <div className="absolute left-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-emerald-400"></div>
                          <p className="text-sm text-slate-400">Issued On</p>
                          <p className="font-medium">
                            {new Date(website.sslInfo.validFrom).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="relative pl-8">
                          <div className={`absolute left-0 w-4 h-4 rounded-full bg-slate-800 border-2 ${
                            sslStatus?.isExpired ? 'border-red-400' :
                            sslStatus?.isExpiringSoon ? 'border-yellow-400' :
                            'border-emerald-400'
                          }`}></div>
                          <p className="text-sm text-slate-400">Expires On</p>
                          <p className={`font-medium ${getStatusColor(sslStatus)}`}>
                            {new Date(website.sslInfo.validTo).toLocaleDateString()}
                            {sslStatus && (
                              <span className="block text-sm mt-1">
                                {sslStatus.isExpired ? 
                                  'Certificate has expired' : 
                                  `${sslStatus.daysUntilExpiry} days remaining`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Response Time History</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold">Check History</h3>
            </div>
            {website.checks && website.checks.length > 0 ? (
              <div className="space-y-3">
                {website.checks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${
                        check.status === 'operational' ? 'bg-emerald-500' :
                        check.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">
                        {new Date(check.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {check.responseTime}ms
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No check history available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteDetailsModal;