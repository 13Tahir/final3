"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [scanId, setScanId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState<"IDLE" | "RUNNING" | "COMPLETED">("IDLE");

  const startScan = async () => {
    if (!url) return;
    setStatus("RUNNING");
    setResults([]);
    setProgress(0);

    try {
      const response = await fetch("http://localhost:8080/api/scan/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.scan_id) {
        setScanId(data.scan_id);
      } else {
        alert(data.error || "Tarama başlatılamadı.");
        setStatus("IDLE");
      }
    } catch (error) {
      console.error(error);
      alert("Backend'e bağlanılamadı.");
      setStatus("IDLE");
    }
  };

  useEffect(() => {
    if (!scanId) return;

    const eventSource = new EventSource(`http://localhost:8080/api/scan/${scanId}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setResults(data.results);
      if (data.status === "COMPLETED") {
        setStatus("COMPLETED");
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [scanId]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            SecScan Final Projesi
          </h1>
          <p className="text-slate-400 text-lg">
            Hızlı, Güvenli ve Kapsamlı Güvenlik Taraması
          </p>
        </header>

        {/* Scan Input Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Hedef URL girin (örn: http://example.com)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={status === "RUNNING"}
            />
            <button
              onClick={startScan}
              disabled={status === "RUNNING" || !url}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              {status === "RUNNING" ? "Taranıyor..." : "Taramayı Başlat"}
            </button>
          </div>
        </div>

        {/* Progress Section */}
        {status !== "IDLE" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-semibold">Tarama İlerlemesi</h2>
              <span className="text-blue-400 font-mono">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
              <h2 className="font-bold">Tarama Logları</h2>
            </div>
            <div className="p-6 h-[400px] overflow-y-auto font-mono text-sm space-y-2">
              {results.map((log, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 ${log.includes("[!]") ? "text-red-400 bg-red-400/10 p-2 rounded" : "text-slate-300"}`}
                >
                  <span className="text-slate-600">[{i+1}]</span>
                  <span>{log}</span>
                </div>
              ))}
              {status === "RUNNING" && (
                <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                  <span>&gt;</span>
                  <span>Analiz devam ediyor...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
