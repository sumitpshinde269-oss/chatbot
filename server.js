const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Simple .env parser to avoid requiring external modules
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    } catch (e) {
      console.warn('Could not parse .env file:', e.message);
    }
  }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

// Emergency intelligence fallback responses when Gemini API Key is pending
function getFallbackEmergencyResponse(message) {
  const lower = (message || '').toLowerCase();
  if (lower.includes('triage') || lower.includes('priority') || lower.includes('casualt')) {
    return `### 🚨 Emergency Triage Protocol (START Protocol)
1. **Immediate / Red (Priority 1):** Unconscious, severe breathing difficulty, uncontrolled hemorrhaging, or pulse > 120. Require immediate evacuation.
2. **Delayed / Yellow (Priority 2):** Serious injuries, fractures, controlled bleeding, stable vitals. Can wait for secondary transport.
3. **Minimal / Green (Priority 3):** "Walking wounded", abrasions, minor sprains. Direct to triage holding area.
4. **Expectant / Black (Priority 4):** Catastrophic trauma incompatible with life given current resource limits.

*Note: For real-time autonomous AI synthesis, ensure your GEMINI_API_KEY is configured in .env.*`;
  }

  if (lower.includes('evacuat') || lower.includes('route') || lower.includes('path')) {
    return `### 📍 Evacuation Route Guidelines
- **Primary Route:** Main arterial roads cleared for emergency personnel only. Maintain bidirectional lane discipline.
- **Secondary Route:** Perimeter collector avenues. Avoid underpasses or low-elevation roads if flooding or structural damage is suspected.
- **Assembly Points:** Staging zones should be established upwind and uphill from hazardous material sources with at least a 500m safety perimeter.
- **Checkpoints:** Log all units via digital status check-in.`;
  }

  if (lower.includes('fire') || lower.includes('burn') || lower.includes('smoke')) {
    return `### 🔥 Wildfire / Structural Incident Protocol
1. **Perimeter Containment:** Establish cold, warm, and hot zones. Wear full SCBA gear in hot zones.
2. **Ventilation Hazards:** Beware of backdraft or flashover triggers in enclosed structures.
3. **Evacuation Order:** Issue immediate RED-level evacuation notice to downwind sectors within a 3km radius.`;
  }

  return `### 🛡️ Respondr Emergency Intelligence Copilot
Received incident query: **"${message}"**

**Key Recommendations:**
- Maintain situational awareness and verify coordinate accuracy before dispatch.
- Prioritize life-safety interventions over property preservation.
- Coordinate with command post using standard ICS (Incident Command System) protocols.

*(Live Gemini AI generation is active when GEMINI_API_KEY is configured in your local .env file)*`;
}

// Call Google Gemini API
function callGemini(message, history = []) {
  return new Promise((resolve, reject) => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return resolve({
        reply: getFallbackEmergencyResponse(message),
        source: 'local_protocol',
        keyConfigured: false,
      });
    }

    const systemPrompt = `You are Respondr Emergency Intelligence AI Copilot, a mission-critical AI assistant for emergency responders, 911 dispatchers, incident commanders, and disaster relief personnel.
Deliver crisp, prioritized, highly actionable guidance with clear headings, bullet points, and urgency classifications (Immediate, Caution, Info). Keep communications professional and life-safety oriented.`;

    const contents = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach(item => {
        if (item.text && item.role) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.text }]
          });
        }
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const bodyPayload = JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    });

    const reqOptions = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyPayload)
      },
      timeout: 15000
    };

    const apiReq = https.request(reqOptions, (apiRes) => {
      let raw = '';
      apiRes.on('data', chunk => raw += chunk);
      apiRes.on('end', () => {
        try {
          const json = JSON.parse(raw);
          if (json.error) {
            console.error('Gemini API returned error:', json.error.message);
            return resolve({
              reply: `${getFallbackEmergencyResponse(message)}\n\n*(Notice: Gemini API reported: ${json.error.message})*`,
              source: 'fallback_error',
              keyConfigured: true,
            });
          }
          const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            resolve({
              reply: generatedText,
              source: 'gemini',
              keyConfigured: true,
            });
          } else {
            resolve({
              reply: getFallbackEmergencyResponse(message),
              source: 'local_protocol',
              keyConfigured: true,
            });
          }
        } catch (err) {
          console.error('Failed to parse Gemini API response:', err.message);
          resolve({
            reply: getFallbackEmergencyResponse(message),
            source: 'local_protocol',
            keyConfigured: true,
          });
        }
      });
    });

    apiReq.on('error', (err) => {
      console.error('Gemini request network error:', err.message);
      resolve({
        reply: `${getFallbackEmergencyResponse(message)}\n\n*(Network fallback: ${err.message})*`,
        source: 'local_protocol',
        keyConfigured: true,
      });
    });

    apiReq.on('timeout', () => {
      apiReq.destroy();
      resolve({
        reply: getFallbackEmergencyResponse(message),
        source: 'timeout_fallback',
        keyConfigured: true,
      });
    });

    apiReq.write(bodyPayload);
    apiReq.end();
  });
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  // Config check endpoint
  if (req.url === '/api/config') {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      geminiConfigured: hasKey,
      appName: 'Respondr AI Emergency Intelligence'
    }));
    return;
  }

  // Chat endpoint
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const message = payload.message || '';
        const history = payload.history || [];

        if (!message.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message cannot be empty' }));
          return;
        }

        const result = await callGemini(message, history);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
      }
    });
    return;
  }

  // Parse URL to pathname
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path
  let safePath = path.normalize(path.join(PUBLIC_DIR, pathname));

  // Prevent path traversal
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // If root, point to index.html
  if (pathname === '/' || pathname === '') {
    safePath = path.join(PUBLIC_DIR, 'index.html');
  }

  // Check if safePath is a directory or doesn't exist
  fs.stat(safePath, (err, stats) => {
    let finalPath = safePath;

    if (err || !stats.isFile()) {
      // Try appending .html (clean URLs)
      const htmlCandidate = `${safePath}.html`;
      if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
        finalPath = htmlCandidate;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>404 Not Found</h1><p>The requested URL <code>${pathname}</code> was not found.</p><p><a href="/">Return Home</a></p>`);
        return;
      }
    }

    const ext = path.extname(finalPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(finalPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Respondr Server is running!`);
  console.log(`📡 Main URL:     http://localhost:${PORT}`);
  console.log(`📄 Available Pages:`);
  console.log(`   - Home:       http://localhost:${PORT}/index.html`);
  console.log(`   - Dashboard:  http://localhost:${PORT}/dash.html`);
  console.log(`   - Console:    http://localhost:${PORT}/respond.html`);
  console.log(`   - Settings:   http://localhost:${PORT}/sett.html`);
  console.log(`   - Preview:    http://localhost:${PORT}/preview.html\n`);
  console.log(`🤖 AI Chat API:  http://localhost:${PORT}/api/chat`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
