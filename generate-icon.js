/**
 * Generate 128x128 PNG icon from SVG
 * This creates a simple HTML canvas-based converter
 */

const fs = require("fs");
const path = require("path");

// Read the SVG file
const svgContent = fs.readFileSync(
  path.join(__dirname, "icon-128.svg"),
  "utf8"
);

// Create an HTML file that will convert SVG to PNG
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Icon Generator</title>
</head>
<body>
    <div id="svg-container"></div>
    <canvas id="canvas" width="128" height="128" style="display:none;"></canvas>
    
    <script>
        // Insert SVG
        document.getElementById('svg-container').innerHTML = ${JSON.stringify(
          svgContent
        )};
        
        // Wait for SVG to render
        setTimeout(() => {
            const svg = document.querySelector('svg');
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            // Serialize SVG to data URL
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            // Create image and draw to canvas
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                
                // Convert canvas to PNG and download
                canvas.toBlob(function(blob) {
                    const link = document.createElement('a');
                    link.download = 'icon-128.png';
                    link.href = URL.createObjectURL(blob);
                    link.click();
                    
                    console.log('✅ Icon generated! Check your downloads folder.');
                }, 'image/png');
                
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }, 100);
    </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, "generate-icon.html"), htmlContent);

console.log("✅ Created generate-icon.html");
console.log("📝 Open this file in a browser to generate icon-128.png");
console.log("");
console.log("Alternative: You can also:");
console.log(
  "1. Open icon-128.svg in any vector graphics editor (Figma, Illustrator, Inkscape)"
);
console.log("2. Export as PNG at 128x128px");
console.log("3. Or use an online converter: https://convertio.co/svg-png/");
