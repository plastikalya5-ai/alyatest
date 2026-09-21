export default function Footer() {
  return (
    <footer style={{ background: "#161a17", color: "var(--light)" }}>
      {/* Ending word */}
      <div
        className="text-center pointer-events-none overflow-hidden"
        style={{
          fontFamily: "Impact, Arial Narrow, sans-serif",
          fontSize: "clamp(120px,25vw,320px)",
          lineHeight: 0.85,
          letterSpacing: "-0.05em",
          color: "#e0e4d6",
          padding: "60px 0 0",
        }}
      >
        ALYA
      </div>

      <div
        className="flex justify-between items-center gap-8 text-xs border-t border-white/10"
        style={{ paddingInline: "var(--pad)", paddingBlock: "25px 40px" }}
      >
        <span style={{ color: "var(--muted)", letterSpacing: "0.05em" }}>
          © {new Date().getFullYear()} ALYA PLASTİK SAN. TİC. LTD. ŞTİ. — TÜM HAKLARI SAKLIDIR
        </span>
        <div className="flex gap-6" style={{ color: "var(--muted)" }}>
          <a href="#" className="hover:text-white transition-colors">KVKK</a>
          <a href="#" className="hover:text-white transition-colors">GİZLİLİK</a>
        </div>
      </div>
    </footer>
  );
}
