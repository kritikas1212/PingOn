import { useState, useEffect, useCallback, useRef } from 'react';
import { Website } from '../types';
import { checkWebsite } from '../utils/monitoring';

const CHECK_INTERVAL = 30000; // 30 seconds

export function useMonitoring(websites: Website[], setWebsites: React.Dispatch<React.SetStateAction<Website[]>>) {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const mountedRef = useRef(true);
  const lastCheckTimeRef = useRef<number>(0);
  const isCheckingRef = useRef(false);

  const checkSingleWebsite = useCallback(async (website: Website): Promise<Website> => {
    try {
      const result = await checkWebsite(website.url);
      const timestamp = new Date().toISOString();
      
      const checks = [
        {
          timestamp,
          status: result.status,
          responseTime: result.responseTime
        },
        ...(website.checks || [])
      ].slice(0, 48);

      const operationalChecks = checks.filter(check => check.status === 'operational').length;
      const uptime = checks.length > 0 ? (operationalChecks / checks.length) * 100 : 100;

      return {
        ...website,
        status: result.status,
        responseTime: result.responseTime,
        uptime: Math.round(uptime * 100) / 100,
        lastChecked: timestamp,
        checks,
        sslInfo: result.sslInfo || website.sslInfo
      };
    } catch (error) {
      console.error(`Check failed for ${website.url}:`, error);
      return {
        ...website,
        status: 'down',
        responseTime: 0,
        lastChecked: new Date().toISOString()
      };
    }
  }, []);

  const scheduleNextCheck = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTimeRef.current;
    const nextCheckDelay = Math.max(0, CHECK_INTERVAL - timeSinceLastCheck);
    
    setTimeout(() => {
      if (mountedRef.current && isMonitoring && !isCheckingRef.current) {
        updateWebsites();
      }
    }, nextCheckDelay);
  }, [isMonitoring]);

  const updateWebsites = useCallback(async () => {
    if (!mountedRef.current || !isMonitoring || websites.length === 0 || isCheckingRef.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTimeRef.current;
    
    if (timeSinceLastCheck < CHECK_INTERVAL) {
      scheduleNextCheck();
      return;
    }

    isCheckingRef.current = true;
    lastCheckTimeRef.current = now;

    try {
      const results = await Promise.all(
        websites.map(website => checkSingleWebsite(website))
      );

      if (mountedRef.current) {
        setWebsites(prev => {
          const updated = [...prev];
          results.forEach(result => {
            const index = updated.findIndex(w => w.id === result.id);
            if (index !== -1) {
              updated[index] = result;
            }
          });
          return updated;
        });
      }
    } finally {
      isCheckingRef.current = false;
      scheduleNextCheck();
    }
  }, [websites, isMonitoring, checkSingleWebsite, setWebsites, scheduleNextCheck]);

  // Initial check for new websites only
  useEffect(() => {
    const newWebsites = websites.filter(
      website => !website.lastChecked || !website.checks?.length
    );
    
    if (newWebsites.length > 0 && !isCheckingRef.current) {
      const checkNew = async () => {
        isCheckingRef.current = true;
        try {
          const results = await Promise.all(
            newWebsites.map(website => checkSingleWebsite(website))
          );
          
          if (mountedRef.current) {
            setWebsites(prev => {
              const updated = [...prev];
              results.forEach(result => {
                const index = updated.findIndex(w => w.id === result.id);
                if (index !== -1) {
                  updated[index] = result;
                }
              });
              return updated;
            });
          }
        } finally {
          isCheckingRef.current = false;
        }
      };
      
      checkNew();
    }
  }, [websites.length, checkSingleWebsite, setWebsites]);

  // Start monitoring
  useEffect(() => {
    mountedRef.current = true;
    
    if (!isCheckingRef.current) {
      updateWebsites();
    }

    return () => {
      mountedRef.current = false;
      isCheckingRef.current = false;
    };
  }, [updateWebsites]);

  return { isMonitoring, setIsMonitoring };
}