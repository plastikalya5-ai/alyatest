const ITEMS = ["Plastik Saksı","Sepet","Sandık","B2B","İhracat","1968","Türkiye","200+ Model","20+ Ülke","İstanbul OSB","Yerli Üretim","ISO Sertifikalı"];

export default function Marquee() {
  return (
    <div className="overflow-hidden bg-[#e55f28] py-[13px]">
      <div className="marquee-inner select-none">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 pr-4 whitespace-nowrap"
            style={{ fontFamily: "'Barlow Condensed', Arial Narrow, Arial, sans-serif", fontSize: "clamp(12px,1.4vw,15px)", fontWeight: 700, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {item}<span className="opacity-40 text-[7px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
