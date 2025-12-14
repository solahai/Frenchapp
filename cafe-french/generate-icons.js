const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, filename, bgColor = '#2563EB', text = '☕') {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  
  // Text (emoji or letters)
  ctx.font = `${Math.floor(size * 0.5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.fillText(text, size/2, size/2);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

const assetsDir = path.join(__dirname, 'mobile', 'assets');

// Create icons
generateIcon(1024, path.join(assetsDir, 'icon.png'), '#2563EB', 'CF');
generateIcon(1024, path.join(assetsDir, 'adaptive-icon.png'), '#2563EB', 'CF');
generateIcon(32, path.join(assetsDir, 'favicon.png'), '#2563EB', '');
generateIcon(1284, path.join(assetsDir, 'splash.png'), '#2563EB', 'CF');

console.log('Icons generated successfully!');
