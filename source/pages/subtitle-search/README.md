# Subtitle Search Page - Setup Instructions

## Problem: User-Agent Header Requirement

The OpenSubtitles API requires a `User-Agent` header in the format `"AppName v1.0.0"`. However, **browsers block custom User-Agent headers** in fetch requests for security reasons.

## Solution: Backend Proxy Server

You need to run a simple proxy server that adds the User-Agent header server-side.

### Option 1: Local Development

1. Install dependencies:
```bash
npm install express cors node-fetch
```

2. Run the proxy server:
```bash
node proxy-server.js
```

3. Update `index.html`:
```javascript
const PROXY_BASE_URL = 'http://localhost:3001/api/proxy';
```

### Option 2: Deploy to Vercel (Recommended)

1. Create a `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/proxy.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/proxy/(.*)",
      "dest": "/api/proxy.js"
    }
  ]
}
```

2. Create `api/proxy.js` (convert proxy-server.js to Vercel format)

3. Deploy and update `PROXY_BASE_URL` in `index.html`

### Option 3: Deploy to Netlify

Use Netlify Functions - similar to Vercel approach.

### Option 4: Deploy to Heroku

1. Add `package.json` with dependencies
2. Deploy proxy-server.js
3. Update `PROXY_BASE_URL` in `index.html`

## Quick Test Without Proxy

The page will show a 403 error explaining the User-Agent requirement. This is expected behavior until you set up the proxy.
