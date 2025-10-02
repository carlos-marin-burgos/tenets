# 🧪 Testing AI Explanation - Debug Guide

## New Test Button Added!

I've added a **"🧪 Test AI"** button to help debug the AI explanation feature.

## How to Use It:

### 1. Reload the Plugin

- Reload your plugin in Figma

### 2. Click "🧪 Test AI"

- You'll see this purple button in the top controls (next to Analyze Page)
- It will:
  - Create a fake test result
  - Automatically trigger an AI explanation after 0.5 seconds
  - Show you exactly how the explanation should look

### 3. What You Should See:

```
┌─────────────────────────────────────────┐
│ [Analyze Selection] [Analyze Page] [🧪 Test AI] │
└─────────────────────────────────────────┘

After clicking Test AI:

┌─────────────────────────────────────────┐
│ ⚠️ Test Violation                  [warning]│
├─────────────────────────────────────────┤
│ Test Element (TEXT): This is a test    │
│ • Test recommendation 1                 │
│ • Test recommendation 2                 │
│                                          │
│ (AI Explain button appears immediately) │
│                                          │
╞═════════════════════════════════════════╡
║ ✨🤖 AI ASSISTANT SAYS                  ║  ← This appears
║ ────────────────────────────────────    ║     automatically!
║                                          ║
║ 💬 EXPLANATION                          ║
║ This is a test explanation...           ║
║                                          ║
║ 💡 HOW TO FIX IT                        ║
║ ✓ First test suggestion...              ║
║ ✓ Second test suggestion...             ║
║ ✓ Third test suggestion...              ║
║                                          ║
║ ⚠️ WHY IT MATTERS                       ║
║ This test demonstrates...               ║
╚═════════════════════════════════════════╝
```

## If Test Works:

✅ The UI explanation display is working correctly
✅ The problem is with the real API communication
✅ Check these next:

- Console logs when clicking real "AI Explain" button
- Network errors in Figma console
- Timeout issues (10 seconds)

## If Test Doesn't Work:

❌ There's a fundamental issue with the display code
❌ Check console for JavaScript errors
❌ Make sure you reloaded the plugin after rebuild

## Console Logs to Watch:

When you click "🧪 Test AI", you should see:

```
🧪 Test AI clicked - sending direct test
📊 Showing results: {...}
🧪 Triggering test AI explanation...
🎯 showAIExplanation called with: {...}
🔍 Looking for result index: "0"
🔍 Button found: true
🔍 Result item found: true
🔍 Explanation div found: true
✅ All elements found, calling showExplanationContent...
✅ Showing AI explanation for result index: 0
```

## Real AI Button vs Test:

| Feature           | Real Button   | Test Button    |
| ----------------- | ------------- | -------------- |
| Creates result    | From analysis | Fake test data |
| Calls plugin      | Yes           | No             |
| Uses API/fallback | Yes           | No             |
| Shows explanation | From service  | Hardcoded test |
| Timeout           | 10 seconds    | Instant        |

## Troubleshooting Real AI Button:

If the test works but real button fails:

### Check 1: Message Communication

Look for these in console:

- `📤 Sending AI explanation request`
- `✅ Message sent to parent window`
- Plugin side: `🤖 Starting AI explanation for:`

### Check 2: Response Received

- `📨 Received ai-explanation-complete`
- If missing → Plugin isn't responding or message not sent

### Check 3: Timeout

- `⏰ AI explanation request timed out`
- If you see this → Increase timeout or check why plugin is slow

### Check 4: Error Messages

- `❌ AI explanation error`
- Plugin side: `🚨 AI explanation failed`

## Quick Fixes:

### If timeout is the issue:

The timeout is currently 10 seconds. The fallback should return instantly, so if it's timing out, something else is wrong.

### If message not received:

1. Check Figma console for plugin errors
2. Verify plugin code compiled correctly
3. Try closing and reopening the plugin

### If explanation doesn't display:

1. Use test button to verify display works
2. Check if `showAIExplanation` function exists
3. Look for JavaScript errors in console

---

**TRY THE TEST BUTTON FIRST!** It will tell you if the display code works. Then we can debug the communication. 🚀
