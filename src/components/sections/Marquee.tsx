const items = ["Plastik Saksı","Bahçe","Depolama","Sepet","Sandık","B2B","İhracat","1968","Türkiye","200+ Model","20+ Ülke","İstanbul OSB"];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden relative" style={{ background: "var(--orange)", paddingBlock: 12 }}>
      <div className="marquee-track select-none">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-5 pr-5"
            style={{ fontFamily: "var(--display)", fontSize: "clamp(11px,1.4vw,15px)", color: "#fff", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            {item}
            <span style={{ opacity: 0.35, fontSize: 8 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
