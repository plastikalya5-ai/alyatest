"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    // ── Scroll reveal ──────────────────────────────────────────
    const targets = document.querySelectorAll<HTMLElement>(".reveal-up, .reveal-fade, .clip-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(el => io.observe(el));

    // ── Smooth scroll (no lib) ─────────────────────────────────
    let lenisRaf: number;
    let currentY = window.scrollY;
    let targetY  = window.scrollY;
    const ease   = 0.092;
    let ticking  = false;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetY = Math.max(0, Math.min(document.body.scrollHeight - window.innerHeight, targetY + e.deltaY * 1.1));
      if (!ticking) {
        ticking = true;
        const tick = () => {
          currentY += (targetY - currentY) * ease;
          if (Math.abs(targetY - currentY) < 0.5) { currentY = targetY; ticking = false; }
          window.scrollTo(0, currentY);
          if (ticking) lenisRaf = requestAnimationFrame(tick);
        };
        lenisRaf = requestAnimationFrame(tick);
      }
    };

    // Only desktop smooth scroll (touch devices handle own momentum)
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (!isMobile) window.addEventListener("wheel", onWheel, { passive: false });

    // ── Hero product parallax ──────────────────────────────────
    const heroProduct = document.querySelector<HTMLElement>(".hero-product");
    const heroBg      = document.querySelector<HTMLElement>(".hero-bg");

    const onScroll = () => {
      const sy = window.scrollY;
      if (heroProduct) heroProduct.style.transform = `rotate(-6deg) translateY(${sy * 0.18}px)`;
      if (heroBg)      heroBg.style.transform      = `scale(1.08) translateY(${sy * 0.08}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Mouse parallax on hero ────────────────────────────────
    const heroSection = document.querySelector<HTMLElement>("#hero");
    const onMouseMove = (e: MouseEvent) => {
      if (!heroSection) return;
      const rect  = heroSection.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      if (heroBg) heroBg.style.transform = `scale(1.08) translate(${x * 0.4}px, ${y * 0.4}px)`;
      if (heroProduct) {
        heroProduct.style.transform = `rotate(-6deg) translate(${x * 0.6}px, ${y * 0.5}px)`;
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Cursor ────────────────────────────────────────────────
    const cursor = document.querySelector<HTMLElement>(".custom-cursor");
    if (cursor) {
      let cx = 0, cy = 0;
      const onCursorMove = (e: MouseEvent) => {
        cx = e.clientX; cy = e.clientY;
        cursor.style.left = cx + "px";
        cursor.style.top  = cy + "px";
        cursor.style.opacity = "1";
      };
      document.addEventListener("mousemove", onCursorMove);
      document.querySelectorAll("a, button").forEach(el => {
        el.addEventListener("mouseenter", () => cursor.classList.add("big"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("big"));
      });
    }

    // ── Count-up via IntersectionObserver ────────────────────
    document.querySelectorAll<HTMLElement>("[data-count]").forEach(el => {
      const target = parseInt(el.dataset.count!);
      const suffix = el.dataset.suffix || "";
      el.textContent = "0" + suffix;
      const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const dur = 1600;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
          el.textContent = v + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.5 });
      obs.observe(el);
    });

    return () => {
      io.disconnect();
      cancelAnimationFrame(lenisRaf);
      if (!isMobile) window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <div className="custom-cursor" style={{ opacity: 0 }} />;
}
