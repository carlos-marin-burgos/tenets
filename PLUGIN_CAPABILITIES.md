# UI Tenets & Traps Analyzer - Plugin Capabilities

## What This Plugin Does

1. **Analyzes Figma designs** - Scans selected elements or entire pages for UI/UX issues

2. **Applies 14 UI best practices** - Checks against 8 UI Tenets (good practices) and 6 UI Traps (common mistakes)

3. **Detects design issues** across 7 categories:

   - Accessibility (contrast, text size, touch targets)
   - Usability (clarity, feedback, cognitive load)
   - Visual Hierarchy (layout, emphasis)
   - Content (readability, structure)
   - Interaction (states, affordances)
   - Performance (complexity, optimization)
   - Consistency (patterns, spacing)

4. **Generates AI-powered explanations** - Get human-friendly insights on why issues matter and how to fix them

5. **Provides production-ready code** - Receive CSS snippets, design tokens, and Figma-specific fixes

6. **Creates annotated reports** - View issues with severity ratings (Error, Warning, Info)

7. **Highlights problem elements** - Click any issue to jump directly to that element in Figma

8. **Filters and exports results** - Filter by severity/category and export to CSV for documentation

9. **Builds a learning library** - Save useful explanations to your personal knowledge base

10. **Supports batch processing** - Explain all issues at once with AI-powered bulk analysis

---

## Perfect For

- Catching accessibility violations before launch
- Learning UI/UX best practices
- Generating developer handoff documentation
- Building consistent design systems
- Quality assurance reviews

---

## Technical Details

**Plugin Type:** Figma Plugin with UI
**Document Access:** Dynamic page access
**Network Access:** GitHub Models API (for AI explanations)
**Data Storage:** Local browser storage only (localStorage for saved learnings)
**Privacy:** No design data sent to external servers - only generic violation descriptions
