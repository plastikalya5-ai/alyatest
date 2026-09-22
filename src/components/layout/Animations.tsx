"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    let lenis: import("@studio-freight/lenis").default | null = null;

    (async () => {
      const gsap = (await import("gsap")).gsap;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText }     = await import("gsap/SplitText");
      const { default: Lenis } = await import("@studio-freight/lenis");

      gsap.registerPlugin(ScrollTrigger, SplitText);

      // ── 1. LENIS SMOOTH SCROLL ───────────────────────────────
      lenis = new Lenis({ lerp: 0.07, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis!.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);

      // ── 2. SCROLL PROGRESS BAR ───────────────────────────────
      const progressBar = document.querySelector<HTMLElement>(".scroll-progress");
      if (progressBar) {
        gsap.to(progressBar, {
          height: "100%",
          ease: "none",
          scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0 },
        });
      }

      // ── 3. SECTION PROGRESS DOTS ────────────────────────────
      const sections = document.querySelectorAll<HTMLElement>("section[id]");
      const dots = document.querySelectorAll<HTMLElement>(".progress-dot");
      sections.forEach((sec, i) => {
        ScrollTrigger.create({
          trigger: sec,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => { dots.forEach((d, j) => d.classList.toggle("active", j === i)); },
          onEnterBack: () => { dots.forEach((d, j) => d.classList.toggle("active", j === i)); },
        });
      });

      // ── 4. HERO ANIMATIONS ──────────────────────────────────
      const heroLines = document.querySelectorAll<HTMLElement>(".anim-hero-line");
      if (heroLines.length) {
        gsap.fromTo(heroLines,
          { yPercent: 120, skewY: 5 },
          { yPercent: 0, skewY: 0, duration: 1.2, ease: "expo.out", stagger: 0.12, delay: 0.15 }
        );
      }
      gsap.fromTo(".anim-hero-sub",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.09, delay: 0.8 }
      );

      // ── 5. SLOT MACHINE NUMBERS ─────────────────────────────
      // rAF ile DOM ready bekle
      await new Promise(r => setTimeout(r, 100));
      document.querySelectorAll<HTMLElement>(".slot-ticker").forEach((ticker) => {
        const target = parseInt(ticker.dataset.target || "0");
        const suffix = ticker.dataset.suffix || "";
        const inner  = ticker.querySelector<HTMLElement>(".slot-ticker-inner");
        if (!inner) return;
        const digits = [];
        for (let i = 0; i <= target; i++) digits.push(i);
        inner.innerHTML = digits.map(d => `<span style="display:block;line-height:1">${d}${suffix}</span>`).join("");
        inner.style.transform = "translateY(0)";
        // Başlangıçta sadece ilk elementi göster
        const itemH = parseInt(getComputedStyle(ticker).height) || 60;
        ScrollTrigger.create({
          trigger: ticker,
          start: "top 85%",
          once: true,
          onEnter: () => {
            const totalH = itemH * (digits.length - 1);
            gsap.to(inner, { y: -totalH, duration: 1.8, ease: "expo.out", delay: 0.1 });
          },
        });
      });

      // ── 6. TEXT SCRAMBLE ────────────────────────────────────
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";
      document.querySelectorAll<HTMLElement>(".scramble").forEach((el) => {
        const original = el.textContent || "";
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            let frame = 0;
            const total = 20;
            const id = setInterval(() => {
              el.textContent = original.split("").map((ch, i) =>
                i < Math.floor((frame / total) * original.length) || ch === " "
                  ? ch
                  : chars[Math.floor(Math.random() * chars.length)]
              ).join("");
              frame++;
              if (frame > total) { el.textContent = original; clearInterval(id); }
            }, 40);
          },
        });
      });

      // ── 7. SPLIT TEXT HEADINGS ──────────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-split-heading").forEach((el) => {
        const split = new SplitText(el, { type: "chars,words" });
        gsap.fromTo(split.chars,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.022,
            scrollTrigger: { trigger: el, start: "top 88%", once: true } }
        );
      });

      // ── 8. CLIP REVEAL (images) ──────────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-clip").forEach((el) => {
        gsap.fromTo(el,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "expo.inOut",
            scrollTrigger: { trigger: el, start: "top 85%", once: true } }
        );
      });

      // ── 9. FADE UP ───────────────────────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-up").forEach((el) => {
        const delay = parseFloat(el.dataset.delay || "0");
        gsap.fromTo(el, { opacity: 0, y: 44 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay,
            scrollTrigger: { trigger: el, start: "top 90%", once: true } }
        );
      });

      // ── 10. STAGGER CARDS ────────────────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-stagger-parent").forEach((parent) => {
        const kids = parent.querySelectorAll<HTMLElement>(".anim-stagger-child");
        gsap.fromTo(kids,
          { opacity: 0, y: 40, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power3.out", stagger: 0.07,
            scrollTrigger: { trigger: parent, start: "top 85%", once: true } }
        );
      });

      // ── 11. LIST ITEMS ───────────────────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-list").forEach((list) => {
        const items = list.querySelectorAll<HTMLElement>(".anim-list-item");
        gsap.fromTo(items, { opacity: 0, x: -28 },
          { opacity: 1, x: 0, duration: 0.65, ease: "power2.out", stagger: 0.065,
            scrollTrigger: { trigger: list, start: "top 85%", once: true } }
        );
      });

      // ── 12. IMAGE CLIP + SCALE REVEAL ────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-img-reveal").forEach((wrap) => {
        const img = wrap.querySelector("img");
        gsap.fromTo(wrap, { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "expo.inOut",
            scrollTrigger: { trigger: wrap, start: "top 85%", once: true } }
        );
        if (img) gsap.fromTo(img, { scale: 1.18 },
          { scale: 1, duration: 1.2, ease: "expo.inOut",
            scrollTrigger: { trigger: wrap, start: "top 85%", once: true } }
        );
      });

      // ── 13. HERO PARALLAX (scroll + mouse) ───────────────────
      const bg  = document.querySelector<HTMLElement>(".js-hero-bg");
      const prd = document.querySelector<HTMLElement>(".js-hero-product");
      if (bg || prd) {
        ScrollTrigger.create({
          trigger: "#hero", start: "top top", end: "bottom top", scrub: 1.2,
          onUpdate: (self) => {
            const p = self.progress;
            if (bg)  gsap.set(bg,  { scale: 1.06 + p * 0.05, y: p * 80 });
            if (prd) gsap.set(prd, { y: p * 140 });
          },
        });
        document.querySelector("#hero")?.addEventListener("mousemove", (e: Event) => {
          const ev = e as MouseEvent;
          const x = (ev.clientX / window.innerWidth  - 0.5) * 20;
          const y = (ev.clientY / window.innerHeight - 0.5) * 12;
          gsap.to(bg,  { x: x * 0.22, y: y * 0.18, duration: 1, ease: "power2.out", overwrite: true });
          gsap.to(prd, { x: x * 0.5,  y: y * 0.4,  duration: 0.8, ease: "power2.out", overwrite: true });
        });
      }

      // ── 14. HORIZONTAL PINNED SECTION ────────────────────────
      const hSection = document.querySelector<HTMLElement>("#h-pin");
      const hTrack   = document.querySelector<HTMLElement>(".h-pin-track");
      if (hSection && hTrack) {
        // overflow:hidden olmadan çalışır
        const getAmt = () => -(hTrack.scrollWidth - window.innerWidth + 60);
        ScrollTrigger.create({
          trigger: hSection,
          start: "top top",
          end: () => `+=${Math.max(hTrack.scrollWidth - window.innerWidth, 0)}`,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(hTrack, { x: self.progress * getAmt() });
          },
        });
      }

      // ── 15. 3D TILT CARDS ────────────────────────────────────
      document.querySelectorAll<HTMLElement>(".tilt-card").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const r   = card.getBoundingClientRect();
          const cx  = r.left + r.width  / 2;
          const cy  = r.top  + r.height / 2;
          const dx  = (e.clientX - cx) / (r.width  / 2);
          const dy  = (e.clientY - cy) / (r.height / 2);
          gsap.to(card, {
            rotateY: dx * 12, rotateX: -dy * 12,
            duration: 0.4, ease: "power2.out",
            transformPerspective: 600,
          });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
        });
      });

      // ── 16. MAGNETIC BUTTONS ─────────────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const r = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: (e.clientX - r.left - r.width  / 2) * 0.38,
            y: (e.clientY - r.top  - r.height / 2) * 0.38,
            duration: 0.4, ease: "power2.out",
          });
        });
        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
        });
      });

      // ── 17. LINE EXPAND ──────────────────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-line-expand").forEach((line) => {
        gsap.fromTo(line, { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 1.1, ease: "expo.out",
            scrollTrigger: { trigger: line, start: "top 90%", once: true } }
        );
      });

      // ── 18. EYEBROW LETTER-SPACING ───────────────────────────
      document.querySelectorAll<HTMLElement>(".anim-eyebrow").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, letterSpacing: "0.5em" },
          { opacity: 1, letterSpacing: "0.2em", duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true } }
        );
      });

      // ── 19. 360 PRODUCT SPIN on hover ────────────────────────
      document.querySelectorAll<HTMLElement>(".product-spin").forEach((el) => {
        let deg = 0;
        el.addEventListener("mouseenter", () => {
          deg += 360;
          gsap.to(el, { rotation: deg, duration: 1.2, ease: "power3.inOut" });
        });
      });

      // ── 20. SECTION BG MORPH ─────────────────────────────────
      document.querySelectorAll<HTMLElement>("[data-bg]").forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec, start: "top 55%", end: "bottom 45%",
          onEnter:     () => gsap.to("body", { backgroundColor: sec.dataset.bg!, duration: 0.7, ease: "power2.inOut" }),
          onEnterBack: () => gsap.to("body", { backgroundColor: sec.dataset.bg!, duration: 0.7, ease: "power2.inOut" }),
        });
      });

    })();

    // ── CUSTOM CURSOR ────────────────────────────────────────
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
        rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
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
      lenis?.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" />
      <div className="cursor-dot" style={{ opacity: 0 }} />
      <div className="cursor-ring" style={{ opacity: 0 }} />
    </>
  );
}
