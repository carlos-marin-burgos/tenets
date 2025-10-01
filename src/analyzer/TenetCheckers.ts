import { NodeContext, Tenet } from "../types/AnalysisTypes";

// Result of a tenet check
export interface CheckResult {
  passed: boolean;
  applicable: boolean;
  severity?: "error" | "warning" | "info";
  message?: string;
  recommendations?: string[];
}

// Type for checker functions
export type CheckerFunction = (
  context: NodeContext,
  tenet: Tenet
) => Promise<CheckResult> | CheckResult;

export class TenetCheckers {
  private checkers: Map<string, CheckerFunction> = new Map();

  constructor() {
    this.initializeCheckers();
  }

  /**
   * Get a checker function by name
   */
  getChecker(name: string): CheckerFunction | undefined {
    return this.checkers.get(name);
  }

  /**
   * Initialize all checker functions
   */
  private initializeCheckers() {
    // Accessibility checkers
    this.checkers.set("checkColorContrast", this.checkColorContrast.bind(this));
    this.checkers.set(
      "checkFocusIndicators",
      this.checkFocusIndicators.bind(this)
    );
    this.checkers.set(
      "checkAltTextPlanning",
      this.checkAltTextPlanning.bind(this)
    );
    this.checkers.set("checkLowContrast", this.checkLowContrast.bind(this));
    this.checkers.set("checkTinyText", this.checkTinyText.bind(this));

    // Usability checkers
    this.checkers.set(
      "checkNavigationStructure",
      this.checkNavigationStructure.bind(this)
    );
    this.checkers.set(
      "checkInteractiveElements",
      this.checkInteractiveElements.bind(this)
    );
    this.checkers.set("checkFormClarity", this.checkFormClarity.bind(this));
    this.checkers.set("checkFakeButtons", this.checkFakeButtons.bind(this));
    this.checkers.set("checkHiddenActions", this.checkHiddenActions.bind(this));

    // Visual hierarchy checkers
    this.checkers.set(
      "checkTypographyHierarchy",
      this.checkTypographyHierarchy.bind(this)
    );
    this.checkers.set("checkVisualWeight", this.checkVisualWeight.bind(this));

    // Consistency checkers
    this.checkers.set(
      "checkComponentConsistency",
      this.checkComponentConsistency.bind(this)
    );
    this.checkers.set(
      "checkSpacingConsistency",
      this.checkSpacingConsistency.bind(this)
    );
    this.checkers.set(
      "checkInconsistentNavigation",
      this.checkInconsistentNavigation.bind(this)
    );

    // Layout checkers
    this.checkers.set(
      "checkTouchTargetSize",
      this.checkTouchTargetSize.bind(this)
    );
    this.checkers.set(
      "checkResponsiveDesign",
      this.checkResponsiveDesign.bind(this)
    );
    this.checkers.set("checkOvercrowding", this.checkOvercrowding.bind(this));
  }

