import { Website } from '../types';

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

function parseIssuerDetails(issuerString: string) {
  const details: Website['sslInfo']['details'] = {};
  
  // Extract CN (Common Name)
  const cnMatch = issuerString.match(/CN\s*=\s*([^,]+)/i);
  if (cnMatch) details.commonName = cnMatch[1].trim();
  
  // Extract O (Organization)
  const oMatch = issuerString.match(/O\s*=\s*([^,]+)/i);
  if (oMatch) details.organization = oMatch[1].trim();
  
  // Extract OU (Organizational Unit)
  const ouMatch = issuerString.match(/OU\s*=\s*([^,]+)/i);
  if (ouMatch) details.organizationalUnit = ouMatch[1].trim();
  
  // Extract C (Country)
  const cMatch = issuerString.match(/C\s*=\s*([^,]+)/i);
  if (cMatch) details.country = cMatch[1].trim();
  
  return details;
}

async function getSSLInfo(url: string): Promise<Website['sslInfo'] | undefined> {
  try {
    const hostname = new URL(url).hostname;
    
    // Try multiple SSL checking services
    const sslCheckers = [
      async () => {
        const response = await fetch(`https://api.certspotter.com/v1/issuances?domain=${hostname}&expand=dns_names&expand=issuer`, {
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('CertSpotter check failed');
        
        const certs = await response.json();
        if (!certs || certs.length === 0) throw new Error('No certificates found');
        
        const validCert = certs
          .filter((cert: any) => new Date(cert.not_after) > new Date())
          .sort((a: any, b: any) => new Date(b.not_after).getTime() - new Date(a.not_after).getTime())[0];
          
        if (!validCert) throw new Error('No valid certificate found');
        
        return {
          validFrom: new Date(validCert.not_before).toISOString(),
          validTo: new Date(validCert.not_after).toISOString(),
          issuer: validCert.issuer.name,
          details: parseIssuerDetails(validCert.issuer.name)
        };
      },
      async () => {
        const response = await fetch(`https://crt.sh/?q=${hostname}&output=json`);
        if (!response.ok) throw new Error('crt.sh check failed');
        
        const certs = await response.json();
        if (!certs || certs.length === 0) throw new Error('No certificates found');
        
        const validCert = certs
          .filter((cert: any) => new Date(cert.not_after) > new Date())
          .sort((a: any, b: any) => new Date(b.not_after).getTime() - new Date(a.not_after).getTime())[0];
          
        if (!validCert) throw new Error('No valid certificate found');
        
        return {
          validFrom: validCert.not_before,
          validTo: validCert.not_after,
          issuer: validCert.issuer_name,
          details: parseIssuerDetails(validCert.issuer_name)
        };
      }
    ];

    // Try each SSL checker until one succeeds
    for (const checker of sslCheckers) {
      try {
        const sslInfo = await checker();
        if (sslInfo) {
          // Simplify issuer name for display
          const issuerName = sslInfo.details?.organization || 
                           sslInfo.details?.commonName || 
                           'Unknown Issuer';

          // Determine certificate type
          const certType = 
            /EV/i.test(sslInfo.issuer) ? 'EV SSL' :
            /OV/i.test(sslInfo.issuer) ? 'OV SSL' :
            /DV/i.test(sslInfo.issuer) ? 'DV SSL' :
            'SSL';

          return {
            validFrom: sslInfo.validFrom,
            validTo: sslInfo.validTo,
            issuer: `${issuerName} ${certType}`,
            details: sslInfo.details
          };
        }
      } catch (error) {
        console.warn('SSL checker failed:', error);
        continue;
      }
    }
    
    throw new Error('All SSL checks failed');
  } catch (error) {
    console.error('Failed to check SSL:', error);
    return undefined;
  }
}

export async function checkWebsite(url: string): Promise<{
  status: Website['status'];
  responseTime: number;
  sslInfo?: Website['sslInfo'];
}> {
  try {
    let response: Response | null = null;
    let startTime = 0;
    let endTime = 0;

    // Try direct request first
    try {
      startTime = performance.now();
      response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      endTime = performance.now();
    } catch (error) {
      // If direct request fails, try CORS proxies
      for (const proxy of CORS_PROXIES) {
        try {
          const encodedUrl = encodeURIComponent(url);
          startTime = performance.now();
          response = await fetch(`${proxy}${encodedUrl}`, {
            method: 'HEAD',
            cache: 'no-cache'
          });
          endTime = performance.now();
          if (response.ok) break;
        } catch (error) {
          console.warn(`Proxy ${proxy} failed:`, error);
          continue;
        }
      }
    }

    if (!response) {
      throw new Error('All requests failed');
    }

    const responseTime = Math.round(endTime - startTime);
    const sslInfo = url.startsWith('https://') ? await getSSLInfo(url) : undefined;

    return {
      status: response.type === 'opaque' || response.ok ? 'operational' : 'degraded',
      responseTime,
      sslInfo
    };
  } catch (error) {
    console.error(`Failed to check ${url}:`, error);
    return {
      status: 'down',
      responseTime: 0,
      sslInfo: url.startsWith('https://') ? await getSSLInfo(url) : undefined
    };
  }
}
