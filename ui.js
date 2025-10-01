/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*******************!*\
  !*** ./src/ui.ts ***!
  \*******************/

// Global error handler
window.addEventListener("error", function (e) {
    alert("❌ JavaScript Error: " + e.error.message + " at line " + e.lineno);
});
try {
    alert("⚡ UI TypeScript file is being parsed!");
    // IMMEDIATE VISUAL TEST - Change page title
    const h1Element = document.querySelector("h1");
    if (h1Element) {
        h1Element.textContent = "🔥 TYPESCRIPT IS WORKING!";
        h1Element.style.color = "red";
    }
}
catch (error) {
    alert("❌ Error in initial script: " +
        (error instanceof Error ? error.message : String(error)));
}
class UIController {
    constructor() {
        console.log("🎯 UI Constructor called - starting initialization...");
        this.analyzeSelectionBtn = document.getElementById("analyze-selection");
        this.analyzePageBtn = document.getElementById("analyze-page");
        this.loading = document.getElementById("loading");
        this.resultsContainer = document.getElementById("results-container");
        this.emptyState = document.getElementById("empty-state");
        // Debug logging
        console.log("UIController initialized");
        console.log("Selection button:", this.analyzeSelectionBtn);
        console.log("Page button:", this.analyzePageBtn);
        this.setupEventListeners();
        this.setupMessageHandler();
    }
    setupEventListeners() {
        console.log("Setting up event listeners");
        this.analyzeSelectionBtn.addEventListener("click", () => {
            console.log("Selection button clicked");
            alert("🔍 Analyze Selection button clicked!");
            this.analyzeSelection();
        });
        this.analyzePageBtn.addEventListener("click", () => {
            console.log("Page button clicked");
            alert("📄 Analyze Page button clicked!");
            this.analyzePage();
        });
        // Handle reference link
        const referenceLink = document.getElementById("reference-link");
        if (referenceLink) {
            referenceLink.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Reference link clicked");
                this.openReferenceGuide();
            });
        }
    }
    setupMessageHandler() {
        console.log("Setting up message handler...");
        window.onmessage = (event) => {
            console.log("Received message event:", event);
            console.log("Event data:", event.data);
            // Handle both formats: direct messages and pluginMessage wrapped
            const message = event.data.pluginMessage || event.data;
            console.log("Extracted message:", message);
            if (message && message.type) {
                console.log("🎯 Processing message type:", message.type);
                this.handlePluginMessage(message);
            }
            else {
                console.log("❌ No valid message found");
            }
        };
    }
    analyzeSelection() {
        console.log("analyzeSelection called");
        alert("🚀 analyzeSelection function called!");
        // Immediate visual feedback - change button text
        const buttonText = this.analyzeSelectionBtn.querySelector(".btn-text");
        if (buttonText) {
            buttonText.textContent = "Analyzing...";
        }
        this.showButtonLoading("analyze-selection");
        // Check if we're in a Figma plugin environment vs browser
        console.log("🔍 Checking environment:");
        console.log("typeof parent:", typeof parent);
        console.log("parent === window:", parent === window);
        console.log("parent:", parent);
        if (typeof parent !== "undefined" && parent !== window) {
            console.log("✅ Figma mode detected - sending message to plugin");
            alert("📤 Sending analyze-selection message to plugin");
            console.log("Sending message:", {
                pluginMessage: { type: "analyze-selection" },
            });
            // Real Figma environment - send message to plugin
            parent.postMessage({ pluginMessage: { type: "analyze-selection" } }, "*");
        }
        else {
            console.log("Browser mode - showing mock results");
            // Browser test mode - show mock results after a delay
            setTimeout(() => {
                if (buttonText) {
                    buttonText.textContent = "Analyze Selection";
                }
                this.hideButtonLoading("analyze-selection");
                this.showMockResults("selection");
            }, 1500);
        }
    }
    analyzePage() {
        console.log("analyzePage called");
        alert("📄 analyzePage function called!");
        // Immediate visual feedback - change button text
        const buttonText = this.analyzePageBtn.querySelector(".btn-text");
        if (buttonText) {
            buttonText.textContent = "Analyzing...";
        }
        this.showButtonLoading("analyze-page");
        // Check if we're in a Figma plugin environment vs browser
        if (typeof parent !== "undefined" && parent !== window) {
            console.log("Figma mode - sending message to plugin");
            console.log("Sending message:", {
                pluginMessage: { type: "analyze-page" },
            });
            // Real Figma environment - send message to plugin
            parent.postMessage({ pluginMessage: { type: "analyze-page" } }, "*");
        }
        else {
            console.log("Browser mode - showing mock results");
            // Browser test mode - show mock results after a delay
            setTimeout(() => {
                if (buttonText) {
                    buttonText.textContent = "Analyze Page";
                }
                this.hideButtonLoading("analyze-page");
                this.showMockResults("page");
            }, 2000);
        }
    }
    openReferenceGuide() {
        // Send message to the main plugin code to handle opening the reference
        parent.postMessage({ pluginMessage: { type: "open-reference" } }, "*");
    }
    handlePluginMessage(message) {
        console.log("🎯 handlePluginMessage called with:", message);
        alert(`📨 Handling message: ${message.type}`);
        switch (message.type) {
            case "analysis-started":
                console.log("📊 Starting analysis loading state");
                this.showLoading();
                break;
            case "analysis-complete":
                console.log("✅ Analysis complete, showing results");
                this.hideLoading();
                this.hideAllButtonLoading();
                this.showResults(message.data);
                break;
            case "analysis-error":
                console.log("❌ Analysis error, showing error");
                this.hideLoading();
                this.hideAllButtonLoading();
                this.showError(message.error);
                break;
            case "show-reference-guide":
                console.log("📚 Showing reference guide");
                this.showReferenceInfo();
                break;
            default:
                console.log("❓ Unknown message type:", message.type);
        }
    }
    showLoading() {
        console.log("🔄 showLoading called");
        alert("🔄 Showing loading spinner!");
        this.loading.style.display = "block";
        this.resultsContainer.style.display = "none";
        this.emptyState.style.display = "none";
    }
    hideLoading() {
        console.log("⏹️ hideLoading called");
        this.loading.style.display = "none";
    }
    showButtonLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button)
            button.classList.add("btn-loading");
    }
    hideButtonLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button)
            button.classList.remove("btn-loading");
    }
    hideAllButtonLoading() {
        this.hideButtonLoading("analyze-selection");
        this.hideButtonLoading("analyze-page");
    }
    showResults(data) {
        this.resultsContainer.style.display = "block";
        this.emptyState.style.display = "none";
        this.renderSummary(data.summary);
        this.renderResults(data.results);
    }
    showError(error) {
        this.resultsContainer.innerHTML = `<div class="error">Error: ${error}</div>`;
        this.resultsContainer.style.display = "block";
        this.emptyState.style.display = "none";
    }
    showReferenceInfo() {
        this.resultsContainer.innerHTML = `
      <div class="reference-info">
        <h2>📚 UI Tenets & Traps Reference Guide</h2>
        <p>The complete reference guide includes:</p>
        <ul>
          <li><strong>8 UI Tenets</strong> - Best practices to follow</li>
          <li><strong>6 UI Traps</strong> - Common mistakes to avoid</li>
          <li><strong>7 Categories</strong> - Accessibility, Usability, Visual Hierarchy, Consistency, Content, Layout, and Interaction</li>
        </ul>
        <p>Each tenet and trap includes:</p>
        <ul>
          <li>Detailed descriptions and explanations</li>
          <li>Real-world examples</li>
          <li>Specific recommendations</li>
          <li>Severity levels (Error, Warning, Info)</li>
        </ul>
        <p><em>Note: In the published plugin, this would open the full interactive reference guide with beautiful styling and filtering capabilities.</em></p>
      </div>
    `;
        this.resultsContainer.style.display = "block";
        this.emptyState.style.display = "none";
    }
    showMockResults(analysisType) {
        // Create mock analysis data for testing
        const mockResults = [
            {
                tenetId: "contrast-ratio",
                tenetTitle: "Sufficient Color Contrast",
                nodeId: "mock-text-1",
                nodeName: "Header Text",
                nodeType: "TEXT",
                status: "failed",
                severity: "error",
                message: "Text contrast ratio is 2.8:1, which is below the required 4.5:1 for normal text",
                category: "Accessibility",
                recommendations: [
                    "Use darker text colors for better contrast",
                    "Test with accessibility tools",
                    "Consider users with visual impairments",
                ],
            },
            {
                tenetId: "touch-target",
                tenetTitle: "Adequate Touch Target Size",
                nodeId: "mock-button-1",
                nodeName: "Action Button",
                nodeType: "FRAME",
                status: "warning",
                severity: "warning",
                message: "Button is 36x24px, recommended minimum is 44x44px for touch interfaces",
                category: "Usability",
                recommendations: [
                    "Increase button size to at least 44x44px",
                    "Add adequate spacing between interactive elements",
                    "Test on mobile devices",
                ],
            },
            {
                tenetId: "visual-hierarchy",
                tenetTitle: "Clear Visual Hierarchy",
                nodeId: "mock-layout-1",
                nodeName: "Content Section",
                nodeType: "FRAME",
                status: "passed",
                severity: "info",
                message: "Good use of typography and spacing to establish hierarchy",
                category: "Visual Hierarchy",
            },
        ];
        const mockSummary = {
            total: mockResults.length,
            passed: mockResults.filter((r) => r.status === "passed").length,
            violations: mockResults.filter((r) => r.status === "failed").length,
            score: 67,
        };
        const mockData = {
            summary: mockSummary,
            results: mockResults,
        };
        this.showResults(mockData);
    }
    renderSummary(summary) {
        const summaryEl = document.getElementById("summary");
        if (!summaryEl)
            return;
        const scoreClass = summary.score >= 80 ? "good" : summary.score >= 60 ? "warning" : "error";
        summaryEl.innerHTML = `<div class="summary-content"><h3>Analysis Summary</h3><div class="summary-stats"><div class="stat"><span class="stat-label">Score:</span><span class="stat-value ${scoreClass}">${summary.score}%</span></div><div class="stat"><span class="stat-label">Total Checks:</span><span class="stat-value">${summary.total}</span></div><div class="stat"><span class="stat-label">Passed:</span><span class="stat-value">${summary.passed}</span></div><div class="stat"><span class="stat-label">Issues:</span><span class="stat-value">${summary.violations}</span></div></div></div>`;
        summaryEl.style.display = "block";
    }
    renderResults(results) {
        const resultsListEl = document.getElementById("results-list");
        if (!resultsListEl)
            return;
        resultsListEl.innerHTML = "";
        if (results.length === 0) {
            resultsListEl.innerHTML =
                '<div class="empty-message">No issues found. Your design follows all checked tenets.</div>';
            return;
        }
        results.forEach((result) => {
            const resultEl = this.renderResultItem(result);
            resultsListEl.appendChild(resultEl);
        });
    }
    renderResultItem(result) {
        const div = document.createElement("div");
        div.className = `result-item ${result.severity}`;
        const recommendations = result.recommendations
            ? `<ul class="recommendations">${result.recommendations
                .map((rec) => `<li>${rec}</li>`)
                .join("")}</ul>`
            : "";
        div.innerHTML = `<div class="result-header"><h4>${result.tenetTitle}</h4><span class="result-status ${result.status}">${result.status}</span></div><div class="result-details"><p><strong>Element:</strong> ${result.nodeName} (${result.nodeType})</p><p><strong>Issue:</strong> ${result.message}</p>${recommendations}</div>`;
        return div;
    }
}
console.log("📄 UI Script loaded, waiting for DOMContentLoaded...");
alert("🔥 UI Script is loading!");
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded fired, creating UIController...");
    alert("🎯 DOM is ready, creating UIController!");
    try {
        new UIController();
        alert("✅ UIController created successfully!");
    }
    catch (error) {
        alert("❌ Error creating UIController: " +
            (error instanceof Error ? error.message : String(error)));
    }
});
// Additional debug test
console.log("🚀 END OF SCRIPT - TypeScript code completely loaded!");
alert("🚀 TypeScript script execution completed!");

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLGdCQUFnQjtBQUN2RDtBQUNBLDZDQUE2QztBQUM3QyxxQ0FBcUMsSUFBSTtBQUN6QywwQkFBMEI7QUFDMUI7QUFDQSwwREFBMEQsa0JBQWtCLGtDQUFrQyxjQUFjLElBQUksY0FBYyx3RUFBd0UsaUJBQWlCLEdBQUcsZ0JBQWdCLGtDQUFrQyxlQUFlLE1BQU0sZ0JBQWdCO0FBQ2pVO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3VpLXRlbmV0cy1hbmFseXplci8uL3NyYy91aS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vIEdsb2JhbCBlcnJvciBoYW5kbGVyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgYWxlcnQoXCLinYwgSmF2YVNjcmlwdCBFcnJvcjogXCIgKyBlLmVycm9yLm1lc3NhZ2UgKyBcIiBhdCBsaW5lIFwiICsgZS5saW5lbm8pO1xufSk7XG50cnkge1xuICAgIGFsZXJ0KFwi4pqhIFVJIFR5cGVTY3JpcHQgZmlsZSBpcyBiZWluZyBwYXJzZWQhXCIpO1xuICAgIC8vIElNTUVESUFURSBWSVNVQUwgVEVTVCAtIENoYW5nZSBwYWdlIHRpdGxlXG4gICAgY29uc3QgaDFFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImgxXCIpO1xuICAgIGlmIChoMUVsZW1lbnQpIHtcbiAgICAgICAgaDFFbGVtZW50LnRleHRDb250ZW50ID0gXCLwn5SlIFRZUEVTQ1JJUFQgSVMgV09SS0lORyFcIjtcbiAgICAgICAgaDFFbGVtZW50LnN0eWxlLmNvbG9yID0gXCJyZWRcIjtcbiAgICB9XG59XG5jYXRjaCAoZXJyb3IpIHtcbiAgICBhbGVydChcIuKdjCBFcnJvciBpbiBpbml0aWFsIHNjcmlwdDogXCIgK1xuICAgICAgICAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKSk7XG59XG5jbGFzcyBVSUNvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq8gVUkgQ29uc3RydWN0b3IgY2FsbGVkIC0gc3RhcnRpbmcgaW5pdGlhbGl6YXRpb24uLi5cIik7XG4gICAgICAgIHRoaXMuYW5hbHl6ZVNlbGVjdGlvbkJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYW5hbHl6ZS1zZWxlY3Rpb25cIik7XG4gICAgICAgIHRoaXMuYW5hbHl6ZVBhZ2VCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFuYWx5emUtcGFnZVwiKTtcbiAgICAgICAgdGhpcy5sb2FkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgICAgICB0aGlzLnJlc3VsdHNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHMtY29udGFpbmVyXCIpO1xuICAgICAgICB0aGlzLmVtcHR5U3RhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVtcHR5LXN0YXRlXCIpO1xuICAgICAgICAvLyBEZWJ1ZyBsb2dnaW5nXG4gICAgICAgIGNvbnNvbGUubG9nKFwiVUlDb250cm9sbGVyIGluaXRpYWxpemVkXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNlbGVjdGlvbiBidXR0b246XCIsIHRoaXMuYW5hbHl6ZVNlbGVjdGlvbkJ0bik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUGFnZSBidXR0b246XCIsIHRoaXMuYW5hbHl6ZVBhZ2VCdG4pO1xuICAgICAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5zZXR1cE1lc3NhZ2VIYW5kbGVyKCk7XG4gICAgfVxuICAgIHNldHVwRXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2V0dGluZyB1cCBldmVudCBsaXN0ZW5lcnNcIik7XG4gICAgICAgIHRoaXMuYW5hbHl6ZVNlbGVjdGlvbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZWxlY3Rpb24gYnV0dG9uIGNsaWNrZWRcIik7XG4gICAgICAgICAgICBhbGVydChcIvCflI0gQW5hbHl6ZSBTZWxlY3Rpb24gYnV0dG9uIGNsaWNrZWQhXCIpO1xuICAgICAgICAgICAgdGhpcy5hbmFseXplU2VsZWN0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFuYWx5emVQYWdlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBhZ2UgYnV0dG9uIGNsaWNrZWRcIik7XG4gICAgICAgICAgICBhbGVydChcIvCfk4QgQW5hbHl6ZSBQYWdlIGJ1dHRvbiBjbGlja2VkIVwiKTtcbiAgICAgICAgICAgIHRoaXMuYW5hbHl6ZVBhZ2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEhhbmRsZSByZWZlcmVuY2UgbGlua1xuICAgICAgICBjb25zdCByZWZlcmVuY2VMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWZlcmVuY2UtbGlua1wiKTtcbiAgICAgICAgaWYgKHJlZmVyZW5jZUxpbmspIHtcbiAgICAgICAgICAgIHJlZmVyZW5jZUxpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVmZXJlbmNlIGxpbmsgY2xpY2tlZFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5SZWZlcmVuY2VHdWlkZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0dXBNZXNzYWdlSGFuZGxlcigpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXR0aW5nIHVwIG1lc3NhZ2UgaGFuZGxlci4uLlwiKTtcbiAgICAgICAgd2luZG93Lm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZWNlaXZlZCBtZXNzYWdlIGV2ZW50OlwiLCBldmVudCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV2ZW50IGRhdGE6XCIsIGV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgLy8gSGFuZGxlIGJvdGggZm9ybWF0czogZGlyZWN0IG1lc3NhZ2VzIGFuZCBwbHVnaW5NZXNzYWdlIHdyYXBwZWRcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBldmVudC5kYXRhLnBsdWdpbk1lc3NhZ2UgfHwgZXZlbnQuZGF0YTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXh0cmFjdGVkIG1lc3NhZ2U6XCIsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgJiYgbWVzc2FnZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn46vIFByb2Nlc3NpbmcgbWVzc2FnZSB0eXBlOlwiLCBtZXNzYWdlLnR5cGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlUGx1Z2luTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi4p2MIE5vIHZhbGlkIG1lc3NhZ2UgZm91bmRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFuYWx5emVTZWxlY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYW5hbHl6ZVNlbGVjdGlvbiBjYWxsZWRcIik7XG4gICAgICAgIGFsZXJ0KFwi8J+agCBhbmFseXplU2VsZWN0aW9uIGZ1bmN0aW9uIGNhbGxlZCFcIik7XG4gICAgICAgIC8vIEltbWVkaWF0ZSB2aXN1YWwgZmVlZGJhY2sgLSBjaGFuZ2UgYnV0dG9uIHRleHRcbiAgICAgICAgY29uc3QgYnV0dG9uVGV4dCA9IHRoaXMuYW5hbHl6ZVNlbGVjdGlvbkJ0bi5xdWVyeVNlbGVjdG9yKFwiLmJ0bi10ZXh0XCIpO1xuICAgICAgICBpZiAoYnV0dG9uVGV4dCkge1xuICAgICAgICAgICAgYnV0dG9uVGV4dC50ZXh0Q29udGVudCA9IFwiQW5hbHl6aW5nLi4uXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaG93QnV0dG9uTG9hZGluZyhcImFuYWx5emUtc2VsZWN0aW9uXCIpO1xuICAgICAgICAvLyBDaGVjayBpZiB3ZSdyZSBpbiBhIEZpZ21hIHBsdWdpbiBlbnZpcm9ubWVudCB2cyBicm93c2VyXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+UjSBDaGVja2luZyBlbnZpcm9ubWVudDpcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidHlwZW9mIHBhcmVudDpcIiwgdHlwZW9mIHBhcmVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGFyZW50ID09PSB3aW5kb3c6XCIsIHBhcmVudCA9PT0gd2luZG93KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJwYXJlbnQ6XCIsIHBhcmVudCk7XG4gICAgICAgIGlmICh0eXBlb2YgcGFyZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHBhcmVudCAhPT0gd2luZG93KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuKchSBGaWdtYSBtb2RlIGRldGVjdGVkIC0gc2VuZGluZyBtZXNzYWdlIHRvIHBsdWdpblwiKTtcbiAgICAgICAgICAgIGFsZXJ0KFwi8J+TpCBTZW5kaW5nIGFuYWx5emUtc2VsZWN0aW9uIG1lc3NhZ2UgdG8gcGx1Z2luXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZW5kaW5nIG1lc3NhZ2U6XCIsIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5NZXNzYWdlOiB7IHR5cGU6IFwiYW5hbHl6ZS1zZWxlY3Rpb25cIiB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBSZWFsIEZpZ21hIGVudmlyb25tZW50IC0gc2VuZCBtZXNzYWdlIHRvIHBsdWdpblxuICAgICAgICAgICAgcGFyZW50LnBvc3RNZXNzYWdlKHsgcGx1Z2luTWVzc2FnZTogeyB0eXBlOiBcImFuYWx5emUtc2VsZWN0aW9uXCIgfSB9LCBcIipcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkJyb3dzZXIgbW9kZSAtIHNob3dpbmcgbW9jayByZXN1bHRzXCIpO1xuICAgICAgICAgICAgLy8gQnJvd3NlciB0ZXN0IG1vZGUgLSBzaG93IG1vY2sgcmVzdWx0cyBhZnRlciBhIGRlbGF5XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYnV0dG9uVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBidXR0b25UZXh0LnRleHRDb250ZW50ID0gXCJBbmFseXplIFNlbGVjdGlvblwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVCdXR0b25Mb2FkaW5nKFwiYW5hbHl6ZS1zZWxlY3Rpb25cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TW9ja1Jlc3VsdHMoXCJzZWxlY3Rpb25cIik7XG4gICAgICAgICAgICB9LCAxNTAwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhbmFseXplUGFnZSgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJhbmFseXplUGFnZSBjYWxsZWRcIik7XG4gICAgICAgIGFsZXJ0KFwi8J+ThCBhbmFseXplUGFnZSBmdW5jdGlvbiBjYWxsZWQhXCIpO1xuICAgICAgICAvLyBJbW1lZGlhdGUgdmlzdWFsIGZlZWRiYWNrIC0gY2hhbmdlIGJ1dHRvbiB0ZXh0XG4gICAgICAgIGNvbnN0IGJ1dHRvblRleHQgPSB0aGlzLmFuYWx5emVQYWdlQnRuLnF1ZXJ5U2VsZWN0b3IoXCIuYnRuLXRleHRcIik7XG4gICAgICAgIGlmIChidXR0b25UZXh0KSB7XG4gICAgICAgICAgICBidXR0b25UZXh0LnRleHRDb250ZW50ID0gXCJBbmFseXppbmcuLi5cIjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNob3dCdXR0b25Mb2FkaW5nKFwiYW5hbHl6ZS1wYWdlXCIpO1xuICAgICAgICAvLyBDaGVjayBpZiB3ZSdyZSBpbiBhIEZpZ21hIHBsdWdpbiBlbnZpcm9ubWVudCB2cyBicm93c2VyXG4gICAgICAgIGlmICh0eXBlb2YgcGFyZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHBhcmVudCAhPT0gd2luZG93KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZpZ21hIG1vZGUgLSBzZW5kaW5nIG1lc3NhZ2UgdG8gcGx1Z2luXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZW5kaW5nIG1lc3NhZ2U6XCIsIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5NZXNzYWdlOiB7IHR5cGU6IFwiYW5hbHl6ZS1wYWdlXCIgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gUmVhbCBGaWdtYSBlbnZpcm9ubWVudCAtIHNlbmQgbWVzc2FnZSB0byBwbHVnaW5cbiAgICAgICAgICAgIHBhcmVudC5wb3N0TWVzc2FnZSh7IHBsdWdpbk1lc3NhZ2U6IHsgdHlwZTogXCJhbmFseXplLXBhZ2VcIiB9IH0sIFwiKlwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQnJvd3NlciBtb2RlIC0gc2hvd2luZyBtb2NrIHJlc3VsdHNcIik7XG4gICAgICAgICAgICAvLyBCcm93c2VyIHRlc3QgbW9kZSAtIHNob3cgbW9jayByZXN1bHRzIGFmdGVyIGEgZGVsYXlcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChidXR0b25UZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvblRleHQudGV4dENvbnRlbnQgPSBcIkFuYWx5emUgUGFnZVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVCdXR0b25Mb2FkaW5nKFwiYW5hbHl6ZS1wYWdlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01vY2tSZXN1bHRzKFwicGFnZVwiKTtcbiAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9wZW5SZWZlcmVuY2VHdWlkZSgpIHtcbiAgICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBtYWluIHBsdWdpbiBjb2RlIHRvIGhhbmRsZSBvcGVuaW5nIHRoZSByZWZlcmVuY2VcbiAgICAgICAgcGFyZW50LnBvc3RNZXNzYWdlKHsgcGx1Z2luTWVzc2FnZTogeyB0eXBlOiBcIm9wZW4tcmVmZXJlbmNlXCIgfSB9LCBcIipcIik7XG4gICAgfVxuICAgIGhhbmRsZVBsdWdpbk1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq8gaGFuZGxlUGx1Z2luTWVzc2FnZSBjYWxsZWQgd2l0aDpcIiwgbWVzc2FnZSk7XG4gICAgICAgIGFsZXJ0KGDwn5OoIEhhbmRsaW5nIG1lc3NhZ2U6ICR7bWVzc2FnZS50eXBlfWApO1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImFuYWx5c2lzLXN0YXJ0ZWRcIjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfk4ogU3RhcnRpbmcgYW5hbHlzaXMgbG9hZGluZyBzdGF0ZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dMb2FkaW5nKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiYW5hbHlzaXMtY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuKchSBBbmFseXNpcyBjb21wbGV0ZSwgc2hvd2luZyByZXN1bHRzXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZUxvYWRpbmcoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVBbGxCdXR0b25Mb2FkaW5nKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93UmVzdWx0cyhtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImFuYWx5c2lzLWVycm9yXCI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLinYwgQW5hbHlzaXMgZXJyb3IsIHNob3dpbmcgZXJyb3JcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlTG9hZGluZygpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZUFsbEJ1dHRvbkxvYWRpbmcoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dFcnJvcihtZXNzYWdlLmVycm9yKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJzaG93LXJlZmVyZW5jZS1ndWlkZVwiOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+TmiBTaG93aW5nIHJlZmVyZW5jZSBndWlkZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dSZWZlcmVuY2VJbmZvKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi4p2TIFVua25vd24gbWVzc2FnZSB0eXBlOlwiLCBtZXNzYWdlLnR5cGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNob3dMb2FkaW5nKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCflIQgc2hvd0xvYWRpbmcgY2FsbGVkXCIpO1xuICAgICAgICBhbGVydChcIvCflIQgU2hvd2luZyBsb2FkaW5nIHNwaW5uZXIhXCIpO1xuICAgICAgICB0aGlzLmxvYWRpbmcuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgdGhpcy5yZXN1bHRzQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgdGhpcy5lbXB0eVN0YXRlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgaGlkZUxvYWRpbmcoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi4o+577iPIGhpZGVMb2FkaW5nIGNhbGxlZFwiKTtcbiAgICAgICAgdGhpcy5sb2FkaW5nLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgc2hvd0J1dHRvbkxvYWRpbmcoYnV0dG9uSWQpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnV0dG9uSWQpO1xuICAgICAgICBpZiAoYnV0dG9uKVxuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJidG4tbG9hZGluZ1wiKTtcbiAgICB9XG4gICAgaGlkZUJ1dHRvbkxvYWRpbmcoYnV0dG9uSWQpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnV0dG9uSWQpO1xuICAgICAgICBpZiAoYnV0dG9uKVxuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJidG4tbG9hZGluZ1wiKTtcbiAgICB9XG4gICAgaGlkZUFsbEJ1dHRvbkxvYWRpbmcoKSB7XG4gICAgICAgIHRoaXMuaGlkZUJ1dHRvbkxvYWRpbmcoXCJhbmFseXplLXNlbGVjdGlvblwiKTtcbiAgICAgICAgdGhpcy5oaWRlQnV0dG9uTG9hZGluZyhcImFuYWx5emUtcGFnZVwiKTtcbiAgICB9XG4gICAgc2hvd1Jlc3VsdHMoZGF0YSkge1xuICAgICAgICB0aGlzLnJlc3VsdHNDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgdGhpcy5lbXB0eVN0YXRlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgdGhpcy5yZW5kZXJTdW1tYXJ5KGRhdGEuc3VtbWFyeSk7XG4gICAgICAgIHRoaXMucmVuZGVyUmVzdWx0cyhkYXRhLnJlc3VsdHMpO1xuICAgIH1cbiAgICBzaG93RXJyb3IoZXJyb3IpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRzQ29udGFpbmVyLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZXJyb3JcIj5FcnJvcjogJHtlcnJvcn08L2Rpdj5gO1xuICAgICAgICB0aGlzLnJlc3VsdHNDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgdGhpcy5lbXB0eVN0YXRlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgc2hvd1JlZmVyZW5jZUluZm8oKSB7XG4gICAgICAgIHRoaXMucmVzdWx0c0NvbnRhaW5lci5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwicmVmZXJlbmNlLWluZm9cIj5cbiAgICAgICAgPGgyPvCfk5ogVUkgVGVuZXRzICYgVHJhcHMgUmVmZXJlbmNlIEd1aWRlPC9oMj5cbiAgICAgICAgPHA+VGhlIGNvbXBsZXRlIHJlZmVyZW5jZSBndWlkZSBpbmNsdWRlczo8L3A+XG4gICAgICAgIDx1bD5cbiAgICAgICAgICA8bGk+PHN0cm9uZz44IFVJIFRlbmV0czwvc3Ryb25nPiAtIEJlc3QgcHJhY3RpY2VzIHRvIGZvbGxvdzwvbGk+XG4gICAgICAgICAgPGxpPjxzdHJvbmc+NiBVSSBUcmFwczwvc3Ryb25nPiAtIENvbW1vbiBtaXN0YWtlcyB0byBhdm9pZDwvbGk+XG4gICAgICAgICAgPGxpPjxzdHJvbmc+NyBDYXRlZ29yaWVzPC9zdHJvbmc+IC0gQWNjZXNzaWJpbGl0eSwgVXNhYmlsaXR5LCBWaXN1YWwgSGllcmFyY2h5LCBDb25zaXN0ZW5jeSwgQ29udGVudCwgTGF5b3V0LCBhbmQgSW50ZXJhY3Rpb248L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgICA8cD5FYWNoIHRlbmV0IGFuZCB0cmFwIGluY2x1ZGVzOjwvcD5cbiAgICAgICAgPHVsPlxuICAgICAgICAgIDxsaT5EZXRhaWxlZCBkZXNjcmlwdGlvbnMgYW5kIGV4cGxhbmF0aW9uczwvbGk+XG4gICAgICAgICAgPGxpPlJlYWwtd29ybGQgZXhhbXBsZXM8L2xpPlxuICAgICAgICAgIDxsaT5TcGVjaWZpYyByZWNvbW1lbmRhdGlvbnM8L2xpPlxuICAgICAgICAgIDxsaT5TZXZlcml0eSBsZXZlbHMgKEVycm9yLCBXYXJuaW5nLCBJbmZvKTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxwPjxlbT5Ob3RlOiBJbiB0aGUgcHVibGlzaGVkIHBsdWdpbiwgdGhpcyB3b3VsZCBvcGVuIHRoZSBmdWxsIGludGVyYWN0aXZlIHJlZmVyZW5jZSBndWlkZSB3aXRoIGJlYXV0aWZ1bCBzdHlsaW5nIGFuZCBmaWx0ZXJpbmcgY2FwYWJpbGl0aWVzLjwvZW0+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgICAgICAgdGhpcy5yZXN1bHRzQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIHRoaXMuZW1wdHlTdGF0ZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxuICAgIHNob3dNb2NrUmVzdWx0cyhhbmFseXNpc1R5cGUpIHtcbiAgICAgICAgLy8gQ3JlYXRlIG1vY2sgYW5hbHlzaXMgZGF0YSBmb3IgdGVzdGluZ1xuICAgICAgICBjb25zdCBtb2NrUmVzdWx0cyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZW5ldElkOiBcImNvbnRyYXN0LXJhdGlvXCIsXG4gICAgICAgICAgICAgICAgdGVuZXRUaXRsZTogXCJTdWZmaWNpZW50IENvbG9yIENvbnRyYXN0XCIsXG4gICAgICAgICAgICAgICAgbm9kZUlkOiBcIm1vY2stdGV4dC0xXCIsXG4gICAgICAgICAgICAgICAgbm9kZU5hbWU6IFwiSGVhZGVyIFRleHRcIixcbiAgICAgICAgICAgICAgICBub2RlVHlwZTogXCJURVhUXCIsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcImZhaWxlZFwiLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiBcImVycm9yXCIsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJUZXh0IGNvbnRyYXN0IHJhdGlvIGlzIDIuODoxLCB3aGljaCBpcyBiZWxvdyB0aGUgcmVxdWlyZWQgNC41OjEgZm9yIG5vcm1hbCB0ZXh0XCIsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwiQWNjZXNzaWJpbGl0eVwiLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGF0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcIlVzZSBkYXJrZXIgdGV4dCBjb2xvcnMgZm9yIGJldHRlciBjb250cmFzdFwiLFxuICAgICAgICAgICAgICAgICAgICBcIlRlc3Qgd2l0aCBhY2Nlc3NpYmlsaXR5IHRvb2xzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQ29uc2lkZXIgdXNlcnMgd2l0aCB2aXN1YWwgaW1wYWlybWVudHNcIixcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZW5ldElkOiBcInRvdWNoLXRhcmdldFwiLFxuICAgICAgICAgICAgICAgIHRlbmV0VGl0bGU6IFwiQWRlcXVhdGUgVG91Y2ggVGFyZ2V0IFNpemVcIixcbiAgICAgICAgICAgICAgICBub2RlSWQ6IFwibW9jay1idXR0b24tMVwiLFxuICAgICAgICAgICAgICAgIG5vZGVOYW1lOiBcIkFjdGlvbiBCdXR0b25cIixcbiAgICAgICAgICAgICAgICBub2RlVHlwZTogXCJGUkFNRVwiLFxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJ3YXJuaW5nXCIsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6IFwid2FybmluZ1wiLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiQnV0dG9uIGlzIDM2eDI0cHgsIHJlY29tbWVuZGVkIG1pbmltdW0gaXMgNDR4NDRweCBmb3IgdG91Y2ggaW50ZXJmYWNlc1wiLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcIlVzYWJpbGl0eVwiLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGF0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcIkluY3JlYXNlIGJ1dHRvbiBzaXplIHRvIGF0IGxlYXN0IDQ0eDQ0cHhcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBZGQgYWRlcXVhdGUgc3BhY2luZyBiZXR3ZWVuIGludGVyYWN0aXZlIGVsZW1lbnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiVGVzdCBvbiBtb2JpbGUgZGV2aWNlc1wiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlbmV0SWQ6IFwidmlzdWFsLWhpZXJhcmNoeVwiLFxuICAgICAgICAgICAgICAgIHRlbmV0VGl0bGU6IFwiQ2xlYXIgVmlzdWFsIEhpZXJhcmNoeVwiLFxuICAgICAgICAgICAgICAgIG5vZGVJZDogXCJtb2NrLWxheW91dC0xXCIsXG4gICAgICAgICAgICAgICAgbm9kZU5hbWU6IFwiQ29udGVudCBTZWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgbm9kZVR5cGU6IFwiRlJBTUVcIixcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGFzc2VkXCIsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6IFwiaW5mb1wiLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiR29vZCB1c2Ugb2YgdHlwb2dyYXBoeSBhbmQgc3BhY2luZyB0byBlc3RhYmxpc2ggaGllcmFyY2h5XCIsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwiVmlzdWFsIEhpZXJhcmNoeVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgbW9ja1N1bW1hcnkgPSB7XG4gICAgICAgICAgICB0b3RhbDogbW9ja1Jlc3VsdHMubGVuZ3RoLFxuICAgICAgICAgICAgcGFzc2VkOiBtb2NrUmVzdWx0cy5maWx0ZXIoKHIpID0+IHIuc3RhdHVzID09PSBcInBhc3NlZFwiKS5sZW5ndGgsXG4gICAgICAgICAgICB2aW9sYXRpb25zOiBtb2NrUmVzdWx0cy5maWx0ZXIoKHIpID0+IHIuc3RhdHVzID09PSBcImZhaWxlZFwiKS5sZW5ndGgsXG4gICAgICAgICAgICBzY29yZTogNjcsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG1vY2tEYXRhID0ge1xuICAgICAgICAgICAgc3VtbWFyeTogbW9ja1N1bW1hcnksXG4gICAgICAgICAgICByZXN1bHRzOiBtb2NrUmVzdWx0cyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zaG93UmVzdWx0cyhtb2NrRGF0YSk7XG4gICAgfVxuICAgIHJlbmRlclN1bW1hcnkoc3VtbWFyeSkge1xuICAgICAgICBjb25zdCBzdW1tYXJ5RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1bW1hcnlcIik7XG4gICAgICAgIGlmICghc3VtbWFyeUVsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBzY29yZUNsYXNzID0gc3VtbWFyeS5zY29yZSA+PSA4MCA/IFwiZ29vZFwiIDogc3VtbWFyeS5zY29yZSA+PSA2MCA/IFwid2FybmluZ1wiIDogXCJlcnJvclwiO1xuICAgICAgICBzdW1tYXJ5RWwuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJzdW1tYXJ5LWNvbnRlbnRcIj48aDM+QW5hbHlzaXMgU3VtbWFyeTwvaDM+PGRpdiBjbGFzcz1cInN1bW1hcnktc3RhdHNcIj48ZGl2IGNsYXNzPVwic3RhdFwiPjxzcGFuIGNsYXNzPVwic3RhdC1sYWJlbFwiPlNjb3JlOjwvc3Bhbj48c3BhbiBjbGFzcz1cInN0YXQtdmFsdWUgJHtzY29yZUNsYXNzfVwiPiR7c3VtbWFyeS5zY29yZX0lPC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9XCJzdGF0XCI+PHNwYW4gY2xhc3M9XCJzdGF0LWxhYmVsXCI+VG90YWwgQ2hlY2tzOjwvc3Bhbj48c3BhbiBjbGFzcz1cInN0YXQtdmFsdWVcIj4ke3N1bW1hcnkudG90YWx9PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9XCJzdGF0XCI+PHNwYW4gY2xhc3M9XCJzdGF0LWxhYmVsXCI+UGFzc2VkOjwvc3Bhbj48c3BhbiBjbGFzcz1cInN0YXQtdmFsdWVcIj4ke3N1bW1hcnkucGFzc2VkfTwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPVwic3RhdFwiPjxzcGFuIGNsYXNzPVwic3RhdC1sYWJlbFwiPklzc3Vlczo8L3NwYW4+PHNwYW4gY2xhc3M9XCJzdGF0LXZhbHVlXCI+JHtzdW1tYXJ5LnZpb2xhdGlvbnN9PC9zcGFuPjwvZGl2PjwvZGl2PjwvZGl2PmA7XG4gICAgICAgIHN1bW1hcnlFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIH1cbiAgICByZW5kZXJSZXN1bHRzKHJlc3VsdHMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0c0xpc3RFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0cy1saXN0XCIpO1xuICAgICAgICBpZiAoIXJlc3VsdHNMaXN0RWwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHJlc3VsdHNMaXN0RWwuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXN1bHRzTGlzdEVsLmlubmVySFRNTCA9XG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJlbXB0eS1tZXNzYWdlXCI+Tm8gaXNzdWVzIGZvdW5kLiBZb3VyIGRlc2lnbiBmb2xsb3dzIGFsbCBjaGVja2VkIHRlbmV0cy48L2Rpdj4nO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHRFbCA9IHRoaXMucmVuZGVyUmVzdWx0SXRlbShyZXN1bHQpO1xuICAgICAgICAgICAgcmVzdWx0c0xpc3RFbC5hcHBlbmRDaGlsZChyZXN1bHRFbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXJSZXN1bHRJdGVtKHJlc3VsdCkge1xuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkaXYuY2xhc3NOYW1lID0gYHJlc3VsdC1pdGVtICR7cmVzdWx0LnNldmVyaXR5fWA7XG4gICAgICAgIGNvbnN0IHJlY29tbWVuZGF0aW9ucyA9IHJlc3VsdC5yZWNvbW1lbmRhdGlvbnNcbiAgICAgICAgICAgID8gYDx1bCBjbGFzcz1cInJlY29tbWVuZGF0aW9uc1wiPiR7cmVzdWx0LnJlY29tbWVuZGF0aW9uc1xuICAgICAgICAgICAgICAgIC5tYXAoKHJlYykgPT4gYDxsaT4ke3JlY308L2xpPmApXG4gICAgICAgICAgICAgICAgLmpvaW4oXCJcIil9PC91bD5gXG4gICAgICAgICAgICA6IFwiXCI7XG4gICAgICAgIGRpdi5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cInJlc3VsdC1oZWFkZXJcIj48aDQ+JHtyZXN1bHQudGVuZXRUaXRsZX08L2g0PjxzcGFuIGNsYXNzPVwicmVzdWx0LXN0YXR1cyAke3Jlc3VsdC5zdGF0dXN9XCI+JHtyZXN1bHQuc3RhdHVzfTwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPVwicmVzdWx0LWRldGFpbHNcIj48cD48c3Ryb25nPkVsZW1lbnQ6PC9zdHJvbmc+ICR7cmVzdWx0Lm5vZGVOYW1lfSAoJHtyZXN1bHQubm9kZVR5cGV9KTwvcD48cD48c3Ryb25nPklzc3VlOjwvc3Ryb25nPiAke3Jlc3VsdC5tZXNzYWdlfTwvcD4ke3JlY29tbWVuZGF0aW9uc308L2Rpdj5gO1xuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH1cbn1cbmNvbnNvbGUubG9nKFwi8J+ThCBVSSBTY3JpcHQgbG9hZGVkLCB3YWl0aW5nIGZvciBET01Db250ZW50TG9hZGVkLi4uXCIpO1xuYWxlcnQoXCLwn5SlIFVJIFNjcmlwdCBpcyBsb2FkaW5nIVwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIuKchSBET01Db250ZW50TG9hZGVkIGZpcmVkLCBjcmVhdGluZyBVSUNvbnRyb2xsZXIuLi5cIik7XG4gICAgYWxlcnQoXCLwn46vIERPTSBpcyByZWFkeSwgY3JlYXRpbmcgVUlDb250cm9sbGVyIVwiKTtcbiAgICB0cnkge1xuICAgICAgICBuZXcgVUlDb250cm9sbGVyKCk7XG4gICAgICAgIGFsZXJ0KFwi4pyFIFVJQ29udHJvbGxlciBjcmVhdGVkIHN1Y2Nlc3NmdWxseSFcIik7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBhbGVydChcIuKdjCBFcnJvciBjcmVhdGluZyBVSUNvbnRyb2xsZXI6IFwiICtcbiAgICAgICAgICAgIChlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpKTtcbiAgICB9XG59KTtcbi8vIEFkZGl0aW9uYWwgZGVidWcgdGVzdFxuY29uc29sZS5sb2coXCLwn5qAIEVORCBPRiBTQ1JJUFQgLSBUeXBlU2NyaXB0IGNvZGUgY29tcGxldGVseSBsb2FkZWQhXCIpO1xuYWxlcnQoXCLwn5qAIFR5cGVTY3JpcHQgc2NyaXB0IGV4ZWN1dGlvbiBjb21wbGV0ZWQhXCIpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9