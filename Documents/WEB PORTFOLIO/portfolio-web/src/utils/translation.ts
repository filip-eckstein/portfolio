import { projectId, publicAnonKey } from './supabase/info';

export async function translateText(
  text: string, 
  token: string, 
  sourceLang: string = 'cs', 
  targetLang: string = 'en'
): Promise<string | null> {
  if (!text || text.trim() === '') {
    return null;
  }

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/translate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Admin-Token': token,
      },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('Translation API error:', response.status, errorData);
    throw new Error(errorData.error || `HTTP ${response.status}: Translation failed`);
  }

  const data = await response.json();
  return data.translatedText || null;
}