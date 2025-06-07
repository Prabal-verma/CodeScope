# CodeScope Chrome Extension - Cyberpunk Popup UI

This extension now uses a beautiful, animated, cyberpunk-themed React + Tailwind popup UI with:

- Model selector (Claude, Gemini, GPT, etc.)
- Voice input (mic button)
- Send button with animation
- Results in ReactMarkdown (with security score)
- History in localStorage (with clear button)
- Close (X) button
- Cyberpunk theme (neon, glass, gradients, animated transitions)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the popup UI:**

   ```bash
   npm run build
   ```

   This will output the React popup to `dist/popup.jsx` for use in the extension.

3. **Load the extension in Chrome:**

   - Go to `chrome://extensions`.
   - Enable Developer Mode.
   - Click "Load unpacked" and select this folder.

4. **Usage:**
   - Select code on GitHub, open the extension, choose a model, and scan!

## Development

- To develop with hot reload:
  ```bash
  npm run dev
  ```
  Then point your popup.html to the dev server output if needed.

## Notes

- The background and content scripts remain in vanilla JS.
- The popup UI is now React+Tailwind, built with Vite.
- You can customize the theme in `popup.jsx` and `index.css`.
