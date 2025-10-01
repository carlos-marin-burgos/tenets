/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/analyzer/TenetAnalyzer.ts":
/*!***************************************!*\
  !*** ./src/analyzer/TenetAnalyzer.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenetAnalyzer = void 0;
const TenetCheckers_1 = __webpack_require__(/*! ./TenetCheckers */ "./src/analyzer/TenetCheckers.ts");
class TenetAnalyzer {
    constructor(tenets) {
        this.tenets = tenets;
        this.checkers = new TenetCheckers_1.TenetCheckers();
    }
    /**
     * Analyze a single node and its children recursively
     */
    async analyzeNode(node, depth = 0) {
        const results = [];
        try {
            // Create context for this node
            const context = this.createNodeContext(node, depth);
            // Run all applicable tenets against this node
            for (const tenet of this.tenets) {
                const result = await this.checkTenet(tenet, context);
                if (result) {
                    results.push(result);
                }
            }
            // Recursively analyze children
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    const childResults = await this.analyzeNode(child, depth + 1);
                    results.push(...childResults);
                }
            }
        }
        catch (error) {
            console.error(`Error analyzing node ${node.name}:`, error);
        }
        return results;
    }
    /**
     * Check a specific tenet against a node
     */
    async checkTenet(tenet, context) {
        try {
            // Get the checker function
            const checkerFunction = this.checkers.getChecker(tenet.checkFunction);
            if (!checkerFunction) {
                console.warn(`No checker function found for: ${tenet.checkFunction}`);
                return null;
            }
            // Execute the check
            const checkResult = await checkerFunction(context, tenet);
            // If check passed or not applicable, return null
            if (checkResult.passed || !checkResult.applicable) {
                return null;
            }
            // Create analysis result for violation
            return {
                tenetId: tenet.id,
                tenetTitle: tenet.title,
                nodeId: context.node.id,
                nodeName: context.node.name || "Unnamed",
                nodeType: context.node.type,
                status: checkResult.severity === "error" ? "failed" : "warning",
                severity: checkResult.severity || tenet.severity,
                message: checkResult.message || tenet.description,
                category: tenet.category.name,
                position: {
                    x: context.node.x || 0,
                    y: context.node.y || 0,
                },
                recommendations: checkResult.recommendations || tenet.recommendations,
            };
        }
        catch (error) {
            console.error(`Error checking tenet ${tenet.id}:`, error);
            return null;
        }
    }
    /**
     * Create context information for a node
     */
    createNodeContext(node, depth) {
        const parent = node.parent;
        const siblings = parent
            ? parent.children.filter((child) => child.id !== node.id)
            : [];
        const children = node.children || [];
        // Build ancestor chain
        const ancestors = [];
        let currentParent = parent;
        while (currentParent) {
            ancestors.push(currentParent);
            currentParent = currentParent.parent;
        }
        return {
            node,
            parent,
            ancestors,
            siblings,
            children,
            depth,
        };
    }
    /**
     * Get all available tenets
     */
    getTenets() {
        return this.tenets;
    }
    /**
     * Get tenets by category
     */
    getTenetsByCategory(categoryId) {
        return this.tenets.filter((tenet) => tenet.category.id === categoryId);
    }
    /**
     * Get tenets by type (tenet or trap)
     */
    getTenetsByType(type) {
        return this.tenets.filter((tenet) => tenet.type === type);
    }
}
exports.TenetAnalyzer = TenetAnalyzer;


/***/ }),

/***/ "./src/analyzer/TenetCheckers.ts":
/*!***************************************!*\
  !*** ./src/analyzer/TenetCheckers.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenetCheckers = void 0;
class TenetCheckers {
    constructor() {
        this.checkers = new Map();
        this.initializeCheckers();
    }
    /**
     * Get a checker function by name
     */
    getChecker(name) {
        return this.checkers.get(name);
    }
    /**
     * Initialize all checker functions
     */
    initializeCheckers() {
        // Accessibility checkers
        this.checkers.set("checkColorContrast", this.checkColorContrast.bind(this));
        this.checkers.set("checkFocusIndicators", this.checkFocusIndicators.bind(this));
        this.checkers.set("checkAltTextPlanning", this.checkAltTextPlanning.bind(this));
        this.checkers.set("checkLowContrast", this.checkLowContrast.bind(this));
        this.checkers.set("checkTinyText", this.checkTinyText.bind(this));
        // Usability checkers
        this.checkers.set("checkNavigationStructure", this.checkNavigationStructure.bind(this));
        this.checkers.set("checkInteractiveElements", this.checkInteractiveElements.bind(this));
        this.checkers.set("checkFormClarity", this.checkFormClarity.bind(this));
        this.checkers.set("checkFakeButtons", this.checkFakeButtons.bind(this));
        this.checkers.set("checkHiddenActions", this.checkHiddenActions.bind(this));
        // Visual hierarchy checkers
        this.checkers.set("checkTypographyHierarchy", this.checkTypographyHierarchy.bind(this));
        this.checkers.set("checkVisualWeight", this.checkVisualWeight.bind(this));
        // Consistency checkers
        this.checkers.set("checkComponentConsistency", this.checkComponentConsistency.bind(this));
        this.checkers.set("checkSpacingConsistency", this.checkSpacingConsistency.bind(this));
        this.checkers.set("checkInconsistentNavigation", this.checkInconsistentNavigation.bind(this));
        // Layout checkers
        this.checkers.set("checkTouchTargetSize", this.checkTouchTargetSize.bind(this));
        this.checkers.set("checkResponsiveDesign", this.checkResponsiveDesign.bind(this));
        this.checkers.set("checkOvercrowding", this.checkOvercrowding.bind(this));
    }
    // ACCESSIBILITY CHECKERS
    checkColorContrast(context) {
        const { node } = context;
        // Only check text nodes
        if (node.type !== "TEXT") {
            return { passed: true, applicable: false };
        }
        // Type guard for text nodes
        const textNode = node;
        // Check if text has fills
        if (!textNode.fills || textNode.fills.length === 0) {
            return { passed: true, applicable: false };
        }
        // Get text color
        const textFill = textNode.fills[0];
        if (textFill.type !== "SOLID") {
            return { passed: true, applicable: false };
        }
        // Check parent background color
        const parent = context.parent;
        if (!parent ||
            !("fills" in parent) ||
            !parent.fills ||
            parent.fills.length === 0) {
            return { passed: true, applicable: false };
        }
        const backgroundFill = parent.fills[0];
        if (backgroundFill.type !== "SOLID") {
            return { passed: true, applicable: false };
        }
        // Calculate contrast ratio (simplified)
        const textColor = textFill.color;
        const backgroundColor = backgroundFill.color;
        const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor);
        // Check if text size qualifies as large text
        const fontSize = textNode.fontSize || 16;
        const isLargeText = fontSize >= 18 ||
            (fontSize >= 14 && (textNode.fontWeight || 400) >= 700);
        const requiredRatio = isLargeText ? 3.0 : 4.5;
        if (contrastRatio < requiredRatio) {
            return {
                passed: false,
                applicable: true,
                severity: "error",
                message: `Text contrast ratio ${contrastRatio.toFixed(2)}:1 is below required ${requiredRatio}:1`,
                recommendations: [
                    "Use darker text or lighter background",
                    "Check contrast with accessibility tools",
                    "Consider using system colors with guaranteed contrast",
                ],
            };
        }
        return { passed: true, applicable: true };
    }
    checkLowContrast(context) {
        // This is essentially the same as checkColorContrast but as a trap
        return this.checkColorContrast(context);
    }
    checkFocusIndicators(context) {
        const { node } = context;
        // Check if node appears to be interactive
        if (!this.isInteractiveElement(node)) {
            return { passed: true, applicable: false };
        }
        // In wireframes, we can't check actual focus states, but we can check naming conventions
        const nodeName = (node.name || "").toLowerCase();
        const hasInteractiveIndicator = nodeName.includes("button") ||
            nodeName.includes("link") ||
            nodeName.includes("input") ||
            nodeName.includes("interactive");
        if (!hasInteractiveIndicator) {
            return {
                passed: false,
                applicable: true,
                severity: "warning",
                message: "Interactive elements should be clearly labeled and have focus states planned",
                recommendations: [
                    'Name interactive elements clearly (e.g., "Submit Button")',
                    "Plan focus indicator styles",
                    "Document keyboard navigation flow",
                ],
            };
        }
        return { passed: true, applicable: true };
    }
    checkAltTextPlanning(context) {
        const { node } = context;
        // Check images and icons
        if (node.type !== "RECTANGLE" &&
            node.type !== "ELLIPSE" &&
            node.type !== "FRAME") {
            return { passed: true, applicable: false };
        }
        // Look for image-like naming or fills
        const nodeName = (node.name || "").toLowerCase();
        const hasImageIndicator = nodeName.includes("image") ||
            nodeName.includes("icon") ||
            nodeName.includes("photo") ||
            nodeName.includes("picture");
        if (hasImageIndicator && !nodeName.includes("alt")) {
            return {
                passed: false,
                applicable: true,
                severity: "warning",
                message: "Images and icons should have alt text planned",
                recommendations: [
                    'Add "alt" to layer names to indicate alt text consideration',
                    "Document alt text descriptions",
                    "Consider decorative vs informative images",
                ],
            };
        }
        return { passed: true, applicable: true };
    }
    checkTinyText(context) {
        const { node } = context;
        if (node.type !== "TEXT") {
            return { passed: true, applicable: false };
        }
        const textNode = node;
        const fontSize = textNode.fontSize || 16;
        if (fontSize < 14) {
            return {
                passed: false,
                applicable: true,
                severity: "error",
                message: `Text size ${fontSize}px is too small. Minimum recommended is 14px, preferably 16px`,
                recommendations: [
                    "Increase font size to at least 14px",
                    "Use 16px or larger for body text",
                    "Consider users with visual impairments",
                ],
            };
        }
        return { passed: true, applicable: true };
    }
    // USABILITY CHECKERS
    checkNavigationStructure(context) {
        const { node } = context;
        // Look for navigation-related elements
        const nodeName = (node.name || "").toLowerCase();
        const isNavigation = nodeName.includes("nav") ||
            nodeName.includes("menu") ||
            nodeName.includes("header") ||
            nodeName.includes("breadcrumb");
        if (!isNavigation) {
            return { passed: true, applicable: false };
        }
        // Check if navigation has clear structure
        const hasChildren = "children" in node && node.children && node.children.length > 0;
        if (!hasChildren) {
            return {
                passed: false,
                applicable: true,
                severity: "warning",
                message: "Navigation elements should contain navigation items",
                recommendations: [
                    "Add navigation links/items",
                    "Organize navigation hierarchically",
                    "Ensure consistent navigation structure",
                ],
            };
        }
        return { passed: true, applicable: true };
    }
    checkInteractiveElements(context) {
        const { node } = context;
        if (!this.isInteractiveElement(node)) {
            return { passed: true, applicable: false };
        }
        // Check if element has visual cues for interactivity
        const hasStroke = "strokes" in node && node.strokes && node.strokes.length > 0;
        const hasFill = "fills" in node && node.fills && node.fills.length > 0;
        if (!hasStroke && !hasFill) {
            return {
                passed: false,
                applicable: true,
                severity: "warning",
                message: "Interactive elements should have visual styling to indicate they are clickable",
                recommendations: [
                    "Add borders, backgrounds, or other visual cues",
                    "Ensure buttons look different from regular text",
                    "Plan hover and active states",
                ],
            };
        }
        return { passed: true, applicable: true };
    }
    checkFormClarity(context) {
        const { node } = context;
        // Look for form-related elements
        const nodeName = (node.name || "").toLowerCase();
        const isFormElement = nodeName.includes("form") ||
            nodeName.includes("input") ||
            nodeName.includes("field") ||
            nodeName.includes("label");
        if (!isFormElement) {
            return { passed: true, applicable: false };
        }
        // Check for form structure
        if (nodeName.includes("input") && !nodeName.includes("label")) {
            return {
                passed: false,
                applicable: true,
                severity: "error",
                message: "Form inputs should have associated labels",
                recommendations: [
                    "Add labels for all form inputs",
                    "Include required field indicators",
                    "Plan error message placement",
                ],
            };
        }
        return { passed: true, applicable: true };
    }
    checkTouchTargetSize(context) {
        const { node } = context;
        if (!this.isInteractiveElement(node)) {
            return { passed: true, applicable: false };
        }
        const width = ("width" in node ? node.width : 0) || 0;
        const height = ("height" in node ? node.height : 0) || 0;
        const minSize = 44;
        if (width < minSize || height < minSize) {
            return {
                passed: false,
                applicable: true,
                severity: "error",
                message: `Interactive element ${width}x${height}px is smaller than minimum 44x44px touch target`,
                recommendations: [
                    "Increase button/link size to at least 44x44px",
                    "Add padding around small interactive elements",
                    "Ensure adequate spacing between touch targets",
                ],
            };
        }
        return { passed: true, applicable: true };
    }
    // Add more checker implementations...
    checkFakeButtons(context) {
        // Implementation for checking fake buttons
        return { passed: true, applicable: false };
    }
    checkHiddenActions(context) {
        // Implementation for checking hidden actions
        return { passed: true, applicable: false };
    }
    checkTypographyHierarchy(context) {
        // Implementation for checking typography hierarchy
        return { passed: true, applicable: false };
    }
    checkVisualWeight(context) {
        // Implementation for checking visual weight
        return { passed: true, applicable: false };
    }
    checkComponentConsistency(context) {
        // Implementation for checking component consistency
        return { passed: true, applicable: false };
    }
    checkSpacingConsistency(context) {
        // Implementation for checking spacing consistency
        return { passed: true, applicable: false };
    }
    checkInconsistentNavigation(context) {
        // Implementation for checking inconsistent navigation
        return { passed: true, applicable: false };
    }
    checkResponsiveDesign(context) {
        // Implementation for checking responsive design
        return { passed: true, applicable: false };
    }
    checkOvercrowding(context) {
        // Implementation for checking overcrowding
        return { passed: true, applicable: false };
    }
    // UTILITY METHODS
    isInteractiveElement(node) {
        const nodeName = (node.name || "").toLowerCase();
        return (nodeName.includes("button") ||
            nodeName.includes("link") ||
            nodeName.includes("input") ||
            nodeName.includes("clickable") ||
            nodeName.includes("tap") ||
            (node.type === "FRAME" &&
                (nodeName.includes("card") || nodeName.includes("item"))));
    }
    calculateContrastRatio(color1, color2) {
        // Simplified contrast ratio calculation
        // In a real implementation, you'd use proper WCAG formulas
        const l1 = this.getLuminance(color1);
        const l2 = this.getLuminance(color2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }
    getLuminance(color) {
        // Simplified luminance calculation
        const r = color.r * 255;
        const g = color.g * 255;
        const b = color.b * 255;
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
}
exports.TenetCheckers = TenetCheckers;


/***/ }),

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const TenetAnalyzer_1 = __webpack_require__(/*! ./analyzer/TenetAnalyzer */ "./src/analyzer/TenetAnalyzer.ts");
const UITenetsData_1 = __webpack_require__(/*! ./data/UITenetsData */ "./src/data/UITenetsData.ts");
const AIExplanationService_1 = __webpack_require__(/*! ./services/AIExplanationService */ "./src/services/AIExplanationService.ts");
const ui_html_1 = __importDefault(__webpack_require__(/*! ./ui.html */ "./src/ui.html"));
console.log("🚀 Plugin is starting...");
console.log("📦 UI HTML length:", ui_html_1.default.length);
// Initialize AI service
const aiService = new AIExplanationService_1.AIExplanationService();
figma.showUI(ui_html_1.default, {
    width: 320,
    height: 600,
    themeColors: true,
});
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
            case "configure-ai":
                console.log("🎯 Handling configure-ai");
                configureAI(actualMessage.data);
                break;
            default:
                console.log("❌ Unknown message type:", actualMessage.type);
                figma.notify(`❌ Unknown message: ${actualMessage.type || "no type"}`);
        }
    }
    catch (error) {
        figma.ui.postMessage({
            type: "analysis-error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
async function analyzeSelection() {
    try {
        figma.ui.postMessage({ type: "analysis-started" });
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
            figma.ui.postMessage({
                type: "analysis-error",
                error: "Please select one or more elements to analyze",
            });
            return;
        }
        const analyzer = new TenetAnalyzer_1.TenetAnalyzer(UITenetsData_1.UITenetsData);
        const results = [];
        for (const node of selection) {
            const nodeResults = await analyzer.analyzeNode(node);
            results.push(...nodeResults);
        }
        const summary = calculateSummary(results);
        figma.ui.postMessage({
            type: "analysis-complete",
            data: { summary, results },
        });
    }
    catch (error) {
        figma.ui.postMessage({
            type: "analysis-error",
            error: error instanceof Error ? error.message : "Selection analysis failed",
        });
    }
}
async function analyzePage() {
    try {
        console.log("📄 analyzePage function started");
        figma.ui.postMessage({ type: "analysis-started" });
        const analyzer = new TenetAnalyzer_1.TenetAnalyzer(UITenetsData_1.UITenetsData);
        const results = [];
        async function analyzeNodeRecursively(node) {
            const nodeResults = await analyzer.analyzeNode(node);
            results.push(...nodeResults);
            if ("children" in node) {
                for (const child of node.children) {
                    await analyzeNodeRecursively(child);
                }
            }
        }
        figma.notify("🔍 Analyzing page nodes...");
        for (const child of figma.currentPage.children) {
            await analyzeNodeRecursively(child);
        }
        console.log(`📊 Analysis complete. Found ${results.length} results`);
        figma.notify(`✅ Analysis complete! Found ${results.length} items`, {
            timeout: 2000,
        });
        const summary = calculateSummary(results);
        figma.ui.postMessage({
            type: "analysis-complete",
            data: { summary, results },
        });
    }
    catch (error) {
        console.error("❌ Page analysis error:", error);
        figma.notify(`❌ Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        figma.ui.postMessage({
            type: "analysis-error",
            error: error instanceof Error ? error.message : "Page analysis failed",
        });
    }
}
function sendTenetsReference() {
    figma.ui.postMessage({
        type: "tenets-reference",
        data: UITenetsData_1.UITenetsData,
    });
}
function openReferenceGuide() {
    // Send a message to show the reference guide within the UI
    figma.ui.postMessage({
        type: "show-reference-guide",
        message: "Reference guide functionality will open the tenets reference. In the published plugin, this will show all 14 UI tenets and traps with examples and recommendations.",
    });
    // Also show a notification to the user
    figma.notify("📚 Reference guide contains 14 UI tenets and traps with examples and best practices!");
}
function calculateSummary(results) {
    const violations = results.filter((r) => r.status === "failed").length;
    const warnings = results.filter((r) => r.status === "warning").length;
    const passed = results.filter((r) => r.status === "passed").length;
    const total = results.length;
    const score = total > 0 ? Math.round(((passed + warnings * 0.5) / total) * 100) : 100;
    return {
        total,
        passed,
        violations,
        score,
    };
}
async function handleAIExplanation(data) {
    try {
        console.log("🤖 Starting AI explanation for:", data);
        if (!data || !data.violation) {
            throw new Error("Invalid AI explanation request data");
        }
        const { violation, resultIndex } = data;
        // Send loading notification
        figma.notify("🤖 Getting AI explanation...", { timeout: 1000 });
        // Get AI explanation
        const explanation = await aiService.getAIExplanation({
            violation: violation,
            designContext: {
                pageType: "Figma Design",
                componentContext: "UI Element",
                userJourney: "Design Review",
            },
        });
        // Send result back to UI
        figma.ui.postMessage({
            type: "ai-explanation-complete",
            data: { explanation, resultIndex },
        });
        figma.notify("✨ AI explanation generated!", { timeout: 2000 });
    }
    catch (error) {
        console.error("🚨 AI explanation failed:", error);
        figma.notify(`❌ AI explanation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        figma.ui.postMessage({
            type: "ai-explanation-error",
            data: {
                error: error instanceof Error ? error.message : "AI explanation failed",
            },
        });
    }
}
function configureAI(data) {
    try {
        console.log("🔑 Configuring AI service");
        if (data && data.apiKey) {
            aiService.configure(data.apiKey);
            figma.notify("✅ AI service configured successfully!");
            figma.ui.postMessage({
                type: "ai-configured",
                data: { configured: true },
            });
        }
        else {
            throw new Error("No API key provided");
        }
    }
    catch (error) {
        console.error("🚨 AI configuration failed:", error);
        figma.notify(`❌ AI configuration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        figma.ui.postMessage({
            type: "ai-config-error",
            data: {
                error: error instanceof Error ? error.message : "AI configuration failed",
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
const uniqueTenets = UITenetsData_1.UITenetsData.map((tenet, index) => ({
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
        aiConfigured: aiService.isConfigured(),
    },
});


/***/ }),

/***/ "./src/data/UITenetsData.ts":
/*!**********************************!*\
  !*** ./src/data/UITenetsData.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UITenetsData = exports.UI_TRAPS = exports.UI_TENETS = exports.TENET_CATEGORIES = void 0;
// Define categories for organizing tenets and traps
exports.TENET_CATEGORIES = [
    {
        id: "accessibility",
        name: "Accessibility",
        description: "Ensure designs are usable by people with disabilities",
        color: "#4CAF50",
    },
    {
        id: "usability",
        name: "Usability",
        description: "Create intuitive and user-friendly interfaces",
        color: "#2196F3",
    },
    {
        id: "visual-hierarchy",
        name: "Visual Hierarchy",
        description: "Guide user attention through proper visual structure",
        color: "#FF9800",
    },
    {
        id: "consistency",
        name: "Consistency",
        description: "Maintain consistent patterns and behaviors",
        color: "#9C27B0",
    },
    {
        id: "content",
        name: "Content & Messaging",
        description: "Ensure clear and effective communication",
        color: "#F44336",
    },
    {
        id: "layout",
        name: "Layout & Spacing",
        description: "Organize content with proper spacing and alignment",
        color: "#607D8B",
    },
    {
        id: "interaction",
        name: "Interaction Design",
        description: "Design clear and predictable interactions",
        color: "#795548",
    },
];
// Comprehensive list of UI Tenets and Traps
exports.UI_TENETS = [
    // ACCESSIBILITY TENETS
    {
        id: "contrast-ratio",
        title: "Sufficient Color Contrast",
        description: "Text and background colors must have sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)",
        category: exports.TENET_CATEGORIES[0], // accessibility
        type: "tenet",
        severity: "error",
        checkFunction: "checkColorContrast",
        examples: [
            "Use dark text on light backgrounds",
            "Ensure button text is readable against button background",
        ],
        recommendations: [
            "Use color contrast checking tools",
            "Test with users who have visual impairments",
            "Provide alternative ways to convey information beyond color",
        ],
    },
    {
        id: "focus-indicators",
        title: "Visible Focus Indicators",
        description: "Interactive elements must have clear focus indicators for keyboard navigation",
        category: exports.TENET_CATEGORIES[0], // accessibility
        type: "tenet",
        severity: "error",
        checkFunction: "checkFocusIndicators",
        examples: [
            "Outline or border around focused buttons",
            "Highlighted state for focused form fields",
        ],
        recommendations: [
            "Design custom focus styles that match your brand",
            "Ensure focus indicators are visible against all backgrounds",
            "Test keyboard navigation flow",
        ],
    },
    {
        id: "alt-text-planning",
        title: "Alt Text Consideration",
        description: "Images and icons should have alternative text descriptions planned",
        category: exports.TENET_CATEGORIES[0], // accessibility
        type: "tenet",
        severity: "warning",
        checkFunction: "checkAltTextPlanning",
        examples: [
            "Descriptive text for informational images",
            "Empty alt text for decorative images",
        ],
    },
    // USABILITY TENETS
    {
        id: "clear-navigation",
        title: "Clear Navigation Structure",
        description: "Navigation should be intuitive and consistently placed",
        category: exports.TENET_CATEGORIES[1], // usability
        type: "tenet",
        severity: "error",
        checkFunction: "checkNavigationStructure",
        examples: [
            "Primary navigation in header",
            "Breadcrumbs for deep hierarchies",
            "Clear back/home buttons",
        ],
    },
    {
        id: "button-recognition",
        title: "Recognizable Interactive Elements",
        description: "Buttons and links should look clickable/tappable",
        category: exports.TENET_CATEGORIES[1], // usability
        type: "tenet",
        severity: "error",
        checkFunction: "checkInteractiveElements",
        examples: [
            "Buttons with clear borders or backgrounds",
            "Links with underlines or distinctive styling",
            "Hover states that indicate interactivity",
        ],
    },
    {
        id: "form-clarity",
        title: "Clear Form Design",
        description: "Forms should have clear labels, validation, and error messages",
        category: exports.TENET_CATEGORIES[1], // usability
        type: "tenet",
        severity: "error",
        checkFunction: "checkFormClarity",
        examples: [
            "Labels clearly associated with inputs",
            "Required field indicators",
            "Inline validation feedback",
        ],
    },
    // VISUAL HIERARCHY TENETS
    {
        id: "typography-hierarchy",
        title: "Clear Typography Hierarchy",
        description: "Use consistent text sizing and weight to create clear information hierarchy",
        category: exports.TENET_CATEGORIES[2], // visual-hierarchy
        type: "tenet",
        severity: "warning",
        checkFunction: "checkTypographyHierarchy",
        examples: [
            "Distinct heading sizes (H1, H2, H3)",
            "Consistent body text sizing",
            "Proper line spacing",
        ],
    },
    {
        id: "visual-weight-distribution",
        title: "Balanced Visual Weight",
        description: "Important elements should have appropriate visual prominence",
        category: exports.TENET_CATEGORIES[2], // visual-hierarchy
        type: "tenet",
        severity: "warning",
        checkFunction: "checkVisualWeight",
        examples: [
            "Primary actions more prominent than secondary",
            "Important content larger or bolder",
            "Proper use of whitespace",
        ],
    },
    // CONSISTENCY TENETS
    {
        id: "component-consistency",
        title: "Consistent Component Usage",
        description: "Similar components should look and behave consistently",
        category: exports.TENET_CATEGORIES[3], // consistency
        type: "tenet",
        severity: "error",
        checkFunction: "checkComponentConsistency",
        examples: [
            "All primary buttons use same style",
            "Consistent card layouts",
            "Uniform icon sizing and style",
        ],
    },
    {
        id: "spacing-consistency",
        title: "Consistent Spacing System",
        description: "Use a consistent spacing scale throughout the design",
        category: exports.TENET_CATEGORIES[3], // consistency
        type: "tenet",
        severity: "warning",
        checkFunction: "checkSpacingConsistency",
        examples: [
            "8px grid system (8, 16, 24, 32)",
            "Consistent margins and padding",
            "Uniform gap between elements",
        ],
    },
    // LAYOUT & SPACING TENETS
    {
        id: "adequate-touch-targets",
        title: "Adequate Touch Target Size",
        description: "Interactive elements should be at least 44x44px for touch interfaces",
        category: exports.TENET_CATEGORIES[5], // layout
        type: "tenet",
        severity: "error",
        checkFunction: "checkTouchTargetSize",
        examples: [
            "Buttons minimum 44px height",
            "Tap areas for small icons",
            "Adequate spacing between touch targets",
        ],
    },
    {
        id: "responsive-considerations",
        title: "Responsive Design Planning",
        description: "Consider how the design will adapt to different screen sizes",
        category: exports.TENET_CATEGORIES[5], // layout
        type: "tenet",
        severity: "warning",
        checkFunction: "checkResponsiveDesign",
        examples: [
            "Mobile-first approach",
            "Flexible grid systems",
            "Scalable typography",
        ],
    },
];
// Common UI Traps to Avoid
exports.UI_TRAPS = [
    {
        id: "low-contrast-trap",
        title: "Low Contrast Text",
        description: "Avoid using text with insufficient contrast against backgrounds",
        category: exports.TENET_CATEGORIES[0], // accessibility
        type: "trap",
        severity: "error",
        checkFunction: "checkLowContrast",
        examples: [
            "Light gray text on white background",
            "Color-only information indicators",
        ],
        recommendations: [
            "Use darker text colors",
            "Add icons or patterns alongside color coding",
            "Test with accessibility tools",
        ],
    },
    {
        id: "tiny-text-trap",
        title: "Text Too Small",
        description: "Avoid text smaller than 16px for body text (14px minimum)",
        category: exports.TENET_CATEGORIES[0], // accessibility
        type: "trap",
        severity: "error",
        checkFunction: "checkTinyText",
        examples: ["12px body text", "10px labels"],
        recommendations: [
            "Use 16px or larger for body text",
            "Ensure text is readable on mobile devices",
            "Consider users with visual impairments",
        ],
    },
    {
        id: "fake-buttons-trap",
        title: "Non-Interactive Elements That Look Clickable",
        description: "Avoid styling non-interactive elements to look like buttons",
        category: exports.TENET_CATEGORIES[1], // usability
        type: "trap",
        severity: "error",
        checkFunction: "checkFakeButtons",
        examples: [
            "Styled text that looks like buttons",
            "Cards with button-like styling but no action",
        ],
        recommendations: [
            "Only style interactive elements as buttons",
            "Use clear visual distinctions for different element types",
            "Add hover states to interactive elements",
        ],
    },
    {
        id: "hidden-actions-trap",
        title: "Critical Actions Hidden in Menus",
        description: "Avoid hiding important actions in overflow menus or secondary locations",
        category: exports.TENET_CATEGORIES[1], // usability
        type: "trap",
        severity: "warning",
        checkFunction: "checkHiddenActions",
        examples: [
            "Delete button only in dropdown menu",
            "Primary CTA in hamburger menu",
        ],
        recommendations: [
            "Make important actions visible and accessible",
            "Use progressive disclosure appropriately",
            "Prioritize actions based on user needs",
        ],
    },
    {
        id: "inconsistent-navigation-trap",
        title: "Inconsistent Navigation Patterns",
        description: "Avoid changing navigation structure between similar pages",
        category: exports.TENET_CATEGORIES[3], // consistency
        type: "trap",
        severity: "error",
        checkFunction: "checkInconsistentNavigation",
        examples: [
            "Different menu structures on similar pages",
            "Inconsistent button placement",
            "Varying interaction patterns",
        ],
        recommendations: [
            "Establish consistent navigation patterns",
            "Use design system components",
            "Document navigation guidelines",
        ],
    },
    {
        id: "overcrowded-interface-trap",
        title: "Overcrowded Interface",
        description: "Avoid cramming too many elements without adequate spacing",
        category: exports.TENET_CATEGORIES[5], // layout
        type: "trap",
        severity: "warning",
        checkFunction: "checkOvercrowding",
        examples: [
            "No whitespace between elements",
            "Too many actions in one area",
            "Dense information without grouping",
        ],
        recommendations: [
            "Use whitespace effectively",
            "Group related elements",
            "Prioritize most important content",
        ],
    },
];
// Combine all tenets and traps
exports.UITenetsData = [...exports.UI_TENETS, ...exports.UI_TRAPS];


/***/ }),

/***/ "./src/services/AIExplanationService.ts":
/*!**********************************************!*\
  !*** ./src/services/AIExplanationService.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * AI Service for generating human-friendly design insights
 * Uses GitHub Models API for cost-effective AI explanations
 * Designed to work in Figma's plugin environment
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIExplanationService = void 0;
class AIExplanationService {
    constructor(apiKey) {
        this.baseURL = "https://models.github.ai/inference/chat/completions";
        this.model = "openai/gpt-4.1-mini";
        this.apiKey = apiKey || "";
        console.log("🤖 AIExplanationService initialized with GitHub Models");
    }
    async getAIExplanation(request) {
        if (!this.apiKey) {
            console.warn("🔑 No API key provided, using fallback explanation");
            return this.getFallbackExplanation(request);
        }
        try {
            const prompt = this.buildPrompt(request);
            const response = await fetch(this.baseURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "system",
                            content: "You are a UX/UI design expert helping designers improve their interfaces. Provide clear, actionable advice in a friendly tone.",
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    max_tokens: 300,
                    temperature: 0.7,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`GitHub Models API request failed: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            const content = data.choices &&
                data.choices[0] &&
                data.choices[0].message &&
                data.choices[0].message.content;
            if (!content) {
                throw new Error("No content received from AI model");
            }
            return this.parseAIResponse(content, request);
        }
        catch (error) {
            console.error("🚨 AI explanation failed:", error);
            return this.getFallbackExplanation(request);
        }
    }
    buildPrompt(request) {
        const { violation } = request;
        return `Analyze this UI design issue: ${violation.message} for element ${violation.nodeName}. Provide WHY it matters, HOW to fix it, and the IMPACT if unfixed.`;
    }
    parseAIResponse(content, request) {
        return {
            explanation: content,
            suggestions: this.extractSuggestionsFromText(content),
            impact: "This issue may impact user experience and accessibility",
            examples: [],
        };
    }
    extractSuggestionsFromText(text) {
        const suggestions = [];
        const lines = text.split("\n");
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("-") ||
                trimmed.startsWith("*") ||
                trimmed.match(/^\d+\./)) {
                suggestions.push(trimmed.replace(/^[-*\d.]\s*/, ""));
            }
        }
        return suggestions.length > 0
            ? suggestions
            : [
                "Review design guidelines",
                "Test with users",
                "Consider accessibility",
            ];
    }
    getFallbackExplanation(request) {
        const { violation } = request;
        const fallbacks = {
            contrast: {
                explanation: "This text doesn't have enough contrast against its background, making it difficult for users to read.",
                suggestions: [
                    "Use darker text colors or lighter backgrounds",
                    "Test contrast ratios with accessibility tools",
                    "Aim for at least 4.5:1 contrast ratio for normal text",
                ],
                impact: "Users with visual impairments may not be able to read this content",
            },
            text: {
                explanation: "Text that's too small can be difficult to read, especially for users with visual impairments.",
                suggestions: [
                    "Use at least 16px for body text",
                    "Ensure text scales properly on mobile",
                    "Test readability at different zoom levels",
                ],
                impact: "Users may strain to read small text or be unable to read it entirely",
            },
        };
        const key = Object.keys(fallbacks).find((k) => violation.message.toLowerCase().includes(k) ||
            violation.tenetTitle.toLowerCase().includes(k));
        const defaultFallback = {
            explanation: `The "${violation.tenetTitle}" principle helps ensure your design is user-friendly. ${violation.message}`,
            suggestions: [
                "Review the specific design principle guidelines",
                "Test your design with real users",
                "Consider accessibility and usability standards",
            ],
            impact: "This issue may impact user experience and accessibility",
        };
        return (key ? fallbacks[key] : null) || defaultFallback;
    }
    isConfigured() {
        return !!this.apiKey;
    }
    configure(apiKey) {
        this.apiKey = apiKey;
        console.log("🔑 AI service configured with new API key");
    }
}
exports.AIExplanationService = AIExplanationService;


/***/ }),

