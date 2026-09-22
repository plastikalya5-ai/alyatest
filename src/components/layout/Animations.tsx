"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;

    (async () => {
      const gsap     = (await import("gsap")).gsap;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText }     = await import("gsap/SplitText");
      const { default: Lenis } = await import("@studio-freight/lenis");

      gsap.registerPlugin(ScrollTrigger, SplitText);

      // ─── Lenis smooth scroll ──────────────────────────────
      const lenis = new Lenis({ lerp: 0.07, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);

      ctx = gsap.context(() => {

        // ─── Hero: satır satır maskeli reveal ────────────────
        const heroLines = document.querySelectorAll<HTMLElement>(".anim-hero-line");
        if (heroLines.length) {
          gsap.fromTo(heroLines,
            { yPercent: 120, skewY: 4 },
            { yPercent: 0, skewY: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, delay: 0.2 }
          );
        }

        // Hero overline + sub
        gsap.fromTo(".anim-hero-sub",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.7 }
        );

        // Hero product parallax
        ScrollTrigger.create({
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const prd = document.querySelector<HTMLElement>(".js-hero-product");
            const bg  = document.querySelector<HTMLElement>(".js-hero-bg");
            if (prd) gsap.set(prd, { y: p * 120 });
            if (bg)  gsap.set(bg,  { scale: 1.06 + p * 0.04, y: p * 60 });
          },
        });

        // Mouse parallax on hero
        const hero = document.querySelector<HTMLElement>("#hero");
        if (hero) {
          hero.addEventListener("mousemove", (e) => {
            const x = (e.clientX / window.innerWidth  - 0.5) * 22;
            const y = (e.clientY / window.innerHeight - 0.5) * 14;
            const prd = document.querySelector<HTMLElement>(".js-hero-product");
            const bg  = document.querySelector<HTMLElement>(".js-hero-bg");
            gsap.to(prd, { x: x * 0.6, y: y * 0.5, duration: 0.8, ease: "power2.out", overwrite: true });
            gsap.to(bg,  { x: x * 0.2, y: y * 0.15, duration: 1.2, ease: "power2.out", overwrite: true });
          });
        }

        // ─── Split text headings ──────────────────────────────
        document.querySelectorAll<HTMLElement>(".anim-split-heading").forEach((el) => {
          const split = new SplitText(el, { type: "chars,words" });
          gsap.fromTo(split.chars,
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0, opacity: 1,
              duration: 0.8, ease: "expo.out",
              stagger: 0.025,
              scrollTrigger: { trigger: el, start: "top 88%" },
            }
          );
        });

        // ─── Clip reveal (maskeden açılma) ────────────────────
        document.querySelectorAll<HTMLElement>(".anim-clip").forEach((el) => {
          gsap.fromTo(el,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.1, ease: "expo.inOut",
              scrollTrigger: { trigger: el, start: "top 88%" },
            }
          );
        });

        // ─── Fade-up (genel elementler) ───────────────────────
        document.querySelectorAll<HTMLElement>(".anim-up").forEach((el, i) => {
          const delay = parseFloat(el.dataset.delay || "0");
          gsap.fromTo(el,
            { opacity: 0, y: 50 },
            {
              opacity: 1, y: 0,
              duration: 0.85, ease: "power3.out",
              delay,
              scrollTrigger: { trigger: el, start: "top 90%" },
            }
          );
        });

        // ─── Stagger cards (ürün grid, stats) ────────────────
        document.querySelectorAll<HTMLElement>(".anim-stagger-parent").forEach((parent) => {
          const children = parent.querySelectorAll<HTMLElement>(".anim-stagger-child");
          gsap.fromTo(children,
            { opacity: 0, y: 40, scale: 0.97 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.7, ease: "power3.out",
              stagger: 0.08,
              scrollTrigger: { trigger: parent, start: "top 85%" },
            }
          );
        });

        // ─── Horizontal marquee scroll-speed ──────────────────
        // (marquee CSS anim, ekstra efekt yok)

        // ─── Feature list — satır satır ───────────────────────
        document.querySelectorAll<HTMLElement>(".anim-list").forEach((list) => {
          const items = list.querySelectorAll<HTMLElement>(".anim-list-item");
          gsap.fromTo(items,
            { opacity: 0, x: -24 },
            {
              opacity: 1, x: 0,
              duration: 0.6, ease: "power2.out",
              stagger: 0.07,
              scrollTrigger: { trigger: list, start: "top 85%" },
            }
          );
        });

        // ─── Image — scale reveal ─────────────────────────────
        document.querySelectorAll<HTMLElement>(".anim-img-reveal").forEach((wrap) => {
          const img = wrap.querySelector("img");
          gsap.fromTo(wrap,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.2, ease: "expo.inOut",
              scrollTrigger: { trigger: wrap, start: "top 85%" },
            }
          );
          if (img) {
            gsap.fromTo(img,
              { scale: 1.15 },
              {
                scale: 1,
                duration: 1.2, ease: "expo.inOut",
                scrollTrigger: { trigger: wrap, start: "top 85%" },
              }
            );
          }
        });

        // ─── Count-up numbers ─────────────────────────────────
        document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          const target = parseInt(el.dataset.count!);
          const suffix = el.dataset.suffix || "";
          el.textContent = "0" + suffix;
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () => {
              const obj = { val: 0 };
              gsap.to(obj, {
                val: target, duration: 1.6, ease: "power2.out",
                onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
              });
            },
          });
        });

        // ─── Horizontal pinned section (collection scroll) ────
        // (native scroll, extra pin yok)

        // ─── Section bg color morph on scroll ─────────────────
        const sections = document.querySelectorAll<HTMLElement>("[data-bg]");
        sections.forEach((sec) => {
          ScrollTrigger.create({
            trigger: sec,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: () => gsap.to("body", { backgroundColor: sec.dataset.bg, duration: 0.8, ease: "power2.inOut" }),
            onEnterBack: () => gsap.to("body", { backgroundColor: sec.dataset.bg, duration: 0.8, ease: "power2.inOut" }),
          });
        });

        // ─── Magnetic buttons ─────────────────────────────────
        document.querySelectorAll<HTMLElement>(".anim-magnetic").forEach((btn) => {
          btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width  / 2;
            const y = e.clientY - rect.top  - rect.height / 2;
            gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: "power2.out" });
          });
          btn.addEventListener("mouseleave", () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
          });
        });

        // ─── Orange line horizontal expand ───────────────────
        document.querySelectorAll<HTMLElement>(".anim-line-expand").forEach((line) => {
          gsap.fromTo(line,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1, duration: 1, ease: "expo.out",
              scrollTrigger: { trigger: line, start: "top 90%" },
            }
          );
        });

        // ─── Eyebrow letter spacing anim ──────────────────────
        document.querySelectorAll<HTMLElement>(".anim-eyebrow").forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0, letterSpacing: "0.4em" },
            {
              opacity: 1, letterSpacing: el.style.letterSpacing || "0.2em",
              duration: 0.9, ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 90%" },
            }
          );
        });

      }); // end gsap.context

    })();

    // ─── Custom cursor ────────────────────────────────────────
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
        rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
        ring.style.left = rx + "px"; ring.style.top = ry + "px";
        rafId = requestAnimationFrame(anim);
      };
      rafId = requestAnimationFrame(anim);
      document.addEventListener("mousemove", mv);
      document.querySelectorAll("a,button").forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
        el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
      });
    }

    return () => {
      ctx?.revert();
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
