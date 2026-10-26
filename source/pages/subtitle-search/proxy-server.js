// Simple Express proxy server for OpenSubtitles API
// This solves the User-Agent header issue (browsers block custom User-Agent headers)
// 
// To run: 
//   1. npm install express cors
//   2. node proxy-server.js
//   3. Update the PROXY_BASE_URL in index.html to: http://localhost:3001/api/proxy
//
// Note: This uses Node.js built-in https/http modules, so no node-fetch needed!

const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');

// Helper function to make HTTP requests with redirect handling
function makeRequest(url, options = {}, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    // Prevent infinite redirect loops
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = protocol.request(requestOptions, (res) => {
      // Handle redirects (301, 302, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location;
        console.log(`Following redirect ${res.statusCode} to: ${redirectUrl}`);
        
        // If redirect goes to HTML page (error), don't follow it
        if (redirectUrl.includes('.html') || redirectUrl.includes('/error')) {
          let errorData = '';
          res.on('data', (chunk) => { errorData += chunk; });
          res.on('end', () => {
            reject(new Error(`Redirect to error page: ${redirectUrl}. Response: ${errorData.substring(0, 200)}`));
          });
          return;
        }
        
        // Resolve relative URLs
        const newUrl = redirectUrl.startsWith('http') 
          ? redirectUrl 
          : `${urlObj.protocol}//${urlObj.hostname}${redirectUrl}`;
        
        // Preserve headers for redirect
        const redirectOptions = {
          ...options,
          headers: {
            ...options.headers
          }
        };
        
        // Recursively follow redirect
        return makeRequest(newUrl, redirectOptions, redirectCount + 1)
          .then(resolve)
          .catch(reject);
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // Check if response is HTML (error page)
        const isHtml = data.trim().startsWith('<!DOCTYPE') || 
                       data.trim().startsWith('<html') || 
                       data.trim().startsWith('<meta') ||
                       data.includes('<html') ||
                       res.headers['content-type']?.includes('text/html');
        
        if (isHtml && res.statusCode >= 200 && res.statusCode < 300) {
          // API returned HTML instead of JSON - treat as error
          resolve({
            ok: false,
            status: 500,
            statusText: 'HTML Response',
            json: async () => {
              throw new Error(`API returned HTML instead of JSON: ${data.substring(0, 200)}`);
            },
            text: async () => data
          });
        } else {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            json: async () => {
              try {
                return JSON.parse(data);
              } catch (e) {
                throw new Error(`Invalid JSON response: ${data.substring(0, 200)}`);
              }
            },
            text: async () => data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

const app = express();
const PORT = 3001;
const OPENTITLES_API_KEY = 'qo2wQs1PXwIHJsXvIiWXu1ZbVjaboPh6';
const OPENTITLES_BASE_URL = 'https://api.opensubtitles.com/api/v1';

// Enable CORS
app.use(cors());
app.use(express.json());

// Proxy endpoint for search
app.get('/api/proxy/subtitles', async (req, res) => {
  try {
    const queryParams = new URLSearchParams(req.query).toString();
    const url = `${OPENTITLES_BASE_URL}/subtitles?${queryParams}`;
    
    console.log('Proxying request to:', url);
    console.log('Query params:', req.query);
    console.log('Language filter:', req.query.languages);
    
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Api-Key': OPENTITLES_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'SubtitleSearchApp v1.0.0' // This works from server-side!
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText.substring(0, 500));
      return res.status(response.status).json({ 
        error: `API returned ${response.status}: ${response.statusText}`,
        details: errorText.substring(0, 200)
      });
    }

    const responseText = await response.text();
    console.log('Response preview:', responseText.substring(0, 200));
    
    // Check if response is HTML (error page) instead of JSON
    if (responseText.trim().startsWith('<!DOCTYPE') || 
        responseText.trim().startsWith('<html') || 
        responseText.trim().startsWith('<meta') ||
        responseText.includes('<html>')) {
      console.error('Received HTML instead of JSON!');
      console.error('Full URL was:', url);
      console.error('HTML preview:', responseText.substring(0, 500));
      
      // Try to extract error message from HTML if possible
      const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
      const errorTitle = titleMatch ? titleMatch[1] : 'Unknown error';
      
      return res.status(500).json({ 
        error: `API returned HTML error page: ${errorTitle}`,
        details: 'This usually means the language code is not supported or the request parameters are invalid.',
        suggestion: 'Try searching without a language filter, or use a different language code.',
        htmlPreview: responseText.substring(0, 300)
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText.substring(0, 500));
      return res.status(500).json({ 
        error: 'Invalid JSON response from API',
        responsePreview: responseText.substring(0, 300)
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for download
app.post('/api/proxy/download', async (req, res) => {
  try {
    const url = `${OPENTITLES_BASE_URL}/download`;
    
    console.log('Proxying download request to:', url);
    
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Api-Key': OPENTITLES_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SubtitleSearchApp v1.0.0'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Download proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Use /api/proxy/subtitles for search and /api/proxy/download for downloads`);
});
