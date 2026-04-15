import { useEffect, useState } from "react";
import defaultSettings from "../config/settings.json";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches widget settings for the given apiKey from the backend.
 * Falls back to settings.json defaults if the key is missing, the
 * API returns 404, or a network error occurs.
 */
export const useWidgetSettings = (apiKey) => {
  const [config, setConfig] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(!!apiKey);

  useEffect(() => {
    if (!apiKey) return;

    let cancelled = false;
    setIsLoading(true);

    const fetchSettings = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/widget-settings/public/${apiKey}`
        );
        if (!cancelled && res.ok) {
          const data = await res.json();
          setConfig(data);
        }
        // 404 or other error → keep defaultSettings
      } catch {
        // Network error → keep defaultSettings
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchSettings();
    return () => { cancelled = true; };
  }, [apiKey]);

  return { config, isLoading };
};
