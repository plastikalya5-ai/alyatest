"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    document.documentElement.classList.add("js-ready");

    const reveal = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(el => {
        if (el.getBoundingClientRect().top < vh * 0.93) el.classList.add("visible");
      });
    };
    reveal();
    window.addEventListener("scroll", reveal, { passive: true });

    // Count-up
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

    // Parallax
    const bg  = document.querySelector<HTMLElement>(".js-hero-bg");
    const prd = document.querySelector<HTMLElement>(".js-hero-product");
    const onScroll = () => {
      const sy = window.scrollY;
      if (bg)  bg.style.transform  = `scale(1.06) translateY(${sy * 0.05}px)`;
      if (prd) prd.style.transform = `translateY(${sy * 0.1}px)`;
    };
    const onMouse = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 0.6) return;
      const x = (e.clientX / window.innerWidth  - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      if (bg)  bg.style.transform  = `scale(1.06) translate(${x*.25}px,${y*.25}px)`;
      if (prd) prd.style.transform = `translate(${x*.45}px,${y*.35}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse);

    // Cursor
    const dot  = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    let rafId: number;
    if (window.matchMedia("(pointer: fine)").matches && dot && ring) {
      let rx = -999, ry = -999, mx = -999, my = -999;
      const mv = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + "px"; dot.style.top = my + "px";
        dot.style.opacity = "1"; ring.style.opacity = "1";
      };
      const anim = () => {
        rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
        ring.style.left = rx + "px"; ring.style.top = ry + "px";
        rafId = requestAnimationFrame(anim);
      };
      rafId = requestAnimationFrame(anim);
      document.addEventListener("mousemove", mv);
      document.querySelectorAll("a,button").forEach(el => {
        el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
        el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
      });
    }

    return () => {
      document.documentElement.classList.remove("js-ready");
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot opacity-0" />
      <div className="cursor-ring opacity-0" />
    </>
  );
}
