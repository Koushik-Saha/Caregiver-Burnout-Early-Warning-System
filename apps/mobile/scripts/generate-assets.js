const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. SVG for the main app icon (1024x1024)
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#0D1117"/>
  <!-- Centered rounded square -->
  <rect x="256" y="256" width="512" height="512" rx="140" fill="#1C2333" stroke="rgba(45,212,191,0.4)" stroke-width="4"/>
  <!-- Leaf Logo centered inside the square -->
  <g transform="translate(512, 512) scale(4.5) translate(-50, -50)">
    <path d="M50 15C30 35 30 65 50 85C70 65 70 35 50 15Z" fill="#2DD4BF"/>
    <!-- Stem/Vein line -->
    <path d="M50 85 L50 35" stroke="#1C2333" stroke-width="5" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`;

// 2. SVG for the adaptive foreground icon (1024x1024)
const adaptiveIconSvg = iconSvg;

// 3. SVG for the splash icon (512x512, transparent background)
const splashIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Leaf Logo centered (no background) -->
  <g transform="translate(256, 256) scale(4.5) translate(-50, -50)">
    <path d="M50 15C30 35 30 65 50 85C70 65 70 35 50 15Z" fill="#2DD4BF"/>
    <!-- Stem/Vein line -->
    <path d="M50 85 L50 35" stroke="#0D1117" stroke-width="5" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`;

async function generate() {
  try {
    console.log('Generating app icon (1024x1024)...');
    await sharp(Buffer.from(iconSvg))
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));

    console.log('Generating adaptive icon (1024x1024)...');
    await sharp(Buffer.from(adaptiveIconSvg))
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));

    console.log('Generating splash icon (512x512)...');
    await sharp(Buffer.from(splashIconSvg))
      .png()
      .toFile(path.join(assetsDir, 'splash-icon.png'));

    console.log('Assets generation completed successfully!');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

generate();
