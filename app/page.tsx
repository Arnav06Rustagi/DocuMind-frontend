"use client";

import { useState } from "react";

function Navbar() {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-indigo-400 tracking-tight">DocuMind</h1>
        <p className="text-xs text-slate-400">Automated Document Parsing & Knowledge System</p>
      </div>
    </header>
  );
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>("Not Classified");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    { question: string; answer: string; source: string }[]
  >([]);
  const [summaryBullets, setSummaryBullets] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      const category = data.doc_type || data.document_type || "General Document";
      setDocType(category);
      setSummaryBullets([]); // Clear old summary when a new document is uploaded
      alert(`File uploaded! Classified as: ${category}`);
    } catch (err) {
      alert("Failed to connect to backend server. Make sure FastAPI is running on port 8000.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!query.trim()) return;

    const formData = new FormData();
    formData.append("question", query);

    try {
      const res = await fetch(`${API_BASE_URL}/query`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setChatHistory([
        ...chatHistory,
        { question: query, answer: data.answer, source: data.source },
      ]);
      setQuery("");
    } catch (err) {
      alert("Error querying the backend.");
    }
  };

  const handleGenerateSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/summarize`, {
        method: "POST",
      });
      const data = await res.json();
      setSummaryBullets(data.bullets || []);
    } catch (err) {
      alert("Error generating summary.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <Navbar />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Card 1: Processing */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
            <h2 className="text-lg font-bold text-slate-100 mb-4">1. Document Processing</h2>
            <input
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400 mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 transition"
            />
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:bg-slate-800 disabled:text-slate-500 shadow-sm"
            >
              {isUploading ? "Processing Document..." : "Upload & Process"}
            </button>
          </div>

          {/* Card 2: Details */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
            <h2 className="text-lg font-bold text-slate-100 mb-3">2. Document Details</h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong className="text-slate-400">File Name:</strong> {file ? file.name : "None selected"}</p>
              <p><strong className="text-slate-400">Document Type:</strong> <span className="text-indigo-400 font-semibold">{docType}</span></p>
            </div>
          </div>

          {/* Card 3: Summary */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
            <h2 className="text-lg font-bold text-slate-100 mb-3">3. Document Summary</h2>
            <button
              onClick={handleGenerateSummary}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg text-sm mb-4 transition shadow-sm"
            >
              Generate Summary
            </button>

            {summaryBullets.length > 0 && (
              <div className="p-4 bg-slate-800/80 border border-emerald-500/30 text-slate-200 text-sm rounded-lg space-y-2">
                <h3 className="font-bold text-emerald-400 border-b border-emerald-500/20 pb-1 mb-2">
                  Key Takeaways:
                </h3>
                <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-slate-300">
                  {summaryBullets.map((bullet, idx) => (
                    <li key={idx} className="font-normal">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RAG Search */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg flex flex-col h-[600px]">
          <h2 className="text-lg font-bold text-slate-100 mb-4">4. Semantic Search & Q&A (RAG)</h2>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 border-b border-slate-800">
            {chatHistory.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-20">
                Ask a question about the uploaded document to query contents.
              </p>
            ) : (
              chatHistory.map((chat, idx) => (
                <div key={idx} className="space-y-2 text-sm">
                  <div className="bg-slate-800 text-indigo-300 p-3 rounded-lg font-medium border border-indigo-500/20">
                    Q: {chat.question}
                  </div>
                  <div className="bg-slate-950 text-slate-200 p-3 rounded-lg border border-slate-800 leading-relaxed">
                    <p>
                      <strong className="text-indigo-400">A: </strong>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: chat.answer.replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong className="text-slate-100 font-semibold">$1</strong>'
                          ),
                        }}
                      />
                    </p>
                    <span className="inline-block mt-2 text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                      Source: {chat.source}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your question here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border border-slate-700 text-slate-100 placeholder-slate-500 font-normal bg-slate-950 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              onClick={handleAskQuestion}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              Ask
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}