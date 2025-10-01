// Minimal test version to isolate syntax errors
console.log("🚀 Minimal plugin starting...");

figma.showUI(
  `
<html>
<head><title>Test</title></head>
<body>
  <h1>Minimal Test Plugin</h1>
  <button id="test-btn">Test Button</button>
  <script>
    document.getElementById('test-btn').addEventListener('click', () => {
      parent.postMessage({ pluginMessage: { type: 'test' } }, '*');
    });
  </script>
</body>
</html>
`,
  {
    width: 300,
    height: 200,
  }
);

figma.ui.onmessage = (msg) => {
  const message = msg.pluginMessage || msg;

  if (message.type === "test") {
    figma.notify("✅ Minimal plugin working!");
  }
};

console.log("✅ Minimal plugin loaded");
