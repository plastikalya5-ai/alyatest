import { AiHata } from '@/lib/ai'

// Ürün fotoğrafından AI ile "360° döner galeri" kareleri üretir (OpenAI Images edit — gpt-image-1).
// Not: Bu gerçek bir 3D model/mesh DEĞİLDİR — kaynak fotoğraftan, farklı açılardan çekilmiş gibi görünen
// karelerin AI ile türetilmesidir (üretici görüntü modeli gerçek arka yüzü "görmez", makul biçimde tahmin eder).
// Tek fotoğraftan gerçek 3D model üretimi çok daha yavaş/pahalı ve güvenilirliği düşüktür; bu yüzden
// müşteri tarafında "sürükle-döndür" izlenimi veren bu pratik yaklaşım tercih edilmiştir.
export const IMAGE_MODEL_360 = () => process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'

// Kare sayısı: çok fazlası hem maliyeti hem de tek istekte toplam süreyi arttırır (Vercel Hobby: 60sn fonksiyon sınırı).
export const KARE_ACILARI = [0, 45, 90, 135, 180, 225, 270, 315] as const
export type KareAcisi = (typeof KARE_ACILARI)[number]

const ACI_TANIM: Record<KareAcisi, string> = {
  0: 'directly from the front',
  45: 'rotated 45 degrees to the right on a turntable, three-quarter front view',
  90: 'rotated 90 degrees to the right on a turntable, direct side view',
  135: 'rotated 135 degrees to the right on a turntable, three-quarter back view',
  180: 'rotated 180 degrees on a turntable, directly from the back',
  225: 'rotated 225 degrees (135 degrees to the left), three-quarter back view from the other side',
  270: 'rotated 270 degrees (90 degrees to the left), direct side view from the other side',
  315: 'rotated 315 degrees (45 degrees to the left), three-quarter front view from the other side',
}

const promptUret = (acisi: KareAcisi) =>
  `This is a product photography turntable sequence. Show the SAME physical product as if the camera had walked around it and it is now seen ${ACI_TANIM[acisi]}, sitting in the exact same spot on a clean neutral studio turntable background with soft consistent lighting and a subtle ground shadow. ` +
  `Keep the product's exact shape, proportions, color, material, texture and every design detail completely consistent with the source photo — only the viewing angle changes. If a side or back cannot be seen in the source photo, infer a plausible, consistent continuation of the same product's design. Do not add any other objects, text, or watermarks.`

async function karateUret(kaynak: ArrayBuffer, kaynakTip: string, acisi: KareAcisi, key: string, base: string): Promise<string> {
  const form = new FormData()
  form.append('model', IMAGE_MODEL_360())
  form.append('image', new Blob([kaynak], { type: kaynakTip }), 'kaynak.png')
  form.append('prompt', promptUret(acisi))
  form.append('size', '1024x1024')
  form.append('n', '1')

  let res: Response
  try {
    res = await fetch(`${base}/images/edits`, { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form, signal: AbortSignal.timeout(45000) })
  } catch (e: any) {
    throw new AiHata(e?.name === 'TimeoutError' ? `360° kare (${acisi}°) zaman aşımına uğradı.` : `360° kare (${acisi}°) için AI servisine ulaşılamadı.`, 504)
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    console.error('[ai-360] OpenAI hata', acisi, res.status, t.slice(0, 500))
    if (res.status === 401) throw new AiHata('OpenAI API anahtarı geçersiz.', 502)
    if (res.status === 429) throw new AiHata('OpenAI kotası/istek limiti doldu, biraz sonra tekrar deneyin.', 429)
    throw new AiHata(`360° kare (${acisi}°) üretimi başarısız oldu.`, 502)
  }
  const j = await res.json().catch(() => null)
  const b64 = j?.data?.[0]?.b64_json
  if (!b64 || typeof b64 !== 'string') throw new AiHata(`AI 360° kare (${acisi}°) döndürmedi.`, 502)
  return b64
}

/** Kaynak görseli indirir, seçilen açı sayısı kadar kareyi PARALEL üretir (Vercel süre sınırı nedeniyle). Kaydetmez. */
export async function gorunum360Uret(imageUrl: string, kareSayisi: 4 | 8 = 8): Promise<string[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new AiHata('AI özelliği yapılandırılmamış (OPENAI_API_KEY tanımlı değil).', 503)
  if (!/^https:\/\//.test(imageUrl)) throw new AiHata('Görsel adresi https olmalı.', 400)

  let kaynak: ArrayBuffer
  let kaynakTip = 'image/png'
  try {
    const r = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) })
    if (!r.ok) throw new Error(String(r.status))
    kaynakTip = r.headers.get('content-type')?.split(';')[0] || kaynakTip
    kaynak = await r.arrayBuffer()
  } catch {
    throw new AiHata('Kaynak görsel indirilemedi.', 400)
  }
  if (kaynak.byteLength > 15 * 1024 * 1024) throw new AiHata('Kaynak görsel çok büyük (15MB üstü).', 400)
  if (!/^image\//.test(kaynakTip)) throw new AiHata('Kaynak dosya bir görsel değil.', 400)

  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const acilar = kareSayisi === 4 ? [0, 90, 180, 270] as const : KARE_ACILARI
  // 0° kareyi tekrar üretmek yerine kaynak görselin kendisini ilk kare olarak kullanıyoruz (tutarlılık + maliyet).
  const digerleri = acilar.filter(a => a !== 0)
  const uretilenler = await Promise.all(digerleri.map(a => karateUret(kaynak, kaynakTip, a as KareAcisi, key, base)))
  const ilkKareB64 = Buffer.from(kaynak).toString('base64')
  return [ilkKareB64, ...uretilenler]
}
