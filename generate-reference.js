const fs = require("fs");
const path = require("path");

// Read the TypeScript data file
const dataPath = path.join(__dirname, "src/data/UITenetsData.ts");
const dataContent = fs.readFileSync(dataPath, "utf8");

// Extract categories
const categoriesMatch = dataContent.match(
  /export const TENET_CATEGORIES: TenetCategory\[\] = \[([\s\S]*?)\];/
);
if (!categoriesMatch) {
  console.error("Could not find TENET_CATEGORIES");
  process.exit(1);
}

// Parse categories (simple regex parsing - could be improved)
const categoriesStr = categoriesMatch[1];
const categories = [];
const categoryMatches = categoriesStr.match(/\{[\s\S]*?\}/g);

categoryMatches?.forEach((match, index) => {
  const idMatch = match.match(/id: ["']([^"']+)["']/);
  const nameMatch = match.match(/name: ["']([^"']+)["']/);
  const descMatch = match.match(/description: ["']([^"']+)["']/);
  const colorMatch = match.match(/color: ["']([^"']+)["']/);

  if (idMatch && nameMatch && descMatch && colorMatch) {
    // Add icons for each category
    const icons = ["♿", "👆", "📐", "🔄", "💬", "📏", "🎯"];
    categories.push({
      id: idMatch[1],
      name: nameMatch[1],
      description: descMatch[1],
      color: colorMatch[1],
      icon: icons[index] || "📋",
    });
  }
});

// Extract tenets and traps
const tenetsMatch = dataContent.match(
  /export const UI_TENETS: Tenet\[\] = \[([\s\S]*?)\];/
);
const trapsMatch = dataContent.match(
  /export const UI_TRAPS: Tenet\[\] = \[([\s\S]*?)\];/
);

let allTenets = [];

function parseTenets(content, type) {
  const tenets = [];
  const tenetMatches = content.match(/\{[\s\S]*?\},?\s*(?=\{|$)/g);

  tenetMatches?.forEach((match) => {
    const idMatch = match.match(/id: ["']([^"']+)["']/);
    const titleMatch = match.match(/title: ["']([^"']+)["']/);
    const descMatch = match.match(/description:\s*["']([^"']+)["']/);
    const categoryMatch = match.match(/category: TENET_CATEGORIES\[(\d+)\]/);
    const severityMatch = match.match(/severity: ["']([^"']+)["']/);

    // Extract examples array
    const examplesMatch = match.match(/examples: \[([\s\S]*?)\]/);
    let examples = [];
    if (examplesMatch) {
      const exampleItems = examplesMatch[1].match(/["']([^"']+)["']/g);
      examples = exampleItems?.map((item) => item.slice(1, -1)) || [];
    }

    // Extract recommendations array
    const recommendationsMatch = match.match(/recommendations: \[([\s\S]*?)\]/);
    let recommendations = [];
    if (recommendationsMatch) {
      const recItems = recommendationsMatch[1].match(/["']([^"']+)["']/g);
      recommendations = recItems?.map((item) => item.slice(1, -1)) || [];
    }

    if (idMatch && titleMatch && descMatch && categoryMatch && severityMatch) {
      const categoryIndex = parseInt(categoryMatch[1]);
      tenets.push({
        id: idMatch[1],
        title: titleMatch[1],
        description: descMatch[1],
        category: categories[categoryIndex],
        type: type,
        severity: severityMatch[1],
        examples: examples,
        recommendations: recommendations,
      });
    }
  });

  return tenets;
}

if (tenetsMatch) {
  allTenets = allTenets.concat(parseTenets(tenetsMatch[1], "tenet"));
}

if (trapsMatch) {
  allTenets = allTenets.concat(parseTenets(trapsMatch[1], "trap"));
}

// Generate JavaScript data
const jsData = `
// Auto-generated from UITenetsData.ts
const TENET_CATEGORIES = ${JSON.stringify(categories, null, 2)};
const ALL_TENETS = ${JSON.stringify(allTenets, null, 2)};
`;

// Read the HTML file and replace the placeholder data
const htmlPath = path.join(__dirname, "tenets-reference.html");
let htmlContent = fs.readFileSync(htmlPath, "utf8");

// Replace the JavaScript data section using the correct markers
const scriptStartMarker = "// TENETS_SCRIPT_START";
const scriptEndMarker = "// TENETS_SCRIPT_END";

const startIndex = htmlContent.indexOf(scriptStartMarker);
const endIndex = htmlContent.indexOf(scriptEndMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newDataSection = `// TENETS_SCRIPT_START
        const ALL_TENETS = ${JSON.stringify(allTenets, null, 2)};
        // TENETS_SCRIPT_END`;

  htmlContent =
    htmlContent.substring(0, startIndex) +
    newDataSection +
    htmlContent.substring(endIndex + scriptEndMarker.length);

  fs.writeFileSync(htmlPath, htmlContent);
  console.log(
    `✅ Successfully updated tenets-reference.html with ${allTenets.length} tenets and traps`
  );
  console.log(`📊 Categories: ${categories.length}`);
  console.log(
    `📋 Tenets: ${allTenets.filter((t) => t.type === "tenet").length}`
  );
  console.log(
    `⚠️  Traps: ${allTenets.filter((t) => t.type === "trap").length}`
  );
} else {
  console.error("Could not find script markers in HTML file");
  console.log("Looking for:", scriptStartMarker, "and", scriptEndMarker);
}
