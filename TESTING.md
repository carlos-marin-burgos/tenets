# Testing Guide for UI Tenets & Traps Analyzer

## Quick Start Testing

1. **Install the Plugin in Figma**:

   - Open Figma Desktop app
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file from this project root
   - The plugin should appear in your development plugins

2. **Create Test Wireframes**:
   Create some test elements to validate the plugin functionality:

### Test Cases for Different Tenets

#### 1. Color Contrast Testing

- Create a text element with light gray text (#CCCCCC) on white background
- Name it "Low Contrast Text"
- Should trigger contrast ratio violation

#### 2. Touch Target Size Testing

- Create a small button (20x20px)
- Name it "Small Button"
- Should trigger touch target size violation

#### 3. Typography Testing

- Create text with 10px font size
- Name it "Tiny Text"
- Should trigger text size violation

#### 4. Navigation Structure Testing

- Create a frame named "Navigation"
- Leave it empty or with just one item
- Should trigger navigation structure warning

#### 5. Interactive Elements Testing

- Create a rectangle with no fills or strokes
- Name it "Clickable Button"
- Should trigger interactive element styling warning

#### 6. Form Elements Testing

- Create a text element
- Name it "Input Field" (without "Label")
- Should trigger form clarity violation

## Sample Test Wireframe Elements

Here are some elements you can create to test different scenarios:

```
Test Page Layout:
├── Header (Frame)
│   ├── Navigation (Frame) [empty - should trigger warning]
│   └── Logo (Rectangle)
├── Main Content (Frame)
│   ├── Title (Text, 32px) ✓ Good
│   ├── Body Text (Text, 10px) ❌ Too small
│   ├── Low Contrast Text (Text, #CCCCCC on white) ❌ Poor contrast
│   └── Call to Action (Rectangle, 20x20px, named "Button") ❌ Too small
├── Sidebar (Frame)
│   ├── Form Section (Frame)
│   │   ├── Input Field (Rectangle) ❌ No label
│   │   └── Submit Button (Rectangle, 44x44px) ✓ Good size
└── Footer (Frame)
```

## Testing the Plugin

1. **Run Analysis**:

   - Select some elements or the entire page
   - Open the plugin
   - Click "Analyze Selection" or "Analyze Page"

2. **Expected Results**:

   - Should see a compliance score
   - Should see specific violations with recommendations
   - Should see issues categorized by severity (error, warning, info)

3. **Validate Results**:
   - Check that low contrast text is flagged
   - Check that small buttons trigger touch target warnings
   - Check that tiny text is flagged as an error
   - Check that empty navigation triggers a warning

## Common Issues & Troubleshooting

1. **Plugin won't load**:

   - Make sure you've built the project (`npm run build`)
   - Check that all files are in the `dist/` folder
   - Verify the `manifest.json` is in the project root

2. **No analysis results**:

   - Ensure layer names follow conventions (include keywords like "button", "text", "nav")
   - Check browser console for JavaScript errors
   - Try with simpler test elements first

3. **Unexpected results**:
   - The analyzer relies on naming conventions and basic Figma properties
   - Make sure elements have proper names that indicate their purpose
   - Some checks may not apply to certain element types

## Advanced Testing

### Testing Different Categories:

- **Accessibility**: Color contrast, text size, focus indicators
- **Usability**: Interactive elements, navigation, forms
- **Consistency**: Component usage, spacing
- **Layout**: Touch targets, responsive considerations

### Testing Edge Cases:

- Elements with no names
- Nested structures
- Complex component hierarchies
- Mixed content types

## Performance Testing

- Test with large pages (100+ elements)
- Test with deeply nested structures
- Monitor analysis speed and memory usage

## Reporting Issues

When reporting issues, please include:

1. Steps to reproduce
2. Expected vs actual results
3. Screenshots of the test setup
4. Browser console errors (if any)
5. Figma file structure

Happy testing! 🎨✨
