import { Tenet, TenetCategory } from "../types/AnalysisTypes";

// Define categories for organizing tenets and traps
export const TENET_CATEGORIES: TenetCategory[] = [
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
export const UI_TENETS: Tenet[] = [
  // ACCESSIBILITY TENETS
  {
    id: "contrast-ratio",
    title: "Sufficient Color Contrast",
    description:
      "Text and background colors must have sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)",
    category: TENET_CATEGORIES[0], // accessibility
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
    description:
      "Interactive elements must have clear focus indicators for keyboard navigation",
    category: TENET_CATEGORIES[0], // accessibility
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
    description:
      "Images and icons should have alternative text descriptions planned",
    category: TENET_CATEGORIES[0], // accessibility
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
    category: TENET_CATEGORIES[1], // usability
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
    category: TENET_CATEGORIES[1], // usability
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
    description:
      "Forms should have clear labels, validation, and error messages",
    category: TENET_CATEGORIES[1], // usability
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
    description:
      "Use consistent text sizing and weight to create clear information hierarchy",
    category: TENET_CATEGORIES[2], // visual-hierarchy
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
    category: TENET_CATEGORIES[2], // visual-hierarchy
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
    category: TENET_CATEGORIES[3], // consistency
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
    category: TENET_CATEGORIES[3], // consistency
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
    description:
      "Interactive elements should be at least 44x44px for touch interfaces",
    category: TENET_CATEGORIES[5], // layout
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
    category: TENET_CATEGORIES[5], // layout
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
export const UI_TRAPS: Tenet[] = [
  {
    id: "low-contrast-trap",
    title: "Low Contrast Text",
    description:
      "Avoid using text with insufficient contrast against backgrounds",
    category: TENET_CATEGORIES[0], // accessibility
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
    category: TENET_CATEGORIES[0], // accessibility
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
    category: TENET_CATEGORIES[1], // usability
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
    description:
      "Avoid hiding important actions in overflow menus or secondary locations",
    category: TENET_CATEGORIES[1], // usability
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
    category: TENET_CATEGORIES[3], // consistency
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
    category: TENET_CATEGORIES[5], // layout
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
export const UITenetsData: Tenet[] = [...UI_TENETS, ...UI_TRAPS];
