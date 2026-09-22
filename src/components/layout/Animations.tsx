"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    // FOUC önleme: js-loaded class'ı html'e ekle
    document.documentElement.classList.add("js-loaded");

    // ── Scroll Reveal ─────────────────────────
    const reveal = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(el => {
        if (el.getBoundingClientRect().top < vh * 0.93) {
          el.classList.add("visible");
        }
      });
    };
    reveal(); // sayfa açılır açılmaz çalıştır
    window.addEventListener("scroll", reveal, { passive: true });

    // ── Count-up ──────────────────────────────
    document.querySelectorAll<HTMLElement>("[data-count]").forEach(el => {
      const target = parseInt(el.dataset.count!);
      const suffix = el.dataset.suffix || "";
      el.textContent = "0" + suffix;
      const obs = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const dur = 1400, t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.5 });
      obs.observe(el);
    });

    // ── Hero parallax ─────────────────────────
    const heroBg  = document.querySelector<HTMLElement>(".js-hero-bg");
    const heroPrd = document.querySelector<HTMLElement>(".js-hero-product");

    const onScroll = () => {
      const sy = window.scrollY;
      if (heroBg)  heroBg.style.transform  = `scale(1.06) translateY(${sy * 0.05}px)`;
      if (heroPrd) heroPrd.style.transform = `translateY(${sy * 0.1}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMouse = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 0.6) return;
      const x = (e.clientX / window.innerWidth  - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      if (heroBg)  heroBg.style.transform  = `scale(1.06) translate(${x * 0.25}px, ${y * 0.25}px)`;
      if (heroPrd) heroPrd.style.transform = `translate(${x * 0.45}px, ${y * 0.35}px)`;
    };
    window.addEventListener("mousemove", onMouse);

    // ── Custom cursor ─────────────────────────
    const dot  = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    const isFine = window.matchMedia("(pointer: fine)").matches;

    let rafId: number;
    if (isFine && dot && ring) {
      let rx = -100, ry = -100, mx = -100, my = -100;

      const onMoveCursor = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + "px";
        dot.style.top  = my + "px";
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      };
      const animRing = () => {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + "px";
        ring.style.top  = ry + "px";
        rafId = requestAnimationFrame(animRing);
      };
      rafId = requestAnimationFrame(animRing);
      document.addEventListener("mousemove", onMoveCursor);
      document.querySelectorAll("a, button").forEach(el => {
        el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
        el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
      });
    }

    return () => {
      document.documentElement.classList.remove("js-loaded");
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" style={{ opacity: 0 }} />
      <div className="cursor-ring" style={{ opacity: 0 }} />
    </>
  );
}
