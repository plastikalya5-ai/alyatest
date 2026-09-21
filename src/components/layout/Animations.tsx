"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any = null;

    (async () => {
      const { default: Lenis } = await import("@studio-freight/lenis");
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { TextPlugin } = await import("gsap/TextPlugin");

      gsap.registerPlugin(ScrollTrigger, TextPlugin);

      // ── Smooth scroll ──────────────────────────────────────────
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis!.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);

      ctx = gsap.context(() => {
        // ── Hero title — satır satır giriş ─────────────────────
        gsap.from(".hero-line", {
          yPercent: 110,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: "expo.out",
          delay: 0.3,
        });

        gsap.from(".hero-stat", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.9,
        });

        gsap.from(".hero-bottom-el", {
          y: 20,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          delay: 1.1,
        });

        // Hero parallax — ürün görseli
        gsap.to(".hero-product-img", {
          yPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });

        // ── Scroll reveal — genel ──────────────────────────────
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
          gsap.from(el, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });

        // ── Display başlıklar — clip reveal ────────────────────
        gsap.utils.toArray<HTMLElement>(".reveal-title").forEach((el) => {
          gsap.from(el, {
            yPercent: 105,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });

        // ── Story section — sol/sağ giriş ──────────────────────
        gsap.utils.toArray<HTMLElement>(".story-copy").forEach((el) => {
          gsap.from(el, {
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });

        gsap.utils.toArray<HTMLElement>(".story-img-wrap").forEach((el) => {
          gsap.from(el, {
            x: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });

        // ── Count-up — bileşenler kendi IntersectionObserver'ını yönetiyor

        // ── Making steps — sırayla ─────────────────────────────
        gsap.utils.toArray<HTMLElement>(".making-step").forEach((el, i) => {
          gsap.from(el, {
            y: 80,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
            },
            delay: i * 0.05,
          });
        });

        // ── Export ticker hız — scroll ile ─────────────────────
        // (ticker zaten JS ile, burada hız boost)

        // ── History year — büyük rakam parallax ────────────────
        gsap.utils.toArray<HTMLElement>(".history-year").forEach((el) => {
          gsap.from(el, {
            x: -80,
            opacity: 0,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });

        // ── Catalogue — başlık pinned reveal ───────────────────
        gsap.from("#catalogue h2", {
          yPercent: 100,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "#catalogue",
            start: "top 80%",
          },
        });

        // ── Editorial ürünler — kademeli ───────────────────────
        gsap.utils.toArray<HTMLElement>(".product-card").forEach((el, i) => {
          gsap.from(el, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: (i % 3) * 0.1,
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        // ── Why cards — kademeli ───────────────────────────────
        gsap.utils.toArray<HTMLElement>(".why-card").forEach((el, i) => {
          gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        // ── Contact form fade ──────────────────────────────────
        gsap.from("#contact form", {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: "#contact form", start: "top 88%" },
        });
      });
    })();

    return () => {
      ctx?.revert();
      lenis?.destroy();
    };
  }, []);

  return null;
}
