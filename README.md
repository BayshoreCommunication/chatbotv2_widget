# BayAI Chatbot Widget

A modern, embeddable chatbot widget built with React, Vite, and Tailwind CSS. It features a lightweight loader script, isolated iframe environment, session management, and smooth animations.

## 🚀 Features

*   **Embeddable**: Simple script tag installation.
*   **Isolated**: Runs inside an iframe to prevent CSS conflicts with the host site.
*   **Customizable**: Configure colors, fonts, branding, and welcome messages via `settings.json`.
*   **Session Management**: Tracks unique Visitors and Sessions (resettable).
*   **Mobile Responsive**: Optimized layout for mobile devices.
*   **Accessible**: ARIA labels and keyboard navigation support.
*   **Smooth Animations**: Apple/Google-style entry and toggle animations.

## 📂 Project Structure

*   **`public/widget.js`**: The **Loader Script**. This is what you embed on client websites. It handles the toggle button, creates the iframe, and manages the open/close state.
*   **`src/`**: The **Chat Application** (React). This runs *inside* the iframe.
    *   `components/`: UI components (Header, MessageList, Input).
    *   `config/settings.json`: Main configuration file.
    *   `utils/session.js`: Logic for Visitor/Session IDs.
    *   `hooks/useChatApi.js`: API integration logic.

## 🛠️ Installation

### 1. Build the Project
First, generate the production assets:

```bash
npm install
npm run build
```

This ensures `dist/` contains the optimized React app and `public/widget.js` is ready.

### 2. Host the Files
Upload the contents of `dist/` to your web server (e.g., `https://chat.your-domain.com`).

### 3. Embed on your Website
Add the following code before the closing `</body>` tag of your website:

```html
<script 
  src="https://chat.your-domain.com/widget.js" 
  data-api-key="YOUR_API_KEY_HERE">
</script>
```

*   Replace `src` with the URL where you hosted the widget.
*   Replace `YOUR_API_KEY_HERE` with your backend API key.

## ⚙️ Configuration

You can customize the widget by editing `src/config/settings.json` and rebuilding.

```json
{
  "bot_name": "BayAI Assistant",
  "theme": {
    "primary_color": "#807045",
    "font_family": "Inter"
  },
  "behavior": {
    "auto_open": false,
    "open_delay": 2000,
    "show_welcome_message": true
  },
  "content": {
    "welcome_message": "Hello! How can I help?",
    "welcome_video": "https://...",
    "welcome_video_autoplay": true
  },
  "launcher": {
    "brand_image_url": "https://..."
  }
}
```

## 💻 Development

Run the development server to test locally:

```bash
npm run dev
```

Visit `http://localhost:5173/` to see the Landing Page / Test Interface.

## 🔑 API Integration

The widget sends requests to your backend defined in `.env`:
`VITE_API_BASE_URL=http://localhost:8000`

**Request Headers:**
*   `X-API-Key`: The key from the embed script.
*   `X-Visitor-ID`: Persistent user ID.
*   `X-Session-ID`: Current session ID (resets on refresh).

## 📱 Mobile Responsiveness
The widget automatically detects mobile devices (screen width < 480px) and adjusts:
*   Full-screen modal experience.
*   Smaller toggle button.
*   Higher z-index to overlay navbars.

---
Powered by **GoConverto**
