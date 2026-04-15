import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function MessageInput({ onSend, disabled, placeholder }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white p-3">
      <div className="relative flex items-end rounded-[26px] border border-gray-200 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your message..."}
          disabled={disabled}
          rows={1}
          className="max-h-[120px] w-full resize-none overflow-y-auto bg-transparent py-3 pl-4 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
          style={{ minHeight: '46px' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="absolute bottom-1.5 right-1.5 rounded-full p-2 text-white transition-opacity hover:opacity-90 disabled:bg-gray-400 disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 text-center text-[10px] text-gray-400">
        Powered by BayAI
      </div>
    </form>
  );
}
