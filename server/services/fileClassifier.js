const path = require("path");

const IMPORTANT_FILES = new Set([
    "package.json",
    "readme.md",
    "server.js",
    "app.js",
    ".env",
    "index.js",
]);

function classifyFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    const normalized = filePath.toLowerCase();

    if (IMPORTANT_FILES.has(fileName)) return "important";
    if (normalized.includes("routes") || normalized.includes("route")) return "routes";
    if (normalized.includes("controller")) return "controller";
    if (normalized.includes("model")) return "model";
    if (normalized.includes("service")) return "service";
    if (normalized.includes("config")) return "config";

    return "general";
}

module.exports = { classifyFile };