const fs = require("fs");
const path = require("path");

// Read the compiled UI JavaScript
const uiJsPath = path.resolve(__dirname, "dist", "ui.js");
const uiHtmlPath = path.resolve(__dirname, "dist", "ui.html");

if (fs.existsSync(uiJsPath) && fs.existsSync(uiHtmlPath)) {
  const uiJs = fs.readFileSync(uiJsPath, "utf8");
  let uiHtml = fs.readFileSync(uiHtmlPath, "utf8");

  // Replace any existing script content with the compiled TypeScript
  const scriptStart = uiHtml.indexOf("<script>");
  const scriptEnd = uiHtml.indexOf("</script>") + "</script>".length;

  if (scriptStart !== -1 && scriptEnd !== -1) {
    const beforeScript = uiHtml.substring(0, scriptStart);
    const afterScript = uiHtml.substring(scriptEnd);

    uiHtml = beforeScript + `<script>\n${uiJs}\n</script>` + afterScript;

    fs.writeFileSync(uiHtmlPath, uiHtml);
    console.log("✅ Successfully inlined TypeScript UI code into HTML");
  } else {
    console.log("❌ Could not find script tags in HTML");
  }
} else {
  console.log("❌ Required files not found");
  console.log("UI JS exists:", fs.existsSync(uiJsPath));
  console.log("UI HTML exists:", fs.existsSync(uiHtmlPath));
}
