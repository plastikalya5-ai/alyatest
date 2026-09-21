"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    // Touch cihaz ise gösterme
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;
    let raf: number;

    cursor.style.opacity = "0";
    dot.style.opacity = "0";

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      if (cursor.style.opacity === "0") {
        cursor.style.opacity = "1";
        dot.style.opacity = "1";
      }
    };

    const animate = () => {
      curX += (mouseX - curX) * 0.1;
      curY += (mouseY - curY) * 0.1;
      cursor.style.transform = `translate(${curX}px, ${curY}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // Magnetic — linkler ve butonlar üzerinde büyü
    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const tag = el.tagName.toLowerCase();
      cursor.dataset.state = tag === "a" || tag === "button" ? "magnetic" : "";
      cursor.style.width = "54px";
      cursor.style.height = "54px";
      cursor.style.background = "var(--orange)";
      cursor.style.mixBlendMode = "difference";
    };

    const onLeave = () => {
      cursor.style.width = "12px";
      cursor.style.height = "12px";
      cursor.style.background = "transparent";
      cursor.style.mixBlendMode = "normal";
    };

    // Drag cursor — collection üzerinde
    const onDragEnter = () => {
      cursor.style.width = "76px";
      cursor.style.height = "76px";
      cursor.style.background = "rgba(255,255,255,0.15)";
      cursor.style.borderColor = "#fff";
    };
    const onDragLeave = () => {
      cursor.style.width = "12px";
      cursor.style.height = "12px";
      cursor.style.background = "transparent";
      cursor.style.borderColor = "var(--orange)";
    };

    document.addEventListener("mousemove", onMove);

    const interactives = document.querySelectorAll("a, button");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    const gallery = document.querySelector("#collection");
    gallery?.addEventListener("mouseenter", onDragEnter);
    gallery?.addEventListener("mouseleave", onDragLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      gallery?.removeEventListener("mouseenter", onDragEnter);
      gallery?.removeEventListener("mouseleave", onDragLeave);
    };
  }, []);

  return (
    <>
      {/* Ana cursor — lag ile takip eder */}
      <div
        ref={cursorRef}
        className="fixed z-[150] pointer-events-none rounded-full"
        style={{
          width: 12,
          height: 12,
          border: "1.5px solid var(--orange)",
          background: "transparent",
          top: 0,
          left: 0,
          transform: "translate(-50%, -50%)",
          transition: "width 0.25s, height 0.25s, background 0.2s, border-color 0.2s",
          willChange: "transform",
        }}
      />
      {/* Dot — mouse'u anında takip eder */}
      <div
        ref={dotRef}
        className="fixed z-[151] pointer-events-none rounded-full"
        style={{
          width: 4,
          height: 4,
          background: "var(--orange)",
          top: 0,
          left: 0,
          transform: "translate(-50%, -50%)",
          willChange: "transform",
        }}
      />
    </>
  );
}
