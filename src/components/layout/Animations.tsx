"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    // ── Scroll Reveal ──────────────────────────────
    const revealAll = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          el.classList.add("visible");
        }
      });
    };
    // İlk render için hemen çalıştır
    revealAll();
    window.addEventListener("scroll", revealAll, { passive: true });

    // ── Count-up ──────────────────────────────────
    document.querySelectorAll<HTMLElement>("[data-count]").forEach(el => {
      const target = parseInt(el.dataset.count!);
      const suffix = el.dataset.suffix || "";
      el.textContent = "0" + suffix;
      const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const dur = 1500;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.4 });
      obs.observe(el);
    });

    // ── Hero Parallax (scroll) ─────────────────────
    const heroBg  = document.querySelector<HTMLElement>(".js-hero-bg");
    const heroPrd = document.querySelector<HTMLElement>(".js-hero-product");

    const onScroll = () => {
      const sy = window.scrollY;
      if (heroBg)  heroBg.style.transform  = `scale(1.06) translateY(${sy * 0.06}px)`;
      if (heroPrd) heroPrd.style.transform = `translateY(${sy * 0.12}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Mouse parallax on hero ─────────────────────
    const onMouse = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 0.5) return;
      const x = (e.clientX / window.innerWidth  - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      if (heroBg)  heroBg.style.transform  = `scale(1.06) translate(${x * 0.3}px, ${y * 0.3}px)`;
      if (heroPrd) heroPrd.style.transform = `translate(${x * 0.5}px, ${y * 0.4}px)`;
    };
    window.addEventListener("mousemove", onMouse);

    // ── Custom cursor ─────────────────────────────
    const dot  = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    const isFine = window.matchMedia("(pointer: fine)").matches;

    if (isFine && dot && ring) {
      let rx = 0, ry = 0;
      let mx = 0, my = 0;
      let rafId: number;

      const moveDot = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + "px";
        dot.style.top  = my + "px";
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      };

      const animateRing = () => {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + "px";
        ring.style.top  = ry + "px";
        rafId = requestAnimationFrame(animateRing);
      };
      rafId = requestAnimationFrame(animateRing);

      document.addEventListener("mousemove", moveDot);
      document.querySelectorAll("a, button").forEach(el => {
        el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
        el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
      });

      return () => {
        window.removeEventListener("scroll", revealAll);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("mousemove", onMouse);
        document.removeEventListener("mousemove", moveDot);
        cancelAnimationFrame(rafId);
      };
    }

    return () => {
      window.removeEventListener("scroll", revealAll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" style={{ opacity: 0 }} />
      <div className="cursor-ring" style={{ opacity: 0 }} />
    </>
  );
}
