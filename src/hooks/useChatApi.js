import { useCallback, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/chatbot/ask`;

export const useChatApi = (apiKey, visitorId, sessionId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("check visitor id ", visitorId);
  console.log("check session id ", sessionId);

  const sendMessage = useCallback(
    async (message) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
            "X-Visitor-ID": visitorId,
            "X-Session-ID": sessionId,
          },
          body: JSON.stringify({ message }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || data.error || "Failed to get response",
          );
        }

        return data.answer || "No response received.";
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, visitorId, sessionId],
  );

  return { sendMessage, isLoading, error };
};
