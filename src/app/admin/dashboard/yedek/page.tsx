'use client'
import { useCallback, useEffect, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { Page, PageHead, Card, Badge, useToast } from '@/components/admin/erp/ui'
import { ZipYazici } from '@/lib/zip-yaz'
import { Download, FileArchive, AlertTriangle, RefreshCw, Database, FolderArchive } from 'lucide-react'

type Tablo = { ad: string; satir: number | null; hata?: string }
type Kova = { ad: string; acik: boolean }
type Sonuc = { tablo: number; satir: number; kullanici: number; dosya: number; boyutMb: number; hatalar: string[] }

async function api(q: string) {
  const r = await fetch('/api/admin/yedek?' + q)
  const j = await r.json().catch(() => ({ error: 'Yanıt okunamadı' }))
  if (!r.ok) throw new Error(j.error || `Hata ${r.status}`)
  return j
}

const bekle = (ms: number) => new Promise(r => setTimeout(r, ms))

// Bir tablonun tüm satırlarını sayfa sayfa çeker (her sayfa en fazla 3 kez denenir)
async function tabloCek(ad: string, sayfa?: (n: number) => void): Promise<any[]> {
  const out: any[] = []
  let bas = 0
  for (;;) {
    let j: any
    for (let d = 0; d < 3; d++) {
      try { j = await api(`islem=tablo&ad=${encodeURIComponent(ad)}&bas=${bas}`); break } catch (e) { if (d === 2) throw e; await bekle(800) }
    }
    out.push(...j.rows)
    bas = j.sonraki
    sayfa?.(out.length)
    if (j.bitti || !j.rows.length) break
  }
  return out
}

function csvMetni(rows: any[]) {
  const cols: string[] = []
  const gorulen = new Set<string>()
  for (const r of rows) for (const k of Object.keys(r)) if (!gorulen.has(k)) { gorulen.add(k); cols.push(k) }
  const esc = (v: any) => `"${(v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)).replace(/"/g, '""')}"`
  return '﻿' + [cols.join(';'), ...rows.map(r => cols.map(c => esc(r[c])).join(';'))].join('\n')
}

function indir(blob: Blob, ad: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = ad; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

const damga = () => new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '')

export default function YedekPage() {
  const toast = useToast()
  const [liste, setListe] = useState<{ tablolar: Tablo[]; kovalar: Kova[] } | null>(null)
  const [hata, setHata] = useState('')
  const [yuk, setYuk] = useState(true)
  const [dosyalarDahil, setDosyalarDahil] = useState(true)
  const [calisiyor, setCalisiyor] = useState(false)
  const [adim, setAdim] = useState('')
  const [yuzde, setYuzde] = useState(0)
  const [sonuc, setSonuc] = useState<Sonuc | null>(null)
  const [tek, setTek] = useState('')

  const yukle = useCallback(async () => {
    setYuk(true); setHata('')
    try { setListe(await api('islem=liste')) } catch (e: any) { setHata(e.message || 'Liste alınamadı') }
    setYuk(false)
  }, [])
  useEffect(() => { yukle() }, [yukle])

  const toplamSatir = (liste?.tablolar || []).reduce((t, x) => t + (x.satir || 0), 0)

  async function tamYedek() {
    if (!liste || calisiyor) return
    setCalisiyor(true); setSonuc(null); setYuzde(0)
    const zip = new ZipYazici()
    const hatalar: string[] = []
    const ozet: Record<string, number | null> = {}
    let satir = 0, dosyaSay = 0, bayt = 0, kullaniciSay = 0
    try {
      await fetch('/api/admin/yedek', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ islem: 'basla', dosyalar: dosyalarDahil }) })

      const n = liste.tablolar.length
      for (let i = 0; i < n; i++) {
        const t = liste.tablolar[i]
        setAdim(`Tablo ${i + 1}/${n}: ${t.ad}`); setYuzde(Math.round((i / n) * 60))
        try {
          const rows = await tabloCek(t.ad, c => setAdim(`Tablo ${i + 1}/${n}: ${t.ad} (${c.toLocaleString('tr-TR')} satır)`))
          zip.ekleMetin(`tablolar/${t.ad}.json`, JSON.stringify(rows))
          zip.ekleMetin(`tablolar/${t.ad}.csv`, csvMetni(rows))
          ozet[t.ad] = rows.length; satir += rows.length
          if (t.satir != null && rows.length !== t.satir) hatalar.push(`${t.ad}: beklenen ${t.satir} satır, alınan ${rows.length}`)
        } catch (e: any) { ozet[t.ad] = null; hatalar.push(`${t.ad}: ${e.message}`) }
      }

      setAdim('Kullanıcı listesi'); setYuzde(61)
      try {
        const k = await api('islem=kullanicilar')
        zip.ekleMetin('kullanicilar.json', JSON.stringify(k.kullanicilar, null, 1)); kullaniciSay = k.kullanicilar.length
      } catch (e: any) { hatalar.push(`kullanıcılar: ${e.message}`) }

      if (dosyalarDahil) {
        setAdim('Dosya listesi hazırlanıyor'); setYuzde(62)
        try {
          const { dosyalar } = await api('islem=dosyalar')
          for (let i = 0; i < dosyalar.length; i++) {
            const d = dosyalar[i]
            setAdim(`Dosya ${i + 1}/${dosyalar.length}: ${d.kova}/${d.yol}`); setYuzde(62 + Math.round((i / Math.max(dosyalar.length, 1)) * 33))
            try {
              if (!d.url) throw new Error('indirme bağlantısı alınamadı')
              const r = await fetch(d.url)
              if (!r.ok) throw new Error(`HTTP ${r.status}`)
              const b = new Uint8Array(await r.arrayBuffer())
              zip.ekle(`dosyalar/${d.kova}/${d.yol}`, b); dosyaSay++; bayt += b.length
            } catch (e: any) { hatalar.push(`dosya ${d.kova}/${d.yol}: ${e.message}`) }
          }
        } catch (e: any) { hatalar.push(`dosyalar: ${e.message}`) }
      }

      setAdim('ZIP dosyası hazırlanıyor'); setYuzde(97)
      zip.ekleMetin('ozet.json', JSON.stringify({ tarih: new Date().toISOString(), tablolar: ozet, kullanici: kullaniciSay, dosya: dosyaSay, hatalar }, null, 1))
      zip.ekleMetin('OKU.txt', [
        'ALYA PANEL — VERİ YEDEĞİ', `Tarih: ${new Date().toLocaleString('tr-TR')}`, '',
        'İçerik:',
        '- tablolar/<ad>.json ve .csv : Veritabanı tabloları (tüm sütunlar; id ve ilişki alanları dahil)',
        '- kullanicilar.json : Giriş hesapları (e-posta, oluşturma ve son giriş tarihi, metadata). ŞİFRELER YEDEKLENEMEZ; yeni sistemde kullanıcıların şifresi yeniden belirlenmelidir.',
        '- dosyalar/<kova>/... : Depolama dosyaları (ürün görselleri, katalog vb.)',
        '- ozet.json : tablo satır sayıları ve alınamayan kayıtlar', '',
        'Taşırken dikkat:',
        '1. Veritabanı YAPISI (tablo tanımları, ilişkiler, RLS kuralları, fonksiyonlar, tetikleyiciler) bu yedekte yoktur; yeni Supabase projesinde ayrıca kurulmalıdır.',
        '2. FIELD_ENCRYPTION_KEY ortam değişkeni aynen taşınmalıdır; aksi halde şifreli alanlar (ör. cari vergi no) okunamaz.',
        '3. Ortam değişkenleri (Vercel > Settings > Environment Variables) ayrıca not alınmalıdır.',
      ].join('\n'))
      const blob = zip.bitir()
      indir(blob, `alya-yedek-${damga()}.zip`)
      setYuzde(100); setAdim('Tamamlandı')
      setSonuc({ tablo: n, satir, kullanici: kullaniciSay, dosya: dosyaSay, boyutMb: Math.round((blob.size / 1048576) * 10) / 10, hatalar })
    } catch (e: any) {
      toast.show(e.message || 'Yedek alınamadı', true); setAdim('Hata oluştu')
    }
    setCalisiyor(false)
  }

  async function tekTablo(ad: string, bicim: 'csv' | 'json') {
    if (tek) return
    setTek(ad + bicim)
    try {
      const rows = await tabloCek(ad)
      if (bicim === 'json') indir(new Blob([JSON.stringify(rows)], { type: 'application/json' }), `${ad}.json`)
      else indir(new Blob([csvMetni(rows)], { type: 'text/csv;charset=utf-8;' }), `${ad}.csv`)
      toast.show(`${ad}: ${rows.length.toLocaleString('tr-TR')} satır indirildi`)
    } catch (e: any) { toast.show(e.message || 'İndirilemedi', true) }
    setTek('')
  }

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Veri Yedeği" />
      <Page maxWidth={980}>
        <PageHead title="Veri Yedeği (Taşıma)" sub="Tüm tabloları, kullanıcı listesini ve yüklenen dosyaları tek ZIP olarak indirir"
          actions={<button className="adm-btn-ghost" onClick={yukle} disabled={yuk || calisiyor}><RefreshCw size={14} />Yenile</button>} />

        {hata && <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--adm-red)', background: 'var(--adm-red2)', borderRadius: 10, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}><AlertTriangle size={15} />{hata}</div>}

        <Card title={<><FileArchive size={15} />Tam yedek</>} pad={16}>
          <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.6 }}>
            {yuk ? 'Tablolar sayılıyor…' : liste ? <>{liste.tablolar.length} tablo, toplam <b>{toplamSatir.toLocaleString('tr-TR')}</b> satır{liste.kovalar.length ? <>, {liste.kovalar.length} dosya klasörü</> : null}.</> : null}
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 14 }}>
            <input type="checkbox" checked={dosyalarDahil} onChange={e => setDosyalarDahil(e.target.checked)} disabled={calisiyor} />
            Yüklenen dosyaları da ekle (ürün görselleri, katalog)
          </label>
          <button className="adm-btn" onClick={tamYedek} disabled={!liste || calisiyor}><Download size={14} />{calisiyor ? 'İndiriliyor…' : 'Tam yedeği indir (ZIP)'}</button>

          {(calisiyor || adim) && (
            <div style={{ marginTop: 16 }}>
              <div style={{ height: 8, borderRadius: 6, background: 'var(--adm-s2, rgba(128,128,128,.18))', overflow: 'hidden' }}>
                <div style={{ width: `${yuzde}%`, height: '100%', background: 'var(--adm-ac)', transition: 'width .25s' }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--adm-tx3)', wordBreak: 'break-all' }}>%{yuzde} — {adim}</div>
            </div>
          )}

          {sonuc && (
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: sonuc.hatalar.length ? 'var(--adm-amber2, rgba(245,158,11,.12))' : 'var(--adm-green2, rgba(34,197,94,.12))', fontSize: 13, lineHeight: 1.6 }}>
              <b>{sonuc.hatalar.length ? 'Yedek indirildi ama bazı kayıtlar alınamadı' : 'Yedek indirildi'}</b>
              <div>{sonuc.tablo} tablo · {sonuc.satir.toLocaleString('tr-TR')} satır · {sonuc.kullanici} kullanıcı · {sonuc.dosya} dosya · {sonuc.boyutMb} MB</div>
              {sonuc.hatalar.length > 0 && <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5 }}>{sonuc.hatalar.slice(0, 12).map((h, i) => <li key={i}>{h}</li>)}{sonuc.hatalar.length > 12 && <li>…ve {sonuc.hatalar.length - 12} hata daha (ozet.json içinde)</li>}</ul>}
            </div>
          )}
        </Card>

        <div style={{ height: 14 }} />
        <Card title={<><AlertTriangle size={15} />Taşımadan önce bilmen gerekenler</>} pad={16}>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
            <li><b>Şifreler yedeklenemez.</b> Kullanıcı listesi gelir, ama yeni sistemde herkesin şifresi yeniden belirlenmelidir.</li>
            <li><b>Veritabanı yapısı</b> (tablo tanımları, ilişkiler, RLS kuralları, fonksiyonlar) bu dosyada yoktur; yeni Supabase projesinde ayrıca kurulmalıdır.</li>
            <li><b>FIELD_ENCRYPTION_KEY</b> değerini Vercel ortam değişkenlerinden mutlaka not al; kaybedilirse şifreli alanlar (ör. cari vergi no) okunamaz.</li>
            <li>Yedek dosyası tüm cari, bordro ve muhasebe verisini içerir; güvenli bir yerde sakla. İndirme anında yöneticilere bildirim gider.</li>
          </ul>
        </Card>

        <div style={{ height: 14 }} />
        <Card title={<><Database size={15} />Tablolar</>} right={liste ? <Badge tone="muted">{liste.tablolar.length}</Badge> : null}>
          <div style={{ maxHeight: 460, overflow: 'auto' }}>
            <table className="adm-tbl compact">
              <thead><tr><th>Tablo</th><th style={{ textAlign: 'right', width: 90 }}>Satır</th><th style={{ width: 150 }}></th></tr></thead>
              <tbody>
                {(liste?.tablolar || []).map(t => (
                  <tr key={t.ad}>
                    <td><code style={{ fontSize: 12 }}>{t.ad}</code>{t.hata && <span style={{ color: 'var(--adm-red)', fontSize: 11, marginLeft: 8 }}>{t.hata}</span>}</td>
                    <td style={{ textAlign: 'right' }}>{t.satir == null ? '—' : t.satir.toLocaleString('tr-TR')}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="adm-btn-ghost" style={{ padding: '2px 9px', fontSize: 11.5 }} disabled={!!tek || calisiyor} onClick={() => tekTablo(t.ad, 'csv')}>{tek === t.ad + 'csv' ? '…' : 'CSV'}</button>{' '}
                      <button className="adm-btn-ghost" style={{ padding: '2px 9px', fontSize: 11.5 }} disabled={!!tek || calisiyor} onClick={() => tekTablo(t.ad, 'json')}>{tek === t.ad + 'json' ? '…' : 'JSON'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {liste && liste.kovalar.length > 0 && (
          <>
            <div style={{ height: 14 }} />
            <Card title={<><FolderArchive size={15} />Dosya klasörleri</>} pad={16}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{liste.kovalar.map(k => <Badge key={k.ad} tone={k.acik ? 'blue' : 'muted'}>{k.ad}{k.acik ? ' · herkese açık' : ''}</Badge>)}</div>
            </Card>
          </>
        )}
      </Page>
      {toast.node}
    </div>
  )
}
