import { useState } from "react";

export function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generate(question, format, title) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, format, title }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "assignment"}.${format === "word" ? "docx" : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { generate, loading, error };
}