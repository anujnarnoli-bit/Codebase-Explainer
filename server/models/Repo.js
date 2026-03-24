const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    path: String,
    language: String,
    sizeBytes: Number,
    lineCount: Number,
    category: String,
});

const RepoSchema = new mongoose.Schema(
    {
        name: String,
        repoPath: { type: String, required: true },
        totalFiles: Number,
        languages: { type: Map, of: Number },
        categories: { type: Map, of: Number },
        summary: String,
        files: [FileSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Repo", RepoSchema);