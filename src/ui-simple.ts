// Minimal TypeScript for testing
alert("🔥 SIMPLE TS WORKS!");

// Change title
const title = document.querySelector("h1");
if (title) {
  title.textContent = "TS WORKING!";
  title.style.color = "blue";
}

// Simple button handlers with spinner
document.addEventListener("DOMContentLoaded", () => {
  alert("DOM READY!");

  const pageBtn = document.getElementById("analyze-page");
  const loading = document.getElementById("loading");

  if (pageBtn && loading) {
    pageBtn.addEventListener("click", () => {
      alert("PAGE BUTTON CLICKED!");

      // Show spinner
      loading.style.display = "block";

      // Send message to plugin
      if (parent && parent !== window) {
        parent.postMessage({ pluginMessage: { type: "analyze-page" } }, "*");
      }
    });
  }

  // Handle messages from plugin
  window.addEventListener("message", (event) => {
    const message = event.data.pluginMessage || event.data;
    if (message && message.type === "analysis-complete") {
      alert("ANALYSIS COMPLETE!");
      if (loading) {
        loading.style.display = "none";
      }
    }
  });
});
