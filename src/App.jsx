import { useCallback, useEffect, useRef, useState } from 'react';
import tinycolor from 'tinycolor2';
import ChatHeader from './components/ChatHeader';
import MessageInput from './components/MessageInput';
import MessageList from './components/MessageList';
import { useChatApi } from './hooks/useChatApi';
import { useWidgetSettings } from './hooks/useWidgetSettingsApi';
import { useSessionHistory } from './hooks/useSessionHistory';
import { useWidgetWebSocket } from './hooks/useWidgetWebSocket';
import { getSessionId, getVisitorId, resetSessionId } from './utils/session';
import LandingPage from './components/LandingPage';

function App() {
  const [messages, setMessages] = useState([]);
  const [visitorId] = useState(getVisitorId());
  const [sessionId, setSessionId] = useState(getSessionId());

  const queryParams = new URLSearchParams(window.location.search);
  const rawApiKey = queryParams.get('apiKey') || '';
  const hasApiKey = !!rawApiKey;

  // Fetch widget settings from backend (falls back to settings.json if not found)
  const { config, isLoading: configLoading } = useWidgetSettings(hasApiKey ? rawApiKey : null);

  // Fetch previous messages for this session
  const { messages: historyMessages, isLoading: historyLoading } = useSessionHistory(
    hasApiKey ? rawApiKey : null,
    sessionId,
  );

  // Custom Hook
  const { sendMessage, isLoading, error } = useChatApi(rawApiKey, visitorId, sessionId);

  const [isTakeover, setIsTakeover] = useState(false);
  const [isWaitingForOwner, setIsWaitingForOwner] = useState(false);
  const isTakeoverRef = useRef(false);
  const pendingMessageRef = useRef(null);   // unanswered visitor question during takeover
  const waitingTimerRef = useRef(null);     // 1-min timeout to hide animation
  const sendMessageRef = useRef(sendMessage);

  useEffect(() => { isTakeoverRef.current = isTakeover; }, [isTakeover]);
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  // WebSocket — receive owner replies in real-time
  const handleOwnerReply = useCallback((content) => {
    clearTimeout(waitingTimerRef.current);
    pendingMessageRef.current = null;
    setIsWaitingForOwner(false);
    setMessages(prev => [...prev, { role: 'assistant', text: content }]);
  }, []);

  const handleTakeoverChange = useCallback((active) => {
    setIsTakeover(active);
    if (!active) {
      clearTimeout(waitingTimerRef.current);
      setIsWaitingForOwner(false);
      // Auto-send the visitor's unanswered question to AI
      const pending = pendingMessageRef.current;
      if (pending) {
        pendingMessageRef.current = null;
        sendMessageRef.current(pending).then((responseText) => {
          if (responseText) {
            setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
          }
        });
      }
    }
  }, []);

  useWidgetWebSocket({
    apiKey: hasApiKey ? rawApiKey : null,
    sessionId,
    onOwnerReply: handleOwnerReply,
    onTakeoverChange: handleTakeoverChange,
  });

  // Apply theme (font + colors) as soon as config is ready — don't wait for history
  useEffect(() => {
    if (!hasApiKey || configLoading) return;

    const primaryColor = config.theme?.primary_color || '#2563eb';
    const secondaryColor = tinycolor(primaryColor).darken(10).toString();
    const fontName = config.theme?.font_family || 'Inter';
    const fontStack = `'${fontName}', system-ui, -apple-system, sans-serif`;

    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--font-family', fontStack);
    document.body.style.fontFamily = fontStack;

    if (fontName !== 'system-ui' && fontName !== 'sans-serif') {
      const linkId = `gfont-${fontName.replace(/ /g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600&display=swap`;
        document.head.appendChild(link);
      }
    }

    // Notify parent (launcher icon + color)
    const sendConfigToParent = () => {
      window.parent.postMessage({
        type: 'CONFIG_UPDATED',
        config: {
          primaryColor,
          logo: config.launcher?.brand_image_url,
        },
      }, '*');
    };
    sendConfigToParent();
    setTimeout(sendConfigToParent, 500);
    setTimeout(sendConfigToParent, 1500);

    // Auto-open
    if (config.behavior?.auto_open) {
      setTimeout(() => {
        window.parent.postMessage('openChatbot', '*');
      }, config.behavior?.open_delay || 2000);
    }
  }, [config, configLoading, hasApiKey]);

  // Restore messages once both config + history are ready
  useEffect(() => {
    if (!hasApiKey || configLoading || historyLoading) return;

    if (historyMessages.length > 0) {
      setMessages(historyMessages);
    } else if (config.behavior?.show_welcome_message) {
      setMessages([{ role: 'assistant', text: config.content?.welcome_message }]);
    }
  }, [config, configLoading, historyLoading, historyMessages, hasApiKey]);


  // Conditional Render: If no API key, show Landing Page
  if (!hasApiKey) {
    return <LandingPage />;
  }

  const handleSend = async (text) => {
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    const responseText = await sendMessage(text);
    if (responseText) {
      clearTimeout(waitingTimerRef.current);
      pendingMessageRef.current = null;
      setIsWaitingForOwner(false);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } else if (responseText === "" || (responseText === null && isTakeoverRef.current)) {
      // Store pending question, show animation, auto-stop after 1 min if no reply
      pendingMessageRef.current = text;
      setIsWaitingForOwner(true);
      clearTimeout(waitingTimerRef.current);
      waitingTimerRef.current = setTimeout(() => setIsWaitingForOwner(false), 60_000);
    }
  };

  const handleRefresh = () => {
    const newSessionId = resetSessionId();
    setSessionId(newSessionId);
    // New session — start fresh with welcome message
    setMessages(
      config.behavior?.show_welcome_message
        ? [{ role: 'assistant', text: config.content?.welcome_message || 'Hello!' }]
        : []
    );
  };

  const handleClose = () => {
    window.parent.postMessage('closeChatbot', '*');
  };

  const activeFontStack = (!configLoading && config.theme?.font_family)
    ? `'${config.theme.font_family}', system-ui, -apple-system, sans-serif`
    : undefined;

  return (
    <div className="flex h-screen flex-col bg-white text-gray-900" style={activeFontStack ? { fontFamily: activeFontStack } : undefined}>
      <ChatHeader
        title={config.bot_name}
        logo={config.launcher?.brand_image_url}
        messages={messages}
        onRefresh={handleRefresh}
        onClose={handleClose}
      />
      
      {/* Show Error Banner if Hook has error */}
      {error && (
        <div className="bg-red-50 p-2 text-center text-xs text-red-600 border-b border-red-100">
          Error: {error}
        </div>
      )}

      <MessageList
        messages={messages}
        isTyping={isLoading || isWaitingForOwner}
        welcomeVideo={config.content?.welcome_video}
        videoAutoplay={config.content?.welcome_video_autoplay}
      />
      <MessageInput onSend={handleSend} disabled={isLoading || isWaitingForOwner} placeholder={config.content?.input_placeholder} />
    </div>
  );
}

export default App;
