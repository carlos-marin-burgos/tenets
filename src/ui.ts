// Global error handler
window.addEventListener("error", function (e) {
  alert("❌ JavaScript Error: " + e.error.message + " at line " + e.lineno);
});

// IMMEDIATE MESSAGE HANDLER - Setup before DOM is ready
console.log("🎯 Setting up immediate message handler...");
console.log("🧪 Testing message handler...");

window.addEventListener("message", (event) => {
  const message = event.data.pluginMessage || event.data;
  console.log("📨 Received message (immediate):", message);
  console.log("📨 Message type:", message?.type);

  if (message && message.type) {
    console.log("✅ Processing message type:", message.type);

    // Handle messages that need immediate response
    switch (message.type) {
      case "ai-explanation-complete":
        console.log("📨 Received ai-explanation-complete:", message.data);
        console.log(
          "🔍 AI Complete - Result index:",
          message.data ? message.data.resultIndex : "undefined"
        );
        console.log(
          "🔍 AI Complete - Explanation:",
          message.data ? message.data.explanation : "undefined"
        );

        // Check DOM state
        const availableDivs = document.querySelectorAll(
          '[id*="ai-explanation"]'
        );
        console.log(
          `🔍 DOM Check: ${availableDivs.length} explanation divs exist`
        );
        availableDivs.forEach((div, idx) => {
          console.log(`  ${idx}: ID="${div.id}"`);
        });

        // Store for later if DOM not ready
        if (document.readyState !== "complete") {
          console.log("⚠️ DOM not ready, storing AI explanation for later");
          (window as any).pendingAIExplanation = message.data;
        } else if ((window as any).showAIExplanation) {
          (window as any).showAIExplanation(
            message.data.resultIndex,
            message.data.explanation
          );
        }
        break;

      case "ai-explanation-error":
        console.log("📨 Received ai-explanation-error:", message.data);
        if ((window as any).handleAIExplanationError) {
          const errorResultIndex = message.data
            ? message.data.resultIndex
            : null;
          (window as any).handleAIExplanationError(
            message.data ? message.data.error : "Unknown error",
            errorResultIndex
          );
        }
        break;

      default:
        // Other messages will be handled by UIController
        console.log(
          "⏭️ Message will be handled by UIController:",
          message.type
        );
        break;
    }
  }
});

// Test message
window.postMessage(
  { pluginMessage: { type: "test-message", data: "test" } },
  "*"
);

try {
  alert("⚡ UI TypeScript file is being parsed!");

  // IMMEDIATE VISUAL TEST - Change page title
  const h1Element = document.querySelector("h1");
  if (h1Element) {
    h1Element.textContent = "🔥 TYPESCRIPT IS WORKING!";
    h1Element.style.color = "red";
  }
} catch (error) {
  alert(
    "❌ Error in initial script: " +
      (error instanceof Error ? error.message : String(error))
  );
}

interface AnalysisResult {
  tenetId: string;
  tenetTitle: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: "passed" | "failed" | "warning";
  severity: "error" | "warning" | "info";
  message: string;
  category: string;
  position?: { x: number; y: number };
  recommendations?: string[];
}

interface AnalysisSummary {
  total: number;
  passed: number;
  violations: number;
  score: number;
}

interface AnalysisData {
  summary: AnalysisSummary;
  results: AnalysisResult[];
}

class UIController {
  private analyzeSelectionBtn: HTMLButtonElement;
  private analyzePageBtn: HTMLButtonElement;
  private loading: HTMLElement;
  private resultsContainer: HTMLElement;
  private emptyState: HTMLElement;

  constructor() {
    console.log("🎯 UI Constructor called - starting initialization...");

    this.analyzeSelectionBtn = document.getElementById(
      "analyze-selection"
    ) as HTMLButtonElement;
    this.analyzePageBtn = document.getElementById(
      "analyze-page"
    ) as HTMLButtonElement;
    this.loading = document.getElementById("loading") as HTMLElement;
    this.resultsContainer = document.getElementById(
      "results-container"
    ) as HTMLElement;
    this.emptyState = document.getElementById("empty-state") as HTMLElement;

    // Debug logging
    console.log("UIController initialized");
    console.log("Selection button:", this.analyzeSelectionBtn);
    console.log("Page button:", this.analyzePageBtn);

    this.setupEventListeners();
    this.setupMessageHandler();
  }

