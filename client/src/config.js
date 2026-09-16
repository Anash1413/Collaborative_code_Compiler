// Centralized Backend Configuration
// Toggle between Local Development and Production Deployment by commenting/uncommenting below:

// 1. Local Development
// export const BASE_URL = "http://localhost:5000";

// 2. Production Deployment (Render)
export const BASE_URL = "https://collaborative-code-compiler-c904.onrender.com";

// Derived WebSocket URL for Yjs Monaco Collaboration (handles http->ws and https->wss)
export const WS_URL = `${BASE_URL.replace(/^http/, 'ws')}/yjs`;
