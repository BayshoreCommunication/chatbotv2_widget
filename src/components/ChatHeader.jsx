import { Check, Copy, RefreshCcw, Shield, X } from 'lucide-react';
import { useState } from 'react';

export default function ChatHeader({ title, logo, onRefresh, onClose, messages }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!messages?.length) return;

    const json = JSON.stringify(
      messages.map((m) => ({ role: m.role, text: m.text })),
      null,
      2
    );

    const onSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    // Modern clipboard API (blocked in iframes without allow="clipboard-write")
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).then(onSuccess).catch(() => fallbackCopy(json, onSuccess));
    } else {
      fallbackCopy(json, onSuccess);
    }
  };

  const fallbackCopy = (text, onSuccess) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch {
      // copy not supported
    } finally {
      document.body.removeChild(el);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 text-white shadow-md transition-colors"
      style={{ background: 'var(--primary-color)' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm overflow-hidden">
          {logo ? (
            <img src={logo} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <Shield className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-sm font-bold leading-tight">{title || 'AI Assistant'}</h2>
          <p className="text-xs text-white/70">Online</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleCopy}
          disabled={!messages?.length}
          className="rounded-full p-2 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Copy conversation as JSON"
        >
          {copied ? <Check className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4" />}
        </button>
        <button
          onClick={onRefresh}
          className="rounded-full p-2 hover:bg-white/20 transition-colors"
          title="Reset Chat"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-white/20 transition-colors"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
