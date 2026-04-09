import { useRemoteContentData } from '../context/RemoteContentContext';
import { Language } from '../translations';

export const useRemoteContent = (language: Language) => {
  const data = useRemoteContentData();

  /**
   * Helper to get text from remote content with a local fallback.
   * Handles language suffixes (e.g. heroTitleCs vs heroTitle).
   */
  const t = (keyBase: string, localFallback: string) => {
    if (!data.content) return localFallback;

    const keyEn = keyBase;
    const keyCs = `${keyBase}Cs`;

    if (language === 'cs') {
      return data.content[keyCs] || data.content[keyEn] || localFallback;
    }
    return data.content[keyEn] || localFallback;
  };

  /**
   * Helper for settings-based texts that might not follow the content naming convention.
   */
  const getSetting = (key: string, localFallback: any) => {
    if (!data.settings) return localFallback;
    return data.settings[key] || localFallback;
  };

  return {
    ...data,
    t,
    getSetting,
  };
};
