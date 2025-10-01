const fs = require("fs");

// Create the most minimal possible HTML for testing
const minimalHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Minimal Test</title>
</head>
<body>
    <h1>Minimal Test</h1>
    <script>
        alert("MINIMAL WORKS!");
        console.log("MINIMAL SCRIPT EXECUTED");
        document.body.style.backgroundColor = "red";
    </script>
</body>
</html>`;

fs.writeFileSync("ui.html", minimalHtml);
console.log("✅ Created minimal test HTML");
