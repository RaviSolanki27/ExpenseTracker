const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
  const svgPath = path.join(__dirname, 'public', 'icons', 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'public', 'icons', 'icon-192.png'));
  console.log('Generated icon-192.png');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'icons', 'icon-512.png'));
  console.log('Generated icon-512.png');

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});

