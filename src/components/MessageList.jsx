import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function MessageList({ messages, isTyping, welcomeVideo, videoAutoplay }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const isYouTube = (url) =>
    url.includes('youtube.com') || url.includes('youtu.be');

  const getYouTubeUrl = (url) => {
    try {
      const videoUrl = new URL(url);
      if (videoAutoplay) {
        videoUrl.searchParams.set('autoplay', '1');
        videoUrl.searchParams.set('mute', '1');
      }
      return videoUrl.toString();
    } catch {
      return url;
    }
  };

  // Format ISO timestamp → "Apr 15, 3:00 PM UTC"
  const formatSlotTime = (iso) => {
    try {
      return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
      });
    } catch {
      return iso;
    }
  };

  // Render a text segment, turning URLs into links / Calendly into a button
  const renderTextWithLinks = (text, keyPrefix) => {
    const urlRe = /https?:\/\/[^\s)>"]+/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRe.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Strip trailing punctuation that may be part of prose, not the URL
      const rawUrl = match[0];
      const url = rawUrl.replace(/[.,;!?]+$/, '');
      const isCalendly = url.includes('calendly.com');

      if (isCalendly) {
        parts.push(
          <a
            key={`${keyPrefix}-url-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all no-underline"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            Confirm Appointment →
          </a>
        );
      } else {
        parts.push(
          <a
            key={`${keyPrefix}-url-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline opacity-70 hover:opacity-100 break-all transition-opacity"
          >
            {url}
          </a>
        );
      }

      lastIndex = match.index + rawUrl.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // Main renderer — splits message into text segments and slot buttons
  const renderMessageContent = (text) => {
    // Matches: "1. 2026-04-15T15:00:00Z | confirmation_url=https://calendly.com/..."
    const slotLineRe = /^(\d+)\.\s+(\S+)\s+\|\s+confirmation_url=(https?:\/\/\S+)/;

    const lines = text.split('\n');
    const elements = [];
    let textBuffer = [];

    const flushText = (key) => {
      if (!textBuffer.length) return;
      const joined = textBuffer.join('\n');
      textBuffer = [];
      elements.push(
        <span key={key} className="whitespace-pre-wrap">
          {renderTextWithLinks(joined, key)}
        </span>
      );
    };

    lines.forEach((line, i) => {
      const m = line.match(slotLineRe);
      if (m) {
        flushText(`text-${i}`);
        const [, num, isoTime, url] = m;
        elements.push(
          <a
            key={`slot-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-1.5 px-3 py-2.5 border-2 rounded-xl text-sm font-medium hover:opacity-80 active:scale-95 transition-all cursor-pointer no-underline"
            style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
          >
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {num}
            </span>
            <span className="flex-1">{formatSlotTime(isoTime)}</span>
            <span className="text-xs opacity-50">→</span>
          </a>
        );
      } else {
        textBuffer.push(line);
      }
    });

    flushText('text-end');
    return elements;
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
      {/* Welcome Video - Fixed at top */}
      {welcomeVideo && (
        <div className="mb-4 overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white">
          <div className="aspect-video w-full">
            {isYouTube(welcomeVideo) ? (
              <iframe
                src={getYouTubeUrl(welcomeVideo)}
                title="Welcome Video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={welcomeVideo}
                className="h-full w-full object-cover"
                autoPlay={videoAutoplay}
                muted={videoAutoplay}
                playsInline
                controls={!videoAutoplay}
                preload="metadata"
              />
            )}
          </div>
        </div>
      )}

      {messages.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm break-words ${
              msg.role === 'user'
                ? 'text-white rounded-br-none whitespace-pre-wrap'
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}
            style={msg.role === 'user' ? { backgroundColor: 'var(--primary-color)' } : {}}
          >
            {msg.role === 'user' ? msg.text : renderMessageContent(msg.text)}
          </div>
        </motion.div>
      ))}

      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="flex items-center space-x-1 rounded-2xl rounded-bl-none bg-white px-4 py-4 shadow-sm border border-gray-100">
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-0"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-150"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-300"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
