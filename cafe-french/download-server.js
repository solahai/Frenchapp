// Simple file server to serve the APK for download
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const APK_PATH = path.join(__dirname, 'builds', 'CafeFrench-release.apk');

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/' || req.url === '/download') {
    // Serve a nice download page
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Café French - Download</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Source Sans Pro', sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      overflow: hidden;
    }
    
    .container {
      text-align: center;
      padding: 40px;
      max-width: 480px;
      position: relative;
      z-index: 1;
    }
    
    .logo {
      font-size: 80px;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #f8b500, #fceabb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: #a0aec0;
      margin-bottom: 40px;
      font-weight: 400;
    }
    
    .download-btn {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 18px 40px;
      font-size: 1.2rem;
      font-weight: 600;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
    }
    
    .download-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 50px rgba(102, 126, 234, 0.5);
    }
    
    .download-btn:active {
      transform: translateY(0);
    }
    
    .download-icon {
      font-size: 1.4rem;
    }
    
    .info {
      margin-top: 30px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .info-item:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #a0aec0;
    }
    
    .info-value {
      font-weight: 600;
      color: #fceabb;
    }
    
    .features {
      margin-top: 40px;
      text-align: left;
    }
    
    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      transition: background 0.3s ease;
    }
    
    .feature:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    
    .feature-icon {
      font-size: 1.5rem;
    }
    
    .feature-text {
      font-size: 0.95rem;
      color: #cbd5e0;
    }
    
    .bg-decoration {
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.3;
      z-index: 0;
    }
    
    .bg-1 {
      background: #667eea;
      top: -100px;
      right: -100px;
    }
    
    .bg-2 {
      background: #764ba2;
      bottom: -100px;
      left: -100px;
    }
    
    .bg-3 {
      background: #f8b500;
      bottom: 50%;
      right: 30%;
      width: 200px;
      height: 200px;
    }
  </style>
</head>
<body>
  <div class="bg-decoration bg-1"></div>
  <div class="bg-decoration bg-2"></div>
  <div class="bg-decoration bg-3"></div>
  
  <div class="container">
    <div class="logo">☕</div>
    <h1>Café French</h1>
    <p class="subtitle">Learn French the AI-powered way</p>
    
    <a href="/apk" class="download-btn">
      <span class="download-icon">📱</span>
      Download for Android
    </a>
    
    <div class="info">
      <div class="info-item">
        <span class="info-label">Version</span>
        <span class="info-value">2.0.0</span>
      </div>
      <div class="info-item">
        <span class="info-label">File Size</span>
        <span class="info-value">~69 MB</span>
      </div>
      <div class="info-item">
        <span class="info-label">Platform</span>
        <span class="info-value">Android 6.0+</span>
      </div>
    </div>
    
    <div class="features">
      <div class="feature">
        <span class="feature-icon">🤖</span>
        <span class="feature-text">AI-powered conversation practice</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🎯</span>
        <span class="feature-text">Spaced repetition for vocabulary</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🎤</span>
        <span class="feature-text">Pronunciation feedback</span>
      </div>
      <div class="feature">
        <span class="feature-icon">📚</span>
        <span class="feature-text">Evidence-based learning</span>
      </div>
    </div>
  </div>
</body>
</html>
    `);
  } else if (req.url === '/apk') {
    // Serve the APK file
    const stat = fs.statSync(APK_PATH);
    
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="CafeFrench-v2.0.0.apk"'
    });
    
    const readStream = fs.createReadStream(APK_PATH);
    readStream.pipe(res);
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   📦 Café French Download Server                             ║
║                                                              ║
║   Download Page: http://0.0.0.0:${PORT}/                        ║
║   Direct APK:    http://0.0.0.0:${PORT}/apk                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

