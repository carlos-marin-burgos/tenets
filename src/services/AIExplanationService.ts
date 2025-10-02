/**
 * AI Service for generating human-friendly design insights
 * Uses GitHub Models API for cost-effective AI explanations
 * Designed to work in Figma's plugin environment
 */

interface AIExplanationRequest {
  violation: {
    tenetTitle: string;
    message: string;
    nodeName: string;
    nodeType: string;
    category: string;
    severity: string;
  };
  designContext?: {
    pageType?: string;
    componentContext?: string;
    userJourney?: string;
  };
}

interface AIExplanationResponse {
  explanation: string;
  suggestions: string[];
  impact: string;
  examples?: string[];
  codeSuggestions?: CodeSuggestion[];
}

interface CodeSuggestion {
  language: "css" | "figma" | "tokens";
  title: string;
  code: string;
  description: string;
}

export class AIExplanationService {
  private apiKey: string;
  private baseURL = "https://models.github.ai/inference/chat/completions";
  private model = "openai/gpt-4.1-mini";

  constructor(apiKey?: string) {
    // Use provided API key or environment variable
    this.apiKey = apiKey || process.env.GITHUB_TOKEN || "";
    if (!this.apiKey) {
      console.warn(
        "🔑 No API key provided. AI explanations will use fallback responses."
      );
    }
    console.log("🤖 AIExplanationService initialized with GitHub Models");
  }

