import { Tenet, AnalysisResult, NodeContext } from "../types/AnalysisTypes";
import { TenetCheckers } from "./TenetCheckers";

export class TenetAnalyzer {
  private tenets: Tenet[];
  private checkers: TenetCheckers;

  constructor(tenets: Tenet[]) {
    this.tenets = tenets;
    this.checkers = new TenetCheckers();
  }

  /**
   * Analyze a single node and its children recursively
   */
  async analyzeNode(node: any, depth: number = 0): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    // Prevent infinite recursion - limit depth to 50 levels
    if (depth > 50) {
      console.warn(
        `⚠️ Maximum recursion depth reached at node: ${node.name || "Unnamed"}`
      );
      return results;
    }

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
    } catch (error) {
      console.error(
        `Error analyzing node ${node.name} at depth ${depth}:`,
        error
      );
    }

    return results;
  }

  /**
   * Check a specific tenet against a node
   */
  private async checkTenet(
    tenet: Tenet,
    context: NodeContext
  ): Promise<AnalysisResult | null> {
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
    } catch (error) {
      console.error(`Error checking tenet ${tenet.id}:`, error);
      return null;
    }
  }

  /**
   * Create context information for a node
   */
  private createNodeContext(node: any, depth: number): NodeContext {
    const parent = node.parent;
    const siblings = parent
      ? parent.children.filter((child: any) => child.id !== node.id)
      : [];
    const children = node.children || [];

    // Build ancestor chain
    const ancestors: any[] = [];
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
  getTenets(): Tenet[] {
    return this.tenets;
  }

  /**
   * Get tenets by category
   */
  getTenetsByCategory(categoryId: string): Tenet[] {
    return this.tenets.filter((tenet) => tenet.category.id === categoryId);
  }

  /**
   * Get tenets by type (tenet or trap)
   */
  getTenetsByType(type: "tenet" | "trap"): Tenet[] {
    return this.tenets.filter((tenet) => tenet.type === type);
  }
}
