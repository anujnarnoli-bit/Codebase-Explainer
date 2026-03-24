const express = require("express");
const Repo = require("../models/Repo");
const { scanRepo } = require("../services/scanner");

const router = express.Router();

router.post("/scan", async (req, res) => {
    try {
        const { repoPath } = req.body;

        if (!repoPath) {
            return res.status(400).json({ error: "repoPath is required" });
        }

        const scanned = scanRepo(repoPath);

        const repo = await Repo.create(scanned);

        res.json(repo);
    } catch (error) {
        console.error("SCAN ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const repos = await Repo.find().sort({ createdAt: -1 });
        res.json(repos);
    } catch (error) {
        console.error("GET REPOS ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/ask", async (req, res) => {
    try {
        const { repoId, question } = req.body;

        if (!repoId || !question) {
            return res.status(400).json({ error: "repoId and question are required" });
        }

        const repo = await Repo.findById(repoId);

        if (!repo) {
            return res.status(404).json({ error: "Repo not found" });
        }

        const q = question.toLowerCase();
        const words = q.split(" ").filter(Boolean);

        let matchedFiles = repo.files.filter((file) => {
            const text = `${file.path} ${file.category}`.toLowerCase();
            return words.some((word) => text.includes(word));
        });

        res.json({
            question,
            results: matchedFiles.slice(0, 10),
        });
    } catch (error) {
        console.error("ASK ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;