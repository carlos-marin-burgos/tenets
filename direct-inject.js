const fs = require("fs");
const path = require("path");

console.log("📄 Direct script injection - bypassing webpack wrapper...");

// Read the UI HTML template
const htmlTemplatePath = path.join(__dirname, "src", "ui.html");
const htmlContent = fs.readFileSync(htmlTemplatePath, "utf8");

// Pure JavaScript code without webpack wrapper
const pureScript = `
// PURE JAVASCRIPT - NO WEBPACK WRAPPER AT ALL
alert("🔥 DIRECT JS INJECTION WORKS!");

// Change title immediately
const title = document.querySelector('h1');
if (title) {
  title.textContent = "DIRECT JS WORKING!";
  title.style.color = "red";
}

// Simple button handlers with spinner
document.addEventListener('DOMContentLoaded', () => {
  alert("DOM READY - DIRECT JS!");
  
  const pageBtn = document.getElementById('analyze-page');
  const selectionBtn = document.getElementById('analyze-selection');
  const loading = document.getElementById('loading');
  
  if (pageBtn && loading) {
    pageBtn.addEventListener('click', () => {
      alert("PAGE BUTTON CLICKED - DIRECT JS!");
      
      // Show spinner
      loading.style.display = 'block';
      
      // Send message to plugin
      if (parent && parent !== window) {
        parent.postMessage({ pluginMessage: { type: 'analyze-page' } }, '*');
      } else {
        // Browser test mode - hide spinner after delay
        setTimeout(() => {
          loading.style.display = 'none';
          alert("MOCK ANALYSIS COMPLETE!");
        }, 2000);
      }
    });
  }
  
  if (selectionBtn && loading) {
    selectionBtn.addEventListener('click', () => {
      alert("SELECTION BUTTON CLICKED - DIRECT JS!");
      
      // Show spinner
      loading.style.display = 'block';
      
      // Send message to plugin
      if (parent && parent !== window) {
        parent.postMessage({ pluginMessage: { type: 'analyze-selection' } }, '*');
      } else {
        // Browser test mode - hide spinner after delay
        setTimeout(() => {
          loading.style.display = 'none';
          alert("MOCK ANALYSIS COMPLETE!");
        }, 1500);
      }
    });
  }
  
  // Handle messages from plugin
  window.addEventListener('message', (event) => {
    const message = event.data.pluginMessage || event.data;
    if (message && message.type === 'analysis-complete') {
      alert("ANALYSIS COMPLETE - DIRECT JS!");
      if (loading) {
        loading.style.display = 'none';
      }
    }
  });
});
`;

// Remove existing placeholder script and replace the closing body tag with our script
let finalHtml = htmlContent.replace(
  /<script>\s*\/\/ Placeholder for TypeScript code - will be replaced by build process\s*<\/script>/g,
  ""
);

finalHtml = finalHtml.replace(
  "</body>",
  `<script>${pureScript}</script>
</body>`
);

// Write to dist folder
const distPath = path.join(__dirname, "dist");
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

const outputPath = path.join(distPath, "ui.html");
fs.writeFileSync(outputPath, finalHtml);

console.log("✅ Successfully injected pure JavaScript directly into HTML");
console.log("🎯 NO WEBPACK WRAPPER - raw JavaScript execution");
