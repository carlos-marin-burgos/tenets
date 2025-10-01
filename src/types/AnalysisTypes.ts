export interface Tenet {
  id: string;
  title: string;
  description: string;
  category: TenetCategory;
  type: "tenet" | "trap";
  severity: "error" | "warning" | "info";
  checkFunction: string; // Name of the function to run
  examples?: string[];
  recommendations?: string[];
}

export interface TenetCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface AnalysisResult {
  tenetId: string;
  tenetTitle: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: "passed" | "failed" | "warning";
  severity: "error" | "warning" | "info";
  message: string;
  category: string;
  position?: {
    x: number;
    y: number;
  };
  recommendations?: string[];
}

export interface AnalysisSummary {
  total: number;
  passed: number;
  violations: number;
  score: number;
}

export interface AnalysisData {
  results: AnalysisResult[];
  summary?: AnalysisSummary;
  error?: string;
}

export interface UIMessage {
  type: "analyze-selection" | "analyze-page" | "close" | "analysis-result";
  data?: any;
}

// Node analysis context
export interface NodeContext {
  node: SceneNode;
  parent?: SceneNode;
  ancestors: SceneNode[];
  siblings: SceneNode[];
  children: SceneNode[];
  depth: number;
}