/***/ "./src/ui.html":
/*!*********************!*\
  !*** ./src/ui.html ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = "<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>UI Tenets & Traps Analyzer</title>\n    <style>\n        * {\n            box-sizing: border-box;\n            margin: 0;\n            padding: 0;\n        }\n\n        body {\n            font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n            font-size: 12px;\n            line-height: 1.4;\n            color: rgba(255, 255, 255, 0.9);\n            background:\n                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),\n                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),\n                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),\n                linear-gradient(135deg, #0f0c29 0%, #24243e 50%, #313862 100%);\n            padding: 12px;\n            height: 100vh;\n            overflow: hidden;\n            position: relative;\n        }\n\n        body::before {\n            content: '';\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background:\n                radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.01) 0%, transparent 20%),\n                radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.01) 0%, transparent 20%),\n                radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.02) 0%, transparent 30%);\n            pointer-events: none;\n            z-index: 1;\n        }\n\n        .liquid-orb {\n            position: fixed;\n            border-radius: 50%;\n            filter: blur(20px);\n            opacity: 0.3;\n            animation: float 15s ease-in-out infinite;\n            pointer-events: none;\n            z-index: 1;\n        }\n\n        .orb-1 {\n            width: 80px;\n            height: 80px;\n            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);\n            top: 15%;\n            right: 15%;\n            animation-delay: 0s;\n        }\n\n        .orb-2 {\n            width: 60px;\n            height: 60px;\n            background: linear-gradient(45deg, #a8edea, #fed6e3);\n            bottom: 25%;\n            left: 20%;\n            animation-delay: 5s;\n        }\n\n        @keyframes float {\n\n            0%,\n            100% {\n                transform: translate(0, 0) rotate(0deg);\n            }\n\n            33% {\n                transform: translate(20px, -20px) rotate(120deg);\n            }\n\n            66% {\n                transform: translate(-15px, 15px) rotate(240deg);\n            }\n        }\n\n        .main-content {\n            display: flex;\n            flex-direction: column;\n            height: calc(100vh - 24px);\n            position: relative;\n            z-index: 2;\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));\n            -webkit-backdrop-filter: blur(20px);\n            backdrop-filter: blur(20px);\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            border-radius: 16px;\n            padding: 16px;\n            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n        }\n\n        .header {\n            border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n            padding-bottom: 12px;\n            margin-bottom: 12px;\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));\n            -webkit-backdrop-filter: blur(15px);\n            backdrop-filter: blur(15px);\n            border-radius: 12px;\n            padding: 12px;\n            position: relative;\n            overflow: hidden;\n        }\n\n        .header::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);\n            border-radius: inherit;\n            pointer-events: none;\n            opacity: 0;\n            transition: opacity 0.3s ease;\n        }\n\n        .header:hover::before {\n            opacity: 1;\n        }\n\n        .header-top {\n            display: flex;\n            justify-content: space-between;\n            align-items: flex-start;\n            margin-bottom: 8px;\n        }\n\n        .header h1 {\n            font-size: 14px;\n            font-weight: 600;\n            color: rgba(255, 255, 255, 0.95);\n            text-shadow:\n                0 1px 2px rgba(0, 0, 0, 0.8),\n                0 2px 4px rgba(0, 0, 0, 0.6),\n                0 0 8px rgba(255, 255, 255, 0.1);\n            position: relative;\n            z-index: 1;\n        }\n\n        .header p {\n            font-size: 11px;\n            color: rgba(255, 255, 255, 0.7);\n            position: relative;\n            z-index: 1;\n        }\n\n        .reference-link {\n            font-size: 11px;\n            color: #90caf9;\n            text-decoration: none;\n            padding: 6px 12px;\n            border-radius: 20px;\n            background: linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(30, 136, 229, 0.1));\n            border: 1px solid rgba(33, 150, 243, 0.3);\n            -webkit-backdrop-filter: blur(10px);\n            backdrop-filter: blur(10px);\n            transition: all 0.3s ease;\n            white-space: nowrap;\n            display: flex;\n            align-items: center;\n            gap: 4px;\n            font-weight: 500;\n            position: relative;\n            z-index: 1;\n            overflow: hidden;\n        }\n\n        .reference-link::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: -100%;\n            width: 100%;\n            height: 100%;\n            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);\n            transition: left 0.5s ease;\n        }\n\n        .reference-link:hover::before {\n            left: 100%;\n        }\n\n        .reference-link:hover {\n            background: linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(30, 136, 229, 0.2));\n            border-color: rgba(33, 150, 243, 0.5);\n            color: #64b5f6;\n            transform: translateY(-1px);\n            box-shadow: 0 6px 20px rgba(33, 150, 243, 0.3);\n        }\n\n        .controls {\n            display: flex;\n            gap: 8px;\n            margin-bottom: 16px;\n        }\n\n        .ai-config {\n            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));\n            border: 1px solid rgba(102, 126, 234, 0.2);\n            border-radius: 12px;\n            padding: 12px;\n            margin-bottom: 16px;\n            display: none;\n        }\n\n        .ai-config.show {\n            display: block;\n        }\n\n        .ai-config h3 {\n            color: #667eea;\n            font-size: 12px;\n            margin-bottom: 8px;\n        }\n\n        .ai-config input {\n            width: 100%;\n            padding: 8px 12px;\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            border-radius: 8px;\n            background: rgba(255, 255, 255, 0.1);\n            color: rgba(255, 255, 255, 0.9);\n            font-size: 11px;\n            font-family: inherit;\n            margin-bottom: 8px;\n        }\n\n        .ai-config input::placeholder {\n            color: rgba(255, 255, 255, 0.5);\n        }\n\n        .ai-config-buttons {\n            display: flex;\n            gap: 8px;\n        }\n\n        .ai-toggle {\n            background: linear-gradient(135deg, #667eea, #764ba2);\n            color: white;\n            border: none;\n            padding: 6px 12px;\n            border-radius: 8px;\n            font-size: 10px;\n            cursor: pointer;\n            margin-bottom: 8px;\n        }\n\n        .btn {\n            padding: 10px 16px;\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));\n            color: rgba(255, 255, 255, 0.9);\n            border-radius: 12px;\n            cursor: pointer;\n            font-size: 11px;\n            font-weight: 500;\n            transition: all 0.3s ease;\n            font-family: inherit;\n            position: relative;\n            overflow: hidden;\n            -webkit-backdrop-filter: blur(10px);\n            backdrop-filter: blur(10px);\n            z-index: 10;\n        }\n\n        .btn::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: -100%;\n            width: 100%;\n            height: 100%;\n            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);\n            transition: left 0.5s ease;\n            pointer-events: none;\n        }\n\n        .btn:hover::before {\n            left: 100%;\n        }\n\n        .btn:hover {\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));\n            border-color: rgba(255, 255, 255, 0.3);\n            transform: translateY(-1px);\n            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);\n        }\n\n        .btn-primary {\n            background: linear-gradient(135deg, rgba(33, 150, 243, 0.8), rgba(30, 136, 229, 0.6));\n            color: rgba(255, 255, 255, 0.95);\n            border-color: rgba(33, 150, 243, 0.4);\n        }\n\n        .btn-primary:hover {\n            background: linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(30, 136, 229, 0.7));\n            border-color: rgba(33, 150, 243, 0.6);\n            box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4);\n        }\n\n        .btn:disabled {\n            opacity: 0.5;\n            cursor: not-allowed;\n        }\n\n        .btn-loading {\n            pointer-events: none;\n        }\n\n        .btn-loading .btn-text {\n            opacity: 0.6;\n        }\n\n        .btn-loading .btn-spinner {\n            position: absolute;\n            left: 50%;\n            top: 50%;\n            transform: translate(-50%, -50%);\n            width: 12px;\n            height: 12px;\n            border: 1px solid currentColor;\n            border-radius: 50%;\n            border-top-color: transparent;\n            animation: spin 0.8s linear infinite;\n            display: block;\n        }\n\n        .btn-spinner {\n            display: none;\n        }\n\n        .loading {\n            display: none;\n            text-align: center;\n            padding: 32px;\n            color: rgba(255, 255, 255, 0.95);\n            font-weight: 500;\n            text-shadow:\n                0 1px 2px rgba(0, 0, 0, 0.8),\n                0 2px 4px rgba(0, 0, 0, 0.6);\n        }\n\n        .spinner {\n            display: inline-block;\n            width: 20px;\n            height: 20px;\n            border: 2px solid var(--figma-color-border);\n            border-radius: 50%;\n            border-top-color: var(--figma-color-bg-brand);\n            animation: spin 1s ease-in-out infinite;\n            margin-right: 8px;\n        }\n\n        @keyframes spin {\n            to {\n                transform: rotate(360deg);\n            }\n        }\n\n        .scrollable {\n            flex: 1;\n            overflow-y: auto;\n        }\n\n        .results-container {\n            flex: 1;\n            overflow-y: auto;\n            margin-top: 16px;\n        }\n\n        .summary {\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            border-radius: 16px;\n            padding: 16px;\n            margin-bottom: 20px;\n            -webkit-backdrop-filter: blur(20px);\n            backdrop-filter: blur(20px);\n            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n            position: relative;\n            overflow: hidden;\n        }\n\n        .summary::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);\n            border-radius: inherit;\n            pointer-events: none;\n            opacity: 0;\n            transition: opacity 0.3s ease;\n        }\n\n        .summary:hover::before {\n            opacity: 1;\n        }\n\n        .results-list {\n            display: flex;\n            flex-direction: column;\n            gap: 12px;\n            margin-bottom: 8px;\n        }\n\n        .result-item {\n            border: 1px solid rgba(255, 255, 255, 0.15);\n            border-radius: 16px;\n            padding: 16px;\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));\n            -webkit-backdrop-filter: blur(15px);\n            backdrop-filter: blur(15px);\n            transition: all 0.3s ease;\n            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);\n            position: relative;\n            overflow: hidden;\n        }\n\n        .result-item::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.03), transparent);\n            border-radius: inherit;\n            pointer-events: none;\n            opacity: 0;\n            transition: opacity 0.3s ease;\n        }\n\n        .result-item:hover::before {\n            opacity: 1;\n        }\n\n        .result-item:hover {\n            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n            transform: translateY(-2px);\n            border-color: rgba(255, 255, 255, 0.25);\n        }\n\n        .result-item.error {\n            border-left: 4px solid #ff6b6b;\n            background: linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(255, 255, 255, 0.05));\n        }\n\n        .result-item.warning {\n            border-left: 4px solid #ffa726;\n            background: linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(255, 255, 255, 0.05));\n        }\n\n        .result-item.info {\n            border-left: 4px solid #42a5f5;\n            background: linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(255, 255, 255, 0.05));\n        }\n\n        .ai-explain-btn {\n            background: linear-gradient(135deg, #667eea, #764ba2);\n            color: white;\n            border: none;\n            padding: 6px 12px;\n            border-radius: 8px;\n            font-size: 10px;\n            font-weight: 500;\n            cursor: pointer;\n            margin-top: 8px;\n            transition: all 0.3s ease;\n        }\n\n        .ai-explain-btn:hover {\n            transform: translateY(-1px);\n            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);\n        }\n\n        .ai-explain-btn:disabled {\n            opacity: 0.7;\n            cursor: not-allowed;\n            transform: none;\n        }\n\n        .ai-explanation {\n            margin-top: 12px;\n            padding: 12px;\n            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));\n            border-radius: 8px;\n            border: 1px solid rgba(102, 126, 234, 0.2);\n        }\n\n        .ai-explanation-content h5 {\n            margin: 0 0 8px 0;\n            color: #667eea;\n            font-size: 12px;\n        }\n\n        .ai-explanation-text {\n            margin-bottom: 8px;\n            line-height: 1.4;\n            color: rgba(255, 255, 255, 0.9);\n        }\n\n        .ai-suggestions {\n            margin: 8px 0;\n        }\n\n        .ai-suggestions ul {\n            margin: 4px 0;\n            padding-left: 16px;\n        }\n\n        .ai-suggestions li {\n            margin: 2px 0;\n            color: rgba(255, 255, 255, 0.8);\n        }\n\n        .ai-impact {\n            margin-top: 8px;\n            font-style: italic;\n            color: rgba(255, 255, 255, 0.7);\n        }\n\n        .empty-state {\n            text-align: center;\n            padding: 48px 24px;\n            color: rgba(255, 255, 255, 0.7);\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));\n            border-radius: 20px;\n            border: 1px solid rgba(255, 255, 255, 0.15);\n            margin: 20px 0;\n            -webkit-backdrop-filter: blur(15px);\n            backdrop-filter: blur(15px);\n            position: relative;\n            overflow: hidden;\n        }\n\n        .empty-state::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.03), transparent);\n            border-radius: inherit;\n            pointer-events: none;\n            opacity: 0;\n            transition: opacity 0.3s ease;\n        }\n\n        .empty-state:hover::before {\n            opacity: 1;\n        }\n\n        .empty-state-icon {\n            font-size: 32px;\n            margin-bottom: 12px;\n            opacity: 0.8;\n        }\n\n        .hidden {\n            display: none;\n        }\n\n        .reference-info {\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));\n            border: 1px solid rgba(255, 255, 255, 0.15);\n            border-radius: 16px;\n            padding: 20px;\n            color: rgba(255, 255, 255, 0.9);\n            position: relative;\n            overflow: hidden;\n        }\n\n        .reference-info::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.03), transparent);\n            border-radius: inherit;\n            pointer-events: none;\n        }\n\n        .reference-info h2 {\n            color: rgba(255, 255, 255, 0.95);\n            margin-bottom: 15px;\n            font-size: 1.1rem;\n            position: relative;\n            z-index: 1;\n        }\n\n        .reference-info p {\n            margin-bottom: 12px;\n            line-height: 1.5;\n            position: relative;\n            z-index: 1;\n        }\n\n        .reference-info ul {\n            margin: 10px 0 10px 20px;\n            position: relative;\n            z-index: 1;\n        }\n\n        .reference-info li {\n            margin-bottom: 6px;\n            line-height: 1.4;\n        }\n\n        .reference-info strong {\n            color: rgba(255, 255, 255, 0.95);\n        }\n\n        .reference-info em {\n            color: rgba(255, 255, 255, 0.7);\n            font-size: 0.9rem;\n        }\n\n        .summary-content h3 {\n            color: rgba(255, 255, 255, 0.95);\n            margin-bottom: 15px;\n            font-size: 1.1rem;\n        }\n\n        .summary-stats {\n            display: grid;\n            grid-template-columns: repeat(2, 1fr);\n            gap: 12px;\n        }\n\n        .stat {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            padding: 8px 12px;\n            background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));\n            border-radius: 8px;\n            border: 1px solid rgba(255, 255, 255, 0.1);\n        }\n\n        .stat-label {\n            color: rgba(255, 255, 255, 0.8);\n            font-size: 0.9rem;\n        }\n\n        .stat-value {\n            font-weight: 600;\n            font-size: 0.95rem;\n        }\n\n        .stat-value.good {\n            color: #4caf50;\n        }\n\n        .stat-value.warning {\n            color: #ff9800;\n        }\n\n        .stat-value.error {\n            color: #f44336;\n        }\n\n        .result-header {\n            display: flex;\n            justify-content: space-between;\n            align-items: flex-start;\n            margin-bottom: 12px;\n        }\n\n        .result-header h4 {\n            color: rgba(255, 255, 255, 0.95);\n            font-size: 1rem;\n            margin: 0;\n            flex: 1;\n        }\n\n        .result-status {\n            padding: 4px 8px;\n            border-radius: 6px;\n            font-size: 0.75rem;\n            font-weight: 500;\n            text-transform: uppercase;\n            margin-left: 8px;\n        }\n\n        .result-status.passed {\n            background: rgba(76, 175, 80, 0.2);\n            color: #4caf50;\n        }\n\n        .result-status.failed {\n            background: rgba(244, 67, 54, 0.2);\n            color: #f44336;\n        }\n\n        .result-status.warning {\n            background: rgba(255, 152, 0, 0.2);\n            color: #ff9800;\n        }\n\n        .result-details {\n            color: rgba(255, 255, 255, 0.8);\n            line-height: 1.5;\n        }\n\n        .result-details p {\n            margin-bottom: 8px;\n        }\n\n        .result-details strong {\n            color: rgba(255, 255, 255, 0.95);\n        }\n\n        .recommendations {\n            margin-top: 12px;\n            padding-left: 16px;\n        }\n\n        .recommendations li {\n            color: rgba(255, 255, 255, 0.7);\n            margin-bottom: 4px;\n            font-size: 0.9rem;\n        }\n    </style>\n</head>\n\n<body>\n    <div class=\"liquid-orb orb-1\"></div>\n    <div class=\"liquid-orb orb-2\"></div>\n\n    <div class=\"main-content\">\n        <div class=\"header\">\n            <div class=\"header-top\">\n                <div>\n                    <h1>UI Tenets & Traps Analyzer</h1>\n                </div>\n                <a href=\"#\" id=\"reference-link\" class=\"reference-link\">\n                    📚 Reference\n                </a>\n            </div>\n            <p>Analyze your wireframes against UI design best practices</p>\n        </div>\n\n        <div class=\"ai-config\" id=\"ai-config\">\n            <h3>🤖 AI Configuration</h3>\n            <input type=\"password\" id=\"api-key-input\" placeholder=\"Enter your GitHub Personal Access Token\">\n            <div class=\"ai-config-buttons\">\n                <button type=\"button\" id=\"save-api-key\" class=\"btn btn-primary\">Save Key</button>\n                <button type=\"button\" id=\"test-ai\" class=\"btn\">Test AI</button>\n            </div>\n        </div>\n\n        <button type=\"button\" id=\"ai-toggle\" class=\"ai-toggle\">🔧 Configure AI</button>\n\n        <div class=\"controls\">\n            <button type=\"button\" id=\"analyze-selection\" class=\"btn btn-primary\">\n                <span class=\"btn-text\">Analyze Selection</span>\n                <span class=\"btn-spinner\"></span>\n            </button>\n            <button type=\"button\" id=\"analyze-page\" class=\"btn\">\n                <span class=\"btn-text\">Analyze Page</span>\n                <span class=\"btn-spinner\"></span>\n            </button>\n        </div>\n\n        <div id=\"loading\" class=\"loading\">\n            <div>\n                <span class=\"spinner\"></span>\n                Analyzing your design...\n            </div>\n        </div>\n\n        <div class=\"scrollable\">\n            <div id=\"results-container\" class=\"results-container hidden\">\n                <div id=\"summary\" class=\"summary hidden\"></div>\n                <div id=\"results-list\" class=\"results-list\"></div>\n            </div>\n            <div id=\"empty-state\" class=\"empty-state\">\n                <div class=\"empty-state-icon\">🎨</div>\n                <div>Select elements or analyze the entire page to get started</div>\n            </div>\n        </div>\n    </div>\n\n    <" + "script>\n        console.log(\"🎯 UI script loading...\");\n\n        document.addEventListener('DOMContentLoaded', () => {\n            console.log(\"✅ DOM ready, setting up UI...\");\n\n            const pageBtn = document.getElementById('analyze-page');\n            const selectionBtn = document.getElementById('analyze-selection');\n            const loading = document.getElementById('loading');\n            const resultsContainer = document.getElementById('results-container');\n            const emptyState = document.getElementById('empty-state');\n\n            // Button click handlers\n            if (pageBtn) {\n                pageBtn.addEventListener('click', () => {\n                    console.log(\"📄 Analyze page clicked\");\n                    showLoading();\n                    if (parent && parent !== window) {\n                        parent.postMessage({ pluginMessage: { type: 'analyze-page' } }, '*');\n                    }\n                });\n            }\n\n            if (selectionBtn) {\n                selectionBtn.addEventListener('click', () => {\n                    console.log(\"🔍 Analyze selection clicked\");\n                    showLoading();\n                    if (parent && parent !== window) {\n                        parent.postMessage({ pluginMessage: { type: 'analyze-selection' } }, '*');\n                    }\n                });\n            }\n\n            // Reference link handler\n            const referenceLink = document.getElementById('reference-link');\n            if (referenceLink) {\n                referenceLink.addEventListener('click', (e) => {\n                    e.preventDefault();\n                    console.log(\"📚 Reference link clicked\");\n                    if (parent && parent !== window) {\n                        parent.postMessage({ pluginMessage: { type: 'open-reference' } }, '*');\n                    }\n                });\n            }\n\n            // AI Configuration handlers\n            const aiToggle = document.getElementById('ai-toggle');\n            const aiConfig = document.getElementById('ai-config');\n            const apiKeyInput = document.getElementById('api-key-input');\n            const saveApiKeyBtn = document.getElementById('save-api-key');\n            const testAiBtn = document.getElementById('test-ai');\n\n            if (aiToggle) {\n                aiToggle.addEventListener('click', () => {\n                    console.log(\"🔧 AI toggle clicked\");\n                    aiConfig.classList.toggle('show');\n                    aiToggle.textContent = aiConfig.classList.contains('show') ? '🔧 Hide AI Config' : '🔧 Configure AI';\n                });\n            }\n\n            if (saveApiKeyBtn) {\n                saveApiKeyBtn.addEventListener('click', () => {\n                    console.log(\"💾 Save API key clicked\");\n                    const apiKey = apiKeyInput.value.trim();\n                    if (apiKey) {\n                        if (parent && parent !== window) {\n                            parent.postMessage({\n                                pluginMessage: {\n                                    type: 'configure-ai',\n                                    data: { apiKey: apiKey }\n                                }\n                            }, '*');\n                        }\n                        // Clear the input for security\n                        apiKeyInput.value = '';\n                        // Hide the config\n                        aiConfig.classList.remove('show');\n                        aiToggle.textContent = '🔧 Configure AI';\n                    } else {\n                        alert('Please enter your GitHub Personal Access Token');\n                    }\n                });\n            }\n\n            if (testAiBtn) {\n                testAiBtn.addEventListener('click', () => {\n                    console.log(\"🧪 Test AI clicked\");\n                    if (parent && parent !== window) {\n                        parent.postMessage({\n                            pluginMessage: {\n                                type: 'get-ai-explanation',\n                                data: {\n                                    violation: {\n                                        tenetTitle: \"Test Connection\",\n                                        message: \"Testing AI service connection\",\n                                        nodeName: \"Test Element\",\n                                        nodeType: \"Test\",\n                                        category: \"Test\",\n                                        severity: \"info\"\n                                    },\n                                    resultIndex: -1 // Special index for test\n                                }\n                            }\n                        }, '*');\n                    }\n                });\n            }\n\n            // Message handler from plugin\n            window.addEventListener('message', (event) => {\n                const message = event.data.pluginMessage || event.data;\n                console.log(\"📨 Received message:\", message);\n\n                if (message && message.type) {\n                    switch (message.type) {\n                        case 'analysis-started':\n                            showLoading();\n                            break;\n                        case 'analysis-complete':\n                            hideLoading();\n                            showResults(message.data);\n                            break;\n                        case 'analysis-error':\n                            hideLoading();\n                            showError(message.error);\n                            break;\n                        case 'show-reference-guide':\n                            showReferenceGuide(message.message);\n                            break;\n                        case 'ai-explanation-complete':\n                            showAIExplanation(message.data.resultIndex, message.data.explanation);\n                            break;\n                        case 'ai-explanation-error':\n                            handleAIExplanationError(message.data.error);\n                            break;\n                        case 'ai-configured':\n                            console.log(\"✅ AI configured successfully\");\n                            alert('🤖 AI service configured successfully! You can now get AI-powered explanations.');\n                            break;\n                        case 'ai-config-error':\n                            console.log(\"❌ AI configuration failed\");\n                            alert(`❌ AI configuration failed: ${message.data.error}`);\n                            break;\n                    }\n                }\n            });\n\n            function showLoading() {\n                console.log(\"🔄 Showing loading...\");\n                if (loading) loading.style.display = 'block';\n                if (resultsContainer) resultsContainer.style.display = 'none';\n                if (emptyState) emptyState.style.display = 'none';\n            }\n\n            function hideLoading() {\n                console.log(\"⏹️ Hiding loading...\");\n                if (loading) loading.style.display = 'none';\n            }\n\n            function showResults(data) {\n                console.log(\"📊 Showing results:\", data);\n                if (resultsContainer) {\n                    resultsContainer.style.display = 'block';\n                    resultsContainer.innerHTML = `\n                        <div class=\"summary\">\n                            <h3>Analysis Complete</h3>\n                            <p>Score: ${data.summary.score}%</p>\n                            <p>Total: ${data.summary.total} | Passed: ${data.summary.passed} | Issues: ${data.summary.violations}</p>\n                        </div>\n                        <div class=\"results\">\n                            ${data.results.map((result, index) => `\n                                <div class=\"result-item ${result.severity}\" data-result-index=\"${index}\">\n                                    <div class=\"result-header\">\n                                        <h4>${result.tenetTitle}</h4>\n                                        <span class=\"result-status ${result.status}\">${result.status}</span>\n                                    </div>\n                                    <div class=\"result-details\">\n                                        <p><strong>${result.nodeName}</strong> (${result.nodeType}): ${result.message}</p>\n                                        ${result.status === 'failed' || result.status === 'warning' ? `\n                                            <button class=\"ai-explain-btn\" data-result-index=\"${index}\">\n                                                🤖 AI Explain\n                                            </button>\n                                        ` : ''}\n                                        <div class=\"ai-explanation\" id=\"ai-explanation-${index}\" style=\"display: none;\"></div>\n                                    </div>\n                                </div>\n                            `).join('')}\n                        </div>\n                    `;\n\n                    // Add event listeners for AI Explain buttons\n                    resultsContainer.querySelectorAll('.ai-explain-btn').forEach(btn => {\n                        btn.addEventListener('click', handleAIExplainClick);\n                    });\n                }\n                if (emptyState) emptyState.style.display = 'none';\n            }\n\n            function handleAIExplainClick(event) {\n                const button = event.target;\n                const resultIndex = button.getAttribute('data-result-index');\n                const explanationDiv = document.getElementById(`ai-explanation-${resultIndex}`);\n\n                // Show loading state\n                button.textContent = '🤖 Loading...';\n                button.disabled = true;\n\n                // Get the violation data from the results\n                const resultItem = button.closest('.result-item');\n                const violation = {\n                    tenetTitle: resultItem.querySelector('h4').textContent,\n                    message: resultItem.querySelector('.result-details p').textContent,\n                    nodeName: resultItem.querySelector('strong').textContent,\n                    nodeType: 'UI Element', // Could be enhanced to get actual type\n                    category: 'Design',\n                    severity: resultItem.classList.contains('error') ? 'error' : 'warning'\n                };\n\n                // Send request to plugin\n                if (parent && parent !== window) {\n                    parent.postMessage({\n                        pluginMessage: {\n                            type: 'get-ai-explanation',\n                            data: { violation, resultIndex }\n                        }\n                    }, '*');\n                }\n            }\n\n            function showAIExplanation(resultIndex, explanation) {\n                // Handle test case\n                if (resultIndex === -1) {\n                    console.log(\"🧪 AI Test Result:\", explanation);\n                    alert(`🤖 AI Test Successful!\\n\\nExplanation: ${explanation.explanation}\\n\\nThe AI service is working correctly!`);\n                    return;\n                }\n\n                const explanationDiv = document.getElementById(`ai-explanation-${resultIndex}`);\n                const button = document.querySelector(`[data-result-index=\"${resultIndex}\"]`);\n\n                if (explanationDiv && explanation) {\n                    explanationDiv.innerHTML = `\n                        <div class=\"ai-explanation-content\">\n                            <h5>🤖 AI Insights</h5>\n                            <div class=\"ai-explanation-text\">\n                                ${explanation.explanation}\n                            </div>\n                            ${explanation.suggestions && explanation.suggestions.length > 0 ? `\n                                <div class=\"ai-suggestions\">\n                                    <strong>💡 Suggestions:</strong>\n                                    <ul>\n                                        ${explanation.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}\n                                    </ul>\n                                </div>\n                            ` : ''}\n                            <div class=\"ai-impact\">\n                                <strong>⚠️ Impact:</strong> ${explanation.impact}\n                            </div>\n                        </div>\n                    `;\n                    explanationDiv.style.display = 'block';\n                }\n\n                // Reset button\n                if (button) {\n                    button.textContent = '✅ AI Explained';\n                    button.disabled = true;\n                    button.style.opacity = '0.7';\n                }\n            }\n\n            function handleAIExplanationError(error) {\n                console.error(\"AI explanation error:\", error);\n                // Reset all loading buttons\n                document.querySelectorAll('.ai-explain-btn[disabled]').forEach(button => {\n                    button.textContent = '🤖 AI Explain';\n                    button.disabled = false;\n                });\n                // Could show a toast notification here\n                console.log(\"AI explanation failed:\", error);\n            }\n\n            function showError(error) {\n                console.log(\"❌ Showing error:\", error);\n                if (resultsContainer) {\n                    resultsContainer.style.display = 'block';\n                    resultsContainer.innerHTML = `<div class=\"error\">Error: ${error}</div>`;\n                }\n                if (emptyState) emptyState.style.display = 'none';\n            }\n\n            function showReferenceGuide(message) {\n                console.log(\"📚 Showing reference guide:\", message);\n                if (resultsContainer) {\n                    resultsContainer.style.display = 'block';\n                    resultsContainer.innerHTML = `\n                        <div class=\"reference-guide\">\n                            <h3>📚 UI Tenets & Traps Reference</h3>\n                            <p>${message}</p>\n                            <div class=\"reference-info\">\n                                <h4>Complete Reference Includes:</h4>\n                                <ul>\n                                    <li><strong>8 UI Tenets</strong> - Best practices to follow</li>\n                                    <li><strong>6 UI Traps</strong> - Common mistakes to avoid</li>\n                                    <li><strong>7 Categories</strong> - Accessibility, Usability, Visual Hierarchy, etc.</li>\n                                </ul>\n                                <p><em>This feature will open the full interactive reference guide in the published version.</em></p>\n                            </div>\n                        </div>\n                    `;\n                }\n                if (emptyState) emptyState.style.display = 'none';\n            }\n\n            console.log(\"✅ UI setup complete!\");\n        });\n    <" + "/script>\n</body>\n\n</html>";
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/code.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWE7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QscUJBQXFCO0FBQ3JCLHdCQUF3QixtQkFBTyxDQUFDLHdEQUFpQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELFVBQVU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtEQUErRCxvQkFBb0I7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0QsU0FBUztBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCOzs7Ozs7Ozs7OztBQ3pIUjtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELHlCQUF5Qix1QkFBdUIsY0FBYztBQUM5RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsU0FBUztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsTUFBTSxHQUFHLE9BQU87QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCOzs7Ozs7Ozs7OztBQ3pWUjtBQUNiO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELHdCQUF3QixtQkFBTyxDQUFDLGlFQUEwQjtBQUMxRCx1QkFBdUIsbUJBQU8sQ0FBQyx1REFBcUI7QUFDcEQsK0JBQStCLG1CQUFPLENBQUMsK0VBQWlDO0FBQ3hFLGtDQUFrQyxtQkFBTyxDQUFDLGdDQUFXO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsdUNBQXVDO0FBQy9FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1ELGdDQUFnQztBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsMEJBQTBCO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEMsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQiwwQkFBMEI7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1ELGdCQUFnQjtBQUNuRSxtREFBbUQsZ0JBQWdCO0FBQ25FO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEMsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyx5REFBeUQ7QUFDcEc7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IseUJBQXlCO0FBQ3pDO0FBQ0EsdURBQXVELGVBQWU7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiwwQkFBMEI7QUFDOUMsU0FBUztBQUNULHNEQUFzRCxlQUFlO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCx5REFBeUQ7QUFDMUc7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGtCQUFrQjtBQUMxQyxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQseURBQXlEO0FBQzVHO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUM7Ozs7Ozs7Ozs7O0FDelBZO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELG9CQUFvQixHQUFHLGdCQUFnQixHQUFHLGlCQUFpQixHQUFHLHdCQUF3QjtBQUN0RjtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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c0Qsd0VBQXdFLHlDQUF5QywrREFBK0QscU5BQXFOLFFBQVEsaXdCQUFpd0IsbUJBQW1CLG9FQUFvRSxlQUFlLHNEQUFzRCxXQUFXLEVBQUU7QUFDajF0QztBQUNBLGlFQUFlLElBQUksRTs7Ozs7O1VDSG5CO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3VpLXRlbmV0cy1hbmFseXplci8uL3NyYy9hbmFseXplci9UZW5ldEFuYWx5emVyLnRzIiwid2VicGFjazovL3VpLXRlbmV0cy1hbmFseXplci8uL3NyYy9hbmFseXplci9UZW5ldENoZWNrZXJzLnRzIiwid2VicGFjazovL3VpLXRlbmV0cy1hbmFseXplci8uL3NyYy9jb2RlLnRzIiwid2VicGFjazovL3VpLXRlbmV0cy1hbmFseXplci8uL3NyYy9kYXRhL1VJVGVuZXRzRGF0YS50cyIsIndlYnBhY2s6Ly91aS10ZW5ldHMtYW5hbHl6ZXIvLi9zcmMvc2VydmljZXMvQUlFeHBsYW5hdGlvblNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vdWktdGVuZXRzLWFuYWx5emVyLy4vc3JjL3VpLmh0bWwiLCJ3ZWJwYWNrOi8vdWktdGVuZXRzLWFuYWx5emVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3VpLXRlbmV0cy1hbmFseXplci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdWktdGVuZXRzLWFuYWx5emVyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdWktdGVuZXRzLWFuYWx5emVyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vdWktdGVuZXRzLWFuYWx5emVyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vdWktdGVuZXRzLWFuYWx5emVyL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly91aS10ZW5ldHMtYW5hbHl6ZXIvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5UZW5ldEFuYWx5emVyID0gdm9pZCAwO1xuY29uc3QgVGVuZXRDaGVja2Vyc18xID0gcmVxdWlyZShcIi4vVGVuZXRDaGVja2Vyc1wiKTtcbmNsYXNzIFRlbmV0QW5hbHl6ZXIge1xuICAgIGNvbnN0cnVjdG9yKHRlbmV0cykge1xuICAgICAgICB0aGlzLnRlbmV0cyA9IHRlbmV0cztcbiAgICAgICAgdGhpcy5jaGVja2VycyA9IG5ldyBUZW5ldENoZWNrZXJzXzEuVGVuZXRDaGVja2VycygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBbmFseXplIGEgc2luZ2xlIG5vZGUgYW5kIGl0cyBjaGlsZHJlbiByZWN1cnNpdmVseVxuICAgICAqL1xuICAgIGFzeW5jIGFuYWx5emVOb2RlKG5vZGUsIGRlcHRoID0gMCkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgY29udGV4dCBmb3IgdGhpcyBub2RlXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jcmVhdGVOb2RlQ29udGV4dChub2RlLCBkZXB0aCk7XG4gICAgICAgICAgICAvLyBSdW4gYWxsIGFwcGxpY2FibGUgdGVuZXRzIGFnYWluc3QgdGhpcyBub2RlXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRlbmV0IG9mIHRoaXMudGVuZXRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jaGVja1RlbmV0KHRlbmV0LCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGFuYWx5emUgY2hpbGRyZW5cbiAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZFJlc3VsdHMgPSBhd2FpdCB0aGlzLmFuYWx5emVOb2RlKGNoaWxkLCBkZXB0aCArIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goLi4uY2hpbGRSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBhbmFseXppbmcgbm9kZSAke25vZGUubmFtZX06YCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBhIHNwZWNpZmljIHRlbmV0IGFnYWluc3QgYSBub2RlXG4gICAgICovXG4gICAgYXN5bmMgY2hlY2tUZW5ldCh0ZW5ldCwgY29udGV4dCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBjaGVja2VyIGZ1bmN0aW9uXG4gICAgICAgICAgICBjb25zdCBjaGVja2VyRnVuY3Rpb24gPSB0aGlzLmNoZWNrZXJzLmdldENoZWNrZXIodGVuZXQuY2hlY2tGdW5jdGlvbik7XG4gICAgICAgICAgICBpZiAoIWNoZWNrZXJGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgTm8gY2hlY2tlciBmdW5jdGlvbiBmb3VuZCBmb3I6ICR7dGVuZXQuY2hlY2tGdW5jdGlvbn1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgdGhlIGNoZWNrXG4gICAgICAgICAgICBjb25zdCBjaGVja1Jlc3VsdCA9IGF3YWl0IGNoZWNrZXJGdW5jdGlvbihjb250ZXh0LCB0ZW5ldCk7XG4gICAgICAgICAgICAvLyBJZiBjaGVjayBwYXNzZWQgb3Igbm90IGFwcGxpY2FibGUsIHJldHVybiBudWxsXG4gICAgICAgICAgICBpZiAoY2hlY2tSZXN1bHQucGFzc2VkIHx8ICFjaGVja1Jlc3VsdC5hcHBsaWNhYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5hbHlzaXMgcmVzdWx0IGZvciB2aW9sYXRpb25cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVuZXRJZDogdGVuZXQuaWQsXG4gICAgICAgICAgICAgICAgdGVuZXRUaXRsZTogdGVuZXQudGl0bGUsXG4gICAgICAgICAgICAgICAgbm9kZUlkOiBjb250ZXh0Lm5vZGUuaWQsXG4gICAgICAgICAgICAgICAgbm9kZU5hbWU6IGNvbnRleHQubm9kZS5uYW1lIHx8IFwiVW5uYW1lZFwiLFxuICAgICAgICAgICAgICAgIG5vZGVUeXBlOiBjb250ZXh0Lm5vZGUudHlwZSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IGNoZWNrUmVzdWx0LnNldmVyaXR5ID09PSBcImVycm9yXCIgPyBcImZhaWxlZFwiIDogXCJ3YXJuaW5nXCIsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6IGNoZWNrUmVzdWx0LnNldmVyaXR5IHx8IHRlbmV0LnNldmVyaXR5LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrUmVzdWx0Lm1lc3NhZ2UgfHwgdGVuZXQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IHRlbmV0LmNhdGVnb3J5Lm5hbWUsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgeDogY29udGV4dC5ub2RlLnggfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgeTogY29udGV4dC5ub2RlLnkgfHwgMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGF0aW9uczogY2hlY2tSZXN1bHQucmVjb21tZW5kYXRpb25zIHx8IHRlbmV0LnJlY29tbWVuZGF0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBjaGVja2luZyB0ZW5ldCAke3RlbmV0LmlkfTpgLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgY29udGV4dCBpbmZvcm1hdGlvbiBmb3IgYSBub2RlXG4gICAgICovXG4gICAgY3JlYXRlTm9kZUNvbnRleHQobm9kZSwgZGVwdGgpIHtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XG4gICAgICAgIGNvbnN0IHNpYmxpbmdzID0gcGFyZW50XG4gICAgICAgICAgICA/IHBhcmVudC5jaGlsZHJlbi5maWx0ZXIoKGNoaWxkKSA9PiBjaGlsZC5pZCAhPT0gbm9kZS5pZClcbiAgICAgICAgICAgIDogW107XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiB8fCBbXTtcbiAgICAgICAgLy8gQnVpbGQgYW5jZXN0b3IgY2hhaW5cbiAgICAgICAgY29uc3QgYW5jZXN0b3JzID0gW107XG4gICAgICAgIGxldCBjdXJyZW50UGFyZW50ID0gcGFyZW50O1xuICAgICAgICB3aGlsZSAoY3VycmVudFBhcmVudCkge1xuICAgICAgICAgICAgYW5jZXN0b3JzLnB1c2goY3VycmVudFBhcmVudCk7XG4gICAgICAgICAgICBjdXJyZW50UGFyZW50ID0gY3VycmVudFBhcmVudC5wYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBwYXJlbnQsXG4gICAgICAgICAgICBhbmNlc3RvcnMsXG4gICAgICAgICAgICBzaWJsaW5ncyxcbiAgICAgICAgICAgIGNoaWxkcmVuLFxuICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgYXZhaWxhYmxlIHRlbmV0c1xuICAgICAqL1xuICAgIGdldFRlbmV0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVuZXRzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGVuZXRzIGJ5IGNhdGVnb3J5XG4gICAgICovXG4gICAgZ2V0VGVuZXRzQnlDYXRlZ29yeShjYXRlZ29yeUlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRlbmV0cy5maWx0ZXIoKHRlbmV0KSA9PiB0ZW5ldC5jYXRlZ29yeS5pZCA9PT0gY2F0ZWdvcnlJZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0ZW5ldHMgYnkgdHlwZSAodGVuZXQgb3IgdHJhcClcbiAgICAgKi9cbiAgICBnZXRUZW5ldHNCeVR5cGUodHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZW5ldHMuZmlsdGVyKCh0ZW5ldCkgPT4gdGVuZXQudHlwZSA9PT0gdHlwZSk7XG4gICAgfVxufVxuZXhwb3J0cy5UZW5ldEFuYWx5emVyID0gVGVuZXRBbmFseXplcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5UZW5ldENoZWNrZXJzID0gdm9pZCAwO1xuY2xhc3MgVGVuZXRDaGVja2VycyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY2hlY2tlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZUNoZWNrZXJzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhIGNoZWNrZXIgZnVuY3Rpb24gYnkgbmFtZVxuICAgICAqL1xuICAgIGdldENoZWNrZXIobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGVja2Vycy5nZXQobmFtZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgYWxsIGNoZWNrZXIgZnVuY3Rpb25zXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZUNoZWNrZXJzKCkge1xuICAgICAgICAvLyBBY2Nlc3NpYmlsaXR5IGNoZWNrZXJzXG4gICAgICAgIHRoaXMuY2hlY2tlcnMuc2V0KFwiY2hlY2tDb2xvckNvbnRyYXN0XCIsIHRoaXMuY2hlY2tDb2xvckNvbnRyYXN0LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmNoZWNrZXJzLnNldChcImNoZWNrRm9jdXNJbmRpY2F0b3JzXCIsIHRoaXMuY2hlY2tGb2N1c0luZGljYXRvcnMuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuY2hlY2tlcnMuc2V0KFwiY2hlY2tBbHRUZXh0UGxhbm5pbmdcIiwgdGhpcy5jaGVja0FsdFRleHRQbGFubmluZy5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja0xvd0NvbnRyYXN0XCIsIHRoaXMuY2hlY2tMb3dDb250cmFzdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja1RpbnlUZXh0XCIsIHRoaXMuY2hlY2tUaW55VGV4dC5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gVXNhYmlsaXR5IGNoZWNrZXJzXG4gICAgICAgIHRoaXMuY2hlY2tlcnMuc2V0KFwiY2hlY2tOYXZpZ2F0aW9uU3RydWN0dXJlXCIsIHRoaXMuY2hlY2tOYXZpZ2F0aW9uU3RydWN0dXJlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmNoZWNrZXJzLnNldChcImNoZWNrSW50ZXJhY3RpdmVFbGVtZW50c1wiLCB0aGlzLmNoZWNrSW50ZXJhY3RpdmVFbGVtZW50cy5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja0Zvcm1DbGFyaXR5XCIsIHRoaXMuY2hlY2tGb3JtQ2xhcml0eS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja0Zha2VCdXR0b25zXCIsIHRoaXMuY2hlY2tGYWtlQnV0dG9ucy5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja0hpZGRlbkFjdGlvbnNcIiwgdGhpcy5jaGVja0hpZGRlbkFjdGlvbnMuYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIFZpc3VhbCBoaWVyYXJjaHkgY2hlY2tlcnNcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja1R5cG9ncmFwaHlIaWVyYXJjaHlcIiwgdGhpcy5jaGVja1R5cG9ncmFwaHlIaWVyYXJjaHkuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuY2hlY2tlcnMuc2V0KFwiY2hlY2tWaXN1YWxXZWlnaHRcIiwgdGhpcy5jaGVja1Zpc3VhbFdlaWdodC5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gQ29uc2lzdGVuY3kgY2hlY2tlcnNcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja0NvbXBvbmVudENvbnNpc3RlbmN5XCIsIHRoaXMuY2hlY2tDb21wb25lbnRDb25zaXN0ZW5jeS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja1NwYWNpbmdDb25zaXN0ZW5jeVwiLCB0aGlzLmNoZWNrU3BhY2luZ0NvbnNpc3RlbmN5LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmNoZWNrZXJzLnNldChcImNoZWNrSW5jb25zaXN0ZW50TmF2aWdhdGlvblwiLCB0aGlzLmNoZWNrSW5jb25zaXN0ZW50TmF2aWdhdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gTGF5b3V0IGNoZWNrZXJzXG4gICAgICAgIHRoaXMuY2hlY2tlcnMuc2V0KFwiY2hlY2tUb3VjaFRhcmdldFNpemVcIiwgdGhpcy5jaGVja1RvdWNoVGFyZ2V0U2l6ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jaGVja2Vycy5zZXQoXCJjaGVja1Jlc3BvbnNpdmVEZXNpZ25cIiwgdGhpcy5jaGVja1Jlc3BvbnNpdmVEZXNpZ24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuY2hlY2tlcnMuc2V0KFwiY2hlY2tPdmVyY3Jvd2RpbmdcIiwgdGhpcy5jaGVja092ZXJjcm93ZGluZy5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgLy8gQUNDRVNTSUJJTElUWSBDSEVDS0VSU1xuICAgIGNoZWNrQ29sb3JDb250cmFzdChjb250ZXh0KSB7XG4gICAgICAgIGNvbnN0IHsgbm9kZSB9ID0gY29udGV4dDtcbiAgICAgICAgLy8gT25seSBjaGVjayB0ZXh0IG5vZGVzXG4gICAgICAgIGlmIChub2RlLnR5cGUgIT09IFwiVEVYVFwiKSB7XG4gICAgICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHlwZSBndWFyZCBmb3IgdGV4dCBub2Rlc1xuICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IG5vZGU7XG4gICAgICAgIC8vIENoZWNrIGlmIHRleHQgaGFzIGZpbGxzXG4gICAgICAgIGlmICghdGV4dE5vZGUuZmlsbHMgfHwgdGV4dE5vZGUuZmlsbHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gR2V0IHRleHQgY29sb3JcbiAgICAgICAgY29uc3QgdGV4dEZpbGwgPSB0ZXh0Tm9kZS5maWxsc1swXTtcbiAgICAgICAgaWYgKHRleHRGaWxsLnR5cGUgIT09IFwiU09MSURcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgcGFzc2VkOiB0cnVlLCBhcHBsaWNhYmxlOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIHBhcmVudCBiYWNrZ3JvdW5kIGNvbG9yXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGNvbnRleHQucGFyZW50O1xuICAgICAgICBpZiAoIXBhcmVudCB8fFxuICAgICAgICAgICAgIShcImZpbGxzXCIgaW4gcGFyZW50KSB8fFxuICAgICAgICAgICAgIXBhcmVudC5maWxscyB8fFxuICAgICAgICAgICAgcGFyZW50LmZpbGxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgcGFzc2VkOiB0cnVlLCBhcHBsaWNhYmxlOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJhY2tncm91bmRGaWxsID0gcGFyZW50LmZpbGxzWzBdO1xuICAgICAgICBpZiAoYmFja2dyb3VuZEZpbGwudHlwZSAhPT0gXCJTT0xJRFwiKSB7XG4gICAgICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FsY3VsYXRlIGNvbnRyYXN0IHJhdGlvIChzaW1wbGlmaWVkKVxuICAgICAgICBjb25zdCB0ZXh0Q29sb3IgPSB0ZXh0RmlsbC5jb2xvcjtcbiAgICAgICAgY29uc3QgYmFja2dyb3VuZENvbG9yID0gYmFja2dyb3VuZEZpbGwuY29sb3I7XG4gICAgICAgIGNvbnN0IGNvbnRyYXN0UmF0aW8gPSB0aGlzLmNhbGN1bGF0ZUNvbnRyYXN0UmF0aW8odGV4dENvbG9yLCBiYWNrZ3JvdW5kQ29sb3IpO1xuICAgICAgICAvLyBDaGVjayBpZiB0ZXh0IHNpemUgcXVhbGlmaWVzIGFzIGxhcmdlIHRleHRcbiAgICAgICAgY29uc3QgZm9udFNpemUgPSB0ZXh0Tm9kZS5mb250U2l6ZSB8fCAxNjtcbiAgICAgICAgY29uc3QgaXNMYXJnZVRleHQgPSBmb250U2l6ZSA+PSAxOCB8fFxuICAgICAgICAgICAgKGZvbnRTaXplID49IDE0ICYmICh0ZXh0Tm9kZS5mb250V2VpZ2h0IHx8IDQwMCkgPj0gNzAwKTtcbiAgICAgICAgY29uc3QgcmVxdWlyZWRSYXRpbyA9IGlzTGFyZ2VUZXh0ID8gMy4wIDogNC41O1xuICAgICAgICBpZiAoY29udHJhc3RSYXRpbyA8IHJlcXVpcmVkUmF0aW8pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBsaWNhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiBcImVycm9yXCIsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYFRleHQgY29udHJhc3QgcmF0aW8gJHtjb250cmFzdFJhdGlvLnRvRml4ZWQoMil9OjEgaXMgYmVsb3cgcmVxdWlyZWQgJHtyZXF1aXJlZFJhdGlvfToxYCxcbiAgICAgICAgICAgICAgICByZWNvbW1lbmRhdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJVc2UgZGFya2VyIHRleHQgb3IgbGlnaHRlciBiYWNrZ3JvdW5kXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQ2hlY2sgY29udHJhc3Qgd2l0aCBhY2Nlc3NpYmlsaXR5IHRvb2xzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQ29uc2lkZXIgdXNpbmcgc3lzdGVtIGNvbG9ycyB3aXRoIGd1YXJhbnRlZWQgY29udHJhc3RcIixcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IHRydWUgfTtcbiAgICB9XG4gICAgY2hlY2tMb3dDb250cmFzdChjb250ZXh0KSB7XG4gICAgICAgIC8vIFRoaXMgaXMgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgY2hlY2tDb2xvckNvbnRyYXN0IGJ1dCBhcyBhIHRyYXBcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tDb2xvckNvbnRyYXN0KGNvbnRleHQpO1xuICAgIH1cbiAgICBjaGVja0ZvY3VzSW5kaWNhdG9ycyhjb250ZXh0KSB7XG4gICAgICAgIGNvbnN0IHsgbm9kZSB9ID0gY29udGV4dDtcbiAgICAgICAgLy8gQ2hlY2sgaWYgbm9kZSBhcHBlYXJzIHRvIGJlIGludGVyYWN0aXZlXG4gICAgICAgIGlmICghdGhpcy5pc0ludGVyYWN0aXZlRWxlbWVudChub2RlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgcGFzc2VkOiB0cnVlLCBhcHBsaWNhYmxlOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEluIHdpcmVmcmFtZXMsIHdlIGNhbid0IGNoZWNrIGFjdHVhbCBmb2N1cyBzdGF0ZXMsIGJ1dCB3ZSBjYW4gY2hlY2sgbmFtaW5nIGNvbnZlbnRpb25zXG4gICAgICAgIGNvbnN0IG5vZGVOYW1lID0gKG5vZGUubmFtZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBoYXNJbnRlcmFjdGl2ZUluZGljYXRvciA9IG5vZGVOYW1lLmluY2x1ZGVzKFwiYnV0dG9uXCIpIHx8XG4gICAgICAgICAgICBub2RlTmFtZS5pbmNsdWRlcyhcImxpbmtcIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwiaW5wdXRcIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwiaW50ZXJhY3RpdmVcIik7XG4gICAgICAgIGlmICghaGFzSW50ZXJhY3RpdmVJbmRpY2F0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBsaWNhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiBcIndhcm5pbmdcIixcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkludGVyYWN0aXZlIGVsZW1lbnRzIHNob3VsZCBiZSBjbGVhcmx5IGxhYmVsZWQgYW5kIGhhdmUgZm9jdXMgc3RhdGVzIHBsYW5uZWRcIixcbiAgICAgICAgICAgICAgICByZWNvbW1lbmRhdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgJ05hbWUgaW50ZXJhY3RpdmUgZWxlbWVudHMgY2xlYXJseSAoZS5nLiwgXCJTdWJtaXQgQnV0dG9uXCIpJyxcbiAgICAgICAgICAgICAgICAgICAgXCJQbGFuIGZvY3VzIGluZGljYXRvciBzdHlsZXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJEb2N1bWVudCBrZXlib2FyZCBuYXZpZ2F0aW9uIGZsb3dcIixcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IHRydWUgfTtcbiAgICB9XG4gICAgY2hlY2tBbHRUZXh0UGxhbm5pbmcoY29udGV4dCkge1xuICAgICAgICBjb25zdCB7IG5vZGUgfSA9IGNvbnRleHQ7XG4gICAgICAgIC8vIENoZWNrIGltYWdlcyBhbmQgaWNvbnNcbiAgICAgICAgaWYgKG5vZGUudHlwZSAhPT0gXCJSRUNUQU5HTEVcIiAmJlxuICAgICAgICAgICAgbm9kZS50eXBlICE9PSBcIkVMTElQU0VcIiAmJlxuICAgICAgICAgICAgbm9kZS50eXBlICE9PSBcIkZSQU1FXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMb29rIGZvciBpbWFnZS1saWtlIG5hbWluZyBvciBmaWxsc1xuICAgICAgICBjb25zdCBub2RlTmFtZSA9IChub2RlLm5hbWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaGFzSW1hZ2VJbmRpY2F0b3IgPSBub2RlTmFtZS5pbmNsdWRlcyhcImltYWdlXCIpIHx8XG4gICAgICAgICAgICBub2RlTmFtZS5pbmNsdWRlcyhcImljb25cIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwicGhvdG9cIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwicGljdHVyZVwiKTtcbiAgICAgICAgaWYgKGhhc0ltYWdlSW5kaWNhdG9yICYmICFub2RlTmFtZS5pbmNsdWRlcyhcImFsdFwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGxpY2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6IFwid2FybmluZ1wiLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiSW1hZ2VzIGFuZCBpY29ucyBzaG91bGQgaGF2ZSBhbHQgdGV4dCBwbGFubmVkXCIsXG4gICAgICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICdBZGQgXCJhbHRcIiB0byBsYXllciBuYW1lcyB0byBpbmRpY2F0ZSBhbHQgdGV4dCBjb25zaWRlcmF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgXCJEb2N1bWVudCBhbHQgdGV4dCBkZXNjcmlwdGlvbnNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDb25zaWRlciBkZWNvcmF0aXZlIHZzIGluZm9ybWF0aXZlIGltYWdlc1wiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogdHJ1ZSB9O1xuICAgIH1cbiAgICBjaGVja1RpbnlUZXh0KGNvbnRleHQpIHtcbiAgICAgICAgY29uc3QgeyBub2RlIH0gPSBjb250ZXh0O1xuICAgICAgICBpZiAobm9kZS50eXBlICE9PSBcIlRFWFRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgcGFzc2VkOiB0cnVlLCBhcHBsaWNhYmxlOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHROb2RlID0gbm9kZTtcbiAgICAgICAgY29uc3QgZm9udFNpemUgPSB0ZXh0Tm9kZS5mb250U2l6ZSB8fCAxNjtcbiAgICAgICAgaWYgKGZvbnRTaXplIDwgMTQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBsaWNhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiBcImVycm9yXCIsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYFRleHQgc2l6ZSAke2ZvbnRTaXplfXB4IGlzIHRvbyBzbWFsbC4gTWluaW11bSByZWNvbW1lbmRlZCBpcyAxNHB4LCBwcmVmZXJhYmx5IDE2cHhgLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGF0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcIkluY3JlYXNlIGZvbnQgc2l6ZSB0byBhdCBsZWFzdCAxNHB4XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiVXNlIDE2cHggb3IgbGFyZ2VyIGZvciBib2R5IHRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDb25zaWRlciB1c2VycyB3aXRoIHZpc3VhbCBpbXBhaXJtZW50c1wiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogdHJ1ZSB9O1xuICAgIH1cbiAgICAvLyBVU0FCSUxJVFkgQ0hFQ0tFUlNcbiAgICBjaGVja05hdmlnYXRpb25TdHJ1Y3R1cmUoY29udGV4dCkge1xuICAgICAgICBjb25zdCB7IG5vZGUgfSA9IGNvbnRleHQ7XG4gICAgICAgIC8vIExvb2sgZm9yIG5hdmlnYXRpb24tcmVsYXRlZCBlbGVtZW50c1xuICAgICAgICBjb25zdCBub2RlTmFtZSA9IChub2RlLm5hbWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaXNOYXZpZ2F0aW9uID0gbm9kZU5hbWUuaW5jbHVkZXMoXCJuYXZcIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwibWVudVwiKSB8fFxuICAgICAgICAgICAgbm9kZU5hbWUuaW5jbHVkZXMoXCJoZWFkZXJcIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwiYnJlYWRjcnVtYlwiKTtcbiAgICAgICAgaWYgKCFpc05hdmlnYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBpZiBuYXZpZ2F0aW9uIGhhcyBjbGVhciBzdHJ1Y3R1cmVcbiAgICAgICAgY29uc3QgaGFzQ2hpbGRyZW4gPSBcImNoaWxkcmVuXCIgaW4gbm9kZSAmJiBub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMDtcbiAgICAgICAgaWYgKCFoYXNDaGlsZHJlbikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGxpY2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6IFwid2FybmluZ1wiLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiTmF2aWdhdGlvbiBlbGVtZW50cyBzaG91bGQgY29udGFpbiBuYXZpZ2F0aW9uIGl0ZW1zXCIsXG4gICAgICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiQWRkIG5hdmlnYXRpb24gbGlua3MvaXRlbXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJPcmdhbml6ZSBuYXZpZ2F0aW9uIGhpZXJhcmNoaWNhbGx5XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiRW5zdXJlIGNvbnNpc3RlbnQgbmF2aWdhdGlvbiBzdHJ1Y3R1cmVcIixcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IHRydWUgfTtcbiAgICB9XG4gICAgY2hlY2tJbnRlcmFjdGl2ZUVsZW1lbnRzKGNvbnRleHQpIHtcbiAgICAgICAgY29uc3QgeyBub2RlIH0gPSBjb250ZXh0O1xuICAgICAgICBpZiAoIXRoaXMuaXNJbnRlcmFjdGl2ZUVsZW1lbnQobm9kZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBpZiBlbGVtZW50IGhhcyB2aXN1YWwgY3VlcyBmb3IgaW50ZXJhY3Rpdml0eVxuICAgICAgICBjb25zdCBoYXNTdHJva2UgPSBcInN0cm9rZXNcIiBpbiBub2RlICYmIG5vZGUuc3Ryb2tlcyAmJiBub2RlLnN0cm9rZXMubGVuZ3RoID4gMDtcbiAgICAgICAgY29uc3QgaGFzRmlsbCA9IFwiZmlsbHNcIiBpbiBub2RlICYmIG5vZGUuZmlsbHMgJiYgbm9kZS5maWxscy5sZW5ndGggPiAwO1xuICAgICAgICBpZiAoIWhhc1N0cm9rZSAmJiAhaGFzRmlsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGxpY2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6IFwid2FybmluZ1wiLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiSW50ZXJhY3RpdmUgZWxlbWVudHMgc2hvdWxkIGhhdmUgdmlzdWFsIHN0eWxpbmcgdG8gaW5kaWNhdGUgdGhleSBhcmUgY2xpY2thYmxlXCIsXG4gICAgICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiQWRkIGJvcmRlcnMsIGJhY2tncm91bmRzLCBvciBvdGhlciB2aXN1YWwgY3Vlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcIkVuc3VyZSBidXR0b25zIGxvb2sgZGlmZmVyZW50IGZyb20gcmVndWxhciB0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiUGxhbiBob3ZlciBhbmQgYWN0aXZlIHN0YXRlc1wiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogdHJ1ZSB9O1xuICAgIH1cbiAgICBjaGVja0Zvcm1DbGFyaXR5KGNvbnRleHQpIHtcbiAgICAgICAgY29uc3QgeyBub2RlIH0gPSBjb250ZXh0O1xuICAgICAgICAvLyBMb29rIGZvciBmb3JtLXJlbGF0ZWQgZWxlbWVudHNcbiAgICAgICAgY29uc3Qgbm9kZU5hbWUgPSAobm9kZS5uYW1lIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGlzRm9ybUVsZW1lbnQgPSBub2RlTmFtZS5pbmNsdWRlcyhcImZvcm1cIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwiaW5wdXRcIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwiZmllbGRcIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwibGFiZWxcIik7XG4gICAgICAgIGlmICghaXNGb3JtRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgcGFzc2VkOiB0cnVlLCBhcHBsaWNhYmxlOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvciBmb3JtIHN0cnVjdHVyZVxuICAgICAgICBpZiAobm9kZU5hbWUuaW5jbHVkZXMoXCJpbnB1dFwiKSAmJiAhbm9kZU5hbWUuaW5jbHVkZXMoXCJsYWJlbFwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGxpY2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6IFwiZXJyb3JcIixcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkZvcm0gaW5wdXRzIHNob3VsZCBoYXZlIGFzc29jaWF0ZWQgbGFiZWxzXCIsXG4gICAgICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiQWRkIGxhYmVscyBmb3IgYWxsIGZvcm0gaW5wdXRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSW5jbHVkZSByZXF1aXJlZCBmaWVsZCBpbmRpY2F0b3JzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiUGxhbiBlcnJvciBtZXNzYWdlIHBsYWNlbWVudFwiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogdHJ1ZSB9O1xuICAgIH1cbiAgICBjaGVja1RvdWNoVGFyZ2V0U2l6ZShjb250ZXh0KSB7XG4gICAgICAgIGNvbnN0IHsgbm9kZSB9ID0gY29udGV4dDtcbiAgICAgICAgaWYgKCF0aGlzLmlzSW50ZXJhY3RpdmVFbGVtZW50KG5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgd2lkdGggPSAoXCJ3aWR0aFwiIGluIG5vZGUgPyBub2RlLndpZHRoIDogMCkgfHwgMDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gKFwiaGVpZ2h0XCIgaW4gbm9kZSA/IG5vZGUuaGVpZ2h0IDogMCkgfHwgMDtcbiAgICAgICAgY29uc3QgbWluU2l6ZSA9IDQ0O1xuICAgICAgICBpZiAod2lkdGggPCBtaW5TaXplIHx8IGhlaWdodCA8IG1pblNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBsaWNhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiBcImVycm9yXCIsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYEludGVyYWN0aXZlIGVsZW1lbnQgJHt3aWR0aH14JHtoZWlnaHR9cHggaXMgc21hbGxlciB0aGFuIG1pbmltdW0gNDR4NDRweCB0b3VjaCB0YXJnZXRgLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGF0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcIkluY3JlYXNlIGJ1dHRvbi9saW5rIHNpemUgdG8gYXQgbGVhc3QgNDR4NDRweFwiLFxuICAgICAgICAgICAgICAgICAgICBcIkFkZCBwYWRkaW5nIGFyb3VuZCBzbWFsbCBpbnRlcmFjdGl2ZSBlbGVtZW50c1wiLFxuICAgICAgICAgICAgICAgICAgICBcIkVuc3VyZSBhZGVxdWF0ZSBzcGFjaW5nIGJldHdlZW4gdG91Y2ggdGFyZ2V0c1wiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogdHJ1ZSB9O1xuICAgIH1cbiAgICAvLyBBZGQgbW9yZSBjaGVja2VyIGltcGxlbWVudGF0aW9ucy4uLlxuICAgIGNoZWNrRmFrZUJ1dHRvbnMoY29udGV4dCkge1xuICAgICAgICAvLyBJbXBsZW1lbnRhdGlvbiBmb3IgY2hlY2tpbmcgZmFrZSBidXR0b25zXG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogZmFsc2UgfTtcbiAgICB9XG4gICAgY2hlY2tIaWRkZW5BY3Rpb25zKGNvbnRleHQpIHtcbiAgICAgICAgLy8gSW1wbGVtZW50YXRpb24gZm9yIGNoZWNraW5nIGhpZGRlbiBhY3Rpb25zXG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogZmFsc2UgfTtcbiAgICB9XG4gICAgY2hlY2tUeXBvZ3JhcGh5SGllcmFyY2h5KGNvbnRleHQpIHtcbiAgICAgICAgLy8gSW1wbGVtZW50YXRpb24gZm9yIGNoZWNraW5nIHR5cG9ncmFwaHkgaGllcmFyY2h5XG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogZmFsc2UgfTtcbiAgICB9XG4gICAgY2hlY2tWaXN1YWxXZWlnaHQoY29udGV4dCkge1xuICAgICAgICAvLyBJbXBsZW1lbnRhdGlvbiBmb3IgY2hlY2tpbmcgdmlzdWFsIHdlaWdodFxuICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgfVxuICAgIGNoZWNrQ29tcG9uZW50Q29uc2lzdGVuY3koY29udGV4dCkge1xuICAgICAgICAvLyBJbXBsZW1lbnRhdGlvbiBmb3IgY2hlY2tpbmcgY29tcG9uZW50IGNvbnNpc3RlbmN5XG4gICAgICAgIHJldHVybiB7IHBhc3NlZDogdHJ1ZSwgYXBwbGljYWJsZTogZmFsc2UgfTtcbiAgICB9XG4gICAgY2hlY2tTcGFjaW5nQ29uc2lzdGVuY3koY29udGV4dCkge1xuICAgICAgICAvLyBJbXBsZW1lbnRhdGlvbiBmb3IgY2hlY2tpbmcgc3BhY2luZyBjb25zaXN0ZW5jeVxuICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgfVxuICAgIGNoZWNrSW5jb25zaXN0ZW50TmF2aWdhdGlvbihjb250ZXh0KSB7XG4gICAgICAgIC8vIEltcGxlbWVudGF0aW9uIGZvciBjaGVja2luZyBpbmNvbnNpc3RlbnQgbmF2aWdhdGlvblxuICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgfVxuICAgIGNoZWNrUmVzcG9uc2l2ZURlc2lnbihjb250ZXh0KSB7XG4gICAgICAgIC8vIEltcGxlbWVudGF0aW9uIGZvciBjaGVja2luZyByZXNwb25zaXZlIGRlc2lnblxuICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgfVxuICAgIGNoZWNrT3ZlcmNyb3dkaW5nKGNvbnRleHQpIHtcbiAgICAgICAgLy8gSW1wbGVtZW50YXRpb24gZm9yIGNoZWNraW5nIG92ZXJjcm93ZGluZ1xuICAgICAgICByZXR1cm4geyBwYXNzZWQ6IHRydWUsIGFwcGxpY2FibGU6IGZhbHNlIH07XG4gICAgfVxuICAgIC8vIFVUSUxJVFkgTUVUSE9EU1xuICAgIGlzSW50ZXJhY3RpdmVFbGVtZW50KG5vZGUpIHtcbiAgICAgICAgY29uc3Qgbm9kZU5hbWUgPSAobm9kZS5uYW1lIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAobm9kZU5hbWUuaW5jbHVkZXMoXCJidXR0b25cIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwibGlua1wiKSB8fFxuICAgICAgICAgICAgbm9kZU5hbWUuaW5jbHVkZXMoXCJpbnB1dFwiKSB8fFxuICAgICAgICAgICAgbm9kZU5hbWUuaW5jbHVkZXMoXCJjbGlja2FibGVcIikgfHxcbiAgICAgICAgICAgIG5vZGVOYW1lLmluY2x1ZGVzKFwidGFwXCIpIHx8XG4gICAgICAgICAgICAobm9kZS50eXBlID09PSBcIkZSQU1FXCIgJiZcbiAgICAgICAgICAgICAgICAobm9kZU5hbWUuaW5jbHVkZXMoXCJjYXJkXCIpIHx8IG5vZGVOYW1lLmluY2x1ZGVzKFwiaXRlbVwiKSkpKTtcbiAgICB9XG4gICAgY2FsY3VsYXRlQ29udHJhc3RSYXRpbyhjb2xvcjEsIGNvbG9yMikge1xuICAgICAgICAvLyBTaW1wbGlmaWVkIGNvbnRyYXN0IHJhdGlvIGNhbGN1bGF0aW9uXG4gICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgeW91J2QgdXNlIHByb3BlciBXQ0FHIGZvcm11bGFzXG4gICAgICAgIGNvbnN0IGwxID0gdGhpcy5nZXRMdW1pbmFuY2UoY29sb3IxKTtcbiAgICAgICAgY29uc3QgbDIgPSB0aGlzLmdldEx1bWluYW5jZShjb2xvcjIpO1xuICAgICAgICBjb25zdCBsaWdodGVyID0gTWF0aC5tYXgobDEsIGwyKTtcbiAgICAgICAgY29uc3QgZGFya2VyID0gTWF0aC5taW4obDEsIGwyKTtcbiAgICAgICAgcmV0dXJuIChsaWdodGVyICsgMC4wNSkgLyAoZGFya2VyICsgMC4wNSk7XG4gICAgfVxuICAgIGdldEx1bWluYW5jZShjb2xvcikge1xuICAgICAgICAvLyBTaW1wbGlmaWVkIGx1bWluYW5jZSBjYWxjdWxhdGlvblxuICAgICAgICBjb25zdCByID0gY29sb3IuciAqIDI1NTtcbiAgICAgICAgY29uc3QgZyA9IGNvbG9yLmcgKiAyNTU7XG4gICAgICAgIGNvbnN0IGIgPSBjb2xvci5iICogMjU1O1xuICAgICAgICByZXR1cm4gKDAuMjk5ICogciArIDAuNTg3ICogZyArIDAuMTE0ICogYikgLyAyNTU7XG4gICAgfVxufVxuZXhwb3J0cy5UZW5ldENoZWNrZXJzID0gVGVuZXRDaGVja2VycztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgVGVuZXRBbmFseXplcl8xID0gcmVxdWlyZShcIi4vYW5hbHl6ZXIvVGVuZXRBbmFseXplclwiKTtcbmNvbnN0IFVJVGVuZXRzRGF0YV8xID0gcmVxdWlyZShcIi4vZGF0YS9VSVRlbmV0c0RhdGFcIik7XG5jb25zdCBBSUV4cGxhbmF0aW9uU2VydmljZV8xID0gcmVxdWlyZShcIi4vc2VydmljZXMvQUlFeHBsYW5hdGlvblNlcnZpY2VcIik7XG5jb25zdCB1aV9odG1sXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vdWkuaHRtbFwiKSk7XG5jb25zb2xlLmxvZyhcIvCfmoAgUGx1Z2luIGlzIHN0YXJ0aW5nLi4uXCIpO1xuY29uc29sZS5sb2coXCLwn5OmIFVJIEhUTUwgbGVuZ3RoOlwiLCB1aV9odG1sXzEuZGVmYXVsdC5sZW5ndGgpO1xuLy8gSW5pdGlhbGl6ZSBBSSBzZXJ2aWNlXG5jb25zdCBhaVNlcnZpY2UgPSBuZXcgQUlFeHBsYW5hdGlvblNlcnZpY2VfMS5BSUV4cGxhbmF0aW9uU2VydmljZSgpO1xuZmlnbWEuc2hvd1VJKHVpX2h0bWxfMS5kZWZhdWx0LCB7XG4gICAgd2lkdGg6IDMyMCxcbiAgICBoZWlnaHQ6IDYwMCxcbiAgICB0aGVtZUNvbG9yczogdHJ1ZSxcbn0pO1xuY29uc29sZS5sb2coXCLwn46oIFVJIHNob3VsZCBiZSBzaG93biBub3dcIik7XG5maWdtYS51aS5vbm1lc3NhZ2UgPSBhc3luYyAobXNnKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCLwn5SlIFBsdWdpbiByZWNlaXZlZCBtZXNzYWdlOlwiLCBtc2cpO1xuICAgIGNvbnNvbGUubG9nKFwi8J+UpSBNZXNzYWdlIHR5cGU6XCIsIHR5cGVvZiBtc2cpO1xuICAgIGNvbnNvbGUubG9nKFwi8J+UpSBNZXNzYWdlIGtleXM6XCIsIE9iamVjdC5rZXlzKG1zZykpO1xuICAgIC8vIEhhbmRsZSBib3RoIGRpcmVjdCBtZXNzYWdlcyBhbmQgcGx1Z2luTWVzc2FnZSB3cmFwcGVkIG1lc3NhZ2VzXG4gICAgY29uc3QgYWN0dWFsTWVzc2FnZSA9IG1zZy5wbHVnaW5NZXNzYWdlIHx8IG1zZztcbiAgICBjb25zb2xlLmxvZyhcIvCfjq8gQWN0dWFsIG1lc3NhZ2UgdG8gcHJvY2VzczpcIiwgYWN0dWFsTWVzc2FnZSk7XG4gICAgY29uc29sZS5sb2coXCLwn46vIE1lc3NhZ2UgdHlwZSB0byBjaGVjazpcIiwgYWN0dWFsTWVzc2FnZS50eXBlKTtcbiAgICAvLyBBZGQgbm90aWZpY2F0aW9uIHRvIG1ha2Ugc3VyZSB3ZSBzZWUgdGhlIG1lc3NhZ2UgcmVjZXB0aW9uXG4gICAgZmlnbWEubm90aWZ5KGDwn5OoIFBsdWdpbiByZWNlaXZlZDogJHthY3R1YWxNZXNzYWdlLnR5cGUgfHwgXCJ1bmRlZmluZWQgdHlwZVwifWApO1xuICAgIHRyeSB7XG4gICAgICAgIHN3aXRjaCAoYWN0dWFsTWVzc2FnZS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwiYW5hbHl6ZS1zZWxlY3Rpb25cIjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq8gSGFuZGxpbmcgYW5hbHl6ZS1zZWxlY3Rpb25cIik7XG4gICAgICAgICAgICAgICAgYXdhaXQgYW5hbHl6ZVNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImFuYWx5emUtcGFnZVwiOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OryBIYW5kbGluZyBhbmFseXplLXBhZ2VcIik7XG4gICAgICAgICAgICAgICAgYXdhaXQgYW5hbHl6ZVBhZ2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJnZXQtdGVuZXRzLXJlZmVyZW5jZVwiOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OryBIYW5kbGluZyBnZXQtdGVuZXRzLXJlZmVyZW5jZVwiKTtcbiAgICAgICAgICAgICAgICBzZW5kVGVuZXRzUmVmZXJlbmNlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwib3Blbi1yZWZlcmVuY2VcIjpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq8gSGFuZGxpbmcgb3Blbi1yZWZlcmVuY2VcIik7XG4gICAgICAgICAgICAgICAgb3BlblJlZmVyZW5jZUd1aWRlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZ2V0LWFpLWV4cGxhbmF0aW9uXCI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn46vIEhhbmRsaW5nIGdldC1haS1leHBsYW5hdGlvblwiKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBoYW5kbGVBSUV4cGxhbmF0aW9uKGFjdHVhbE1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29uZmlndXJlLWFpXCI6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn46vIEhhbmRsaW5nIGNvbmZpZ3VyZS1haVwiKTtcbiAgICAgICAgICAgICAgICBjb25maWd1cmVBSShhY3R1YWxNZXNzYWdlLmRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuKdjCBVbmtub3duIG1lc3NhZ2UgdHlwZTpcIiwgYWN0dWFsTWVzc2FnZS50eXBlKTtcbiAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoYOKdjCBVbmtub3duIG1lc3NhZ2U6ICR7YWN0dWFsTWVzc2FnZS50eXBlIHx8IFwibm8gdHlwZVwifWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICB0eXBlOiBcImFuYWx5c2lzLWVycm9yXCIsXG4gICAgICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIixcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbmFzeW5jIGZ1bmN0aW9uIGFuYWx5emVTZWxlY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyB0eXBlOiBcImFuYWx5c2lzLXN0YXJ0ZWRcIiB9KTtcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgICAgICBpZiAoc2VsZWN0aW9uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYW5hbHlzaXMtZXJyb3JcIixcbiAgICAgICAgICAgICAgICBlcnJvcjogXCJQbGVhc2Ugc2VsZWN0IG9uZSBvciBtb3JlIGVsZW1lbnRzIHRvIGFuYWx5emVcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFuYWx5emVyID0gbmV3IFRlbmV0QW5hbHl6ZXJfMS5UZW5ldEFuYWx5emVyKFVJVGVuZXRzRGF0YV8xLlVJVGVuZXRzRGF0YSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIHNlbGVjdGlvbikge1xuICAgICAgICAgICAgY29uc3Qgbm9kZVJlc3VsdHMgPSBhd2FpdCBhbmFseXplci5hbmFseXplTm9kZShub2RlKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCguLi5ub2RlUmVzdWx0cyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGNhbGN1bGF0ZVN1bW1hcnkocmVzdWx0cyk7XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6IFwiYW5hbHlzaXMtY29tcGxldGVcIixcbiAgICAgICAgICAgIGRhdGE6IHsgc3VtbWFyeSwgcmVzdWx0cyB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6IFwiYW5hbHlzaXMtZXJyb3JcIixcbiAgICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiU2VsZWN0aW9uIGFuYWx5c2lzIGZhaWxlZFwiLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBhbmFseXplUGFnZSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfk4QgYW5hbHl6ZVBhZ2UgZnVuY3Rpb24gc3RhcnRlZFwiKTtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyB0eXBlOiBcImFuYWx5c2lzLXN0YXJ0ZWRcIiB9KTtcbiAgICAgICAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgVGVuZXRBbmFseXplcl8xLlRlbmV0QW5hbHl6ZXIoVUlUZW5ldHNEYXRhXzEuVUlUZW5ldHNEYXRhKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICBhc3luYyBmdW5jdGlvbiBhbmFseXplTm9kZVJlY3Vyc2l2ZWx5KG5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVSZXN1bHRzID0gYXdhaXQgYW5hbHl6ZXIuYW5hbHl6ZU5vZGUobm9kZSk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goLi4ubm9kZVJlc3VsdHMpO1xuICAgICAgICAgICAgaWYgKFwiY2hpbGRyZW5cIiBpbiBub2RlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFuYWx5emVOb2RlUmVjdXJzaXZlbHkoY2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWdtYS5ub3RpZnkoXCLwn5SNIEFuYWx5emluZyBwYWdlIG5vZGVzLi4uXCIpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZpZ21hLmN1cnJlbnRQYWdlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBhd2FpdCBhbmFseXplTm9kZVJlY3Vyc2l2ZWx5KGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhg8J+TiiBBbmFseXNpcyBjb21wbGV0ZS4gRm91bmQgJHtyZXN1bHRzLmxlbmd0aH0gcmVzdWx0c2ApO1xuICAgICAgICBmaWdtYS5ub3RpZnkoYOKchSBBbmFseXNpcyBjb21wbGV0ZSEgRm91bmQgJHtyZXN1bHRzLmxlbmd0aH0gaXRlbXNgLCB7XG4gICAgICAgICAgICB0aW1lb3V0OiAyMDAwLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGNhbGN1bGF0ZVN1bW1hcnkocmVzdWx0cyk7XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6IFwiYW5hbHlzaXMtY29tcGxldGVcIixcbiAgICAgICAgICAgIGRhdGE6IHsgc3VtbWFyeSwgcmVzdWx0cyB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCLinYwgUGFnZSBhbmFseXNpcyBlcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICBmaWdtYS5ub3RpZnkoYOKdjCBBbmFseXNpcyBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogXCJhbmFseXNpcy1lcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJQYWdlIGFuYWx5c2lzIGZhaWxlZFwiLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZW5kVGVuZXRzUmVmZXJlbmNlKCkge1xuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogXCJ0ZW5ldHMtcmVmZXJlbmNlXCIsXG4gICAgICAgIGRhdGE6IFVJVGVuZXRzRGF0YV8xLlVJVGVuZXRzRGF0YSxcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIG9wZW5SZWZlcmVuY2VHdWlkZSgpIHtcbiAgICAvLyBTZW5kIGEgbWVzc2FnZSB0byBzaG93IHRoZSByZWZlcmVuY2UgZ3VpZGUgd2l0aGluIHRoZSBVSVxuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogXCJzaG93LXJlZmVyZW5jZS1ndWlkZVwiLFxuICAgICAgICBtZXNzYWdlOiBcIlJlZmVyZW5jZSBndWlkZSBmdW5jdGlvbmFsaXR5IHdpbGwgb3BlbiB0aGUgdGVuZXRzIHJlZmVyZW5jZS4gSW4gdGhlIHB1Ymxpc2hlZCBwbHVnaW4sIHRoaXMgd2lsbCBzaG93IGFsbCAxNCBVSSB0ZW5ldHMgYW5kIHRyYXBzIHdpdGggZXhhbXBsZXMgYW5kIHJlY29tbWVuZGF0aW9ucy5cIixcbiAgICB9KTtcbiAgICAvLyBBbHNvIHNob3cgYSBub3RpZmljYXRpb24gdG8gdGhlIHVzZXJcbiAgICBmaWdtYS5ub3RpZnkoXCLwn5OaIFJlZmVyZW5jZSBndWlkZSBjb250YWlucyAxNCBVSSB0ZW5ldHMgYW5kIHRyYXBzIHdpdGggZXhhbXBsZXMgYW5kIGJlc3QgcHJhY3RpY2VzIVwiKTtcbn1cbmZ1bmN0aW9uIGNhbGN1bGF0ZVN1bW1hcnkocmVzdWx0cykge1xuICAgIGNvbnN0IHZpb2xhdGlvbnMgPSByZXN1bHRzLmZpbHRlcigocikgPT4gci5zdGF0dXMgPT09IFwiZmFpbGVkXCIpLmxlbmd0aDtcbiAgICBjb25zdCB3YXJuaW5ncyA9IHJlc3VsdHMuZmlsdGVyKChyKSA9PiByLnN0YXR1cyA9PT0gXCJ3YXJuaW5nXCIpLmxlbmd0aDtcbiAgICBjb25zdCBwYXNzZWQgPSByZXN1bHRzLmZpbHRlcigocikgPT4gci5zdGF0dXMgPT09IFwicGFzc2VkXCIpLmxlbmd0aDtcbiAgICBjb25zdCB0b3RhbCA9IHJlc3VsdHMubGVuZ3RoO1xuICAgIGNvbnN0IHNjb3JlID0gdG90YWwgPiAwID8gTWF0aC5yb3VuZCgoKHBhc3NlZCArIHdhcm5pbmdzICogMC41KSAvIHRvdGFsKSAqIDEwMCkgOiAxMDA7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG90YWwsXG4gICAgICAgIHBhc3NlZCxcbiAgICAgICAgdmlvbGF0aW9ucyxcbiAgICAgICAgc2NvcmUsXG4gICAgfTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFJRXhwbGFuYXRpb24oZGF0YSkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+kliBTdGFydGluZyBBSSBleHBsYW5hdGlvbiBmb3I6XCIsIGRhdGEpO1xuICAgICAgICBpZiAoIWRhdGEgfHwgIWRhdGEudmlvbGF0aW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIEFJIGV4cGxhbmF0aW9uIHJlcXVlc3QgZGF0YVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHZpb2xhdGlvbiwgcmVzdWx0SW5kZXggfSA9IGRhdGE7XG4gICAgICAgIC8vIFNlbmQgbG9hZGluZyBub3RpZmljYXRpb25cbiAgICAgICAgZmlnbWEubm90aWZ5KFwi8J+kliBHZXR0aW5nIEFJIGV4cGxhbmF0aW9uLi4uXCIsIHsgdGltZW91dDogMTAwMCB9KTtcbiAgICAgICAgLy8gR2V0IEFJIGV4cGxhbmF0aW9uXG4gICAgICAgIGNvbnN0IGV4cGxhbmF0aW9uID0gYXdhaXQgYWlTZXJ2aWNlLmdldEFJRXhwbGFuYXRpb24oe1xuICAgICAgICAgICAgdmlvbGF0aW9uOiB2aW9sYXRpb24sXG4gICAgICAgICAgICBkZXNpZ25Db250ZXh0OiB7XG4gICAgICAgICAgICAgICAgcGFnZVR5cGU6IFwiRmlnbWEgRGVzaWduXCIsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50Q29udGV4dDogXCJVSSBFbGVtZW50XCIsXG4gICAgICAgICAgICAgICAgdXNlckpvdXJuZXk6IFwiRGVzaWduIFJldmlld1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNlbmQgcmVzdWx0IGJhY2sgdG8gVUlcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogXCJhaS1leHBsYW5hdGlvbi1jb21wbGV0ZVwiLFxuICAgICAgICAgICAgZGF0YTogeyBleHBsYW5hdGlvbiwgcmVzdWx0SW5kZXggfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIuKcqCBBSSBleHBsYW5hdGlvbiBnZW5lcmF0ZWQhXCIsIHsgdGltZW91dDogMjAwMCB9KTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn5qoIEFJIGV4cGxhbmF0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICBmaWdtYS5ub3RpZnkoYOKdjCBBSSBleHBsYW5hdGlvbiBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogXCJhaS1leHBsYW5hdGlvbi1lcnJvclwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiQUkgZXhwbGFuYXRpb24gZmFpbGVkXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5mdW5jdGlvbiBjb25maWd1cmVBSShkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coXCLwn5SRIENvbmZpZ3VyaW5nIEFJIHNlcnZpY2VcIik7XG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEuYXBpS2V5KSB7XG4gICAgICAgICAgICBhaVNlcnZpY2UuY29uZmlndXJlKGRhdGEuYXBpS2V5KTtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIuKchSBBSSBzZXJ2aWNlIGNvbmZpZ3VyZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcbiAgICAgICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImFpLWNvbmZpZ3VyZWRcIixcbiAgICAgICAgICAgICAgICBkYXRhOiB7IGNvbmZpZ3VyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gQVBJIGtleSBwcm92aWRlZFwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIvCfmqggQUkgY29uZmlndXJhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgZmlnbWEubm90aWZ5KGDinYwgQUkgY29uZmlndXJhdGlvbiBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogXCJhaS1jb25maWctZXJyb3JcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIkFJIGNvbmZpZ3VyYXRpb24gZmFpbGVkXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5maWdtYS5vbihcInNlbGVjdGlvbmNoYW5nZVwiLCAoKSA9PiB7XG4gICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiBcInNlbGVjdGlvbi1jaGFuZ2VkXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGhhc1NlbGVjdGlvbjogZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICBzZWxlY3Rpb25Db3VudDogZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uLmxlbmd0aCxcbiAgICAgICAgfSxcbiAgICB9KTtcbn0pO1xuY29uc3QgdW5pcXVlVGVuZXRzID0gVUlUZW5ldHNEYXRhXzEuVUlUZW5ldHNEYXRhLm1hcCgodGVuZXQsIGluZGV4KSA9PiAoe1xuICAgIGlkOiB0ZW5ldC5pZCxcbiAgICB0aXRsZTogdGVuZXQudGl0bGUsXG4gICAgZGVzY3JpcHRpb246IHRlbmV0LmRlc2NyaXB0aW9uLFxuICAgIGNhdGVnb3J5OiB0ZW5ldC5jYXRlZ29yeSxcbiAgICBzZXZlcml0eTogdGVuZXQuc2V2ZXJpdHksXG4gICAgY2hlY2tGdW5jdGlvbjogdGVuZXQuY2hlY2tGdW5jdGlvbixcbn0pKTtcbmZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICB0eXBlOiBcInBsdWdpbi1yZWFkeVwiLFxuICAgIGRhdGE6IHtcbiAgICAgICAgdGVuZXRzOiB1bmlxdWVUZW5ldHMsXG4gICAgICAgIGhhc1NlbGVjdGlvbjogZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uLmxlbmd0aCA+IDAsXG4gICAgICAgIGFpQ29uZmlndXJlZDogYWlTZXJ2aWNlLmlzQ29uZmlndXJlZCgpLFxuICAgIH0sXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5VSVRlbmV0c0RhdGEgPSBleHBvcnRzLlVJX1RSQVBTID0gZXhwb3J0cy5VSV9URU5FVFMgPSBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVMgPSB2b2lkIDA7XG4vLyBEZWZpbmUgY2F0ZWdvcmllcyBmb3Igb3JnYW5pemluZyB0ZW5ldHMgYW5kIHRyYXBzXG5leHBvcnRzLlRFTkVUX0NBVEVHT1JJRVMgPSBbXG4gICAge1xuICAgICAgICBpZDogXCJhY2Nlc3NpYmlsaXR5XCIsXG4gICAgICAgIG5hbWU6IFwiQWNjZXNzaWJpbGl0eVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJFbnN1cmUgZGVzaWducyBhcmUgdXNhYmxlIGJ5IHBlb3BsZSB3aXRoIGRpc2FiaWxpdGllc1wiLFxuICAgICAgICBjb2xvcjogXCIjNENBRjUwXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiBcInVzYWJpbGl0eVwiLFxuICAgICAgICBuYW1lOiBcIlVzYWJpbGl0eVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJDcmVhdGUgaW50dWl0aXZlIGFuZCB1c2VyLWZyaWVuZGx5IGludGVyZmFjZXNcIixcbiAgICAgICAgY29sb3I6IFwiIzIxOTZGM1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogXCJ2aXN1YWwtaGllcmFyY2h5XCIsXG4gICAgICAgIG5hbWU6IFwiVmlzdWFsIEhpZXJhcmNoeVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJHdWlkZSB1c2VyIGF0dGVudGlvbiB0aHJvdWdoIHByb3BlciB2aXN1YWwgc3RydWN0dXJlXCIsXG4gICAgICAgIGNvbG9yOiBcIiNGRjk4MDBcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6IFwiY29uc2lzdGVuY3lcIixcbiAgICAgICAgbmFtZTogXCJDb25zaXN0ZW5jeVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJNYWludGFpbiBjb25zaXN0ZW50IHBhdHRlcm5zIGFuZCBiZWhhdmlvcnNcIixcbiAgICAgICAgY29sb3I6IFwiIzlDMjdCMFwiLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogXCJjb250ZW50XCIsXG4gICAgICAgIG5hbWU6IFwiQ29udGVudCAmIE1lc3NhZ2luZ1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJFbnN1cmUgY2xlYXIgYW5kIGVmZmVjdGl2ZSBjb21tdW5pY2F0aW9uXCIsXG4gICAgICAgIGNvbG9yOiBcIiNGNDQzMzZcIixcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6IFwibGF5b3V0XCIsXG4gICAgICAgIG5hbWU6IFwiTGF5b3V0ICYgU3BhY2luZ1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJPcmdhbml6ZSBjb250ZW50IHdpdGggcHJvcGVyIHNwYWNpbmcgYW5kIGFsaWdubWVudFwiLFxuICAgICAgICBjb2xvcjogXCIjNjA3RDhCXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiBcImludGVyYWN0aW9uXCIsXG4gICAgICAgIG5hbWU6IFwiSW50ZXJhY3Rpb24gRGVzaWduXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkRlc2lnbiBjbGVhciBhbmQgcHJlZGljdGFibGUgaW50ZXJhY3Rpb25zXCIsXG4gICAgICAgIGNvbG9yOiBcIiM3OTU1NDhcIixcbiAgICB9LFxuXTtcbi8vIENvbXByZWhlbnNpdmUgbGlzdCBvZiBVSSBUZW5ldHMgYW5kIFRyYXBzXG5leHBvcnRzLlVJX1RFTkVUUyA9IFtcbiAgICAvLyBBQ0NFU1NJQklMSVRZIFRFTkVUU1xuICAgIHtcbiAgICAgICAgaWQ6IFwiY29udHJhc3QtcmF0aW9cIixcbiAgICAgICAgdGl0bGU6IFwiU3VmZmljaWVudCBDb2xvciBDb250cmFzdFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJUZXh0IGFuZCBiYWNrZ3JvdW5kIGNvbG9ycyBtdXN0IGhhdmUgc3VmZmljaWVudCBjb250cmFzdCByYXRpbyAoNC41OjEgZm9yIG5vcm1hbCB0ZXh0LCAzOjEgZm9yIGxhcmdlIHRleHQpXCIsXG4gICAgICAgIGNhdGVnb3J5OiBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVNbMF0sIC8vIGFjY2Vzc2liaWxpdHlcbiAgICAgICAgdHlwZTogXCJ0ZW5ldFwiLFxuICAgICAgICBzZXZlcml0eTogXCJlcnJvclwiLFxuICAgICAgICBjaGVja0Z1bmN0aW9uOiBcImNoZWNrQ29sb3JDb250cmFzdFwiLFxuICAgICAgICBleGFtcGxlczogW1xuICAgICAgICAgICAgXCJVc2UgZGFyayB0ZXh0IG9uIGxpZ2h0IGJhY2tncm91bmRzXCIsXG4gICAgICAgICAgICBcIkVuc3VyZSBidXR0b24gdGV4dCBpcyByZWFkYWJsZSBhZ2FpbnN0IGJ1dHRvbiBiYWNrZ3JvdW5kXCIsXG4gICAgICAgIF0sXG4gICAgICAgIHJlY29tbWVuZGF0aW9uczogW1xuICAgICAgICAgICAgXCJVc2UgY29sb3IgY29udHJhc3QgY2hlY2tpbmcgdG9vbHNcIixcbiAgICAgICAgICAgIFwiVGVzdCB3aXRoIHVzZXJzIHdobyBoYXZlIHZpc3VhbCBpbXBhaXJtZW50c1wiLFxuICAgICAgICAgICAgXCJQcm92aWRlIGFsdGVybmF0aXZlIHdheXMgdG8gY29udmV5IGluZm9ybWF0aW9uIGJleW9uZCBjb2xvclwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogXCJmb2N1cy1pbmRpY2F0b3JzXCIsXG4gICAgICAgIHRpdGxlOiBcIlZpc2libGUgRm9jdXMgSW5kaWNhdG9yc1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJbnRlcmFjdGl2ZSBlbGVtZW50cyBtdXN0IGhhdmUgY2xlYXIgZm9jdXMgaW5kaWNhdG9ycyBmb3Iga2V5Ym9hcmQgbmF2aWdhdGlvblwiLFxuICAgICAgICBjYXRlZ29yeTogZXhwb3J0cy5URU5FVF9DQVRFR09SSUVTWzBdLCAvLyBhY2Nlc3NpYmlsaXR5XG4gICAgICAgIHR5cGU6IFwidGVuZXRcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwiZXJyb3JcIixcbiAgICAgICAgY2hlY2tGdW5jdGlvbjogXCJjaGVja0ZvY3VzSW5kaWNhdG9yc1wiLFxuICAgICAgICBleGFtcGxlczogW1xuICAgICAgICAgICAgXCJPdXRsaW5lIG9yIGJvcmRlciBhcm91bmQgZm9jdXNlZCBidXR0b25zXCIsXG4gICAgICAgICAgICBcIkhpZ2hsaWdodGVkIHN0YXRlIGZvciBmb2N1c2VkIGZvcm0gZmllbGRzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIHJlY29tbWVuZGF0aW9uczogW1xuICAgICAgICAgICAgXCJEZXNpZ24gY3VzdG9tIGZvY3VzIHN0eWxlcyB0aGF0IG1hdGNoIHlvdXIgYnJhbmRcIixcbiAgICAgICAgICAgIFwiRW5zdXJlIGZvY3VzIGluZGljYXRvcnMgYXJlIHZpc2libGUgYWdhaW5zdCBhbGwgYmFja2dyb3VuZHNcIixcbiAgICAgICAgICAgIFwiVGVzdCBrZXlib2FyZCBuYXZpZ2F0aW9uIGZsb3dcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6IFwiYWx0LXRleHQtcGxhbm5pbmdcIixcbiAgICAgICAgdGl0bGU6IFwiQWx0IFRleHQgQ29uc2lkZXJhdGlvblwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJbWFnZXMgYW5kIGljb25zIHNob3VsZCBoYXZlIGFsdGVybmF0aXZlIHRleHQgZGVzY3JpcHRpb25zIHBsYW5uZWRcIixcbiAgICAgICAgY2F0ZWdvcnk6IGV4cG9ydHMuVEVORVRfQ0FURUdPUklFU1swXSwgLy8gYWNjZXNzaWJpbGl0eVxuICAgICAgICB0eXBlOiBcInRlbmV0XCIsXG4gICAgICAgIHNldmVyaXR5OiBcIndhcm5pbmdcIixcbiAgICAgICAgY2hlY2tGdW5jdGlvbjogXCJjaGVja0FsdFRleHRQbGFubmluZ1wiLFxuICAgICAgICBleGFtcGxlczogW1xuICAgICAgICAgICAgXCJEZXNjcmlwdGl2ZSB0ZXh0IGZvciBpbmZvcm1hdGlvbmFsIGltYWdlc1wiLFxuICAgICAgICAgICAgXCJFbXB0eSBhbHQgdGV4dCBmb3IgZGVjb3JhdGl2ZSBpbWFnZXNcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIC8vIFVTQUJJTElUWSBURU5FVFNcbiAgICB7XG4gICAgICAgIGlkOiBcImNsZWFyLW5hdmlnYXRpb25cIixcbiAgICAgICAgdGl0bGU6IFwiQ2xlYXIgTmF2aWdhdGlvbiBTdHJ1Y3R1cmVcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiTmF2aWdhdGlvbiBzaG91bGQgYmUgaW50dWl0aXZlIGFuZCBjb25zaXN0ZW50bHkgcGxhY2VkXCIsXG4gICAgICAgIGNhdGVnb3J5OiBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVNbMV0sIC8vIHVzYWJpbGl0eVxuICAgICAgICB0eXBlOiBcInRlbmV0XCIsXG4gICAgICAgIHNldmVyaXR5OiBcImVycm9yXCIsXG4gICAgICAgIGNoZWNrRnVuY3Rpb246IFwiY2hlY2tOYXZpZ2F0aW9uU3RydWN0dXJlXCIsXG4gICAgICAgIGV4YW1wbGVzOiBbXG4gICAgICAgICAgICBcIlByaW1hcnkgbmF2aWdhdGlvbiBpbiBoZWFkZXJcIixcbiAgICAgICAgICAgIFwiQnJlYWRjcnVtYnMgZm9yIGRlZXAgaGllcmFyY2hpZXNcIixcbiAgICAgICAgICAgIFwiQ2xlYXIgYmFjay9ob21lIGJ1dHRvbnNcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6IFwiYnV0dG9uLXJlY29nbml0aW9uXCIsXG4gICAgICAgIHRpdGxlOiBcIlJlY29nbml6YWJsZSBJbnRlcmFjdGl2ZSBFbGVtZW50c1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJCdXR0b25zIGFuZCBsaW5rcyBzaG91bGQgbG9vayBjbGlja2FibGUvdGFwcGFibGVcIixcbiAgICAgICAgY2F0ZWdvcnk6IGV4cG9ydHMuVEVORVRfQ0FURUdPUklFU1sxXSwgLy8gdXNhYmlsaXR5XG4gICAgICAgIHR5cGU6IFwidGVuZXRcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwiZXJyb3JcIixcbiAgICAgICAgY2hlY2tGdW5jdGlvbjogXCJjaGVja0ludGVyYWN0aXZlRWxlbWVudHNcIixcbiAgICAgICAgZXhhbXBsZXM6IFtcbiAgICAgICAgICAgIFwiQnV0dG9ucyB3aXRoIGNsZWFyIGJvcmRlcnMgb3IgYmFja2dyb3VuZHNcIixcbiAgICAgICAgICAgIFwiTGlua3Mgd2l0aCB1bmRlcmxpbmVzIG9yIGRpc3RpbmN0aXZlIHN0eWxpbmdcIixcbiAgICAgICAgICAgIFwiSG92ZXIgc3RhdGVzIHRoYXQgaW5kaWNhdGUgaW50ZXJhY3Rpdml0eVwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogXCJmb3JtLWNsYXJpdHlcIixcbiAgICAgICAgdGl0bGU6IFwiQ2xlYXIgRm9ybSBEZXNpZ25cIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiRm9ybXMgc2hvdWxkIGhhdmUgY2xlYXIgbGFiZWxzLCB2YWxpZGF0aW9uLCBhbmQgZXJyb3IgbWVzc2FnZXNcIixcbiAgICAgICAgY2F0ZWdvcnk6IGV4cG9ydHMuVEVORVRfQ0FURUdPUklFU1sxXSwgLy8gdXNhYmlsaXR5XG4gICAgICAgIHR5cGU6IFwidGVuZXRcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwiZXJyb3JcIixcbiAgICAgICAgY2hlY2tGdW5jdGlvbjogXCJjaGVja0Zvcm1DbGFyaXR5XCIsXG4gICAgICAgIGV4YW1wbGVzOiBbXG4gICAgICAgICAgICBcIkxhYmVscyBjbGVhcmx5IGFzc29jaWF0ZWQgd2l0aCBpbnB1dHNcIixcbiAgICAgICAgICAgIFwiUmVxdWlyZWQgZmllbGQgaW5kaWNhdG9yc1wiLFxuICAgICAgICAgICAgXCJJbmxpbmUgdmFsaWRhdGlvbiBmZWVkYmFja1wiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgLy8gVklTVUFMIEhJRVJBUkNIWSBURU5FVFNcbiAgICB7XG4gICAgICAgIGlkOiBcInR5cG9ncmFwaHktaGllcmFyY2h5XCIsXG4gICAgICAgIHRpdGxlOiBcIkNsZWFyIFR5cG9ncmFwaHkgSGllcmFyY2h5XCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSBjb25zaXN0ZW50IHRleHQgc2l6aW5nIGFuZCB3ZWlnaHQgdG8gY3JlYXRlIGNsZWFyIGluZm9ybWF0aW9uIGhpZXJhcmNoeVwiLFxuICAgICAgICBjYXRlZ29yeTogZXhwb3J0cy5URU5FVF9DQVRFR09SSUVTWzJdLCAvLyB2aXN1YWwtaGllcmFyY2h5XG4gICAgICAgIHR5cGU6IFwidGVuZXRcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwid2FybmluZ1wiLFxuICAgICAgICBjaGVja0Z1bmN0aW9uOiBcImNoZWNrVHlwb2dyYXBoeUhpZXJhcmNoeVwiLFxuICAgICAgICBleGFtcGxlczogW1xuICAgICAgICAgICAgXCJEaXN0aW5jdCBoZWFkaW5nIHNpemVzIChIMSwgSDIsIEgzKVwiLFxuICAgICAgICAgICAgXCJDb25zaXN0ZW50IGJvZHkgdGV4dCBzaXppbmdcIixcbiAgICAgICAgICAgIFwiUHJvcGVyIGxpbmUgc3BhY2luZ1wiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogXCJ2aXN1YWwtd2VpZ2h0LWRpc3RyaWJ1dGlvblwiLFxuICAgICAgICB0aXRsZTogXCJCYWxhbmNlZCBWaXN1YWwgV2VpZ2h0XCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkltcG9ydGFudCBlbGVtZW50cyBzaG91bGQgaGF2ZSBhcHByb3ByaWF0ZSB2aXN1YWwgcHJvbWluZW5jZVwiLFxuICAgICAgICBjYXRlZ29yeTogZXhwb3J0cy5URU5FVF9DQVRFR09SSUVTWzJdLCAvLyB2aXN1YWwtaGllcmFyY2h5XG4gICAgICAgIHR5cGU6IFwidGVuZXRcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwid2FybmluZ1wiLFxuICAgICAgICBjaGVja0Z1bmN0aW9uOiBcImNoZWNrVmlzdWFsV2VpZ2h0XCIsXG4gICAgICAgIGV4YW1wbGVzOiBbXG4gICAgICAgICAgICBcIlByaW1hcnkgYWN0aW9ucyBtb3JlIHByb21pbmVudCB0aGFuIHNlY29uZGFyeVwiLFxuICAgICAgICAgICAgXCJJbXBvcnRhbnQgY29udGVudCBsYXJnZXIgb3IgYm9sZGVyXCIsXG4gICAgICAgICAgICBcIlByb3BlciB1c2Ugb2Ygd2hpdGVzcGFjZVwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgLy8gQ09OU0lTVEVOQ1kgVEVORVRTXG4gICAge1xuICAgICAgICBpZDogXCJjb21wb25lbnQtY29uc2lzdGVuY3lcIixcbiAgICAgICAgdGl0bGU6IFwiQ29uc2lzdGVudCBDb21wb25lbnQgVXNhZ2VcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU2ltaWxhciBjb21wb25lbnRzIHNob3VsZCBsb29rIGFuZCBiZWhhdmUgY29uc2lzdGVudGx5XCIsXG4gICAgICAgIGNhdGVnb3J5OiBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVNbM10sIC8vIGNvbnNpc3RlbmN5XG4gICAgICAgIHR5cGU6IFwidGVuZXRcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwiZXJyb3JcIixcbiAgICAgICAgY2hlY2tGdW5jdGlvbjogXCJjaGVja0NvbXBvbmVudENvbnNpc3RlbmN5XCIsXG4gICAgICAgIGV4YW1wbGVzOiBbXG4gICAgICAgICAgICBcIkFsbCBwcmltYXJ5IGJ1dHRvbnMgdXNlIHNhbWUgc3R5bGVcIixcbiAgICAgICAgICAgIFwiQ29uc2lzdGVudCBjYXJkIGxheW91dHNcIixcbiAgICAgICAgICAgIFwiVW5pZm9ybSBpY29uIHNpemluZyBhbmQgc3R5bGVcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6IFwic3BhY2luZy1jb25zaXN0ZW5jeVwiLFxuICAgICAgICB0aXRsZTogXCJDb25zaXN0ZW50IFNwYWNpbmcgU3lzdGVtXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSBhIGNvbnNpc3RlbnQgc3BhY2luZyBzY2FsZSB0aHJvdWdob3V0IHRoZSBkZXNpZ25cIixcbiAgICAgICAgY2F0ZWdvcnk6IGV4cG9ydHMuVEVORVRfQ0FURUdPUklFU1szXSwgLy8gY29uc2lzdGVuY3lcbiAgICAgICAgdHlwZTogXCJ0ZW5ldFwiLFxuICAgICAgICBzZXZlcml0eTogXCJ3YXJuaW5nXCIsXG4gICAgICAgIGNoZWNrRnVuY3Rpb246IFwiY2hlY2tTcGFjaW5nQ29uc2lzdGVuY3lcIixcbiAgICAgICAgZXhhbXBsZXM6IFtcbiAgICAgICAgICAgIFwiOHB4IGdyaWQgc3lzdGVtICg4LCAxNiwgMjQsIDMyKVwiLFxuICAgICAgICAgICAgXCJDb25zaXN0ZW50IG1hcmdpbnMgYW5kIHBhZGRpbmdcIixcbiAgICAgICAgICAgIFwiVW5pZm9ybSBnYXAgYmV0d2VlbiBlbGVtZW50c1wiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgLy8gTEFZT1VUICYgU1BBQ0lORyBURU5FVFNcbiAgICB7XG4gICAgICAgIGlkOiBcImFkZXF1YXRlLXRvdWNoLXRhcmdldHNcIixcbiAgICAgICAgdGl0bGU6IFwiQWRlcXVhdGUgVG91Y2ggVGFyZ2V0IFNpemVcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSW50ZXJhY3RpdmUgZWxlbWVudHMgc2hvdWxkIGJlIGF0IGxlYXN0IDQ0eDQ0cHggZm9yIHRvdWNoIGludGVyZmFjZXNcIixcbiAgICAgICAgY2F0ZWdvcnk6IGV4cG9ydHMuVEVORVRfQ0FURUdPUklFU1s1XSwgLy8gbGF5b3V0XG4gICAgICAgIHR5cGU6IFwidGVuZXRcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwiZXJyb3JcIixcbiAgICAgICAgY2hlY2tGdW5jdGlvbjogXCJjaGVja1RvdWNoVGFyZ2V0U2l6ZVwiLFxuICAgICAgICBleGFtcGxlczogW1xuICAgICAgICAgICAgXCJCdXR0b25zIG1pbmltdW0gNDRweCBoZWlnaHRcIixcbiAgICAgICAgICAgIFwiVGFwIGFyZWFzIGZvciBzbWFsbCBpY29uc1wiLFxuICAgICAgICAgICAgXCJBZGVxdWF0ZSBzcGFjaW5nIGJldHdlZW4gdG91Y2ggdGFyZ2V0c1wiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogXCJyZXNwb25zaXZlLWNvbnNpZGVyYXRpb25zXCIsXG4gICAgICAgIHRpdGxlOiBcIlJlc3BvbnNpdmUgRGVzaWduIFBsYW5uaW5nXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbnNpZGVyIGhvdyB0aGUgZGVzaWduIHdpbGwgYWRhcHQgdG8gZGlmZmVyZW50IHNjcmVlbiBzaXplc1wiLFxuICAgICAgICBjYXRlZ29yeTogZXhwb3J0cy5URU5FVF9DQVRFR09SSUVTWzVdLCAvLyBsYXlvdXRcbiAgICAgICAgdHlwZTogXCJ0ZW5ldFwiLFxuICAgICAgICBzZXZlcml0eTogXCJ3YXJuaW5nXCIsXG4gICAgICAgIGNoZWNrRnVuY3Rpb246IFwiY2hlY2tSZXNwb25zaXZlRGVzaWduXCIsXG4gICAgICAgIGV4YW1wbGVzOiBbXG4gICAgICAgICAgICBcIk1vYmlsZS1maXJzdCBhcHByb2FjaFwiLFxuICAgICAgICAgICAgXCJGbGV4aWJsZSBncmlkIHN5c3RlbXNcIixcbiAgICAgICAgICAgIFwiU2NhbGFibGUgdHlwb2dyYXBoeVwiLFxuICAgICAgICBdLFxuICAgIH0sXG5dO1xuLy8gQ29tbW9uIFVJIFRyYXBzIHRvIEF2b2lkXG5leHBvcnRzLlVJX1RSQVBTID0gW1xuICAgIHtcbiAgICAgICAgaWQ6IFwibG93LWNvbnRyYXN0LXRyYXBcIixcbiAgICAgICAgdGl0bGU6IFwiTG93IENvbnRyYXN0IFRleHRcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQXZvaWQgdXNpbmcgdGV4dCB3aXRoIGluc3VmZmljaWVudCBjb250cmFzdCBhZ2FpbnN0IGJhY2tncm91bmRzXCIsXG4gICAgICAgIGNhdGVnb3J5OiBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVNbMF0sIC8vIGFjY2Vzc2liaWxpdHlcbiAgICAgICAgdHlwZTogXCJ0cmFwXCIsXG4gICAgICAgIHNldmVyaXR5OiBcImVycm9yXCIsXG4gICAgICAgIGNoZWNrRnVuY3Rpb246IFwiY2hlY2tMb3dDb250cmFzdFwiLFxuICAgICAgICBleGFtcGxlczogW1xuICAgICAgICAgICAgXCJMaWdodCBncmF5IHRleHQgb24gd2hpdGUgYmFja2dyb3VuZFwiLFxuICAgICAgICAgICAgXCJDb2xvci1vbmx5IGluZm9ybWF0aW9uIGluZGljYXRvcnNcIixcbiAgICAgICAgXSxcbiAgICAgICAgcmVjb21tZW5kYXRpb25zOiBbXG4gICAgICAgICAgICBcIlVzZSBkYXJrZXIgdGV4dCBjb2xvcnNcIixcbiAgICAgICAgICAgIFwiQWRkIGljb25zIG9yIHBhdHRlcm5zIGFsb25nc2lkZSBjb2xvciBjb2RpbmdcIixcbiAgICAgICAgICAgIFwiVGVzdCB3aXRoIGFjY2Vzc2liaWxpdHkgdG9vbHNcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6IFwidGlueS10ZXh0LXRyYXBcIixcbiAgICAgICAgdGl0bGU6IFwiVGV4dCBUb28gU21hbGxcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQXZvaWQgdGV4dCBzbWFsbGVyIHRoYW4gMTZweCBmb3IgYm9keSB0ZXh0ICgxNHB4IG1pbmltdW0pXCIsXG4gICAgICAgIGNhdGVnb3J5OiBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVNbMF0sIC8vIGFjY2Vzc2liaWxpdHlcbiAgICAgICAgdHlwZTogXCJ0cmFwXCIsXG4gICAgICAgIHNldmVyaXR5OiBcImVycm9yXCIsXG4gICAgICAgIGNoZWNrRnVuY3Rpb246IFwiY2hlY2tUaW55VGV4dFwiLFxuICAgICAgICBleGFtcGxlczogW1wiMTJweCBib2R5IHRleHRcIiwgXCIxMHB4IGxhYmVsc1wiXSxcbiAgICAgICAgcmVjb21tZW5kYXRpb25zOiBbXG4gICAgICAgICAgICBcIlVzZSAxNnB4IG9yIGxhcmdlciBmb3IgYm9keSB0ZXh0XCIsXG4gICAgICAgICAgICBcIkVuc3VyZSB0ZXh0IGlzIHJlYWRhYmxlIG9uIG1vYmlsZSBkZXZpY2VzXCIsXG4gICAgICAgICAgICBcIkNvbnNpZGVyIHVzZXJzIHdpdGggdmlzdWFsIGltcGFpcm1lbnRzXCIsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiBcImZha2UtYnV0dG9ucy10cmFwXCIsXG4gICAgICAgIHRpdGxlOiBcIk5vbi1JbnRlcmFjdGl2ZSBFbGVtZW50cyBUaGF0IExvb2sgQ2xpY2thYmxlXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkF2b2lkIHN0eWxpbmcgbm9uLWludGVyYWN0aXZlIGVsZW1lbnRzIHRvIGxvb2sgbGlrZSBidXR0b25zXCIsXG4gICAgICAgIGNhdGVnb3J5OiBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVNbMV0sIC8vIHVzYWJpbGl0eVxuICAgICAgICB0eXBlOiBcInRyYXBcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwiZXJyb3JcIixcbiAgICAgICAgY2hlY2tGdW5jdGlvbjogXCJjaGVja0Zha2VCdXR0b25zXCIsXG4gICAgICAgIGV4YW1wbGVzOiBbXG4gICAgICAgICAgICBcIlN0eWxlZCB0ZXh0IHRoYXQgbG9va3MgbGlrZSBidXR0b25zXCIsXG4gICAgICAgICAgICBcIkNhcmRzIHdpdGggYnV0dG9uLWxpa2Ugc3R5bGluZyBidXQgbm8gYWN0aW9uXCIsXG4gICAgICAgIF0sXG4gICAgICAgIHJlY29tbWVuZGF0aW9uczogW1xuICAgICAgICAgICAgXCJPbmx5IHN0eWxlIGludGVyYWN0aXZlIGVsZW1lbnRzIGFzIGJ1dHRvbnNcIixcbiAgICAgICAgICAgIFwiVXNlIGNsZWFyIHZpc3VhbCBkaXN0aW5jdGlvbnMgZm9yIGRpZmZlcmVudCBlbGVtZW50IHR5cGVzXCIsXG4gICAgICAgICAgICBcIkFkZCBob3ZlciBzdGF0ZXMgdG8gaW50ZXJhY3RpdmUgZWxlbWVudHNcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6IFwiaGlkZGVuLWFjdGlvbnMtdHJhcFwiLFxuICAgICAgICB0aXRsZTogXCJDcml0aWNhbCBBY3Rpb25zIEhpZGRlbiBpbiBNZW51c1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJBdm9pZCBoaWRpbmcgaW1wb3J0YW50IGFjdGlvbnMgaW4gb3ZlcmZsb3cgbWVudXMgb3Igc2Vjb25kYXJ5IGxvY2F0aW9uc1wiLFxuICAgICAgICBjYXRlZ29yeTogZXhwb3J0cy5URU5FVF9DQVRFR09SSUVTWzFdLCAvLyB1c2FiaWxpdHlcbiAgICAgICAgdHlwZTogXCJ0cmFwXCIsXG4gICAgICAgIHNldmVyaXR5OiBcIndhcm5pbmdcIixcbiAgICAgICAgY2hlY2tGdW5jdGlvbjogXCJjaGVja0hpZGRlbkFjdGlvbnNcIixcbiAgICAgICAgZXhhbXBsZXM6IFtcbiAgICAgICAgICAgIFwiRGVsZXRlIGJ1dHRvbiBvbmx5IGluIGRyb3Bkb3duIG1lbnVcIixcbiAgICAgICAgICAgIFwiUHJpbWFyeSBDVEEgaW4gaGFtYnVyZ2VyIG1lbnVcIixcbiAgICAgICAgXSxcbiAgICAgICAgcmVjb21tZW5kYXRpb25zOiBbXG4gICAgICAgICAgICBcIk1ha2UgaW1wb3J0YW50IGFjdGlvbnMgdmlzaWJsZSBhbmQgYWNjZXNzaWJsZVwiLFxuICAgICAgICAgICAgXCJVc2UgcHJvZ3Jlc3NpdmUgZGlzY2xvc3VyZSBhcHByb3ByaWF0ZWx5XCIsXG4gICAgICAgICAgICBcIlByaW9yaXRpemUgYWN0aW9ucyBiYXNlZCBvbiB1c2VyIG5lZWRzXCIsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiBcImluY29uc2lzdGVudC1uYXZpZ2F0aW9uLXRyYXBcIixcbiAgICAgICAgdGl0bGU6IFwiSW5jb25zaXN0ZW50IE5hdmlnYXRpb24gUGF0dGVybnNcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQXZvaWQgY2hhbmdpbmcgbmF2aWdhdGlvbiBzdHJ1Y3R1cmUgYmV0d2VlbiBzaW1pbGFyIHBhZ2VzXCIsXG4gICAgICAgIGNhdGVnb3J5OiBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVNbM10sIC8vIGNvbnNpc3RlbmN5XG4gICAgICAgIHR5cGU6IFwidHJhcFwiLFxuICAgICAgICBzZXZlcml0eTogXCJlcnJvclwiLFxuICAgICAgICBjaGVja0Z1bmN0aW9uOiBcImNoZWNrSW5jb25zaXN0ZW50TmF2aWdhdGlvblwiLFxuICAgICAgICBleGFtcGxlczogW1xuICAgICAgICAgICAgXCJEaWZmZXJlbnQgbWVudSBzdHJ1Y3R1cmVzIG9uIHNpbWlsYXIgcGFnZXNcIixcbiAgICAgICAgICAgIFwiSW5jb25zaXN0ZW50IGJ1dHRvbiBwbGFjZW1lbnRcIixcbiAgICAgICAgICAgIFwiVmFyeWluZyBpbnRlcmFjdGlvbiBwYXR0ZXJuc1wiLFxuICAgICAgICBdLFxuICAgICAgICByZWNvbW1lbmRhdGlvbnM6IFtcbiAgICAgICAgICAgIFwiRXN0YWJsaXNoIGNvbnNpc3RlbnQgbmF2aWdhdGlvbiBwYXR0ZXJuc1wiLFxuICAgICAgICAgICAgXCJVc2UgZGVzaWduIHN5c3RlbSBjb21wb25lbnRzXCIsXG4gICAgICAgICAgICBcIkRvY3VtZW50IG5hdmlnYXRpb24gZ3VpZGVsaW5lc1wiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogXCJvdmVyY3Jvd2RlZC1pbnRlcmZhY2UtdHJhcFwiLFxuICAgICAgICB0aXRsZTogXCJPdmVyY3Jvd2RlZCBJbnRlcmZhY2VcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQXZvaWQgY3JhbW1pbmcgdG9vIG1hbnkgZWxlbWVudHMgd2l0aG91dCBhZGVxdWF0ZSBzcGFjaW5nXCIsXG4gICAgICAgIGNhdGVnb3J5OiBleHBvcnRzLlRFTkVUX0NBVEVHT1JJRVNbNV0sIC8vIGxheW91dFxuICAgICAgICB0eXBlOiBcInRyYXBcIixcbiAgICAgICAgc2V2ZXJpdHk6IFwid2FybmluZ1wiLFxuICAgICAgICBjaGVja0Z1bmN0aW9uOiBcImNoZWNrT3ZlcmNyb3dkaW5nXCIsXG4gICAgICAgIGV4YW1wbGVzOiBbXG4gICAgICAgICAgICBcIk5vIHdoaXRlc3BhY2UgYmV0d2VlbiBlbGVtZW50c1wiLFxuICAgICAgICAgICAgXCJUb28gbWFueSBhY3Rpb25zIGluIG9uZSBhcmVhXCIsXG4gICAgICAgICAgICBcIkRlbnNlIGluZm9ybWF0aW9uIHdpdGhvdXQgZ3JvdXBpbmdcIixcbiAgICAgICAgXSxcbiAgICAgICAgcmVjb21tZW5kYXRpb25zOiBbXG4gICAgICAgICAgICBcIlVzZSB3aGl0ZXNwYWNlIGVmZmVjdGl2ZWx5XCIsXG4gICAgICAgICAgICBcIkdyb3VwIHJlbGF0ZWQgZWxlbWVudHNcIixcbiAgICAgICAgICAgIFwiUHJpb3JpdGl6ZSBtb3N0IGltcG9ydGFudCBjb250ZW50XCIsXG4gICAgICAgIF0sXG4gICAgfSxcbl07XG4vLyBDb21iaW5lIGFsbCB0ZW5ldHMgYW5kIHRyYXBzXG5leHBvcnRzLlVJVGVuZXRzRGF0YSA9IFsuLi5leHBvcnRzLlVJX1RFTkVUUywgLi4uZXhwb3J0cy5VSV9UUkFQU107XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogQUkgU2VydmljZSBmb3IgZ2VuZXJhdGluZyBodW1hbi1mcmllbmRseSBkZXNpZ24gaW5zaWdodHNcbiAqIFVzZXMgR2l0SHViIE1vZGVscyBBUEkgZm9yIGNvc3QtZWZmZWN0aXZlIEFJIGV4cGxhbmF0aW9uc1xuICogRGVzaWduZWQgdG8gd29yayBpbiBGaWdtYSdzIHBsdWdpbiBlbnZpcm9ubWVudFxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkFJRXhwbGFuYXRpb25TZXJ2aWNlID0gdm9pZCAwO1xuY2xhc3MgQUlFeHBsYW5hdGlvblNlcnZpY2Uge1xuICAgIGNvbnN0cnVjdG9yKGFwaUtleSkge1xuICAgICAgICB0aGlzLmJhc2VVUkwgPSBcImh0dHBzOi8vbW9kZWxzLmdpdGh1Yi5haS9pbmZlcmVuY2UvY2hhdC9jb21wbGV0aW9uc1wiO1xuICAgICAgICB0aGlzLm1vZGVsID0gXCJvcGVuYWkvZ3B0LTQuMS1taW5pXCI7XG4gICAgICAgIHRoaXMuYXBpS2V5ID0gYXBpS2V5IHx8IFwiXCI7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+kliBBSUV4cGxhbmF0aW9uU2VydmljZSBpbml0aWFsaXplZCB3aXRoIEdpdEh1YiBNb2RlbHNcIik7XG4gICAgfVxuICAgIGFzeW5jIGdldEFJRXhwbGFuYXRpb24ocmVxdWVzdCkge1xuICAgICAgICBpZiAoIXRoaXMuYXBpS2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SRIE5vIEFQSSBrZXkgcHJvdmlkZWQsIHVzaW5nIGZhbGxiYWNrIGV4cGxhbmF0aW9uXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmFsbGJhY2tFeHBsYW5hdGlvbihyZXF1ZXN0KTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHJvbXB0ID0gdGhpcy5idWlsZFByb21wdChyZXF1ZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy5iYXNlVVJMLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dGhpcy5hcGlLZXl9YCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogXCJzeXN0ZW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBcIllvdSBhcmUgYSBVWC9VSSBkZXNpZ24gZXhwZXJ0IGhlbHBpbmcgZGVzaWduZXJzIGltcHJvdmUgdGhlaXIgaW50ZXJmYWNlcy4gUHJvdmlkZSBjbGVhciwgYWN0aW9uYWJsZSBhZHZpY2UgaW4gYSBmcmllbmRseSB0b25lLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlOiBcInVzZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAzMDAsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBHaXRIdWIgTW9kZWxzIEFQSSByZXF1ZXN0IGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9IC0gJHtlcnJvclRleHR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGRhdGEuY2hvaWNlcyAmJlxuICAgICAgICAgICAgICAgIGRhdGEuY2hvaWNlc1swXSAmJlxuICAgICAgICAgICAgICAgIGRhdGEuY2hvaWNlc1swXS5tZXNzYWdlICYmXG4gICAgICAgICAgICAgICAgZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudDtcbiAgICAgICAgICAgIGlmICghY29udGVudCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGNvbnRlbnQgcmVjZWl2ZWQgZnJvbSBBSSBtb2RlbFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlQUlSZXNwb25zZShjb250ZW50LCByZXF1ZXN0KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn5qoIEFJIGV4cGxhbmF0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmFsbGJhY2tFeHBsYW5hdGlvbihyZXF1ZXN0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBidWlsZFByb21wdChyZXF1ZXN0KSB7XG4gICAgICAgIGNvbnN0IHsgdmlvbGF0aW9uIH0gPSByZXF1ZXN0O1xuICAgICAgICByZXR1cm4gYEFuYWx5emUgdGhpcyBVSSBkZXNpZ24gaXNzdWU6ICR7dmlvbGF0aW9uLm1lc3NhZ2V9IGZvciBlbGVtZW50ICR7dmlvbGF0aW9uLm5vZGVOYW1lfS4gUHJvdmlkZSBXSFkgaXQgbWF0dGVycywgSE9XIHRvIGZpeCBpdCwgYW5kIHRoZSBJTVBBQ1QgaWYgdW5maXhlZC5gO1xuICAgIH1cbiAgICBwYXJzZUFJUmVzcG9uc2UoY29udGVudCwgcmVxdWVzdCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXhwbGFuYXRpb246IGNvbnRlbnQsXG4gICAgICAgICAgICBzdWdnZXN0aW9uczogdGhpcy5leHRyYWN0U3VnZ2VzdGlvbnNGcm9tVGV4dChjb250ZW50KSxcbiAgICAgICAgICAgIGltcGFjdDogXCJUaGlzIGlzc3VlIG1heSBpbXBhY3QgdXNlciBleHBlcmllbmNlIGFuZCBhY2Nlc3NpYmlsaXR5XCIsXG4gICAgICAgICAgICBleGFtcGxlczogW10sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGV4dHJhY3RTdWdnZXN0aW9uc0Zyb21UZXh0KHRleHQpIHtcbiAgICAgICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoXCItXCIpIHx8XG4gICAgICAgICAgICAgICAgdHJpbW1lZC5zdGFydHNXaXRoKFwiKlwiKSB8fFxuICAgICAgICAgICAgICAgIHRyaW1tZWQubWF0Y2goL15cXGQrXFwuLykpIHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9ucy5wdXNoKHRyaW1tZWQucmVwbGFjZSgvXlstKlxcZC5dXFxzKi8sIFwiXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnMubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyBzdWdnZXN0aW9uc1xuICAgICAgICAgICAgOiBbXG4gICAgICAgICAgICAgICAgXCJSZXZpZXcgZGVzaWduIGd1aWRlbGluZXNcIixcbiAgICAgICAgICAgICAgICBcIlRlc3Qgd2l0aCB1c2Vyc1wiLFxuICAgICAgICAgICAgICAgIFwiQ29uc2lkZXIgYWNjZXNzaWJpbGl0eVwiLFxuICAgICAgICAgICAgXTtcbiAgICB9XG4gICAgZ2V0RmFsbGJhY2tFeHBsYW5hdGlvbihyZXF1ZXN0KSB7XG4gICAgICAgIGNvbnN0IHsgdmlvbGF0aW9uIH0gPSByZXF1ZXN0O1xuICAgICAgICBjb25zdCBmYWxsYmFja3MgPSB7XG4gICAgICAgICAgICBjb250cmFzdDoge1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uOiBcIlRoaXMgdGV4dCBkb2Vzbid0IGhhdmUgZW5vdWdoIGNvbnRyYXN0IGFnYWluc3QgaXRzIGJhY2tncm91bmQsIG1ha2luZyBpdCBkaWZmaWN1bHQgZm9yIHVzZXJzIHRvIHJlYWQuXCIsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJVc2UgZGFya2VyIHRleHQgY29sb3JzIG9yIGxpZ2h0ZXIgYmFja2dyb3VuZHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJUZXN0IGNvbnRyYXN0IHJhdGlvcyB3aXRoIGFjY2Vzc2liaWxpdHkgdG9vbHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBaW0gZm9yIGF0IGxlYXN0IDQuNToxIGNvbnRyYXN0IHJhdGlvIGZvciBub3JtYWwgdGV4dFwiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgaW1wYWN0OiBcIlVzZXJzIHdpdGggdmlzdWFsIGltcGFpcm1lbnRzIG1heSBub3QgYmUgYWJsZSB0byByZWFkIHRoaXMgY29udGVudFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbjogXCJUZXh0IHRoYXQncyB0b28gc21hbGwgY2FuIGJlIGRpZmZpY3VsdCB0byByZWFkLCBlc3BlY2lhbGx5IGZvciB1c2VycyB3aXRoIHZpc3VhbCBpbXBhaXJtZW50cy5cIixcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcIlVzZSBhdCBsZWFzdCAxNnB4IGZvciBib2R5IHRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgXCJFbnN1cmUgdGV4dCBzY2FsZXMgcHJvcGVybHkgb24gbW9iaWxlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiVGVzdCByZWFkYWJpbGl0eSBhdCBkaWZmZXJlbnQgem9vbSBsZXZlbHNcIixcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGltcGFjdDogXCJVc2VycyBtYXkgc3RyYWluIHRvIHJlYWQgc21hbGwgdGV4dCBvciBiZSB1bmFibGUgdG8gcmVhZCBpdCBlbnRpcmVseVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qga2V5ID0gT2JqZWN0LmtleXMoZmFsbGJhY2tzKS5maW5kKChrKSA9PiB2aW9sYXRpb24ubWVzc2FnZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGspIHx8XG4gICAgICAgICAgICB2aW9sYXRpb24udGVuZXRUaXRsZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGspKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdEZhbGxiYWNrID0ge1xuICAgICAgICAgICAgZXhwbGFuYXRpb246IGBUaGUgXCIke3Zpb2xhdGlvbi50ZW5ldFRpdGxlfVwiIHByaW5jaXBsZSBoZWxwcyBlbnN1cmUgeW91ciBkZXNpZ24gaXMgdXNlci1mcmllbmRseS4gJHt2aW9sYXRpb24ubWVzc2FnZX1gLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbnM6IFtcbiAgICAgICAgICAgICAgICBcIlJldmlldyB0aGUgc3BlY2lmaWMgZGVzaWduIHByaW5jaXBsZSBndWlkZWxpbmVzXCIsXG4gICAgICAgICAgICAgICAgXCJUZXN0IHlvdXIgZGVzaWduIHdpdGggcmVhbCB1c2Vyc1wiLFxuICAgICAgICAgICAgICAgIFwiQ29uc2lkZXIgYWNjZXNzaWJpbGl0eSBhbmQgdXNhYmlsaXR5IHN0YW5kYXJkc1wiLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGltcGFjdDogXCJUaGlzIGlzc3VlIG1heSBpbXBhY3QgdXNlciBleHBlcmllbmNlIGFuZCBhY2Nlc3NpYmlsaXR5XCIsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiAoa2V5ID8gZmFsbGJhY2tzW2tleV0gOiBudWxsKSB8fCBkZWZhdWx0RmFsbGJhY2s7XG4gICAgfVxuICAgIGlzQ29uZmlndXJlZCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5hcGlLZXk7XG4gICAgfVxuICAgIGNvbmZpZ3VyZShhcGlLZXkpIHtcbiAgICAgICAgdGhpcy5hcGlLZXkgPSBhcGlLZXk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+UkSBBSSBzZXJ2aWNlIGNvbmZpZ3VyZWQgd2l0aCBuZXcgQVBJIGtleVwiKTtcbiAgICB9XG59XG5leHBvcnRzLkFJRXhwbGFuYXRpb25TZXJ2aWNlID0gQUlFeHBsYW5hdGlvblNlcnZpY2U7XG4iLCIvLyBNb2R1bGVcbnZhciBjb2RlID0gXCI8IURPQ1RZUEUgaHRtbD5cXG48aHRtbCBsYW5nPVxcXCJlblxcXCI+XFxuXFxuPGhlYWQ+XFxuICAgIDxtZXRhIGNoYXJzZXQ9XFxcIlVURi04XFxcIj5cXG4gICAgPG1ldGEgbmFtZT1cXFwidmlld3BvcnRcXFwiIGNvbnRlbnQ9XFxcIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjBcXFwiPlxcbiAgICA8dGl0bGU+VUkgVGVuZXRzICYgVHJhcHMgQW5hbHl6ZXI8L3RpdGxlPlxcbiAgICA8c3R5bGU+XFxuICAgICAgICAqIHtcXG4gICAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICAgICAgICAgIG1hcmdpbjogMDtcXG4gICAgICAgICAgICBwYWRkaW5nOiAwO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgYm9keSB7XFxuICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXFxcIlNlZ29lIFVJXFxcIiwgUm9ib3RvLCBzYW5zLXNlcmlmO1xcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcXG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICAgICAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOSk7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDpcXG4gICAgICAgICAgICAgICAgcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAyMCUgODAlLCByZ2JhKDEyMCwgMTE5LCAxOTgsIDAuMikgMCUsIHRyYW5zcGFyZW50IDUwJSksXFxuICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgODAlIDIwJSwgcmdiYSgyNTUsIDExOSwgMTk4LCAwLjIpIDAlLCB0cmFuc3BhcmVudCA1MCUpLFxcbiAgICAgICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDQwJSA0MCUsIHJnYmEoMTIwLCAyMTksIDI1NSwgMC4yKSAwJSwgdHJhbnNwYXJlbnQgNTAlKSxcXG4gICAgICAgICAgICAgICAgbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzBmMGMyOSAwJSwgIzI0MjQzZSA1MCUsICMzMTM4NjIgMTAwJSk7XFxuICAgICAgICAgICAgcGFkZGluZzogMTJweDtcXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMHZoO1xcbiAgICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgYm9keTo6YmVmb3JlIHtcXG4gICAgICAgICAgICBjb250ZW50OiAnJztcXG4gICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgICAgICAgICAgdG9wOiAwO1xcbiAgICAgICAgICAgIGxlZnQ6IDA7XFxuICAgICAgICAgICAgd2lkdGg6IDEwMCU7XFxuICAgICAgICAgICAgaGVpZ2h0OiAxMDAlO1xcbiAgICAgICAgICAgIGJhY2tncm91bmQ6XFxuICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgMTAlIDIwJSwgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAxKSAwJSwgdHJhbnNwYXJlbnQgMjAlKSxcXG4gICAgICAgICAgICAgICAgcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCA4MCUgODAlLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDEpIDAlLCB0cmFuc3BhcmVudCAyMCUpLFxcbiAgICAgICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDQwJSA0MCUsIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMikgMCUsIHRyYW5zcGFyZW50IDMwJSk7XFxuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICAgICAgICAgICAgei1pbmRleDogMTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5saXF1aWQtb3JiIHtcXG4gICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICAgICAgICAgIGZpbHRlcjogYmx1cigyMHB4KTtcXG4gICAgICAgICAgICBvcGFjaXR5OiAwLjM7XFxuICAgICAgICAgICAgYW5pbWF0aW9uOiBmbG9hdCAxNXMgZWFzZS1pbi1vdXQgaW5maW5pdGU7XFxuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICAgICAgICAgICAgei1pbmRleDogMTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5vcmItMSB7XFxuICAgICAgICAgICAgd2lkdGg6IDgwcHg7XFxuICAgICAgICAgICAgaGVpZ2h0OiA4MHB4O1xcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCg0NWRlZywgI2ZmNmI2YiwgIzRlY2RjNCk7XFxuICAgICAgICAgICAgdG9wOiAxNSU7XFxuICAgICAgICAgICAgcmlnaHQ6IDE1JTtcXG4gICAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDBzO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLm9yYi0yIHtcXG4gICAgICAgICAgICB3aWR0aDogNjBweDtcXG4gICAgICAgICAgICBoZWlnaHQ6IDYwcHg7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjYThlZGVhLCAjZmVkNmUzKTtcXG4gICAgICAgICAgICBib3R0b206IDI1JTtcXG4gICAgICAgICAgICBsZWZ0OiAyMCU7XFxuICAgICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiA1cztcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIEBrZXlmcmFtZXMgZmxvYXQge1xcblxcbiAgICAgICAgICAgIDAlLFxcbiAgICAgICAgICAgIDEwMCUge1xcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKSByb3RhdGUoMGRlZyk7XFxuICAgICAgICAgICAgfVxcblxcbiAgICAgICAgICAgIDMzJSB7XFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDIwcHgsIC0yMHB4KSByb3RhdGUoMTIwZGVnKTtcXG4gICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgNjYlIHtcXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTE1cHgsIDE1cHgpIHJvdGF0ZSgyNDBkZWcpO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5tYWluLWNvbnRlbnQge1xcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgICAgICAgICBoZWlnaHQ6IGNhbGMoMTAwdmggLSAyNHB4KTtcXG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgICAgICAgICAgei1pbmRleDogMjtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkpO1xcbiAgICAgICAgICAgIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDIwcHgpO1xcbiAgICAgICAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigyMHB4KTtcXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTZweDtcXG4gICAgICAgICAgICBwYWRkaW5nOiAxNnB4O1xcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLCAwLCAwLCAwLjMpO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmhlYWRlciB7XFxuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcXG4gICAgICAgICAgICBwYWRkaW5nLWJvdHRvbTogMTJweDtcXG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNCkpO1xcbiAgICAgICAgICAgIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDE1cHgpO1xcbiAgICAgICAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxNXB4KTtcXG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDEycHg7XFxuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuaGVhZGVyOjpiZWZvcmUge1xcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnO1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgICAgICAgICB0b3A6IDA7XFxuICAgICAgICAgICAgbGVmdDogMDtcXG4gICAgICAgICAgICByaWdodDogMDtcXG4gICAgICAgICAgICBib3R0b206IDA7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCB0cmFuc3BhcmVudCwgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSwgdHJhbnNwYXJlbnQpO1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IGluaGVyaXQ7XFxuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICAgICAgICAgICAgb3BhY2l0eTogMDtcXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgZWFzZTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5oZWFkZXI6aG92ZXI6OmJlZm9yZSB7XFxuICAgICAgICAgICAgb3BhY2l0eTogMTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5oZWFkZXItdG9wIHtcXG4gICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICAgICAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA4cHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuaGVhZGVyIGgxIHtcXG4gICAgICAgICAgICBmb250LXNpemU6IDE0cHg7XFxuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gICAgICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcXG4gICAgICAgICAgICB0ZXh0LXNoYWRvdzpcXG4gICAgICAgICAgICAgICAgMCAxcHggMnB4IHJnYmEoMCwgMCwgMCwgMC44KSxcXG4gICAgICAgICAgICAgICAgMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC42KSxcXG4gICAgICAgICAgICAgICAgMCAwIDhweCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XFxuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgICAgIHotaW5kZXg6IDE7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuaGVhZGVyIHAge1xcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTFweDtcXG4gICAgICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpO1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgICAgICAgICB6LWluZGV4OiAxO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlZmVyZW5jZS1saW5rIHtcXG4gICAgICAgICAgICBmb250LXNpemU6IDExcHg7XFxuICAgICAgICAgICAgY29sb3I6ICM5MGNhZjk7XFxuICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDZweCAxMnB4O1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgzMywgMTUwLCAyNDMsIDAuMiksIHJnYmEoMzAsIDEzNiwgMjI5LCAwLjEpKTtcXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDMzLCAxNTAsIDI0MywgMC4zKTtcXG4gICAgICAgICAgICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcXG4gICAgICAgICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcXG4gICAgICAgICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgICAgICBnYXA6IDRweDtcXG4gICAgICAgICAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgICAgICAgICB6LWluZGV4OiAxO1xcbiAgICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVmZXJlbmNlLWxpbms6OmJlZm9yZSB7XFxuICAgICAgICAgICAgY29udGVudDogJyc7XFxuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgICAgICAgIHRvcDogMDtcXG4gICAgICAgICAgICBsZWZ0OiAtMTAwJTtcXG4gICAgICAgICAgICB3aWR0aDogMTAwJTtcXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCU7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDkwZGVnLCB0cmFuc3BhcmVudCwgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpLCB0cmFuc3BhcmVudCk7XFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogbGVmdCAwLjVzIGVhc2U7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVmZXJlbmNlLWxpbms6aG92ZXI6OmJlZm9yZSB7XFxuICAgICAgICAgICAgbGVmdDogMTAwJTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZWZlcmVuY2UtbGluazpob3ZlciB7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgzMywgMTUwLCAyNDMsIDAuMyksIHJnYmEoMzAsIDEzNiwgMjI5LCAwLjIpKTtcXG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMzMsIDE1MCwgMjQzLCAwLjUpO1xcbiAgICAgICAgICAgIGNvbG9yOiAjNjRiNWY2O1xcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcXG4gICAgICAgICAgICBib3gtc2hhZG93OiAwIDZweCAyMHB4IHJnYmEoMzMsIDE1MCwgMjQzLCAwLjMpO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmNvbnRyb2xzIHtcXG4gICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgICAgIGdhcDogOHB4O1xcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDE2cHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYWktY29uZmlnIHtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuMSksIHJnYmEoMTE4LCA3NSwgMTYyLCAwLjEpKTtcXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuMik7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTJweDtcXG4gICAgICAgICAgICBwYWRkaW5nOiAxMnB4O1xcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDE2cHg7XFxuICAgICAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5haS1jb25maWcuc2hvdyB7XFxuICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYWktY29uZmlnIGgzIHtcXG4gICAgICAgICAgICBjb2xvcjogIzY2N2VlYTtcXG4gICAgICAgICAgICBmb250LXNpemU6IDEycHg7XFxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmFpLWNvbmZpZyBpbnB1dCB7XFxuICAgICAgICAgICAgd2lkdGg6IDEwMCU7XFxuICAgICAgICAgICAgcGFkZGluZzogOHB4IDEycHg7XFxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpO1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XFxuICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45KTtcXG4gICAgICAgICAgICBmb250LXNpemU6IDExcHg7XFxuICAgICAgICAgICAgZm9udC1mYW1pbHk6IGluaGVyaXQ7XFxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmFpLWNvbmZpZyBpbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgICAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNSk7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYWktY29uZmlnLWJ1dHRvbnMge1xcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICAgICAgZ2FwOiA4cHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYWktdG9nZ2xlIHtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjNjY3ZWVhLCAjNzY0YmEyKTtcXG4gICAgICAgICAgICBjb2xvcjogd2hpdGU7XFxuICAgICAgICAgICAgYm9yZGVyOiBub25lO1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDZweCAxMnB4O1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcXG4gICAgICAgICAgICBmb250LXNpemU6IDEwcHg7XFxuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDhweDtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5idG4ge1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDEwcHggMTZweDtcXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpKTtcXG4gICAgICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjkpO1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XFxuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTFweDtcXG4gICAgICAgICAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XFxuICAgICAgICAgICAgZm9udC1mYW1pbHk6IGluaGVyaXQ7XFxuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgICAgICAgICAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XFxuICAgICAgICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xcbiAgICAgICAgICAgIHotaW5kZXg6IDEwO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmJ0bjo6YmVmb3JlIHtcXG4gICAgICAgICAgICBjb250ZW50OiAnJztcXG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICAgICAgdG9wOiAwO1xcbiAgICAgICAgICAgIGxlZnQ6IC0xMDAlO1xcbiAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xcbiAgICAgICAgICAgIGhlaWdodDogMTAwJTtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHRyYW5zcGFyZW50LCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSksIHRyYW5zcGFyZW50KTtcXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBsZWZ0IDAuNXMgZWFzZTtcXG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5idG46aG92ZXI6OmJlZm9yZSB7XFxuICAgICAgICAgICAgbGVmdDogMTAwJTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5idG46aG92ZXIge1xcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xNSksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCkpO1xcbiAgICAgICAgICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcXG4gICAgICAgICAgICBib3gtc2hhZG93OiAwIDZweCAyMHB4IHJnYmEoMCwgMCwgMCwgMC4zKTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5idG4tcHJpbWFyeSB7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgzMywgMTUwLCAyNDMsIDAuOCksIHJnYmEoMzAsIDEzNiwgMjI5LCAwLjYpKTtcXG4gICAgICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcXG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMzMsIDE1MCwgMjQzLCAwLjQpO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmJ0bi1wcmltYXJ5OmhvdmVyIHtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDMzLCAxNTAsIDI0MywgMC45KSwgcmdiYSgzMCwgMTM2LCAyMjksIDAuNykpO1xcbiAgICAgICAgICAgIGJvcmRlci1jb2xvcjogcmdiYSgzMywgMTUwLCAyNDMsIDAuNik7XFxuICAgICAgICAgICAgYm94LXNoYWRvdzogMCA4cHggMjVweCByZ2JhKDMzLCAxNTAsIDI0MywgMC40KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5idG46ZGlzYWJsZWQge1xcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuNTtcXG4gICAgICAgICAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmJ0bi1sb2FkaW5nIHtcXG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5idG4tbG9hZGluZyAuYnRuLXRleHQge1xcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuNjtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5idG4tbG9hZGluZyAuYnRuLXNwaW5uZXIge1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgICAgICAgICBsZWZ0OiA1MCU7XFxuICAgICAgICAgICAgdG9wOiA1MCU7XFxuICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XFxuICAgICAgICAgICAgd2lkdGg6IDEycHg7XFxuICAgICAgICAgICAgaGVpZ2h0OiAxMnB4O1xcbiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcXG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgICAgICAgICAgYm9yZGVyLXRvcC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDAuOHMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmJ0bi1zcGlubmVyIHtcXG4gICAgICAgICAgICBkaXNwbGF5OiBub25lO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmxvYWRpbmcge1xcbiAgICAgICAgICAgIGRpc3BsYXk6IG5vbmU7XFxuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDMycHg7XFxuICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45NSk7XFxuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcXG4gICAgICAgICAgICB0ZXh0LXNoYWRvdzpcXG4gICAgICAgICAgICAgICAgMCAxcHggMnB4IHJnYmEoMCwgMCwgMCwgMC44KSxcXG4gICAgICAgICAgICAgICAgMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5zcGlubmVyIHtcXG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgICAgICAgICAgd2lkdGg6IDIwcHg7XFxuICAgICAgICAgICAgaGVpZ2h0OiAyMHB4O1xcbiAgICAgICAgICAgIGJvcmRlcjogMnB4IHNvbGlkIHZhcigtLWZpZ21hLWNvbG9yLWJvcmRlcik7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICAgICAgICAgIGJvcmRlci10b3AtY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLWJnLWJyYW5kKTtcXG4gICAgICAgICAgICBhbmltYXRpb246IHNwaW4gMXMgZWFzZS1pbi1vdXQgaW5maW5pdGU7XFxuICAgICAgICAgICAgbWFyZ2luLXJpZ2h0OiA4cHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xcbiAgICAgICAgICAgIHRvIHtcXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuc2Nyb2xsYWJsZSB7XFxuICAgICAgICAgICAgZmxleDogMTtcXG4gICAgICAgICAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdHMtY29udGFpbmVyIHtcXG4gICAgICAgICAgICBmbGV4OiAxO1xcbiAgICAgICAgICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgICAgICAgICAgbWFyZ2luLXRvcDogMTZweDtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5zdW1tYXJ5IHtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTIpLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDYpKTtcXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTZweDtcXG4gICAgICAgICAgICBwYWRkaW5nOiAxNnB4O1xcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XFxuICAgICAgICAgICAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoMjBweCk7XFxuICAgICAgICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDIwcHgpO1xcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLCAwLCAwLCAwLjMpO1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnN1bW1hcnk6OmJlZm9yZSB7XFxuICAgICAgICAgICAgY29udGVudDogJyc7XFxuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgICAgICAgIHRvcDogMDtcXG4gICAgICAgICAgICBsZWZ0OiAwO1xcbiAgICAgICAgICAgIHJpZ2h0OiAwO1xcbiAgICAgICAgICAgIGJvdHRvbTogMDtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoNDVkZWcsIHRyYW5zcGFyZW50LCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpLCB0cmFuc3BhcmVudCk7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogaW5oZXJpdDtcXG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG4gICAgICAgICAgICBvcGFjaXR5OiAwO1xcbiAgICAgICAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBlYXNlO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnN1bW1hcnk6aG92ZXI6OmJlZm9yZSB7XFxuICAgICAgICAgICAgb3BhY2l0eTogMTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZXN1bHRzLWxpc3Qge1xcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgICAgICAgICBnYXA6IDEycHg7XFxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdC1pdGVtIHtcXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpO1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHg7XFxuICAgICAgICAgICAgcGFkZGluZzogMTZweDtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkpO1xcbiAgICAgICAgICAgIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDE1cHgpO1xcbiAgICAgICAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxNXB4KTtcXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDIwcHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdC1pdGVtOjpiZWZvcmUge1xcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnO1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgICAgICAgICB0b3A6IDA7XFxuICAgICAgICAgICAgbGVmdDogMDtcXG4gICAgICAgICAgICByaWdodDogMDtcXG4gICAgICAgICAgICBib3R0b206IDA7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCB0cmFuc3BhcmVudCwgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSwgdHJhbnNwYXJlbnQpO1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IGluaGVyaXQ7XFxuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICAgICAgICAgICAgb3BhY2l0eTogMDtcXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgZWFzZTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZXN1bHQtaXRlbTpob3Zlcjo6YmVmb3JlIHtcXG4gICAgICAgICAgICBvcGFjaXR5OiAxO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdC1pdGVtOmhvdmVyIHtcXG4gICAgICAgICAgICBib3gtc2hhZG93OiAwIDhweCAzMnB4IHJnYmEoMCwgMCwgMCwgMC4zKTtcXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTJweCk7XFxuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdC1pdGVtLmVycm9yIHtcXG4gICAgICAgICAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkICNmZjZiNmI7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgyMzEsIDc2LCA2MCwgMC4xNSksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkpO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdC1pdGVtLndhcm5pbmcge1xcbiAgICAgICAgICAgIGJvcmRlci1sZWZ0OiA0cHggc29saWQgI2ZmYTcyNjtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDI0MywgMTU2LCAxOCwgMC4xNSksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkpO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdC1pdGVtLmluZm8ge1xcbiAgICAgICAgICAgIGJvcmRlci1sZWZ0OiA0cHggc29saWQgIzQyYTVmNTtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDUyLCAxNTIsIDIxOSwgMC4xNSksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkpO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmFpLWV4cGxhaW4tYnRuIHtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjNjY3ZWVhLCAjNzY0YmEyKTtcXG4gICAgICAgICAgICBjb2xvcjogd2hpdGU7XFxuICAgICAgICAgICAgYm9yZGVyOiBub25lO1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDZweCAxMnB4O1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcXG4gICAgICAgICAgICBmb250LXNpemU6IDEwcHg7XFxuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcXG4gICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgICAgICAgbWFyZ2luLXRvcDogOHB4O1xcbiAgICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYWktZXhwbGFpbi1idG46aG92ZXIge1xcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcXG4gICAgICAgICAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoMTAyLCAxMjYsIDIzNCwgMC40KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5haS1leHBsYWluLWJ0bjpkaXNhYmxlZCB7XFxuICAgICAgICAgICAgb3BhY2l0eTogMC43O1xcbiAgICAgICAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBub25lO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmFpLWV4cGxhbmF0aW9uIHtcXG4gICAgICAgICAgICBtYXJnaW4tdG9wOiAxMnB4O1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDEycHg7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjEpLCByZ2JhKDExOCwgNzUsIDE2MiwgMC4xKSk7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTAyLCAxMjYsIDIzNCwgMC4yKTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5haS1leHBsYW5hdGlvbi1jb250ZW50IGg1IHtcXG4gICAgICAgICAgICBtYXJnaW46IDAgMCA4cHggMDtcXG4gICAgICAgICAgICBjb2xvcjogIzY2N2VlYTtcXG4gICAgICAgICAgICBmb250LXNpemU6IDEycHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYWktZXhwbGFuYXRpb24tdGV4dCB7XFxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxLjQ7XFxuICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5haS1zdWdnZXN0aW9ucyB7XFxuICAgICAgICAgICAgbWFyZ2luOiA4cHggMDtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5haS1zdWdnZXN0aW9ucyB1bCB7XFxuICAgICAgICAgICAgbWFyZ2luOiA0cHggMDtcXG4gICAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDE2cHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYWktc3VnZ2VzdGlvbnMgbGkge1xcbiAgICAgICAgICAgIG1hcmdpbjogMnB4IDA7XFxuICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC44KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5haS1pbXBhY3Qge1xcbiAgICAgICAgICAgIG1hcmdpbi10b3A6IDhweDtcXG4gICAgICAgICAgICBmb250LXN0eWxlOiBpdGFsaWM7XFxuICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5lbXB0eS1zdGF0ZSB7XFxuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDQ4cHggMjRweDtcXG4gICAgICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpO1xcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNCkpO1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7XFxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE1KTtcXG4gICAgICAgICAgICBtYXJnaW46IDIwcHggMDtcXG4gICAgICAgICAgICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cigxNXB4KTtcXG4gICAgICAgICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTVweCk7XFxuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuZW1wdHktc3RhdGU6OmJlZm9yZSB7XFxuICAgICAgICAgICAgY29udGVudDogJyc7XFxuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgICAgICAgIHRvcDogMDtcXG4gICAgICAgICAgICBsZWZ0OiAwO1xcbiAgICAgICAgICAgIHJpZ2h0OiAwO1xcbiAgICAgICAgICAgIGJvdHRvbTogMDtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoNDVkZWcsIHRyYW5zcGFyZW50LCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpLCB0cmFuc3BhcmVudCk7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogaW5oZXJpdDtcXG4gICAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG4gICAgICAgICAgICBvcGFjaXR5OiAwO1xcbiAgICAgICAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBlYXNlO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmVtcHR5LXN0YXRlOmhvdmVyOjpiZWZvcmUge1xcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuZW1wdHktc3RhdGUtaWNvbiB7XFxuICAgICAgICAgICAgZm9udC1zaXplOiAzMnB4O1xcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDEycHg7XFxuICAgICAgICAgICAgb3BhY2l0eTogMC44O1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmhpZGRlbiB7XFxuICAgICAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZWZlcmVuY2UtaW5mbyB7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpKTtcXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpO1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHg7XFxuICAgICAgICAgICAgcGFkZGluZzogMjBweDtcXG4gICAgICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjkpO1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlZmVyZW5jZS1pbmZvOjpiZWZvcmUge1xcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnO1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgICAgICAgICB0b3A6IDA7XFxuICAgICAgICAgICAgbGVmdDogMDtcXG4gICAgICAgICAgICByaWdodDogMDtcXG4gICAgICAgICAgICBib3R0b206IDA7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCB0cmFuc3BhcmVudCwgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSwgdHJhbnNwYXJlbnQpO1xcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IGluaGVyaXQ7XFxuICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVmZXJlbmNlLWluZm8gaDIge1xcbiAgICAgICAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTUpO1xcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDE1cHg7XFxuICAgICAgICAgICAgZm9udC1zaXplOiAxLjFyZW07XFxuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgICAgIHotaW5kZXg6IDE7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVmZXJlbmNlLWluZm8gcCB7XFxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMTJweDtcXG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMS41O1xcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgICAgICAgICB6LWluZGV4OiAxO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlZmVyZW5jZS1pbmZvIHVsIHtcXG4gICAgICAgICAgICBtYXJnaW46IDEwcHggMCAxMHB4IDIwcHg7XFxuICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgICAgIHotaW5kZXg6IDE7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVmZXJlbmNlLWluZm8gbGkge1xcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDZweDtcXG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlZmVyZW5jZS1pbmZvIHN0cm9uZyB7XFxuICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45NSk7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVmZXJlbmNlLWluZm8gZW0ge1xcbiAgICAgICAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7XFxuICAgICAgICAgICAgZm9udC1zaXplOiAwLjlyZW07XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuc3VtbWFyeS1jb250ZW50IGgzIHtcXG4gICAgICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcXG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxNXB4O1xcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMS4xcmVtO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnN1bW1hcnktc3RhdHMge1xcbiAgICAgICAgICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgMWZyKTtcXG4gICAgICAgICAgICBnYXA6IDEycHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuc3RhdCB7XFxuICAgICAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgICAgICBwYWRkaW5nOiA4cHggMTJweDtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpKTtcXG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA4cHg7XFxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnN0YXQtbGFiZWwge1xcbiAgICAgICAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOCk7XFxuICAgICAgICAgICAgZm9udC1zaXplOiAwLjlyZW07XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuc3RhdC12YWx1ZSB7XFxuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gICAgICAgICAgICBmb250LXNpemU6IDAuOTVyZW07XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuc3RhdC12YWx1ZS5nb29kIHtcXG4gICAgICAgICAgICBjb2xvcjogIzRjYWY1MDtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5zdGF0LXZhbHVlLndhcm5pbmcge1xcbiAgICAgICAgICAgIGNvbG9yOiAjZmY5ODAwO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnN0YXQtdmFsdWUuZXJyb3Ige1xcbiAgICAgICAgICAgIGNvbG9yOiAjZjQ0MzM2O1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdC1oZWFkZXIge1xcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDEycHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVzdWx0LWhlYWRlciBoNCB7XFxuICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45NSk7XFxuICAgICAgICAgICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICAgICAgICAgIG1hcmdpbjogMDtcXG4gICAgICAgICAgICBmbGV4OiAxO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlc3VsdC1zdGF0dXMge1xcbiAgICAgICAgICAgIHBhZGRpbmc6IDRweCA4cHg7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcXG4gICAgICAgICAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDhweDtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZXN1bHQtc3RhdHVzLnBhc3NlZCB7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSg3NiwgMTc1LCA4MCwgMC4yKTtcXG4gICAgICAgICAgICBjb2xvcjogIzRjYWY1MDtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZXN1bHQtc3RhdHVzLmZhaWxlZCB7XFxuICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNDQsIDY3LCA1NCwgMC4yKTtcXG4gICAgICAgICAgICBjb2xvcjogI2Y0NDMzNjtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZXN1bHQtc3RhdHVzLndhcm5pbmcge1xcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAxNTIsIDAsIDAuMik7XFxuICAgICAgICAgICAgY29sb3I6ICNmZjk4MDA7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVzdWx0LWRldGFpbHMge1xcbiAgICAgICAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOCk7XFxuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuNTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZXN1bHQtZGV0YWlscyBwIHtcXG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA4cHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAucmVzdWx0LWRldGFpbHMgc3Ryb25nIHtcXG4gICAgICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5yZWNvbW1lbmRhdGlvbnMge1xcbiAgICAgICAgICAgIG1hcmdpbi10b3A6IDEycHg7XFxuICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAxNnB4O1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgLnJlY29tbWVuZGF0aW9ucyBsaSB7XFxuICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KTtcXG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA0cHg7XFxuICAgICAgICAgICAgZm9udC1zaXplOiAwLjlyZW07XFxuICAgICAgICB9XFxuICAgIDwvc3R5bGU+XFxuPC9oZWFkPlxcblxcbjxib2R5PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsaXF1aWQtb3JiIG9yYi0xXFxcIj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwibGlxdWlkLW9yYiBvcmItMlxcXCI+PC9kaXY+XFxuXFxuICAgIDxkaXYgY2xhc3M9XFxcIm1haW4tY29udGVudFxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJoZWFkZXJcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImhlYWRlci10b3BcXFwiPlxcbiAgICAgICAgICAgICAgICA8ZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPGgxPlVJIFRlbmV0cyAmIFRyYXBzIEFuYWx5emVyPC9oMT5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcIiNcXFwiIGlkPVxcXCJyZWZlcmVuY2UtbGlua1xcXCIgY2xhc3M9XFxcInJlZmVyZW5jZS1saW5rXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIPCfk5ogUmVmZXJlbmNlXFxuICAgICAgICAgICAgICAgIDwvYT5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8cD5BbmFseXplIHlvdXIgd2lyZWZyYW1lcyBhZ2FpbnN0IFVJIGRlc2lnbiBiZXN0IHByYWN0aWNlczwvcD5cXG4gICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiYWktY29uZmlnXFxcIiBpZD1cXFwiYWktY29uZmlnXFxcIj5cXG4gICAgICAgICAgICA8aDM+8J+kliBBSSBDb25maWd1cmF0aW9uPC9oMz5cXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwicGFzc3dvcmRcXFwiIGlkPVxcXCJhcGkta2V5LWlucHV0XFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50ZXIgeW91ciBHaXRIdWIgUGVyc29uYWwgQWNjZXNzIFRva2VuXFxcIj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhaS1jb25maWctYnV0dG9uc1xcXCI+XFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBpZD1cXFwic2F2ZS1hcGkta2V5XFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5XFxcIj5TYXZlIEtleTwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgaWQ9XFxcInRlc3QtYWlcXFwiIGNsYXNzPVxcXCJidG5cXFwiPlRlc3QgQUk8L2J1dHRvbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGlkPVxcXCJhaS10b2dnbGVcXFwiIGNsYXNzPVxcXCJhaS10b2dnbGVcXFwiPvCflKcgQ29uZmlndXJlIEFJPC9idXR0b24+XFxuXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb250cm9sc1xcXCI+XFxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGlkPVxcXCJhbmFseXplLXNlbGVjdGlvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeVxcXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJidG4tdGV4dFxcXCI+QW5hbHl6ZSBTZWxlY3Rpb248L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJidG4tc3Bpbm5lclxcXCI+PC9zcGFuPlxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBpZD1cXFwiYW5hbHl6ZS1wYWdlXFxcIiBjbGFzcz1cXFwiYnRuXFxcIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImJ0bi10ZXh0XFxcIj5BbmFseXplIFBhZ2U8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJidG4tc3Bpbm5lclxcXCI+PC9zcGFuPlxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICA8ZGl2IGlkPVxcXCJsb2FkaW5nXFxcIiBjbGFzcz1cXFwibG9hZGluZ1xcXCI+XFxuICAgICAgICAgICAgPGRpdj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInNwaW5uZXJcXFwiPjwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgQW5hbHl6aW5nIHlvdXIgZGVzaWduLi4uXFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInNjcm9sbGFibGVcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgaWQ9XFxcInJlc3VsdHMtY29udGFpbmVyXFxcIiBjbGFzcz1cXFwicmVzdWx0cy1jb250YWluZXIgaGlkZGVuXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cXFwic3VtbWFyeVxcXCIgY2xhc3M9XFxcInN1bW1hcnkgaGlkZGVuXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cXFwicmVzdWx0cy1saXN0XFxcIiBjbGFzcz1cXFwicmVzdWx0cy1saXN0XFxcIj48L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGlkPVxcXCJlbXB0eS1zdGF0ZVxcXCIgY2xhc3M9XFxcImVtcHR5LXN0YXRlXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZW1wdHktc3RhdGUtaWNvblxcXCI+8J+OqDwvZGl2PlxcbiAgICAgICAgICAgICAgICA8ZGl2PlNlbGVjdCBlbGVtZW50cyBvciBhbmFseXplIHRoZSBlbnRpcmUgcGFnZSB0byBnZXQgc3RhcnRlZDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcblxcbiAgICA8XCIgKyBcInNjcmlwdD5cXG4gICAgICAgIGNvbnNvbGUubG9nKFxcXCLwn46vIFVJIHNjcmlwdCBsb2FkaW5nLi4uXFxcIik7XFxuXFxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxcXCLinIUgRE9NIHJlYWR5LCBzZXR0aW5nIHVwIFVJLi4uXFxcIik7XFxuXFxuICAgICAgICAgICAgY29uc3QgcGFnZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbmFseXplLXBhZ2UnKTtcXG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb25CdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5hbHl6ZS1zZWxlY3Rpb24nKTtcXG4gICAgICAgICAgICBjb25zdCBsb2FkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmcnKTtcXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3VsdHMtY29udGFpbmVyJyk7XFxuICAgICAgICAgICAgY29uc3QgZW1wdHlTdGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlbXB0eS1zdGF0ZScpO1xcblxcbiAgICAgICAgICAgIC8vIEJ1dHRvbiBjbGljayBoYW5kbGVyc1xcbiAgICAgICAgICAgIGlmIChwYWdlQnRuKSB7XFxuICAgICAgICAgICAgICAgIHBhZ2VCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcXFwi8J+ThCBBbmFseXplIHBhZ2UgY2xpY2tlZFxcXCIpO1xcbiAgICAgICAgICAgICAgICAgICAgc2hvd0xvYWRpbmcoKTtcXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSB3aW5kb3cpIHtcXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9zdE1lc3NhZ2UoeyBwbHVnaW5NZXNzYWdlOiB7IHR5cGU6ICdhbmFseXplLXBhZ2UnIH0gfSwgJyonKTtcXG4gICAgICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgfVxcblxcbiAgICAgICAgICAgIGlmIChzZWxlY3Rpb25CdG4pIHtcXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXFxcIvCflI0gQW5hbHl6ZSBzZWxlY3Rpb24gY2xpY2tlZFxcXCIpO1xcbiAgICAgICAgICAgICAgICAgICAgc2hvd0xvYWRpbmcoKTtcXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSB3aW5kb3cpIHtcXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9zdE1lc3NhZ2UoeyBwbHVnaW5NZXNzYWdlOiB7IHR5cGU6ICdhbmFseXplLXNlbGVjdGlvbicgfSB9LCAnKicpO1xcbiAgICAgICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlIGxpbmsgaGFuZGxlclxcbiAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZUxpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVmZXJlbmNlLWxpbmsnKTtcXG4gICAgICAgICAgICBpZiAocmVmZXJlbmNlTGluaykge1xcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VMaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxcXCLwn5OaIFJlZmVyZW5jZSBsaW5rIGNsaWNrZWRcXFwiKTtcXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSB3aW5kb3cpIHtcXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9zdE1lc3NhZ2UoeyBwbHVnaW5NZXNzYWdlOiB7IHR5cGU6ICdvcGVuLXJlZmVyZW5jZScgfSB9LCAnKicpO1xcbiAgICAgICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgLy8gQUkgQ29uZmlndXJhdGlvbiBoYW5kbGVyc1xcbiAgICAgICAgICAgIGNvbnN0IGFpVG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FpLXRvZ2dsZScpO1xcbiAgICAgICAgICAgIGNvbnN0IGFpQ29uZmlnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FpLWNvbmZpZycpO1xcbiAgICAgICAgICAgIGNvbnN0IGFwaUtleUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwaS1rZXktaW5wdXQnKTtcXG4gICAgICAgICAgICBjb25zdCBzYXZlQXBpS2V5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NhdmUtYXBpLWtleScpO1xcbiAgICAgICAgICAgIGNvbnN0IHRlc3RBaUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWFpJyk7XFxuXFxuICAgICAgICAgICAgaWYgKGFpVG9nZ2xlKSB7XFxuICAgICAgICAgICAgICAgIGFpVG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXFxcIvCflKcgQUkgdG9nZ2xlIGNsaWNrZWRcXFwiKTtcXG4gICAgICAgICAgICAgICAgICAgIGFpQ29uZmlnLmNsYXNzTGlzdC50b2dnbGUoJ3Nob3cnKTtcXG4gICAgICAgICAgICAgICAgICAgIGFpVG9nZ2xlLnRleHRDb250ZW50ID0gYWlDb25maWcuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaG93JykgPyAn8J+UpyBIaWRlIEFJIENvbmZpZycgOiAn8J+UpyBDb25maWd1cmUgQUknO1xcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgaWYgKHNhdmVBcGlLZXlCdG4pIHtcXG4gICAgICAgICAgICAgICAgc2F2ZUFwaUtleUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxcXCLwn5K+IFNhdmUgQVBJIGtleSBjbGlja2VkXFxcIik7XFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcGlLZXkgPSBhcGlLZXlJbnB1dC52YWx1ZS50cmltKCk7XFxuICAgICAgICAgICAgICAgICAgICBpZiAoYXBpS2V5KSB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IHdpbmRvdykge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9zdE1lc3NhZ2Uoe1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGx1Z2luTWVzc2FnZToge1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb25maWd1cmUtYWknLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgYXBpS2V5OiBhcGlLZXkgfVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnKicpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDbGVhciB0aGUgaW5wdXQgZm9yIHNlY3VyaXR5XFxuICAgICAgICAgICAgICAgICAgICAgICAgYXBpS2V5SW5wdXQudmFsdWUgPSAnJztcXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBIaWRlIHRoZSBjb25maWdcXG4gICAgICAgICAgICAgICAgICAgICAgICBhaUNvbmZpZy5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgYWlUb2dnbGUudGV4dENvbnRlbnQgPSAn8J+UpyBDb25maWd1cmUgQUknO1xcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnUGxlYXNlIGVudGVyIHlvdXIgR2l0SHViIFBlcnNvbmFsIEFjY2VzcyBUb2tlbicpO1xcbiAgICAgICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgaWYgKHRlc3RBaUJ0bikge1xcbiAgICAgICAgICAgICAgICB0ZXN0QWlCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcXFwi8J+nqiBUZXN0IEFJIGNsaWNrZWRcXFwiKTtcXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSB3aW5kb3cpIHtcXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9zdE1lc3NhZ2Uoe1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbHVnaW5NZXNzYWdlOiB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZ2V0LWFpLWV4cGxhbmF0aW9uJyxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aW9sYXRpb246IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuZXRUaXRsZTogXFxcIlRlc3QgQ29ubmVjdGlvblxcXCIsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFxcXCJUZXN0aW5nIEFJIHNlcnZpY2UgY29ubmVjdGlvblxcXCIsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lOiBcXFwiVGVzdCBFbGVtZW50XFxcIixcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVR5cGU6IFxcXCJUZXN0XFxcIixcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFxcXCJUZXN0XFxcIixcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V2ZXJpdHk6IFxcXCJpbmZvXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0SW5kZXg6IC0xIC8vIFNwZWNpYWwgaW5kZXggZm9yIHRlc3RcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICcqJyk7XFxuICAgICAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICAvLyBNZXNzYWdlIGhhbmRsZXIgZnJvbSBwbHVnaW5cXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4ge1xcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZXZlbnQuZGF0YS5wbHVnaW5NZXNzYWdlIHx8IGV2ZW50LmRhdGE7XFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxcXCLwn5OoIFJlY2VpdmVkIG1lc3NhZ2U6XFxcIiwgbWVzc2FnZSk7XFxuXFxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlICYmIG1lc3NhZ2UudHlwZSkge1xcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhbmFseXNpcy1zdGFydGVkJzpcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0xvYWRpbmcoKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYW5hbHlzaXMtY29tcGxldGUnOlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWRlTG9hZGluZygpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93UmVzdWx0cyhtZXNzYWdlLmRhdGEpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhbmFseXNpcy1lcnJvcic6XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVMb2FkaW5nKCk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dFcnJvcihtZXNzYWdlLmVycm9yKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2hvdy1yZWZlcmVuY2UtZ3VpZGUnOlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93UmVmZXJlbmNlR3VpZGUobWVzc2FnZS5tZXNzYWdlKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWktZXhwbGFuYXRpb24tY29tcGxldGUnOlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93QUlFeHBsYW5hdGlvbihtZXNzYWdlLmRhdGEucmVzdWx0SW5kZXgsIG1lc3NhZ2UuZGF0YS5leHBsYW5hdGlvbik7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FpLWV4cGxhbmF0aW9uLWVycm9yJzpcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlQUlFeHBsYW5hdGlvbkVycm9yKG1lc3NhZ2UuZGF0YS5lcnJvcik7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FpLWNvbmZpZ3VyZWQnOlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcXFwi4pyFIEFJIGNvbmZpZ3VyZWQgc3VjY2Vzc2Z1bGx5XFxcIik7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCfwn6SWIEFJIHNlcnZpY2UgY29uZmlndXJlZCBzdWNjZXNzZnVsbHkhIFlvdSBjYW4gbm93IGdldCBBSS1wb3dlcmVkIGV4cGxhbmF0aW9ucy4nKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWktY29uZmlnLWVycm9yJzpcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXFxcIuKdjCBBSSBjb25maWd1cmF0aW9uIGZhaWxlZFxcXCIpO1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydChg4p2MIEFJIGNvbmZpZ3VyYXRpb24gZmFpbGVkOiAke21lc3NhZ2UuZGF0YS5lcnJvcn1gKTtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XFxuICAgICAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9KTtcXG5cXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93TG9hZGluZygpIHtcXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXFxcIvCflIQgU2hvd2luZyBsb2FkaW5nLi4uXFxcIik7XFxuICAgICAgICAgICAgICAgIGlmIChsb2FkaW5nKSBsb2FkaW5nLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0c0NvbnRhaW5lcikgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xcbiAgICAgICAgICAgICAgICBpZiAoZW1wdHlTdGF0ZSkgZW1wdHlTdGF0ZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICBmdW5jdGlvbiBoaWRlTG9hZGluZygpIHtcXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXFxcIuKPue+4jyBIaWRpbmcgbG9hZGluZy4uLlxcXCIpO1xcbiAgICAgICAgICAgICAgICBpZiAobG9hZGluZykgbG9hZGluZy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93UmVzdWx0cyhkYXRhKSB7XFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxcXCLwn5OKIFNob3dpbmcgcmVzdWx0czpcXFwiLCBkYXRhKTtcXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHNDb250YWluZXIpIHtcXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XFxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzQ29udGFpbmVyLmlubmVySFRNTCA9IGBcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJzdW1tYXJ5XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPkFuYWx5c2lzIENvbXBsZXRlPC9oMz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+U2NvcmU6ICR7ZGF0YS5zdW1tYXJ5LnNjb3JlfSU8L3A+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPlRvdGFsOiAke2RhdGEuc3VtbWFyeS50b3RhbH0gfCBQYXNzZWQ6ICR7ZGF0YS5zdW1tYXJ5LnBhc3NlZH0gfCBJc3N1ZXM6ICR7ZGF0YS5zdW1tYXJ5LnZpb2xhdGlvbnN9PC9wPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdHNcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2RhdGEucmVzdWx0cy5tYXAoKHJlc3VsdCwgaW5kZXgpID0+IGBcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJlc3VsdC1pdGVtICR7cmVzdWx0LnNldmVyaXR5fVxcXCIgZGF0YS1yZXN1bHQtaW5kZXg9XFxcIiR7aW5kZXh9XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXN1bHQtaGVhZGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGg0PiR7cmVzdWx0LnRlbmV0VGl0bGV9PC9oND5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInJlc3VsdC1zdGF0dXMgJHtyZXN1bHQuc3RhdHVzfVxcXCI+JHtyZXN1bHQuc3RhdHVzfTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZXN1bHQtZGV0YWlsc1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzdHJvbmc+JHtyZXN1bHQubm9kZU5hbWV9PC9zdHJvbmc+ICgke3Jlc3VsdC5ub2RlVHlwZX0pOiAke3Jlc3VsdC5tZXNzYWdlfTwvcD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHQuc3RhdHVzID09PSAnZmFpbGVkJyB8fCByZXN1bHQuc3RhdHVzID09PSAnd2FybmluZycgPyBgXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVxcXCJhaS1leHBsYWluLWJ0blxcXCIgZGF0YS1yZXN1bHQtaW5kZXg9XFxcIiR7aW5kZXh9XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDwn6SWIEFJIEV4cGxhaW5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgIDogJyd9XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImFpLWV4cGxhbmF0aW9uXFxcIiBpZD1cXFwiYWktZXhwbGFuYXRpb24tJHtpbmRleH1cXFwiIHN0eWxlPVxcXCJkaXNwbGF5OiBub25lO1xcXCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICBgO1xcblxcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgQUkgRXhwbGFpbiBidXR0b25zXFxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5haS1leHBsYWluLWJ0bicpLmZvckVhY2goYnRuID0+IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVBSUV4cGxhaW5DbGljayk7XFxuICAgICAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICBpZiAoZW1wdHlTdGF0ZSkgZW1wdHlTdGF0ZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVBSUV4cGxhaW5DbGljayhldmVudCkge1xcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBldmVudC50YXJnZXQ7XFxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdEluZGV4ID0gYnV0dG9uLmdldEF0dHJpYnV0ZSgnZGF0YS1yZXN1bHQtaW5kZXgnKTtcXG4gICAgICAgICAgICAgICAgY29uc3QgZXhwbGFuYXRpb25EaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgYWktZXhwbGFuYXRpb24tJHtyZXN1bHRJbmRleH1gKTtcXG5cXG4gICAgICAgICAgICAgICAgLy8gU2hvdyBsb2FkaW5nIHN0YXRlXFxuICAgICAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICfwn6SWIExvYWRpbmcuLi4nO1xcbiAgICAgICAgICAgICAgICBidXR0b24uZGlzYWJsZWQgPSB0cnVlO1xcblxcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHZpb2xhdGlvbiBkYXRhIGZyb20gdGhlIHJlc3VsdHNcXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0SXRlbSA9IGJ1dHRvbi5jbG9zZXN0KCcucmVzdWx0LWl0ZW0nKTtcXG4gICAgICAgICAgICAgICAgY29uc3QgdmlvbGF0aW9uID0ge1xcbiAgICAgICAgICAgICAgICAgICAgdGVuZXRUaXRsZTogcmVzdWx0SXRlbS5xdWVyeVNlbGVjdG9yKCdoNCcpLnRleHRDb250ZW50LFxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogcmVzdWx0SXRlbS5xdWVyeVNlbGVjdG9yKCcucmVzdWx0LWRldGFpbHMgcCcpLnRleHRDb250ZW50LFxcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWU6IHJlc3VsdEl0ZW0ucXVlcnlTZWxlY3Rvcignc3Ryb25nJykudGV4dENvbnRlbnQsXFxuICAgICAgICAgICAgICAgICAgICBub2RlVHlwZTogJ1VJIEVsZW1lbnQnLCAvLyBDb3VsZCBiZSBlbmhhbmNlZCB0byBnZXQgYWN0dWFsIHR5cGVcXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnRGVzaWduJyxcXG4gICAgICAgICAgICAgICAgICAgIHNldmVyaXR5OiByZXN1bHRJdGVtLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKSA/ICdlcnJvcicgOiAnd2FybmluZydcXG4gICAgICAgICAgICAgICAgfTtcXG5cXG4gICAgICAgICAgICAgICAgLy8gU2VuZCByZXF1ZXN0IHRvIHBsdWdpblxcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50ICYmIHBhcmVudCAhPT0gd2luZG93KSB7XFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9zdE1lc3NhZ2Uoe1xcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbk1lc3NhZ2U6IHtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2dldC1haS1leHBsYW5hdGlvbicsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgdmlvbGF0aW9uLCByZXN1bHRJbmRleCB9XFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICAgICAgfSwgJyonKTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93QUlFeHBsYW5hdGlvbihyZXN1bHRJbmRleCwgZXhwbGFuYXRpb24pIHtcXG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIHRlc3QgY2FzZVxcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0SW5kZXggPT09IC0xKSB7XFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcXFwi8J+nqiBBSSBUZXN0IFJlc3VsdDpcXFwiLCBleHBsYW5hdGlvbik7XFxuICAgICAgICAgICAgICAgICAgICBhbGVydChg8J+kliBBSSBUZXN0IFN1Y2Nlc3NmdWwhXFxcXG5cXFxcbkV4cGxhbmF0aW9uOiAke2V4cGxhbmF0aW9uLmV4cGxhbmF0aW9ufVxcXFxuXFxcXG5UaGUgQUkgc2VydmljZSBpcyB3b3JraW5nIGNvcnJlY3RseSFgKTtcXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcXG4gICAgICAgICAgICAgICAgfVxcblxcbiAgICAgICAgICAgICAgICBjb25zdCBleHBsYW5hdGlvbkRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBhaS1leHBsYW5hdGlvbi0ke3Jlc3VsdEluZGV4fWApO1xcbiAgICAgICAgICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1yZXN1bHQtaW5kZXg9XFxcIiR7cmVzdWx0SW5kZXh9XFxcIl1gKTtcXG5cXG4gICAgICAgICAgICAgICAgaWYgKGV4cGxhbmF0aW9uRGl2ICYmIGV4cGxhbmF0aW9uKSB7XFxuICAgICAgICAgICAgICAgICAgICBleHBsYW5hdGlvbkRpdi5pbm5lckhUTUwgPSBgXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYWktZXhwbGFuYXRpb24tY29udGVudFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoNT7wn6SWIEFJIEluc2lnaHRzPC9oNT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYWktZXhwbGFuYXRpb24tdGV4dFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2V4cGxhbmF0aW9uLmV4cGxhbmF0aW9ufVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtleHBsYW5hdGlvbi5zdWdnZXN0aW9ucyAmJiBleHBsYW5hdGlvbi5zdWdnZXN0aW9ucy5sZW5ndGggPiAwID8gYFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYWktc3VnZ2VzdGlvbnNcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+8J+SoSBTdWdnZXN0aW9uczo8L3N0cm9uZz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZXhwbGFuYXRpb24uc3VnZ2VzdGlvbnMubWFwKHN1Z2dlc3Rpb24gPT4gYDxsaT4ke3N1Z2dlc3Rpb259PC9saT5gKS5qb2luKCcnKX1cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAgOiAnJ31cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYWktaW1wYWN0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+4pqg77iPIEltcGFjdDo8L3N0cm9uZz4gJHtleHBsYW5hdGlvbi5pbXBhY3R9XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgYDtcXG4gICAgICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uRGl2LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xcbiAgICAgICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgICAgIC8vIFJlc2V0IGJ1dHRvblxcbiAgICAgICAgICAgICAgICBpZiAoYnV0dG9uKSB7XFxuICAgICAgICAgICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn4pyFIEFJIEV4cGxhaW5lZCc7XFxuICAgICAgICAgICAgICAgICAgICBidXR0b24uZGlzYWJsZWQgPSB0cnVlO1xcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAnMC43JztcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVBSUV4cGxhbmF0aW9uRXJyb3IoZXJyb3IpIHtcXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcXFwiQUkgZXhwbGFuYXRpb24gZXJyb3I6XFxcIiwgZXJyb3IpO1xcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBhbGwgbG9hZGluZyBidXR0b25zXFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5haS1leHBsYWluLWJ0bltkaXNhYmxlZF0nKS5mb3JFYWNoKGJ1dHRvbiA9PiB7XFxuICAgICAgICAgICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAn8J+kliBBSSBFeHBsYWluJztcXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgLy8gQ291bGQgc2hvdyBhIHRvYXN0IG5vdGlmaWNhdGlvbiBoZXJlXFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxcXCJBSSBleHBsYW5hdGlvbiBmYWlsZWQ6XFxcIiwgZXJyb3IpO1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93RXJyb3IoZXJyb3IpIHtcXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXFxcIuKdjCBTaG93aW5nIGVycm9yOlxcXCIsIGVycm9yKTtcXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHNDb250YWluZXIpIHtcXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XFxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzQ29udGFpbmVyLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVxcXCJlcnJvclxcXCI+RXJyb3I6ICR7ZXJyb3J9PC9kaXY+YDtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICBpZiAoZW1wdHlTdGF0ZSkgZW1wdHlTdGF0ZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93UmVmZXJlbmNlR3VpZGUobWVzc2FnZSkge1xcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcXFwi8J+TmiBTaG93aW5nIHJlZmVyZW5jZSBndWlkZTpcXFwiLCBtZXNzYWdlKTtcXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHNDb250YWluZXIpIHtcXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XFxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzQ29udGFpbmVyLmlubmVySFRNTCA9IGBcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZWZlcmVuY2UtZ3VpZGVcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+8J+TmiBVSSBUZW5ldHMgJiBUcmFwcyBSZWZlcmVuY2U8L2gzPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke21lc3NhZ2V9PC9wPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyZWZlcmVuY2UtaW5mb1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDQ+Q29tcGxldGUgUmVmZXJlbmNlIEluY2x1ZGVzOjwvaDQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPjxzdHJvbmc+OCBVSSBUZW5ldHM8L3N0cm9uZz4gLSBCZXN0IHByYWN0aWNlcyB0byBmb2xsb3c8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT48c3Ryb25nPjYgVUkgVHJhcHM8L3N0cm9uZz4gLSBDb21tb24gbWlzdGFrZXMgdG8gYXZvaWQ8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT48c3Ryb25nPjcgQ2F0ZWdvcmllczwvc3Ryb25nPiAtIEFjY2Vzc2liaWxpdHksIFVzYWJpbGl0eSwgVmlzdWFsIEhpZXJhcmNoeSwgZXRjLjwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PGVtPlRoaXMgZmVhdHVyZSB3aWxsIG9wZW4gdGhlIGZ1bGwgaW50ZXJhY3RpdmUgcmVmZXJlbmNlIGd1aWRlIGluIHRoZSBwdWJsaXNoZWQgdmVyc2lvbi48L2VtPjwvcD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICBgO1xcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgICAgIGlmIChlbXB0eVN0YXRlKSBlbXB0eVN0YXRlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XFxuICAgICAgICAgICAgfVxcblxcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxcXCLinIUgVUkgc2V0dXAgY29tcGxldGUhXFxcIik7XFxuICAgICAgICB9KTtcXG4gICAgPFwiICsgXCIvc2NyaXB0PlxcbjwvYm9keT5cXG5cXG48L2h0bWw+XCI7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBjb2RlOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvY29kZS50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==