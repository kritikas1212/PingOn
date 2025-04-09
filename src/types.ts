export type Website = {
  id: number;
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastChecked: string;
  sslInfo?: {
    validFrom: string;
    validTo: string;
    issuer: string;
    details?: {
      commonName?: string;
      organization?: string;
      organizationalUnit?: string;
      country?: string;
    };
  };
  checks: Array<{
    timestamp: string;
    status: 'operational' | 'degraded' | 'down';
    responseTime: number;
  }>;
};