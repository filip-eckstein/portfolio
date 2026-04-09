import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RemoteContent {
  content: any;
  settings: any;
  projects: any[];
  achievements: any[];
  testimonials: any[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const RemoteContentContext = createContext<RemoteContent | undefined>(undefined);

export const RemoteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Omit<RemoteContent, 'loading' | 'refresh'>>({
    content: null,
    settings: null,
    projects: [],
    achievements: [],
    testimonials: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      };
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e`;

      const [contentRes, settingsRes, projectsRes, achievementsRes, testimonialsRes] = await Promise.all([
        fetch(`${baseUrl}/content`, { headers }),
        fetch(`${baseUrl}/settings`, { headers }),
        fetch(`${baseUrl}/projects`, { headers }),
        fetch(`${baseUrl}/admin/achievements`, { headers }),
        fetch(`${baseUrl}/admin/testimonials`, { headers }),
      ]);

      const [contentData, settingsData, projectsData, achievementsData, testimonialsData] = await Promise.all([
        contentRes.ok ? contentRes.json() : { content: null },
        settingsRes.ok ? settingsRes.json() : { settings: null },
        projectsRes.ok ? projectsRes.json() : { projects: [] },
        achievementsRes.ok ? achievementsRes.json() : { achievements: [] },
        testimonialsRes.ok ? testimonialsRes.json() : { testimonials: [] },
      ]);

      setData({
        content: contentData.content,
        settings: settingsData.settings,
        projects: projectsData.projects || [],
        achievements: achievementsData.achievements || [],
        testimonials: testimonialsData.testimonials || [],
      });
    } catch (error) {
      console.error('Failed to fetch remote content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <RemoteContentContext.Provider value={{ ...data, loading, refresh: fetchData }}>
      {children}
    </RemoteContentContext.Provider>
  );
};

export const useRemoteContentData = () => {
  const context = useContext(RemoteContentContext);
  if (context === undefined) {
    throw new Error('useRemoteContentData must be used within a RemoteContentProvider');
  }
  return context;
};
