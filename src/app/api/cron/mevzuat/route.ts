import { NextRequest, NextResponse } from 'next/server'
import { topluKontrol } from '@/lib/mevzuat-takip'
import { notify } from '@/lib/notify'

export const maxDuration = 60

// Vercel Cron (vercel.json) her gün çağırır; CRON_SECRET tanımlıysa Vercel "Authorization: Bearer <CRON_SECRET>" gönderir.
// Her çalışmada en uzun süredir kontrol edilmeyen 8 kayıt işlenir (26+ kayıt birkaç günde döner).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET tanımlı değil' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const sonuclar = await topluKontrol(8)
    const yeniUyari = sonuclar.filter(s => s.sonuc === 'degismis_olabilir' && s.onceki !== 'degismis_olabilir')
    if (yeniUyari.length) {
      await notify(
        'mevzuat_uyari',
        `Mevzuat uyarısı: ${yeniUyari.length} kayıtta değişiklik olası`,
        ['Alya Plastik Muhasebe AI mevzuat takibi, aşağıdaki kayıtların kaynağında değişiklik olabileceğini tespit etti. Lütfen kontrol edip bilgi tabanını güncelleyin (Muhasebe → Muhasebe AI → Güncel mevzuat).', ...yeniUyari.map(s => `• ${s.baslik}: ${s.not}`)].join('\n'),
        { adet: yeniUyari.length },
      )
    }
    return NextResponse.json({ ok: true, kontrol: sonuclar.length, sonuclar: sonuclar.map(s => ({ baslik: s.baslik, sonuc: s.sonuc })), yeniUyari: yeniUyari.length })
  } catch (e: any) {
    console.error('[cron/mevzuat]', e)
    return NextResponse.json({ error: 'Kontrol başarısız' }, { status: 500 })
  }
}
