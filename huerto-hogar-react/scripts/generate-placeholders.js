const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Miembros del equipo
const teamMembers = [
  { id: 'team-1', name: 'Hawk Durant', role: 'Fundador & CEO' },
  { id: 'team-2', name: 'Guerben Cajuste', role: 'Jefe de Cultivo' },
  { id: 'team-3', name: 'Carolina Lopez', role: 'Ingeniera agricola' },
  { id: 'team-4', name: 'Jorge Silva', role: 'Atención al Cliente' }
];

// Create productos del catalogo
const products = [
  { id: 'kit-huerto', name: 'Kit de Inicio de Huerto' },
  { id: 'macetero-madera', name: 'Macetero de Madera 30L' },
  { id: 'tijeras-podar', name: 'Tijeras de Podar Profesionales' },
  { id: 'semillas-tomate', name: 'Semillas de Tomate Orgánico' },
  { id: 'sustrato-universal', name: 'Sustrato Universal 50L' },
  { id: 'regadera-metal', name: 'Regadera de Metal 5L' }
];

// Colors for the placeholders
const colors = [
  '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c',
  '#1abc9c', '#27ae60', '#2980b9', '#8e44ad', '#f39c12', '#d35400'
];

// Function to create an image with text
function createImageWithText(text, width, height, bgColor, textColor = '#fff', outputPath) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Calculate font size based on text length
  const maxWidth = width * 0.9;
  let fontSize = 24;
  let textWidth;
  
  do {
    ctx.font = `bold ${fontSize}px Arial`;
    textWidth = ctx.measureText(text).width;
    if (textWidth > maxWidth && fontSize > 10) {
      fontSize -= 2;
    } else {
      break;
    }
  } while (true);
  
  // Split text into multiple lines if needed
  const words = text.split(' ');
  let line = '';
  const lines = [];
  const lineHeight = fontSize * 1.2;
  let y = (height / 2) - ((words.length > 2 ? words.length - 1 : 1) * lineHeight) / 2;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      lines.push({ text: line.trim(), y });
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  lines.push({ text: line.trim(), y });
  
  // Draw text lines
  lines.forEach(({ text, y }) => {
    ctx.fillText(text, width / 2, y);
  });
  
  // Save to file
  const buffer = canvas.toBuffer('/static/img');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created: ${outputPath}`);
}

// Ensure directories exist
const teamDir = path.join(__dirname, '../static/img/team');
const productsDir = path.join(__dirname, '../static/img');

[teamDir, productsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate team member placeholders
teamMembers.forEach((member, index) => {
  const color = colors[index % colors.length];
  const outputPath = path.join(teamDir, `${member.id}.jpg`);
  createImageWithText(
    `${member.name}\n${member.role}`,
    400, 400,
    color,
    '#ffffff',
    outputPath
  );
});

// Generate product placeholders
products.forEach((product, index) => {
  const color = colors[(index + teamMembers.length) % colors.length];
  const outputPath = path.join(productsDir, `${product.id}.jpg`);
  createImageWithText(
    product.name,
    600, 400,
    color,
    '#ffffff',
    outputPath
  );
});

console.log('\n Generated all placeholder images');
