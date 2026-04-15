import { useEffect, useState } from 'react';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/chatbot/history`;

/**
 * Fetches previous messages for the current session from the backend.
 * Returns { messages, isLoading } where messages is an array of
 * { role: 'user' | 'assistant', text: string }.
 */
export const useSessionHistory = (apiKey, sessionId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(!!(apiKey && sessionId));

  useEffect(() => {
    if (!apiKey || !sessionId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const fetchHistory = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: {
            'X-API-Key': apiKey,
            'X-Session-ID': sessionId,
          },
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch {
        // Network error — start with empty history
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => { cancelled = true; };
  }, [apiKey, sessionId]);

  return { messages, isLoading };
};
