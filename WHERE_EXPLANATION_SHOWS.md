# 📍 Where the AI Explanation Shows Up

## Visual Structure

When you run the plugin and get analysis results, the HTML structure looks like this:

```
┌─────────────────────────────────────────────────────┐
│ 📊 Analysis Complete                                │
│ Found X results                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ⚠️ Insufficient Text Contrast               [warning]│
├─────────────────────────────────────────────────────┤
│ Text Layer (TEXT): Low contrast detected           │
│ • Increase contrast ratio                          │
│ • Use darker colors                                │
│                                                     │
│ ┌───────────────────────────────────────────────┐  │
│ │     🤖 AI Explain     ← CLICK THIS BUTTON     │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 🤖 AI Insights                    ← EXPLANATION  ││
│ │ ────────────────────────────────────────────    ││
│ │ This text doesn't have enough contrast...       ││
│ │                                                  ││
│ │ 💡 Suggestions:                                  ││
│ │ • Use darker text colors or lighter backgrounds ││
│ │ • Test contrast ratios with accessibility tools ││
│ │ • Aim for at least 4.5:1 contrast ratio         ││
│ │                                                  ││
│ │ ⚠️ Impact: Users with visual impairments...     ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## Where to Look in Figma

1. **Open your plugin** in Figma (Plugins → Development → UI Tenets Analyzer)

2. **Run an analysis**:

   - Click "Analyze Page" or "Analyze Selection"
   - You'll see result cards appear

3. **Each result card contains**:

   - 📝 Title (e.g., "Insufficient Text Contrast")
   - 🏷️ Status badge (warning/error/info)
   - 📄 Description text
   - 🤖 "AI Explain" button
   - 📦 **Hidden explanation div** (initially `display: none`)

4. **When you click "🤖 AI Explain"**:
   - Button text changes to "🤖 Loading..."
   - After 1-3 seconds, the explanation appears **DIRECTLY BELOW** the button
   - It has a purple/blue gradient background with a border
   - Button changes to "✅ AI Explained"

## What You Should See

### Location in the DOM:

```html
<div class="result-item">
  <div class="result-header">
    <h4>Violation Title</h4>
    <span class="result-status">warning</span>
  </div>
  <div class="result-details">
    <p>Description...</p>
    <ul>
      Recommendations...
    </ul>

    <!-- BUTTON HERE -->
    <button class="ai-explain-btn">🤖 AI Explain</button>

    <!-- EXPLANATION APPEARS HERE (initially hidden) -->
    <div class="ai-explanation" id="ai-explanation-0" style="display: none;">
      <!-- After clicking, this fills with content -->
    </div>
  </div>
</div>
```

## Debugging - What to Check

### In Figma Console (Plugins → Development → Open Console):

After clicking "AI Explain", you should see these logs **in order**:

```
1. 🤖 AI Explain button clicked
2. 🔍 Button click details: { resultIndex: "0", ... }
3. 📤 Sending AI explanation request: { violation: {...}, resultIndex: 0 }
4. ✅ Message sent to parent window

--- Plugin side ---
5. 🤖 Starting AI explanation for: {...}
6. 🔑 No API key provided, using fallback explanation (or AI response)
7. ✅ AI explanation received: {...}
8. 📤 Sending AI explanation to UI...

--- UI side ---
9. 📨 Received ai-explanation-complete: {...}
10. 🎯 showAIExplanation called with: {...}
11. 🔍 Looking for result index: "0"
12. 🔍 Button found: true
13. 🔍 Result item found: true
14. 🔍 Explanation div found: true
15. 🔍 Explanation div ID: "ai-explanation-0"
16. ✅ All elements found, calling showExplanationContent...
17. ✅ Showing AI explanation for result index: 0
18. ✅ Explanation HTML set, innerHTML length: 842
19. ✅ After setting display: block
20. ✅ Button updated to 'AI Explained' state
```

### If explanation doesn't show:

1. **Check if any of these logs fail**:

   - ❌ Button not found → The button wasn't created properly
   - ❌ Result item not found → DOM structure issue
   - ❌ Explanation div not found → The div wasn't created

2. **Check the explanation div in DOM**:

   - Right-click in plugin → Inspect Element
   - Find `<div class="ai-explanation" id="ai-explanation-0">`
   - Check its `style.display` - should be `block` after clicking
   - Check its `innerHTML` - should have content

3. **Common Issues**:
   - **Nothing happens**: Check if request even reaches the plugin (look for log #5)
   - **"Failed - Retry?"**: Request timed out or error occurred
   - **Button changes but no explanation**: The div exists but isn't visible (check CSS)

## Visual Appearance

The explanation should have:

- 🎨 **Purple/blue gradient background** (rgba(102, 126, 234, 0.15))
- 🔲 **Blue border** (2px solid #667eea)
- 📏 **Padding** (16px all around)
- 🔝 **Margin top** (12px from button)
- 📝 **Three sections**:
  1. Heading: "🤖 AI Insights"
  2. Explanation text
  3. Suggestions list
  4. Impact statement

## Expected Flow Time

- **Button click** → 0ms
- **"Loading..." appears** → 0ms (immediate)
- **Request sent** → <10ms
- **AI Service processes** → 100-3000ms
- **Response received** → <10ms
- **Explanation displayed** → <10ms
- **"AI Explained" button** → 0ms (immediate)

**Total: 0.1-3 seconds from click to display**

## Still Not Seeing It?

Try these:

1. **Scroll down in the plugin window** - explanation might be below viewport
2. **Look for the purple box** - it has a distinctive color
3. **Check if button says "✅ AI Explained"** - if yes, explanation should be there
4. **Inspect the element** - find `ai-explanation-0` and check its styles
5. **Check console for errors** - look for any ❌ messages

---

**The explanation appears DIRECTLY BELOW the "🤖 AI Explain" button in each result card!**
