// Chatbot Widget Loader Script
(function () {
  // Configuration
  const widgetConfig = {
    apiKey: document.currentScript?.getAttribute("data-api-key") || "",
    position: document.currentScript?.getAttribute("data-position") || "bottom-right",
    baseUrl: document.currentScript?.src ? new URL(document.currentScript.src).origin : "https://your-domain.com",
  };

  if (!widgetConfig.apiKey) {
    console.warn("Chatbot Widget: No API key provided.");
  }

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    .chatbot-widget-container {
      position: fixed;
      z-index: 9999;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .chatbot-widget-container.bottom-left { right: auto; left: 20px; align-items: flex-start; }
    .chatbot-widget-container.top-right { bottom: auto; top: 20px; }
    .chatbot-widget-container.top-left { bottom: auto; top: 20px; right: auto; left: 20px; align-items: flex-start; }

    .chatbot-frame {
      width: 400px;
      height: 600px;
      max-height: 80vh;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 16px;
      background: #fff;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transform-origin: bottom right;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }
    .chatbot-frame.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    .chatbot-toggle {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background-color: #000;
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); /* Ease Out Expo for snapping feel */
    }
    .chatbot-toggle.open {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      transform: rotate(0deg); /* No spin for container */
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }
    .chatbot-toggle:active {
      transform: scale(0.92);
    }
    .chatbot-toggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    
     /* Icon Common Styles */
    .chatbot-toggle svg, 
    .chatbot-toggle .custom-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .chatbot-toggle .custom-logo {
      opacity: 0; /* Hidden initially, shown via .visible class */
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
    }
    
    .chatbot-toggle .custom-logo.visible {
      opacity: 1;
    }

    /* Chat Icon State (Default) */
    .chatbot-toggle svg.chat-icon {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
    }
    
    /* Close Icon State (Hidden by default) */
    .chatbot-toggle svg.close-icon {
      width: 20px; 
      height: 20px;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5) rotate(-90deg);
    }

    /* Open State Transformations */
    /* IMPORTANT: Force hide custom logo when open */
    .chatbot-toggle.open svg.chat-icon,
    .chatbot-toggle.open .custom-logo {
      opacity: 0 !important;
      transform: translate(-50%, -50%) scale(0.5) rotate(90deg);
    }
    
    .chatbot-toggle.open svg.close-icon {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
    }

    /* Bubble Styles */
    .chatbot-bubble {
      position: absolute;
      bottom: 20px;
      right: 80px;
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      font-size: 14px;
      line-height: 1.4; /* Better line height for multi-line */
      color: #333;
      max-width: 350px; /* Limit width to force wrap */
      opacity: 0;
      transform: translateX(10px);
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
      display: flex;
      align-items: center;
    }
    .chatbot-widget-container.bottom-left .chatbot-bubble {
      right: auto;
      left: 80px;
      transform: translateX(-10px);
    }
    .chatbot-bubble.visible {
      opacity: 1;
      transform: translateX(0);
      pointer-events: all;
    }
    .chatbot-bubble::after {
      content: '';
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 6px 0 6px 8px;
      border-style: solid;
      border-color: transparent transparent transparent white;
    }
    .chatbot-widget-container.bottom-left .chatbot-bubble::after {
      right: auto;
      left: -6px;
      border-width: 6px 8px 6px 0;
      border-color: transparent white transparent transparent;
    }

    /* Typing Animation - Simplified fade-in for multi-line since CSS typing is hard for wrapped text */
    .typing-text {
      display: inline-block;
      opacity: 0;
      transform: translateY(5px);
      transition: opacity 0.5s, transform 0.5s;
    }
    .typing-text.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Keyframes removed as we use simple fade for multi-line text */
    /* Keyframes removed as we use simple fade for multi-line text */
    
    /* Mobile Responsiveness */
    @media (max-width: 480px) {
      .chatbot-widget-container {
        bottom: 12px;
        right: 12px;
        z-index: 2147483647; /* Highest possible z-index to ensure it sits on top */
      }
      .chatbot-widget-container.bottom-left { left: 12px; }
      
      .chatbot-frame {
        position: fixed;
        bottom: 80px; /* Space for toggle button */
        right: 0;
        left: 0;
        width: calc(100% - 24px) !important; /* Full width minus margins */
        height: min(600px, calc(100vh - 100px)) !important; /* Ensure it fits on screen */
        margin: 0 12px; /* Center horizontally */
        border-radius: 20px;
        max-height: 80vh;
      }
      
      .chatbot-frame.open {
        transform: translateY(0);
      }
      
      .chatbot-toggle {
        width: 50px;
        height: 50px;
      }
      
      .chatbot-toggle.open {
        width: 44px;
        height: 44px;
      }
      
      /* Adjust bubble for mobile */
      .chatbot-bubble {
        right: 70px;
        bottom: 15px;
        max-width: 260px;
        font-size: 13px;
      }
      .chatbot-widget-container.bottom-left .chatbot-bubble {
        left: 70px;
      }
    }
  `;
  document.head.appendChild(style);

  // Container
  const container = document.createElement("div");
  container.className = `chatbot-widget-container ${widgetConfig.position}`;

  // Iframe
  const iframe = document.createElement("iframe");
  iframe.className = "chatbot-frame";
  // Point to the root index.html with apiKey param
  iframe.src = `${widgetConfig.baseUrl}/?apiKey=${widgetConfig.apiKey}&position=${widgetConfig.position}`;
  
  // Toggle Button
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "chatbot-toggle";
  toggleBtn.setAttribute('aria-label', 'Open Chatbot'); // A11y Improvement
  toggleBtn.innerHTML = `
    <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
    <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;

  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.classList.add("open");
      toggleBtn.classList.add("open");
      toggleBtn.setAttribute('aria-label', 'Close Chatbot'); // A11y Update
      // Hide bubble when opened
      bubble.classList.remove("visible");
      // Mark as seen so it doesn't auto-show again
      localStorage.setItem("chatbot_has_opened", "true");
    } else {
      iframe.classList.remove("open");
      toggleBtn.classList.remove("open");
      toggleBtn.setAttribute('aria-label', 'Open Chatbot'); // A11y Update
    }
  }

  toggleBtn.onclick = toggleChat;

  // Create Bubble Element
  const bubble = document.createElement("div");
  bubble.className = "chatbot-bubble";
  // Updated text with line break logic handled by CSS max-width
  bubble.innerHTML = `<span class="typing-text">Hello! 👋 Welcome to Bayshore Communication. How can I assist you today?</span>`;
  
  // Logic to show bubble
  setTimeout(() => {
    // Only show if chat is closed AND user hasn't opened it before
    const hasOpened = localStorage.getItem("chatbot_has_opened");
    if (!isOpen && !hasOpened) {
      bubble.classList.add("visible");
      // Small delay for text fade-in
      setTimeout(() => {
        const textSpan = bubble.querySelector(".typing-text");
        textSpan.classList.add("visible");
      }, 300);
    }
  }, 2000); // Show after 2 seconds

  // Click bubble to open
  bubble.onclick = toggleChat;

  container.appendChild(iframe);
  container.appendChild(bubble); // Append Bubble
  container.appendChild(toggleBtn);
  document.body.appendChild(container);

  // Listen for messages from iframe
  window.addEventListener("message", (event) => {
    if (event.data === "closeChatbot") {
      if (isOpen) toggleChat();
    }
    if (event.data === "openChatbot") {
      if (!isOpen) toggleChat();
    }
    
    // Handle Config Update from React App
    if (event.data && event.data.type === 'CONFIG_UPDATED') {
      const { logo, primaryColor } = event.data.config;
      console.log("📥 Widget Loader: Received CONFIG_UPDATED", event.data.config);
      
      // Update Toggle Button Color
      if (primaryColor) {
        // We use !important to ensure it overrides any specific styles
        toggleBtn.style.setProperty('background-color', primaryColor, 'important'); 
      }

      // Update Toggle Button Icon if Logo provided
      if (logo) {
         console.log("🖼️ Updating Logo to:", logo);
         
         // 1. Add Loader HTML immediately
         // We keep the close icon, but replace the chat icon part with a loader container
         toggleBtn.innerHTML = `
            <div class="chatbot-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <div class="spinner"></div>
            </div>
            <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
         `;
         
         // 2. Add Loader CSS dynamically
         if (!document.getElementById('chatbot-loader-style')) {
             const loaderStyle = document.createElement('style');
             loaderStyle.id = 'chatbot-loader-style';
             loaderStyle.textContent = `
                 .chatbot-loader .spinner {
                     width: 20px;
                     height: 20px;
                     border: 2px solid rgba(255,255,255,0.3);
                     border-radius: 50%;
                     border-top-color: #fff;
                     animation: spin 0.8s linear infinite;
                 }
                 @keyframes spin {
                     to { transform: rotate(360deg); }
                 }
             `;
             document.head.appendChild(loaderStyle);
         }

         // 3. Preload Image
         const img = new Image();
         img.src = logo;
         img.className = "chat-icon custom-logo";
         // Remove inline opacity logic, rely on CSS classes
         img.style.cssText = "width: 100%; height: 100%; object-fit: cover; border-radius: 50%;";
         
         img.onload = () => {
             // 4. Once loaded, append image
             const loader = toggleBtn.querySelector('.chatbot-loader');
             if (loader) {
                 loader.remove();
                 
                 // Add image to button
                 toggleBtn.insertAdjacentElement('afterbegin', img);
                 
                 // Trigger reflow/timeout for transition
                 requestAnimationFrame(() => {
                     img.classList.add('visible');
                 });
             }
         };
         
         img.onerror = () => {
             console.error("❌ Failed to load logo image");
             // Fallback to default icon if image fails
              toggleBtn.innerHTML = `
                <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              `;
         };
      }
    }
  });

})();
