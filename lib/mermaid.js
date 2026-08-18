export function extractMermaidDiagrams(content) {
  const diagrams = [];
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    diagrams.push({
      code: match[1].trim(),
      fullMatch: match[0],
    });
  }
  return diagrams;
}

export function getMermaidImageUrl(mermaidCode) {
  const encoded = Buffer.from(mermaidCode).toString("base64url");
  return `https://mermaid.ink/img/${encoded}?type=png`;
}

export async function fetchMermaidImage(mermaidCode) {
  try {
    const url = getMermaidImageUrl(mermaidCode);
    console.log("Fetching mermaid diagram:", url);
    const res = await fetch(url, {
      headers: { "Accept": "image/png" }
    });
    if (!res.ok) {
      console.error("Mermaid fetch failed:", res.status, await res.text());
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Mermaid fetch error:", error);
    return null;
  }
}