  // ACCESSIBILITY CHECKERS
  private checkColorContrast(context: NodeContext): CheckResult {
    try {
      const { node } = context;

      // Only check text nodes
      if (!node || node.type !== "TEXT") {
        return { passed: true, applicable: false };
      }

      // Type guard for text nodes
      const textNode = node as TextNode;

      // Check if text has fills
      if (
        !textNode.fills ||
        !Array.isArray(textNode.fills) ||
        textNode.fills.length === 0
      ) {
        return { passed: true, applicable: false };
      }

      // Get text color
      const textFill = textNode.fills[0] as Paint;
      if (!textFill || textFill.type !== "SOLID") {
        return { passed: true, applicable: false };
      }

      // Check parent background color
      const parent = context.parent;
      if (
        !parent ||
        !("fills" in parent) ||
        !parent.fills ||
        !Array.isArray(parent.fills) ||
        parent.fills.length === 0
      ) {
        return { passed: true, applicable: false };
      }

      const backgroundFill = parent.fills[0] as Paint;
      if (!backgroundFill || backgroundFill.type !== "SOLID") {
        return { passed: true, applicable: false };
      }

      // Calculate contrast ratio (simplified)
      const textColor = (textFill as SolidPaint).color;
      const backgroundColor = (backgroundFill as SolidPaint).color;

      if (!textColor || !backgroundColor) {
        return { passed: true, applicable: false };
      }

      const contrastRatio = this.calculateContrastRatio(
        textColor,
        backgroundColor
      );

      // Check if text size qualifies as large text
      const fontSize = (textNode.fontSize as number) || 16;
      const fontWeight = (textNode.fontWeight as number) || 400;
      const isLargeText =
        fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

      const requiredRatio = isLargeText ? 3.0 : 4.5;

      if (contrastRatio < requiredRatio) {
        return {
          passed: false,
          applicable: true,
          severity: "error",
          message: `Text contrast ratio ${contrastRatio.toFixed(
            2
          )}:1 is below required ${requiredRatio}:1`,
          recommendations: [
            "Use darker text or lighter background",
            "Check contrast with accessibility tools",
            "Consider using system colors with guaranteed contrast",
          ],
        };
      }

      return { passed: true, applicable: true };
    } catch (error) {
      console.warn("Error in checkColorContrast:", error);
      return { passed: true, applicable: false };
    }
  }

  private checkLowContrast(context: NodeContext): CheckResult {
    // This is essentially the same as checkColorContrast but as a trap
    return this.checkColorContrast(context);
  }

  private checkFocusIndicators(context: NodeContext): CheckResult {
    const { node } = context;

    // Check if node appears to be interactive
    if (!this.isInteractiveElement(node)) {
      return { passed: true, applicable: false };
    }

    // In wireframes, we can't check actual focus states, but we can check naming conventions
    const nodeName = (node.name || "").toLowerCase();
    const hasInteractiveIndicator =
      nodeName.includes("button") ||
      nodeName.includes("link") ||
      nodeName.includes("input") ||
      nodeName.includes("interactive");

    if (!hasInteractiveIndicator) {
      return {
        passed: false,
        applicable: true,
        severity: "warning",
        message:
          "Interactive elements should be clearly labeled and have focus states planned",
        recommendations: [
          'Name interactive elements clearly (e.g., "Submit Button")',
          "Plan focus indicator styles",
          "Document keyboard navigation flow",
        ],
      };
    }

    return { passed: true, applicable: true };
  }

