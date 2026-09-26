"use client";
import { useEffect } from "react";
import { M } from "@/lib/site-metin";
import type { Dil } from "@/lib/diller";

// Kök layout tek olduğundan <html lang> istemcide sayfanın diline ayarlanır (ekran okuyucu/çeviri araçları için).
export default function HtmlLang({ dil }: { dil: Dil }) {
  useEffect(() => {
    const onceki = document.documentElement.lang;
    document.documentElement.lang = M[dil].htmlLang;
    return () => { document.documentElement.lang = onceki; };
  }, [dil]);
  return null;
}
