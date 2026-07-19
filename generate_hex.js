const fs = require('fs');
const R = 40; // Size of hexagons
const W = R * Math.sqrt(3);
const width = 3 * W;
const height = 9 * R;

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(2)}" height="${height.toFixed(2)}" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(2)}">
<rect width="100%" height="100%" fill="#f8fafc" />
`;

for (let row = -1; row < 4; row++) {
  for (let col = -1; col < 5; col++) {
    const cx = col * W + (row % 2 !== 0 ? W / 2 : 0);
    const cy = row * 1.5 * R * 2;

    // Hexagon vertices (pointy-top)
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + R * Math.cos(angle);
      const py = cy + R * Math.sin(angle);
      points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
    }

    // Soccer ball pattern: every 3rd hexagon gets a very faint tint
    const isBlack = (col - row) % 3 === 0;
    // Much more faded: accent hex is #f1f5f9 instead of #e2e8f0, stroke opacity dropped to 0.25
    const fill = isBlack ? '#f1f5f9' : '#f8fafc';
    svg += `<polygon points="${points.join(' ')}" fill="${fill}" stroke="#e2e8f0" stroke-width="1" stroke-opacity="0.25"/>
`;
  }
}

svg += `</svg>`;

// URL encode
const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
fs.writeFileSync('pattern.txt', encoded);
console.log('Pattern generated!');
