import { ArrowRight, Code, Shield } from 'lucide-react';

export default function LandingPage() {
  const currentUrl = window.location.origin;
  const scriptTag = `<script 
  src="${currentUrl}/widget.js" 
  data-api-key="YOUR_API_KEY_HERE">
</script>`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans text-gray-800">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-[#807045] p-8 text-white text-center">
          <div className="inline-flex p-3 bg-white/10 rounded-full mb-4 ring-1 ring-white/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">GoConverto Chatbot Widget</h1>
          <p className="opacity-90">Ready to be embedded on your website.</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Widget Server Running
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Code className="w-5 h-5 text-gray-500" />
              Installation
            </h2>
            <p className="text-gray-600 text-sm">
              Copy and paste this code snippet before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag of your website.
            </p>
            
            <div className="relative group">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto font-mono custom-scrollbar">
                {scriptTag}
              </pre>
              <button 
                onClick={() => navigator.clipboard.writeText(scriptTag)}
                className="absolute top-2 right-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex justify-center border-t pt-8">
            <a 
              href={`/?apiKey=TEST_KEY`} 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
            >
              Test Chatbot Interface
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
      
    </div>
  );
}
