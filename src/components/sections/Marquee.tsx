const items = ["Plastik Saksı","Sepet","Sandık","B2B","İhracat","1968","Türkiye","200+ Model","20+ Ülke","OSB İstanbul","Yerli Üretim"];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden" style={{ background: "var(--orange)", paddingBlock: 11 }}>
      <div className="marquee-inner select-none">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 pr-4"
            style={{ fontFamily: "var(--head)", fontSize: "clamp(11px,1.3vw,14px)", fontWeight: 700, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {item}<span style={{ opacity: 0.35 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
