import { TenetAnalyzer } from "./analyzer/TenetAnalyzer";
import { UITenetsData } from "./data/UITenetsData";
import { AnalysisResult } from "./types/AnalysisTypes";
import { AIExplanationService } from "./services/AIExplanationService";
import uiHtml from "./ui.html";

console.log("🚀 Plugin is starting...");
console.log("📦 UI HTML length:", uiHtml.length);

// Initialize AI service (will use fallback explanations if no API key is provided)
const aiService = new AIExplanationService();
console.log("🤖 AI Service initialized, configured:", aiService.isConfigured());

figma.showUI(uiHtml, {
  width: 800,
  height: 1400,
  themeColors: true,
});

// Try to resize after showing
figma.ui.resize(800, 1400);

console.log("🎨 UI should be shown now");

figma.ui.onmessage = async (msg) => {
  console.log("🔥 Plugin received message:", msg);
  console.log("🔥 Message type:", typeof msg);
  console.log("🔥 Message keys:", Object.keys(msg));

  // Handle both direct messages and pluginMessage wrapped messages
  const actualMessage = msg.pluginMessage || msg;
  console.log("🎯 Actual message to process:", actualMessage);
  console.log("🎯 Message type to check:", actualMessage.type);

  // Add notification to make sure we see the message reception
  figma.notify(`📨 Plugin received: ${actualMessage.type || "undefined type"}`);

  try {
    switch (actualMessage.type) {
      case "analyze-selection":
        console.log("🎯 Handling analyze-selection");
        await analyzeSelection();
        break;
      case "analyze-page":
        console.log("🎯 Handling analyze-page");
        await analyzePage();
        break;
      case "get-tenets-reference":
        console.log("🎯 Handling get-tenets-reference");
        sendTenetsReference();
        break;
      case "open-reference":
        console.log("🎯 Handling open-reference");
        openReferenceGuide();
        break;
      case "get-ai-explanation":
        console.log("🎯 Handling get-ai-explanation");
        await handleAIExplanation(actualMessage.data);
        break;
      default:
        console.log("❌ Unknown message type:", actualMessage.type);
        figma.notify(`❌ Unknown message: ${actualMessage.type || "no type"}`);
    }
  } catch (error) {
    figma.ui.postMessage({
      type: "analysis-error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

async function analyzeSelection() {
  try {
    console.log("🔍 analyzeSelection function started");
    figma.ui.postMessage({ type: "analysis-started" });

    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.ui.postMessage({
        type: "analysis-error",
        error: "Please select one or more elements to analyze",
      });
      return;
    }

    console.log(`📋 Analyzing ${selection.length} selected items`);
    const analyzer = new TenetAnalyzer(UITenetsData);
    const results: AnalysisResult[] = [];

    for (let i = 0; i < selection.length; i++) {
      const node = selection[i];
      console.log(
        `🔍 Analyzing selected node ${i + 1}/${selection.length}: ${
          node.name || "Unnamed"
        } (${node.type})`
      );

      try {
        const nodeResults = await analyzer.analyzeNode(node);
        results.push(...nodeResults);
        console.log(
          `✅ Node ${i + 1} analysis complete, found ${
            nodeResults.length
          } results`
        );
      } catch (error) {
        console.error(`❌ Error analyzing selected node ${node.name}:`, error);
        // Continue with other nodes even if one fails
      }
    }

    console.log(
      `📊 Selection analysis complete. Found ${results.length} total results`
    );
    const summary = calculateSummary(results);

    figma.ui.postMessage({
      type: "analysis-complete",
      data: { summary, results },
    });
  } catch (error) {
    console.error("❌ Selection analysis error:", error);
    figma.ui.postMessage({
      type: "analysis-error",
      error:
        error instanceof Error ? error.message : "Selection analysis failed",
    });
  }
}

async function analyzePage() {
  try {
    console.log("📄 Starting page analysis...");
    figma.notify("🔍 Analyzing page...");

    const analyzer = new TenetAnalyzer(UITenetsData);
    const results: AnalysisResult[] = [];
    let nodeCount = 0;
    const maxNodes = 300; // Reduced limit to prevent timeout

    async function analyzeNodeRecursively(node: SceneNode): Promise<boolean> {
      nodeCount++;

      // Safety check to prevent infinite loops or extremely large analyses
      if (nodeCount > maxNodes) {
        console.warn(
          `⚠️ Reached maximum node limit of ${maxNodes}, stopping analysis`
        );
        return false; // Return false to signal we should stop
      }

      console.log(
        `🔍 Analyzing node ${nodeCount}: ${node.name || "Unnamed"} (${
          node.type
        })`
      );

      try {
        const nodeResults = await analyzer.analyzeNode(node);
        results.push(...nodeResults);
      } catch (error) {
        console.error(`❌ Error analyzing node ${node.name}:`, error);
        // Continue with other nodes even if one fails
      }

      if ("children" in node && node.children) {
        for (const child of node.children) {
          const shouldContinue = await analyzeNodeRecursively(child);
          if (!shouldContinue) return false; // Propagate stop signal
        }
      }

      return true; // Continue processing
    }

    // Add timeout to prevent hanging
    const analysisPromise = async () => {
      for (const child of figma.currentPage.children) {
        const shouldContinue = await analyzeNodeRecursively(child);
        if (!shouldContinue) {
          // Hit the node limit, but that's okay - we'll still show results
          figma.notify(
            `⚠️ Analyzed ${maxNodes} nodes (limit reached), showing results`,
            { timeout: 3000 }
          );
          break;
        }
      }
    };

    // Set a timeout of 15 seconds (reduced)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Analysis timeout after 15 seconds")),
        15000
      );
    });

    await Promise.race([analysisPromise(), timeoutPromise]);

    console.log(
      `📊 Analysis complete. Analyzed ${nodeCount} nodes, found ${results.length} results`
    );

    if (nodeCount >= maxNodes) {
      figma.notify(
        `⚠️ Analyzed ${maxNodes} nodes (limit reached). Found ${results.length} items.`,
        { timeout: 3000 }
      );
    } else {
      figma.notify(
        `✅ Analysis complete! Found ${results.length} items from ${nodeCount} nodes`,
        { timeout: 2000 }
      );
    }

    const summary = calculateSummary(results);

    console.log("📤 Sending results to UI:", {
      resultsCount: results.length,
      summary,
    });

    figma.ui.postMessage({
      type: "analysis-complete",
      data: { summary, results },
    });
  } catch (error) {
    console.error("❌ Page analysis error:", error);
    figma.notify(
      `❌ Analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    figma.ui.postMessage({
      type: "analysis-error",
      error: error instanceof Error ? error.message : "Page analysis failed",
    });
  }
}

function sendTenetsReference() {
  figma.ui.postMessage({
    type: "tenets-reference",
    data: UITenetsData,
  });
}

function openReferenceGuide() {
  // Send a message to show the reference guide within the UI
  figma.ui.postMessage({
    type: "show-reference-guide",
    message:
      "Reference guide functionality will open the tenets reference. In the published plugin, this will show all 14 UI tenets and traps with examples and recommendations.",
  });

  // Also show a notification to the user
  figma.notify(
    "📚 Reference guide contains 14 UI tenets and traps with examples and best practices!"
  );
}

function calculateSummary(results: AnalysisResult[]) {
  const violations = results.filter((r) => r.status === "failed").length;
  const warnings = results.filter((r) => r.status === "warning").length;
  const passed = results.filter((r) => r.status === "passed").length;
  const total = results.length;

  const score =
    total > 0 ? Math.round(((passed + warnings * 0.5) / total) * 100) : 100;

  return {
    total,
    passed,
    violations,
    score,
  };
}

async function handleAIExplanation(data: any) {
  try {
    console.log("🤖 Starting AI explanation for:", data);
    console.log("🔍 AI service configured:", aiService.isConfigured());

    if (!data || !data.violation) {
      console.error("❌ Invalid AI explanation request data:", data);
      throw new Error("Invalid AI explanation request data");
    }

    const { violation, resultIndex } = data;
    console.log("📋 Violation data:", violation);
    console.log("📊 Result index:", resultIndex);

    // Send loading notification
    figma.notify("🤖 Getting AI explanation...", { timeout: 1000 });

    // Get AI explanation
    console.log("🚀 Calling AI service...");
    const explanation = await aiService.getAIExplanation({
      violation: violation,
      designContext: {
        pageType: "Figma Design",
        componentContext: "UI Element",
        userJourney: "Design Review",
      },
    });

    console.log("✅ AI explanation received:", explanation);

    // Validate explanation has required fields
    if (!explanation.explanation) {
      console.warn(
        "⚠️ Received explanation without explanation text, using fallback"
      );
      explanation.explanation = `This ${violation.tenetTitle} issue needs attention to improve user experience.`;
    }

    // Send result back to UI
    console.log("📤 Sending AI explanation to UI...");
    figma.ui.postMessage({
      type: "ai-explanation-complete",
      data: { explanation, resultIndex },
    });

    console.log("✅ AI explanation message sent to UI");

    // Show appropriate notification based on whether it's AI or fallback
    if (aiService.isConfigured()) {
      figma.notify("✨ AI explanation generated!", { timeout: 2000 });
    } else {
      figma.notify("💡 Design insight provided!", { timeout: 2000 });
    }
  } catch (error) {
    console.error("🚨 AI explanation failed:", error);
    console.error(
      "🚨 Error details:",
      error instanceof Error ? error.stack : error
    );

    const errorMessage =
      error instanceof Error ? error.message : "AI explanation failed";
    figma.notify(`❌ AI explanation failed: ${errorMessage}`);

    figma.ui.postMessage({
      type: "ai-explanation-error",
      data: {
        error: errorMessage,
        resultIndex: data.resultIndex, // Include result index for targeted error handling
      },
    });
  }
}

figma.on("selectionchange", () => {
  figma.ui.postMessage({
    type: "selection-changed",
    data: {
      hasSelection: figma.currentPage.selection.length > 0,
      selectionCount: figma.currentPage.selection.length,
    },
  });
});

const uniqueTenets = UITenetsData.map((tenet, index) => ({
  id: tenet.id,
  title: tenet.title,
  description: tenet.description,
  category: tenet.category,
  severity: tenet.severity,
  checkFunction: tenet.checkFunction,
}));

figma.ui.postMessage({
  type: "plugin-ready",
  data: {
    tenets: uniqueTenets,
    hasSelection: figma.currentPage.selection.length > 0,
    aiConfigured: true, // Always true since API key is embedded
  },
});