  private setupEventListeners() {
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

  private setupMessageHandler() {
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
      } else {
        console.log("❌ No valid message found");
      }
    };
  }

  private analyzeSelection() {
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
    } else {
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

  private analyzePage() {
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
    } else {
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

  private openReferenceGuide() {
    // Send message to the main plugin code to handle opening the reference
    parent.postMessage({ pluginMessage: { type: "open-reference" } }, "*");
  }

  private handlePluginMessage(message: any) {
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

  private showLoading() {
    console.log("🔄 showLoading called");
    alert("🔄 Showing loading spinner!");
    this.loading.style.display = "block";
    this.resultsContainer.style.display = "none";
    this.emptyState.style.display = "none";
  }

  private hideLoading() {
    console.log("⏹️ hideLoading called");
    this.loading.style.display = "none";
  }

  private showButtonLoading(buttonId: string) {
    const button = document.getElementById(buttonId) as HTMLButtonElement;
    if (button) button.classList.add("btn-loading");
  }

  private hideButtonLoading(buttonId: string) {
    const button = document.getElementById(buttonId) as HTMLButtonElement;
    if (button) button.classList.remove("btn-loading");
  }

  private hideAllButtonLoading() {
    this.hideButtonLoading("analyze-selection");
    this.hideButtonLoading("analyze-page");
  }

  private showResults(data: AnalysisData) {
    this.resultsContainer.style.display = "block";
    this.emptyState.style.display = "none";
    this.renderSummary(data.summary);
    this.renderResults(data.results);
  }

  private showError(error: string) {
    this.resultsContainer.innerHTML = `<div class="error">Error: ${error}</div>`;
    this.resultsContainer.style.display = "block";
    this.emptyState.style.display = "none";
  }

  private showReferenceInfo() {
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

  private showMockResults(analysisType: string) {
    // Create mock analysis data for testing
    const mockResults: AnalysisResult[] = [
      {
        tenetId: "contrast-ratio",
        tenetTitle: "Sufficient Color Contrast",
        nodeId: "mock-text-1",
        nodeName: "Header Text",
        nodeType: "TEXT",
        status: "failed",
        severity: "error",
        message:
          "Text contrast ratio is 2.8:1, which is below the required 4.5:1 for normal text",
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
        message:
          "Button is 36x24px, recommended minimum is 44x44px for touch interfaces",
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

    const mockSummary: AnalysisSummary = {
      total: mockResults.length,
      passed: mockResults.filter((r) => r.status === "passed").length,
      violations: mockResults.filter((r) => r.status === "failed").length,
      score: 67,
    };

    const mockData: AnalysisData = {
      summary: mockSummary,
      results: mockResults,
    };

    this.showResults(mockData);
  }

  private renderSummary(summary: AnalysisSummary) {
    const summaryEl = document.getElementById("summary") as HTMLElement;
    if (!summaryEl) return;
    const scoreClass =
      summary.score >= 80 ? "good" : summary.score >= 60 ? "warning" : "error";
    summaryEl.innerHTML = `<div class="summary-content"><h3>Analysis Summary</h3><div class="summary-stats"><div class="stat"><span class="stat-label">Score:</span><span class="stat-value ${scoreClass}">${summary.score}%</span></div><div class="stat"><span class="stat-label">Total Checks:</span><span class="stat-value">${summary.total}</span></div><div class="stat"><span class="stat-label">Passed:</span><span class="stat-value">${summary.passed}</span></div><div class="stat"><span class="stat-label">Issues:</span><span class="stat-value">${summary.violations}</span></div></div></div>`;
    summaryEl.style.display = "block";
  }

  private renderResults(results: AnalysisResult[]) {
    const resultsListEl = document.getElementById(
      "results-list"
    ) as HTMLElement;
    if (!resultsListEl) return;
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

  private renderResultItem(result: AnalysisResult): HTMLElement {
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
  } catch (error) {
    alert(
      "❌ Error creating UIController: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
});

// Additional debug test
console.log("🚀 END OF SCRIPT - TypeScript code completely loaded!");
alert("🚀 TypeScript script execution completed!");
