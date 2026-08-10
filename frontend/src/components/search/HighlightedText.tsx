interface HighlightedTextProps {
  text: string;
  query: string | undefined;
}

/** Wraps every case-insensitive match of `query` inside `text` in a highlighted <mark>. */
export function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query || !query.trim()) {
    return <>{text}</>;
  }

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i} className="rounded bg-brand/30 text-foreground">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}