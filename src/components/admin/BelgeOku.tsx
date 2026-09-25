'use client'
import { useRef, useState } from 'react'
import { ScanText } from 'lucide-react'
import { aiIstek } from '@/lib/ai-client'

export type BelgeSonuc = {
  belge_tipi: string; satici: string; belge_no: string; tarih: string; para_birimi: string
  kalemler: { aciklama: string; miktar: number | null; birim: string; birim_fiyat: number | null; kdv_orani: number | null; toplam: number | null }[]
  ara_toplam: number | null; kdv_tutari: number | null; genel_toplam: number | null; notlar: string; guven: 'yuksek' | 'orta' | 'dusuk'
}

// Fotoğrafı sunucu gövde sınırına (~4.5 MB) sığması için küçültüp JPEG'e çevirir.
async function gorselKucult(f: File): Promise<string> {
  const bmp = await createImageBitmap(f)
  for (const [kenar, kalite] of [[1800, 0.85], [1400, 0.75], [1100, 0.65]] as const) {
    const oran = Math.min(1, kenar / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * oran); c.height = Math.round(bmp.height * oran)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    const d = c.toDataURL('image/jpeg', kalite)
    if (d.length < 4_000_000) return d
  }
  throw new Error('Görsel çok büyük, daha küçük çözünürlükle deneyin.')
}
const dosyaOku = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(new Error('Dosya okunamadı')); r.readAsDataURL(f) })

// Fatura/irsaliye fotoğrafı veya PDF'inden AI ile veri çıkarır. Sonuç yalnızca forma doldurulur; kaydı kullanıcı onaylar.
export default function BelgeOku({ onSonuc, onHata }: { onSonuc: (b: BelgeSonuc) => void; onHata: (m: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function sec(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setBusy(true)
    try {
      let dosya: string
      if (f.type === 'application/pdf') { if (f.size > 3_000_000) throw new Error('PDF en fazla 3 MB olabilir.'); dosya = await dosyaOku(f) }
      else if (/^image\/(jpeg|png|webp)$/.test(f.type)) dosya = await gorselKucult(f)
      else throw new Error('Desteklenen türler: JPEG, PNG, WEBP, PDF')
      const r = await aiIstek<{ sonuc: BelgeSonuc }>('belge_oku', { dosya })
      onSonuc(r.sonuc)
    } catch (err: any) { onHata(err.message || 'Belge okunamadı') }
    setBusy(false)
  }

  return (
    <>
      <button type="button" className="adm-btn-ghost" style={{ fontSize: 12 }} disabled={busy} onClick={() => ref.current?.click()}><ScanText size={13} />{busy ? 'Belge okunuyor…' : 'Belgeden oku (AI)'}</button>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={sec} style={{ display: 'none' }} />
    </>
  )
}
