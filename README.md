# GPTSTASH

A sleek Manifest V3 Chrome Extension built specifically for ChatGPT. It extracts, filters, and structures active conversation histories into context-rich clipboard payloads. Features a clean terminal-style dark mode inspired by Tally and instant raw chat exports. 100% private and processed locally.

---

## Features

- **Contextual Continuation Packs:** Combines the core topic, filtered user requests, and recent assistant explanations into a single clipboard pack designed to bring other ChatGPT sessions or models up to speed instantly.
- **Raw Chat Extraction:** One-click backup of the entire text thread, properly mapping roles (`USER` vs `ASSISTANT`).
- **Sleek Interface:** An ultra-clean, terminal-inspired dark grid footprint optimized for zero layout shift.
- **Privacy First:** 100% execution happens locally via the Chrome Scripting API. Your conversation data never leaves your machine.

---

## 🛠️ Project Structure

Your project directory should look like this:
```text
LLM_CHAT_SUMMARISER/
├── manifest.json
├── popup.html
├── styles.css
├── popup.js
└── logo.png
```
📦 How to Install and Run It (For Free)
Because this extension is open-source and run locally, you can install it instantly without paying any Chrome Web Store registration fees:

**Step 1: **

Download the Code
If you are downloading this from GitHub, click the green Code button at the top of this page and select Download ZIP. Extract the ZIP file to a folder on your computer (e.g., your Desktop or a dedicated coding folder).

**Step 2: **

Open Chrome Extensions
Launch Google Chrome.

In the URL address bar, type 
```text
chrome://extensions/
```
hit Enter.

**Step 3: **

Enable Developer Mode
In the top-right corner of the Extensions page, toggle the Developer mode switch to ON.

**Step 4: **

Load the Unpacked Extension

1. In the top-left corner, click the Load unpacked button.
2. A file selection window will open. Select the folder that contains your project files (the folder containing manifest.json).
3. Click Select Folder.

**How to Use It**

Pin the LLM_CHAT_SUMMARISER icon to your Chrome toolbar by clicking the puzzle piece extension icon in the top right.
Open an active conversation thread on ChatGPT.
Click the extension logo.
Click Copy Summary to get a structured continuation payload, or Copy Raw Chat to back up the entire chat history straight to your clipboard!
