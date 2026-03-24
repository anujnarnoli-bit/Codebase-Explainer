import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/repos";

function App() {
    const [repoPath, setRepoPath] = useState("");
    const [repos, setRepos] = useState([]);
    const [selectedRepoId, setSelectedRepoId] = useState("");
    const [question, setQuestion] = useState("");
    const [askResults, setAskResults] = useState([]);
    const [scanLoading, setScanLoading] = useState(false);
    const [askLoading, setAskLoading] = useState(false);

    const fetchRepos = async () => {
        try {
            const res = await axios.get(API_BASE);
            setRepos(res.data);

            if (res.data.length > 0 && !selectedRepoId) {
                setSelectedRepoId(res.data[0]._id);
            }
        } catch (error) {
            console.error("Failed to fetch repos:", error);
        }
    };

    const handleScan = async () => {
        if (!repoPath.trim()) {
            alert("Please enter a repo path");
            return;
        }

        try {
            setScanLoading(true);
            await axios.post(`${API_BASE}/scan`, { repoPath });
            setRepoPath("");
            await fetchRepos();
        } catch (error) {
            alert(error.response?.data?.error || "Scan failed");
        } finally {
            setScanLoading(false);
        }
    };

    const handleAsk = async () => {
        if (!selectedRepoId || !question.trim()) {
            alert("Select a repo and enter a question");
            return;
        }

        try {
            setAskLoading(true);
            const res = await axios.post(`${API_BASE}/ask`, {
                repoId: selectedRepoId,
                question,
            });
            setAskResults(res.data.results || []);
        } catch (error) {
            alert(error.response?.data?.error || "Ask failed");
        } finally {
            setAskLoading(false);
        }
    };

    useEffect(() => {
        fetchRepos();
    }, []);

    return (
        <div className="page">
            <div className="container">
                <header className="hero">
                    <h1>Codebase Explainer</h1>
                    <p>Scan a project folder and ask basic questions about the codebase.</p>
                </header>

                <section className="card">
                    <h2>Scan Repository</h2>
                    <div className="row">
                        <input
                            type="text"
                            placeholder="Enter absolute repo path"
                            value={repoPath}
                            onChange={(e) => setRepoPath(e.target.value)}
                        />
                        <button onClick={handleScan} disabled={scanLoading}>
                            {scanLoading ? "Scanning..." : "Scan Repo"}
                        </button>
                    </div>
                </section>

                <section className="card">
                    <h2>Saved Repositories</h2>
                    <select
                        value={selectedRepoId}
                        onChange={(e) => setSelectedRepoId(e.target.value)}
                    >
                        <option value="">Select a repo</option>
                        {repos.map((repo) => (
                            <option key={repo._id} value={repo._id}>
                                {repo.name}
                            </option>
                        ))}
                    </select>

                    <div className="repo-grid">
                        {repos.map((repo) => (
                            <div className="repo-card" key={repo._id}>
                                <h3>{repo.name}</h3>
                                <p className="muted">{repo.summary}</p>
                                <p>
                                    <strong>Total files:</strong> {repo.totalFiles}
                                </p>
                                <p>
                                    <strong>Path:</strong> {repo.repoPath}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="card">
                    <h2>Ask About a Repo</h2>
                    <div className="row">
                        <input
                            type="text"
                            placeholder="e.g. where are routes defined"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <button onClick={handleAsk} disabled={askLoading}>
                            {askLoading ? "Searching..." : "Ask"}
                        </button>
                    </div>

                    <div className="results">
                        {askResults.length === 0 ? (
                            <p className="muted">No results yet.</p>
                        ) : (
                            askResults.map((file, index) => (
                                <div className="result-card" key={index}>
                                    <p>
                                        <strong>Path:</strong> {file.path}
                                    </p>
                                    <p>
                                        <strong>Category:</strong> {file.category}
                                    </p>
                                    <p>
                                        <strong>Language:</strong> {file.language}
                                    </p>
                                    <p>
                                        <strong>Functions:</strong>{" "}
                                        {file.functions?.length ? file.functions.join(", ") : "none"}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default App;