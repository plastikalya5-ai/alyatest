const ITEMS = ["Plastik Saksı","Sepet","Sandık","B2B","İhracat","1968","Türkiye","200+ Model","20+ Ülke","İstanbul OSB","Yerli Üretim","ISO Sertifikalı"];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div style={{ background: "var(--orange)", paddingBlock: 13, overflow: "hidden" }}>
      <div className="marquee-inner select-none">
        {doubled.map((item, i) => (
          <span key={i} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            paddingRight: 16,
            fontFamily: "var(--font-head)",
            fontSize: "clamp(12px, 1.4vw, 15px)",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            {item}
            <span style={{ opacity: 0.4, fontSize: 7 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
