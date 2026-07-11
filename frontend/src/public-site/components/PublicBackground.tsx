// Fixed, non-interactive animated background for the public site.
// CSS-only (see index.css keyframes); respects prefers-reduced-motion.

export function PublicBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="fi-blob fi-blob-a"
        style={{ top: "-8%", left: "-6%", width: "42vw", height: "42vw", background: "radial-gradient(circle at 30% 30%, #f0abcc, #d8a0ff)" }}
      />
      <div
        className="fi-blob fi-blob-b"
        style={{ top: "20%", right: "-10%", width: "38vw", height: "38vw", background: "radial-gradient(circle at 30% 30%, #a5c9ff, #93e0d0)" }}
      />
      <div
        className="fi-blob fi-blob-c"
        style={{ bottom: "-12%", left: "25%", width: "36vw", height: "36vw", background: "radial-gradient(circle at 30% 30%, #ffd7a1, #ffb3c6)" }}
      />
      {/* Soft veil so foreground content stays legible in both themes. */}
      <div className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-[2px]" />
    </div>
  )
}
