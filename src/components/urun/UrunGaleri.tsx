"use client";
import { useState } from "react";
import Donus360 from "@/components/urun/Donus360";
import Model3D from "@/components/urun/Model3D";

// Ürün detay sayfasındaki ana görsel + küçük resimler (thumbnail) galerisi.
// Önceden thumbnail'ler tıklanabilir değildi (düz <img>, tıklama/seçili durum yoktu) —
// bu yüzden ikinci/üçüncü resme geçmek mümkün değildi. Artık seçili küçük resme göre
// ana kutuda ne gösterileceği (gerçek 3D model / AI 360° galeri / ilgili statik resim) belirleniyor.
export default function UrunGaleri({
  model3dUrl, kareler360, resimler, alt,
}: {
  model3dUrl: string | null;
  kareler360: string[];
  resimler: string[];
  alt: string;
}) {
  const [secili, setSecili] = useState(0);
  const digerResimler = resimler.slice(1, 9);
  const kucukResimVarMi = digerResimler.length > 0;

  return (
    <div>
      <div className="bg-[#e3ddcf] flex items-center justify-center" style={{ aspectRatio: "1 / 1" }}>
        {secili === 0 ? (
          model3dUrl ? (
            <Model3D url={model3dUrl} alt={alt} className="w-full h-full" />
          ) : kareler360.length > 1 ? (
            <Donus360 kareler={kareler360} alt={alt} className="w-full h-full flex items-center justify-center" style={{ padding: "clamp(16px,4vw,48px)" }} />
          ) : (
            resimler[0] &&
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resimler[0]} alt={alt} className="w-full h-full object-contain" style={{ padding: "clamp(16px,4vw,48px)" }} fetchPriority="high" />
          )
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resimler[secili]} alt={alt} className="w-full h-full object-contain" style={{ padding: "clamp(16px,4vw,48px)" }} />
        )}
      </div>

      {kucukResimVarMi && (
        <ul className="grid grid-cols-4 gap-2 mt-2">
          {/* İlk küçük resim: ana gösterimi (3D/360/ilk foto) temsil eder */}
          <li>
            <button type="button" onClick={() => setSecili(0)} aria-label={`${alt} — 1`} aria-current={secili === 0}
              className="block w-full bg-[#e3ddcf] aspect-square transition-opacity"
              style={{ outline: secili === 0 ? "2px solid #e55f28" : "2px solid transparent", outlineOffset: -2, opacity: secili === 0 ? 1 : 0.75 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resimler[0]} alt="" loading="lazy" className="w-full h-full object-contain p-2" />
            </button>
          </li>
          {digerResimler.map((r, i) => {
            const idx = i + 1;
            return (
              <li key={r}>
                <button type="button" onClick={() => setSecili(idx)} aria-label={`${alt} — ${idx + 1}`} aria-current={secili === idx}
                  className="block w-full bg-[#e3ddcf] aspect-square transition-opacity"
                  style={{ outline: secili === idx ? "2px solid #e55f28" : "2px solid transparent", outlineOffset: -2, opacity: secili === idx ? 1 : 0.75 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r} alt="" loading="lazy" className="w-full h-full object-contain p-2" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