  async getAIExplanation(
    request: AIExplanationRequest
  ): Promise<AIExplanationResponse> {
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
              content:
                "You are a UX/UI design expert helping designers improve their interfaces. Provide clear, actionable advice in a friendly tone.",
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
        throw new Error(
          `GitHub Models API request failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      const content =
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content;

      if (!content) {
        throw new Error("No content received from AI model");
      }

      return this.parseAIResponse(content, request);
    } catch (error) {
      console.error("🚨 AI explanation failed:", error);
      return this.getFallbackExplanation(request);
    }
  }

  private buildPrompt(request: AIExplanationRequest): string {
    const { violation } = request;
    return `Analyze this UI design issue: ${violation.message} for element ${violation.nodeName} (${violation.nodeType}).

Please provide:
1. WHY it matters (brief explanation)
2. HOW to fix it (actionable steps)
3. IMPACT if unfixed
4. CODE SUGGESTIONS (specific CSS or design tokens)

For code suggestions, provide:
- CSS code with actual values (colors, sizes, spacing)
- Design token recommendations (naming conventions)
- Figma-specific settings if applicable

Format your response clearly with sections.`;
  }

  private parseAIResponse(
    content: string,
    request: AIExplanationRequest
  ): AIExplanationResponse {
    const codeSuggestions = this.extractCodeSuggestionsFromText(content);

    return {
      explanation: content,
      suggestions: this.extractSuggestionsFromText(content),
      impact: "This issue may impact user experience and accessibility",
      examples: [],
      codeSuggestions:
        codeSuggestions.length > 0
          ? codeSuggestions
          : this.generateDefaultCodeSuggestions(request),
    };
  }

  private extractCodeSuggestionsFromText(text: string): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Look for CSS code blocks
    const cssMatches = text.matchAll(/```css\n([\s\S]*?)```/g);
    for (const match of cssMatches) {
      suggestions.push({
        language: "css",
        title: "CSS Fix",
        code: match[1].trim(),
        description: "Apply this CSS to fix the issue",
      });
    }

    // Look for design token mentions
    const tokenRegex = /--[\w-]+:\s*[^;]+;/g;
    const tokenMatches = text.match(tokenRegex);
    if (tokenMatches && tokenMatches.length > 0) {
      suggestions.push({
        language: "tokens",
        title: "Design Tokens",
        code: tokenMatches.join("\n"),
        description: "Use these design tokens for consistency",
      });
    }

    return suggestions;
  }

  private generateDefaultCodeSuggestions(
    request: AIExplanationRequest
  ): CodeSuggestion[] {
    const { violation } = request;
    const suggestions: CodeSuggestion[] = [];

    // Generate context-specific code suggestions
    if (violation.message.toLowerCase().includes("contrast")) {
      suggestions.push({
        language: "css",
        title: "Improve Contrast",
        code: `/* Original - Low Contrast */
color: #999999;
background: #CCCCCC;

/* Fixed - High Contrast */
color: #333333;
background: #FFFFFF;

/* Or use semantic tokens */
color: var(--text-primary);
background: var(--bg-surface);`,
        description:
          "Use darker text or lighter backgrounds for better readability",
      });

      suggestions.push({
        language: "tokens",
        title: "Contrast Tokens",
        code: `--text-primary: #1a1a1a;
--text-secondary: #4a4a4a;
--bg-surface: #ffffff;
--bg-elevated: #f5f5f5;`,
        description: "Define semantic color tokens for consistent contrast",
      });
    }

    if (
      violation.message.toLowerCase().includes("size") ||
      violation.message.toLowerCase().includes("font")
    ) {
      suggestions.push({
        language: "css",
        title: "Adjust Font Size",
        code: `/* Mobile-first approach */
font-size: 16px;
line-height: 1.5;

/* Responsive scaling */
@media (min-width: 768px) {
  font-size: 18px;
}

/* Or use clamp for fluid typography */
font-size: clamp(16px, 2vw, 20px);`,
        description: "Ensure text is readable on all devices",
      });

      suggestions.push({
        language: "tokens",
        title: "Typography Tokens",
        code: `--font-size-body: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--line-height-base: 1.5;
--line-height-tight: 1.3;`,
        description: "Use a type scale for consistent typography",
      });
    }

    if (
      violation.message.toLowerCase().includes("spacing") ||
      violation.message.toLowerCase().includes("padding")
    ) {
      suggestions.push({
        language: "css",
        title: "Improve Spacing",
        code: `/* Use 8-point grid system */
padding: 16px;
margin-bottom: 24px;
gap: 8px;

/* Touch-friendly targets */
min-height: 44px;
min-width: 44px;

/* Or use spacing tokens */
padding: var(--space-md);
gap: var(--space-sm);`,
        description: "Follow consistent spacing patterns",
      });

      suggestions.push({
        language: "tokens",
        title: "Spacing Tokens",
        code: `--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;`,
        description: "Define spacing scale based on 8-point grid",
      });
    }

    if (
      violation.message.toLowerCase().includes("accessibility") ||
      violation.message.toLowerCase().includes("accessible")
    ) {
      suggestions.push({
        language: "css",
        title: "Accessibility Improvements",
        code: `/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}`,
        description: "Ensure keyboard and screen reader accessibility",
      });

      suggestions.push({
        language: "figma",
        title: "Figma Accessibility",
        code: `1. Add Alt Text to images/icons
2. Set proper text hierarchy (H1, H2, H3)
3. Use Auto Layout for responsive spacing
4. Name layers descriptively
5. Group related elements semantically`,
        description: "Configure Figma for better accessibility handoff",
      });
    }

    // Always provide at least one generic suggestion if none matched
    if (suggestions.length === 0) {
      suggestions.push({
        language: "css",
        title: "General Improvement",
        code: `/* Follow design system principles */
.${violation.nodeType.toLowerCase()} {
  /* Use semantic tokens */
  color: var(--text-primary);
  background: var(--bg-surface);
  
  /* Consistent spacing */
  padding: var(--space-md);
  gap: var(--space-sm);
  
  /* Smooth interactions */
  transition: all 0.2s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .${violation.nodeType.toLowerCase()} {
    padding: var(--space-sm);
  }
}`,
        description: "Apply design system principles consistently",
      });
    }

    return suggestions;
  }

  private extractSuggestionsFromText(text: string): string[] {
    const suggestions: string[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("-") ||
        trimmed.startsWith("*") ||
        trimmed.match(/^\d+\./)
      ) {
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

  private getFallbackExplanation(
    request: AIExplanationRequest
  ): AIExplanationResponse {
    const { violation } = request;

    const fallbacks: Record<string, AIExplanationResponse> = {
      contrast: {
        explanation:
          "This text doesn't have enough contrast against its background, making it difficult for users to read. Good contrast is essential for readability and accessibility.",
        suggestions: [
          "Use darker text colors or lighter backgrounds",
          "Test contrast ratios with accessibility tools",
          "Aim for at least 4.5:1 contrast ratio for normal text",
          "Consider users with visual impairments or color blindness",
        ],
        impact:
          "Users with visual impairments may not be able to read this content, which could exclude a significant portion of your audience.",
        codeSuggestions: [
          {
            language: "css",
            title: "Fix Contrast",
            code: `/* Improve text contrast */
color: #1a1a1a;
background: #ffffff;

/* Use WCAG AA compliant colors */
--text-primary: #212121;
--bg-surface: #f5f5f5;`,
            description: "Use high-contrast colors for better readability",
          },
          {
            language: "tokens",
            title: "Contrast Tokens",
            code: `--color-text-primary: #1a1a1a;
--color-text-secondary: #4a4a4a;
--color-bg-primary: #ffffff;
--color-bg-secondary: #f5f5f5;`,
            description: "Define semantic color tokens",
          },
        ],
      },
      text: {
        explanation:
          "Text that's too small can be difficult to read, especially for users with visual impairments or on smaller screens.",
        suggestions: [
          "Use at least 16px for body text",
          "Ensure text scales properly on mobile devices",
          "Test readability at different zoom levels",
          "Consider line height and letter spacing for better readability",
        ],
        impact:
          "Users may strain to read small text, leading to eye fatigue, or be unable to read it entirely.",
        codeSuggestions: [
          {
            language: "css",
            title: "Readable Font Sizes",
            code: `/* Base font size */
font-size: 16px;
line-height: 1.5;

/* Responsive typography */
@media (min-width: 768px) {
  font-size: 18px;
}`,
            description: "Use accessible font sizes",
          },
          {
            language: "tokens",
            title: "Typography Scale",
            code: `--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--line-height-base: 1.5;`,
            description: "Define a modular type scale",
          },
        ],
      },
      spacing: {
        explanation:
          "Proper spacing improves readability and creates visual hierarchy in your design.",
        suggestions: [
          "Use consistent spacing throughout your design",
          "Follow the 8-point grid system for spacing",
          "Ensure touch targets are at least 44x44 pixels",
          "Add breathing room between interactive elements",
        ],
        impact:
          "Poor spacing can lead to accidental clicks and user frustration.",
        codeSuggestions: [
          {
            language: "css",
            title: "Consistent Spacing",
            code: `/* 8-point grid system */
padding: 16px;
gap: 8px;
margin-bottom: 24px;

/* Touch-friendly targets */
min-height: 44px;
min-width: 44px;`,
            description: "Use the 8-point grid for spacing",
          },
          {
            language: "tokens",
            title: "Spacing Scale",
            code: `--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;`,
            description: "Define spacing tokens",
          },
        ],
      },
      accessibility: {
        explanation:
          "This element may not be accessible to all users, particularly those using assistive technologies.",
        suggestions: [
          "Add proper labels for screen readers",
          "Ensure keyboard navigation works correctly",
          "Test with accessibility tools and real users",
          "Follow WCAG guidelines for accessibility",
        ],
        impact:
          "Users with disabilities may be unable to use this feature, violating accessibility standards.",
        codeSuggestions: [
          {
            language: "css",
            title: "Accessibility Styles",
            code: `/* Keyboard focus indicators */
:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  clip: rect(0 0 0 0);
  overflow: hidden;
}`,
            description: "Add accessible styles",
          },
          {
            language: "figma",
            title: "Figma A11y Checklist",
            code: `✓ Add alt text to images
✓ Use semantic hierarchy (H1-H6)
✓ Name layers descriptively
✓ Set proper text roles
✓ Use Auto Layout for structure
✓ Group related elements`,
            description: "Configure Figma for accessibility",
          },
        ],
      },
    };

    // Try to match based on violation message or title
    const key = Object.keys(fallbacks).find(
      (k) =>
        violation.message.toLowerCase().includes(k) ||
        violation.tenetTitle.toLowerCase().includes(k)
    );

    const matchedFallback = key ? fallbacks[key] : null;

    if (matchedFallback) {
      return matchedFallback;
    }

    // Default fallback with generic code suggestions
    return {
      explanation: `The "${violation.tenetTitle}" principle helps ensure your design is user-friendly and accessible. ${violation.message}`,
      suggestions: [
        "Review the specific design principle guidelines",
        "Test your design with real users",
        "Consider accessibility and usability standards",
        "Iterate based on user feedback",
      ],
      impact:
        "This issue may negatively impact user experience, accessibility, and overall design quality.",
      codeSuggestions: this.generateDefaultCodeSuggestions(request),
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey; // Return true only if API key is actually available
  }
}
