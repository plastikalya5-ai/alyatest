export default function Marquee() {
  const items = ["Plastik Saksı", "Depolama", "Sepet", "Sandık", "İhracat", "B2B", "1968'den Beri", "İstanbul OSB", "200+ Model", "20+ Ülke"];
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden relative" style={{ background: "var(--orange)", paddingBlock: 14 }}>
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 whitespace-nowrap"
            style={{ fontFamily: "var(--display)", fontSize: "clamp(13px,1.5vw,18px)", color: "var(--dark)", letterSpacing: "0.05em" }}>
            {item}
            <span style={{ color: "rgba(0,0,0,0.3)" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