  private checkAltTextPlanning(context: NodeContext): CheckResult {
    const { node } = context;

    // Check images and icons
    if (
      node.type !== "RECTANGLE" &&
      node.type !== "ELLIPSE" &&
      node.type !== "FRAME"
    ) {
      return { passed: true, applicable: false };
    }

    // Look for image-like naming or fills
    const nodeName = (node.name || "").toLowerCase();
    const hasImageIndicator =
      nodeName.includes("image") ||
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

  private checkTinyText(context: NodeContext): CheckResult {
    try {
      const { node } = context;

      if (!node || node.type !== "TEXT") {
        return { passed: true, applicable: false };
      }

      const textNode = node as TextNode;

      // Safely get the font size - handle mixed values
      let fontSize = 16; // default

      if (typeof textNode.fontSize === "number") {
        fontSize = textNode.fontSize;
      } else if (typeof textNode.fontSize === "symbol") {
        // This is likely figma.mixed - skip this check
        return { passed: true, applicable: false };
      } else {
        // Fallback to default
        fontSize = 16;
      }

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
    } catch (error) {
      console.warn("Error in checkTinyText:", error);
      return { passed: true, applicable: false };
    }
  }

  // USABILITY CHECKERS
  private checkNavigationStructure(context: NodeContext): CheckResult {
    const { node } = context;

    // Look for navigation-related elements
    const nodeName = (node.name || "").toLowerCase();
    const isNavigation =
      nodeName.includes("nav") ||
      nodeName.includes("menu") ||
      nodeName.includes("header") ||
      nodeName.includes("breadcrumb");

    if (!isNavigation) {
      return { passed: true, applicable: false };
    }

    // Check if navigation has clear structure
    const hasChildren =
      "children" in node && node.children && node.children.length > 0;

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

  private checkInteractiveElements(context: NodeContext): CheckResult {
    const { node } = context;

    if (!this.isInteractiveElement(node)) {
      return { passed: true, applicable: false };
    }

    // Check if element has visual cues for interactivity
    const hasStroke =
      "strokes" in node && node.strokes && (node.strokes as Paint[]).length > 0;
    const hasFill =
      "fills" in node && node.fills && (node.fills as Paint[]).length > 0;

    if (!hasStroke && !hasFill) {
      return {
        passed: false,
        applicable: true,
        severity: "warning",
        message:
          "Interactive elements should have visual styling to indicate they are clickable",
        recommendations: [
          "Add borders, backgrounds, or other visual cues",
          "Ensure buttons look different from regular text",
          "Plan hover and active states",
        ],
      };
    }

    return { passed: true, applicable: true };
  }

  private checkFormClarity(context: NodeContext): CheckResult {
    const { node } = context;

    // Look for form-related elements
    const nodeName = (node.name || "").toLowerCase();
    const isFormElement =
      nodeName.includes("form") ||
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

  private checkTouchTargetSize(context: NodeContext): CheckResult {
    const { node } = context;

    if (!this.isInteractiveElement(node)) {
      return { passed: true, applicable: false };
    }

    const width = ("width" in node ? (node.width as number) : 0) || 0;
    const height = ("height" in node ? (node.height as number) : 0) || 0;
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
  private checkFakeButtons(context: NodeContext): CheckResult {
    // Implementation for checking fake buttons
    return { passed: true, applicable: false };
  }

  private checkHiddenActions(context: NodeContext): CheckResult {
    // Implementation for checking hidden actions
    return { passed: true, applicable: false };
  }

  private checkTypographyHierarchy(context: NodeContext): CheckResult {
    // Implementation for checking typography hierarchy
    return { passed: true, applicable: false };
  }

  private checkVisualWeight(context: NodeContext): CheckResult {
    // Implementation for checking visual weight
    return { passed: true, applicable: false };
  }

  private checkComponentConsistency(context: NodeContext): CheckResult {
    // Implementation for checking component consistency
    return { passed: true, applicable: false };
  }

  private checkSpacingConsistency(context: NodeContext): CheckResult {
    // Implementation for checking spacing consistency
    return { passed: true, applicable: false };
  }

  private checkInconsistentNavigation(context: NodeContext): CheckResult {
    // Implementation for checking inconsistent navigation
    return { passed: true, applicable: false };
  }

  private checkResponsiveDesign(context: NodeContext): CheckResult {
    // Implementation for checking responsive design
    return { passed: true, applicable: false };
  }

  private checkOvercrowding(context: NodeContext): CheckResult {
    // Implementation for checking overcrowding
    return { passed: true, applicable: false };
  }

  // UTILITY METHODS
  private isInteractiveElement(node: any): boolean {
    const nodeName = (node.name || "").toLowerCase();
    return (
      nodeName.includes("button") ||
      nodeName.includes("link") ||
      nodeName.includes("input") ||
      nodeName.includes("clickable") ||
      nodeName.includes("tap") ||
      (node.type === "FRAME" &&
        (nodeName.includes("card") || nodeName.includes("item")))
    );
  }

  private calculateContrastRatio(color1: any, color2: any): number {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd use proper WCAG formulas
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(color: any): number {
    // Simplified luminance calculation
    const r = color.r * 255;
    const g = color.g * 255;
    const b = color.b * 255;

    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
}
