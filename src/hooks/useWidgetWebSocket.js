import { useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^https/, 'wss').replace(/^http/, 'ws');

export function useWidgetWebSocket({ apiKey, sessionId, onOwnerReply, onTakeoverChange }) {
  const onOwnerReplyRef = useRef(onOwnerReply);
  const onTakeoverChangeRef = useRef(onTakeoverChange);

  useEffect(() => { onOwnerReplyRef.current = onOwnerReply; }, [onOwnerReply]);
  useEffect(() => { onTakeoverChangeRef.current = onTakeoverChange; }, [onTakeoverChange]);

  useEffect(() => {
    if (!apiKey || !sessionId) return;

    const url = `${WS_BASE}/api/chatbot/ws?apiKey=${encodeURIComponent(apiKey)}&sessionId=${encodeURIComponent(sessionId)}`;
    let ws;
    let pingInterval;
    let reconnectTimeout;
    let unmounted = false;

    function connect() {
      ws = new WebSocket(url);

      ws.onopen = () => {
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'owner_reply') {
            onOwnerReplyRef.current?.(data.content);
          } else if (data.type === 'takeover_status') {
            onTakeoverChangeRef.current?.(data.active);
          }
        } catch {}
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        if (!unmounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      unmounted = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [apiKey, sessionId]);
}
