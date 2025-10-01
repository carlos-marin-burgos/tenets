# UI Tenets & Traps Analyzer - Figma Plugin

A comprehensive Figma plugin that analyzes wireframes and designs against UI design best practices, helping designers identify potential usability issues and ensure compliance with accessibility and design tenets.

## 🎯 Features

- **Real-time Analysis**: Analyze selected elements or entire pages
- **Comprehensive Checks**: Cover accessibility, usability, visual hierarchy, consistency, and layout
- **Smart Detection**: Automatically detect common UI traps and violations
- **Actionable Recommendations**: Get specific suggestions for fixing issues
- **Visual Scoring**: See overall compliance score and detailed breakdown
- **Category Filtering**: Filter results by severity and category

## 🔍 What It Checks

### Accessibility Tenets

- Color contrast ratios (WCAG compliance)
- Focus indicators for interactive elements
- Alt text planning for images
- Text size requirements
- Touch target sizing

### Usability Tenets

- Clear navigation structure
- Recognizable interactive elements
- Form clarity and labeling
- Button recognition patterns

### Visual Hierarchy

- Typography hierarchy consistency
- Visual weight distribution
- Information prioritization

### Consistency

- Component usage patterns
- Spacing system adherence
- Navigation consistency

### Common UI Traps

- Low contrast text detection
- Fake button identification
- Hidden critical actions
- Overcrowded interfaces
- Inconsistent navigation patterns

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- Figma desktop app
- Basic understanding of Figma plugin development

### Installation

1. **Clone and setup the project:**

   ```bash
   cd /path/to/your/figma-plugins
   git clone <repository-url> ui-tenets-analyzer
   cd ui-tenets-analyzer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the plugin:**
   ```bash
   npm run build
   ```

### Development

1. **Start development mode:**

   ```bash
   npm run dev
   ```

2. **In Figma:**

   - Open Figma desktop app
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file from this project
   - The plugin will appear in your plugins list

3. **Testing:**
   - Create a wireframe or design in Figma
   - Run the plugin from `Plugins` → `Development` → `UI Tenets & Traps Analyzer`
   - Select elements or analyze the entire page

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for publishing to the Figma Community.

## 🎨 How to Use

1. **Open the Plugin**:

   - In Figma, go to `Plugins` → `UI Tenets & Traps Analyzer`

2. **Choose Analysis Scope**:

   - **Analyze Selection**: Check only selected elements
   - **Analyze Page**: Check all elements on the current page

3. **Review Results**:

   - See overall compliance score
   - Browse detailed issues by category
   - Follow specific recommendations for each issue

4. **Fix Issues**:
   - Use the provided recommendations
   - Re-run analysis to verify fixes
   - Iterate until achieving desired compliance score

## 🔧 Customization

### Adding New Tenets

1. **Define the Tenet**: Add to `src/data/UITenetsData.ts`

   ```typescript
   {
     id: 'your-tenet-id',
     title: 'Your Tenet Title',
     description: 'Description of what to check',
     category: TENET_CATEGORIES[0], // Choose appropriate category
     type: 'tenet', // or 'trap'
     severity: 'error', // or 'warning' or 'info'
     checkFunction: 'checkYourTenet',
     recommendations: ['Recommendation 1', 'Recommendation 2']
   }
   ```

2. **Implement the Checker**: Add to `src/analyzer/TenetCheckers.ts`

   ```typescript
   private checkYourTenet(context: NodeContext): CheckResult {
     // Your checking logic here
     return {
       passed: true, // or false
       applicable: true, // or false
       severity: 'error',
       message: 'Issue description',
       recommendations: ['Fix suggestion']
     };
   }
   ```

3. **Register the Checker**: Add to the `initializeCheckers()` method
   ```typescript
   this.checkers.set("checkYourTenet", this.checkYourTenet.bind(this));
   ```

### Modifying Categories

Edit the `TENET_CATEGORIES` array in `src/data/UITenetsData.ts` to add or modify categories.

## 📁 Project Structure

```
ui-tenets-analyzer/
├── src/
│   ├── analyzer/
│   │   ├── TenetAnalyzer.ts      # Main analysis engine
│   │   └── TenetCheckers.ts      # Individual check implementations
│   ├── data/
│   │   └── UITenetsData.ts       # Tenets and traps definitions
│   ├── types/
│   │   └── AnalysisTypes.ts      # TypeScript interfaces
│   ├── code.ts                   # Main plugin code (Figma sandbox)
│   ├── ui.ts                     # UI controller code
│   └── ui.html                   # Plugin interface
├── dist/                         # Built files
├── manifest.json                 # Figma plugin manifest
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

1. **Plugin won't load**:

   - Ensure you've run `npm run build`
   - Check that `manifest.json` is in the root directory
   - Verify Figma desktop app is up to date

2. **TypeScript errors**:

   - Run `npm install` to ensure all dependencies are installed
   - Check that `@figma/plugin-typings` is installed

3. **Analysis not working**:
   - Ensure elements are properly named (the analyzer relies on naming conventions)
   - Check console for error messages
   - Verify the selection contains analyzable elements

### Development Tips

- Use meaningful layer names in Figma (e.g., "Submit Button", "Navigation Menu")
- Test with various wireframe styles and components
- Add console logs in checker functions for debugging
- Use Figma's developer console to debug plugin issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-tenet`
3. Add your tenet or improvement
4. Test thoroughly with various designs
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Based on UI design best practices from industry standards
- Inspired by accessibility guidelines (WCAG)
- Built for the Figma developer community

## 📞 Support

If you encounter issues or have suggestions:

1. Check the troubleshooting section above
2. Open an issue in the repository
3. Provide detailed steps to reproduce any problems

---

Happy designing! 🎨✨
