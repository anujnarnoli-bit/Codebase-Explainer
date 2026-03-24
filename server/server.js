require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const repoRoutes = require("./routes/repoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/repos", repoRoutes);

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const port = process.env.PORT || 5000;
        const server = app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });

        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.error(`Port ${port} is already in use. Please stop the process using that port or set a different PORT in .env.`);
                process.exit(1);
            }
            console.error("Server error:", err);
            process.exit(1);
        });
    } catch (err) {
        console.error("DB connection error:", err.message);
        process.exit(1);
    }
}

startServer();