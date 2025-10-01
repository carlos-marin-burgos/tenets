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
    return `Analyze this UI design issue: ${violation.message} for element ${violation.nodeName}. Provide WHY it matters, HOW to fix it, and the IMPACT if unfixed.`;
  }

  private parseAIResponse(
    content: string,
    request: AIExplanationRequest
  ): AIExplanationResponse {
    return {
      explanation: content,
      suggestions: this.extractSuggestionsFromText(content),
      impact: "This issue may impact user experience and accessibility",
      examples: [],
    };
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
          "This text doesn't have enough contrast against its background, making it difficult for users to read.",
        suggestions: [
          "Use darker text colors or lighter backgrounds",
          "Test contrast ratios with accessibility tools",
          "Aim for at least 4.5:1 contrast ratio for normal text",
        ],
        impact:
          "Users with visual impairments may not be able to read this content",
      },
      text: {
        explanation:
          "Text that's too small can be difficult to read, especially for users with visual impairments.",
        suggestions: [
          "Use at least 16px for body text",
          "Ensure text scales properly on mobile",
          "Test readability at different zoom levels",
        ],
        impact:
          "Users may strain to read small text or be unable to read it entirely",
      },
    };

    const key = Object.keys(fallbacks).find(
      (k) =>
        violation.message.toLowerCase().includes(k) ||
        violation.tenetTitle.toLowerCase().includes(k)
    );

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

  isConfigured(): boolean {
    return !!this.apiKey; // Return true only if API key is actually available
  }
}
