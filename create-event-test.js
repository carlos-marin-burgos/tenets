const fs = require("fs");

// Create HTML with event attributes instead of inline scripts
const eventHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Event Test</title>
</head>
<body onload="alert('BODY ONLOAD WORKS!');">
    <h1 onclick="alert('CLICK WORKS!');">Click This Title</h1>
    <button onclick="alert('BUTTON WORKS!'); this.style.backgroundColor='green';">Test Button</button>
    <p>If you can see this UI but get no alerts when clicking, then Figma blocks JavaScript execution.</p>
</body>
</html>`;

fs.writeFileSync("ui.html", eventHtml);
console.log("✅ Created event-based test HTML");
