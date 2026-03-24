const fs = require("fs");
const path = require("path");
const { classifyFile } = require("./fileClassifier");

const IGNORE_DIRS = new Set([
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".vscode",
]);

const LANGUAGE_MAP = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".json": "json",
    ".md": "markdown",
    ".py": "python",
    ".java": "java",
    ".cpp": "cpp",
};

function shouldIgnore(filePath) {
    const parts = filePath.split(path.sep);
    return parts.some((part) => IGNORE_DIRS.has(part));
}

function detectLanguage(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return LANGUAGE_MAP[ext] || "unknown";
}

function countLines(fullPath) {
    try {
        const content = fs.readFileSync(fullPath, "utf-8");
        return content.split("\n").length;
    } catch {
        return 0;
    }
}

function scanDirectory(rootDir, currentDir = rootDir, results = []) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(currentDir, item.name);

        if (shouldIgnore(fullPath)) continue;

        if (item.isDirectory()) {
            scanDirectory(rootDir, fullPath, results);
        } else {
            const language = detectLanguage(item.name);
            if (language === "unknown") continue;

            const stats = fs.statSync(fullPath);
            const relPath = path.relative(rootDir, fullPath);

            results.push({
                path: relPath,
                language,
                sizeBytes: stats.size,
                lineCount: countLines(fullPath),
                category: classifyFile(relPath),
            });
        }
    }

    return results;
}

function buildSummary(files) {
    const languages = {};
    const categories = {};

    for (const file of files) {
        languages[file.language] = (languages[file.language] || 0) + 1;
        categories[file.category] = (categories[file.category] || 0) + 1;
    }

    let topLanguage = "unknown";
    let maxLangCount = 0;

    for (const lang in languages) {
        if (languages[lang] > maxLangCount) {
            maxLangCount = languages[lang];
            topLanguage = lang;
        }
    }

    const importantFiles = files
        .filter((file) => file.category === "important")
        .slice(0, 5)
        .map((file) => file.path);

    const routeFiles = files
        .filter((file) => file.category === "routes")
        .slice(0, 3)
        .map((file) => file.path);

    const modelFiles = files
        .filter((file) => file.category === "model")
        .slice(0, 3)
        .map((file) => file.path);

    const summaryParts = [
        `Repository has ${files.length} supported files.`,
        `Primary language seems to be ${topLanguage}.`,
        `Important files: ${importantFiles.length ? importantFiles.join(", ") : "none"}.`,
        `Routes: ${routeFiles.length ? routeFiles.join(", ") : "none"}.`,
        `Models: ${modelFiles.length ? modelFiles.join(", ") : "none"}.`,
    ];

    return {
        totalFiles: files.length,
        languages,
        categories,
        summary: summaryParts.join(" "),
    };
}

function scanRepo(repoPath) {
    const normalizedPath = path.resolve(repoPath);

    if (!fs.existsSync(normalizedPath)) {
        throw new Error("Invalid repo path");
    }

    const stats = fs.statSync(normalizedPath);
    if (!stats.isDirectory()) {
        throw new Error("Path is not a directory");
    }

    const files = scanDirectory(normalizedPath);
    const meta = buildSummary(files);

    return {
        repoPath: normalizedPath,
        name: path.basename(normalizedPath),
        ...meta,
        files,
    };
}

module.exports = { scanRepo };