'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { web } from '@/lib/web-data'
import { createClient } from '@/lib/supabase/client'
import { aiIstek } from '@/lib/ai-client'
import { belgeDataUrl } from '@/lib/belge-dosya'
import { csvDownload, fmtDate, todayISO } from '@/lib/fmt'
import { Page, PageHead, Badge, Tabs, Card, Modal, Field, FormGrid, useToast } from '@/components/admin/erp/ui'
import { DataGrid, type Col } from '@/components/admin/erp/DataGrid'
import { Sparkles, Send, Trash2, Upload, FileText, Copy, Download, MessageSquare, Plus, Pencil, CheckCircle2, ShieldAlert, X, BookOpen, RefreshCw } from 'lucide-react'

const ENDPOINT = '/api/admin/muhasebe-ai'
const GUVEN: Record<string, { l: string; tone: any }> = { resmi: { l: 'Resmi kaynak', tone: 'green' }, coklu_kaynak: { l: 'Çoklu kaynak', tone: 'blue' }, tek_kaynak: { l: 'Tek kaynak — teyit et', tone: 'amber' } }
const KONTROL: Record<string, { l: string; tone: any }> = { tutarli: { l: 'Kaynakla tutarlı', tone: 'green' }, degismis_olabilir: { l: 'Kaynakta değişiklik olası', tone: 'red' }, belirsiz: { l: 'Kontrol belirsiz', tone: 'amber' }, okunamadi: { l: 'Kaynak okunamadı', tone: 'muted' } }
const OKUMA: Record<string, any> = { yuksek: 'green', orta: 'amber', dusuk: 'red' }
const BAYAT_GUN = 120

const ORNEKLER = [
  'Gecikme zammı oranı nedir? 250.000 TL borç 45 gün gecikirse ne kadar gecikme zammı işler?',
  '2026 asgari ücretli bir işçinin işverene maliyeti nedir? İmalat sektörü indirimiyle farkı da söyle.',
  'Bu ay hesaplanan ve indirilecek KDV durumumuz nedir?',
  'Vadesi geçen alacaklarımızı yaşlandırmayla göster.',
  'Kurumlar vergisi oranı nedir, imalat/ihracat indirimi bize uygulanır mı?',
]
const BELGE_ISTEKLERI = [
  { l: 'Standart alanlar', t: '' },
  { l: 'KDV oranına göre matrah + KDV', t: 'Satıcı unvanı, vergi no, fatura no, tarih, her KDV oranı için matrah ve KDV tutarı, genel toplam, para birimi' },
  { l: 'Sadece satıcı, tarih, tutar', t: 'Satıcı unvanı, belge tarihi, genel toplam' },
  { l: 'Ödeme bilgileri', t: 'Vade tarihi, ödeme koşulu, IBAN, banka adı' },
  { l: 'Ekstre hareketleri', t: 'Tüm hareketler: tarih, açıklama, tutar, borç/alacak yönü, bakiye (tablo olarak)' },
]

type Msg = { role: 'user' | 'assistant'; content: string; araclar?: string[] }
type BelgeSatir = { ad: string; durum: 'bekliyor' | 'okunuyor' | 'tamam' | 'hata'; sonuc?: any; hata?: string }

const bosMevzuat = { kategori: '', anahtar: '', baslik: '', deger: '', gecerlilik_baslangic: '', gecerlilik_bitis: '', kaynak_adi: '', kaynak_url: '', guven: 'tek_kaynak', dogrulama_tarihi: '', notlar: '', aktif: true }

export default function MuhasebeAiPage() {
  const toast = useToast()
  const [tab, setTab] = useState('sor')

  /* ── Mevzuat bilgi tabanı ── */
  const [kb, setKb] = useState<any[]>([])
  const [kbYukleniyor, setKbYukleniyor] = useState(true)
  const [kbModal, setKbModal] = useState(false)
  const [kbEdit, setKbEdit] = useState<any>(null)
  const [kbForm, setKbForm] = useState<any>(bosMevzuat)
  const [busy, setBusy] = useState(false)
  const bugun = todayISO()
  const yas = (k: any) => Math.round((+new Date(bugun) - +new Date(k.dogrulama_tarihi)) / 86400000)
  const sorunlu = useMemo(() => ({
    bayat: kb.filter(k => k.aktif && yas(k) > BAYAT_GUN).length,
    tek: kb.filter(k => k.aktif && k.guven === 'tek_kaynak').length,
    bitmis: kb.filter(k => k.aktif && k.gecerlilik_bitis && k.gecerlilik_bitis < bugun).length,
    degisen: kb.filter(k => k.aktif && k.kontrol_sonucu === 'degismis_olabilir').length,
  }), [kb]) // eslint-disable-line

  const loadKb = useCallback(async () => {
    const { data, error } = await web.from('muhasebe_mevzuat').select('*').order('kategori').order('anahtar')
    if (error) toast.show(error.message, true)
    setKb(data || []); setKbYukleniyor(false)
  }, []) // eslint-disable-line
  useEffect(() => { loadKb() }, [loadKb])

  function kbAc(k?: any) {
    setKbEdit(k || null)
    setKbForm(k ? { ...bosMevzuat, ...Object.fromEntries(Object.entries(k).map(([a, v]) => [a, v ?? ''])) } : { ...bosMevzuat, dogrulama_tarihi: bugun })
    setKbModal(true)
  }
  async function kbKaydet(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    setBusy(true)
    const { data: { user } } = await createClient().auth.getUser()
    const p: any = {
      kategori: kbForm.kategori.trim(), anahtar: kbForm.anahtar.trim(), baslik: kbForm.baslik.trim(), deger: kbForm.deger.trim(),
      gecerlilik_baslangic: kbForm.gecerlilik_baslangic || null, gecerlilik_bitis: kbForm.gecerlilik_bitis || null,
      kaynak_adi: kbForm.kaynak_adi || null, kaynak_url: kbForm.kaynak_url || null, guven: kbForm.guven,
      dogrulama_tarihi: kbForm.dogrulama_tarihi || bugun, notlar: kbForm.notlar || null, aktif: !!kbForm.aktif,
      updated_at: new Date().toISOString(), updated_by: user?.id ?? null,
    }
    const { error } = kbEdit ? await web.from('muhasebe_mevzuat').update(p).eq('id', kbEdit.id) : await web.from('muhasebe_mevzuat').insert(p)
    setBusy(false)
    if (error) return toast.show(error.message.includes('duplicate') ? 'Bu anahtar zaten var' : error.message, true)
    setKbModal(false); toast.show('Kaydedildi'); loadKb()
  }
  async function kbDogrulandi(k: any) {
    const { data: { user } } = await createClient().auth.getUser()
    const { error } = await web.from('muhasebe_mevzuat').update({ dogrulama_tarihi: bugun, updated_at: new Date().toISOString(), updated_by: user?.id ?? null }).eq('id', k.id)
    if (error) return toast.show(error.message, true)
    toast.show('Doğrulama tarihi bugüne çekildi'); loadKb()
  }
  const [kontrolde, setKontrolde] = useState('')
  async function kbKontrol(k: any) {
    setKontrolde(k.id)
    try {
      const r = await aiIstek<{ sonuc: any }>('mevzuat_kontrol', { id: k.id }, ENDPOINT)
      toast.show(r.sonuc ? `Kontrol: ${KONTROL[r.sonuc.sonuc]?.l || r.sonuc.sonuc}` : 'Kontrol edilemedi', r.sonuc?.sonuc === 'degismis_olabilir'); await loadKb()
    } catch (e: any) { toast.show(e.message, true) }
    setKontrolde('')
  }
  async function kbSil(k: any) {
    if (!confirm(`"${k.baslik}" kaydı silinsin mi?`)) return
    const { error } = await web.from('muhasebe_mevzuat').delete().eq('id', k.id)
    if (error) return toast.show(error.message, true)
    toast.show('Silindi'); loadKb()
  }

  const kbCols: Col<any>[] = [
    { key: 'kat', label: 'Kategori', width: 130, sort: k => k.kategori, render: k => <Badge tone="muted">{k.kategori}</Badge> },
    { key: 'baslik', label: 'Kayıt', sort: k => k.baslik, render: k => <div><div style={{ fontWeight: 600, opacity: k.aktif ? 1 : .5 }}>{k.baslik}{!k.aktif && ' (pasif)'}</div><div style={{ fontSize: 12, color: 'var(--adm-tx2)', marginTop: 2, maxWidth: 560, lineHeight: 1.5 }}>{k.deger}</div>{k.notlar && <div style={{ fontSize: 11.5, color: 'var(--adm-amber)', marginTop: 3, maxWidth: 560 }}>⚠ {k.notlar}</div>}</div> },
    { key: 'guven', label: 'Güven', width: 150, sort: k => k.guven, render: k => <Badge tone={GUVEN[k.guven]?.tone}>{GUVEN[k.guven]?.l}</Badge>, hideSm: true },
    { key: 'gec', label: 'Geçerlilik', width: 150, sort: k => k.gecerlilik_baslangic || '', render: k => <span style={{ fontSize: 12 }}>{k.gecerlilik_baslangic ? fmtDate(k.gecerlilik_baslangic) : '?'} → {k.gecerlilik_bitis ? fmtDate(k.gecerlilik_bitis) : '—'}{k.gecerlilik_bitis && k.gecerlilik_bitis < bugun && <div><Badge tone="red">süresi dolmuş</Badge></div>}</span>, hideSm: true },
    { key: 'dog', label: 'Doğrulama', width: 130, sort: k => k.dogrulama_tarihi, render: k => <span style={{ fontSize: 12 }}>{fmtDate(k.dogrulama_tarihi)}{yas(k) > BAYAT_GUN && <div><Badge tone="amber">{yas(k)} gün önce</Badge></div>}</span> },
    { key: 'kontrol', label: 'Kaynak kontrolü', width: 170, sort: k => k.kontrol_sonucu || '', hideSm: true, render: k => k.kontrol_sonucu
      ? <div><Badge tone={KONTROL[k.kontrol_sonucu]?.tone}>{KONTROL[k.kontrol_sonucu]?.l}</Badge><div style={{ fontSize: 10.5, color: 'var(--adm-tx3)', marginTop: 3, lineHeight: 1.4 }}>{fmtDate(String(k.son_kontrol_at).slice(0, 10))}{k.kontrol_notu ? ` — ${String(k.kontrol_notu).slice(0, 110)}` : ''}</div></div>
      : <span style={{ fontSize: 11, color: 'var(--adm-tx3)' }}>henüz kontrol edilmedi</span> },
    { key: 'kaynak', label: 'Kaynak', width: 110, render: k => k.kaynak_url ? <a href={k.kaynak_url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--adm-ac)', fontSize: 12 }} title={k.kaynak_adi || ''}>Aç ↗</a> : <span style={{ color: 'var(--adm-tx3)' }}>—</span>, hideSm: true },
    { key: 'act', label: '', width: 160, align: 'right', render: k => <span style={{ display: 'inline-flex', gap: 4 }} onClick={e => e.stopPropagation()}>
      <button className="adm-btn-ghost" style={{ padding: '4px 7px' }} title="Kaynağı şimdi kontrol et" disabled={kontrolde === k.id || !k.kaynak_url} onClick={() => kbKontrol(k)}><RefreshCw size={12} className={kontrolde === k.id ? 'spin' : ''} /></button>
      <button className="adm-btn-ghost" style={{ padding: '4px 7px' }} title="Bugün doğruladım" onClick={() => kbDogrulandi(k)}><CheckCircle2 size={12} /></button>
      <button className="adm-btn-ghost" style={{ padding: '4px 7px' }} onClick={() => kbAc(k)}><Pencil size={12} /></button>
      <button className="adm-btn-danger" style={{ padding: '4px 7px' }} onClick={() => kbSil(k)}><Trash2 size={12} /></button></span> },
  ]

  /* ── Sohbet ── */
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [girdi, setGirdi] = useState('')
  const [loading, setLoading] = useState(false)
  const [belgeBaglam, setBelgeBaglam] = useState<{ ad: string; veri: string } | null>(null)
  const alt = useRef<HTMLDivElement>(null)
  useEffect(() => { alt.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  async function sor(metin: string) {
    const q = metin.trim(); if (!q || loading) return
    const yeni: Msg[] = [...msgs, { role: 'user', content: q }]
    setMsgs(yeni); setGirdi(''); setLoading(true)
    try {
      const r = await aiIstek<{ yanit: string; araclar: string[] }>('sor', { mesajlar: yeni.map(m => ({ role: m.role, content: m.content })), belge: belgeBaglam?.veri }, ENDPOINT)
      setMsgs(m => [...m, { role: 'assistant', content: r.yanit, araclar: r.araclar }])
    } catch (e: any) { toast.show(e.message, true); setMsgs(yeni.slice(0, -1)); setGirdi(q) }
    setLoading(false)
  }

  /* ── Belge ── */
  const [istek, setIstek] = useState('')
  const [belgeler, setBelgeler] = useState<BelgeSatir[]>([])
  const [okuyor, setOkuyor] = useState(false)
  const dosyaRef = useRef<HTMLInputElement>(null)

  async function belgeOku(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 6); e.target.value = ''
    if (!files.length) return
    setOkuyor(true)
    const baslangic = belgeler.length
    setBelgeler(b => [...b, ...files.map(f => ({ ad: f.name, durum: 'bekliyor' as const }))])
    const guncelle = (i: number, p: Partial<BelgeSatir>) => setBelgeler(b => b.map((x, j) => j === i ? { ...x, ...p } : x))
    for (let k = 0; k < files.length; k++) {
      const i = baslangic + k
      guncelle(i, { durum: 'okunuyor' })
      try {
        const dosya = await belgeDataUrl(files[k])
        const r = await aiIstek<{ sonuc: any }>('belge_cikar', { dosya, istek }, ENDPOINT)
        guncelle(i, { durum: 'tamam', sonuc: r.sonuc })
      } catch (err: any) { guncelle(i, { durum: 'hata', hata: err.message || 'Okunamadı' }) }
    }
    setOkuyor(false)
  }
  const kopyala = async (b: BelgeSatir) => {
    const s = b.sonuc; const tsv = [['Alan', 'Değer', 'Sayısal', 'Güven', 'Not'], ...s.alanlar.map((a: any) => [a.ad, a.deger, a.sayisal ?? '', a.guven, a.not])].map(r => r.join('\t')).join('\n')
    try { await navigator.clipboard.writeText(tsv); toast.show('Kopyalandı (Excel\'e yapıştırabilirsin)') } catch { toast.show('Kopyalanamadı', true) }
  }
  const csvAlanlar = (b: BelgeSatir) => csvDownload(`${b.ad.replace(/\.[^.]+$/, '')}-alanlar.csv`, b.sonuc.alanlar.map((a: any) => ({ Alan: a.ad, Değer: a.deger, Sayısal: a.sayisal ?? '', Güven: a.guven, Not: a.not })))
  const csvTablo = (b: BelgeSatir, t: any, i: number) => csvDownload(`${b.ad.replace(/\.[^.]+$/, '')}-tablo${i + 1}.csv`, t.satirlar.map((r: string[]) => Object.fromEntries(t.kolonlar.map((c: string, j: number) => [c || `Kolon ${j + 1}`, r[j] ?? '']))))
  function sohbeteEkle(b: BelgeSatir) {
    const s = b.sonuc
    setBelgeBaglam({ ad: b.ad, veri: JSON.stringify({ dosya: b.ad, belge_turu: s.belge_turu, ozet: s.ozet, alanlar: s.alanlar.map((a: any) => ({ ad: a.ad, deger: a.deger, sayisal: a.sayisal })), tablolar: s.tablolar.map((t: any) => ({ baslik: t.baslik, kolonlar: t.kolonlar, satirlar: t.satirlar.slice(0, 40) })), uyarilar: s.uyarilar }).slice(0, 9000) })
    setTab('sor'); toast.show('Belge sohbete eklendi — sorularını yazabilirsin')
  }

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Muhasebe AI" />
      <Page>
        <PageHead title="Muhasebe AI" sub="Güncel 2026 mevzuat bilgi tabanına dayalı muhasebe asistanı: soru sor, belge yükleyip istediğin verileri çıkar. Cevaplar yapay zeka ile üretilir; nihai karar mali müşavirindir." />

        {!kbYukleniyor && (sorunlu.bayat > 0 || sorunlu.bitmis > 0 || sorunlu.tek > 0 || sorunlu.degisen > 0) && (
          <div className="adm-card" style={{ padding: '10px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', borderColor: 'var(--adm-amber)' }}>
            <ShieldAlert size={17} style={{ color: 'var(--adm-amber)', flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, flex: 1 }}>
              Mevzuat bilgi tabanında dikkat: {sorunlu.degisen > 0 && <b style={{ color: 'var(--adm-red)' }}>{sorunlu.degisen} kayıtta kaynakta değişiklik olası{(sorunlu.tek || sorunlu.bayat || sorunlu.bitmis) ? ', ' : ''}</b>}{sorunlu.tek > 0 && <b>{sorunlu.tek} kayıt tek kaynaklı</b>}{sorunlu.tek > 0 && (sorunlu.bayat || sorunlu.bitmis) ? ', ' : ''}{sorunlu.bayat > 0 && <b>{sorunlu.bayat} kayıt {BAYAT_GUN}+ gündür doğrulanmadı</b>}{sorunlu.bayat > 0 && sorunlu.bitmis ? ', ' : ''}{sorunlu.bitmis > 0 && <b>{sorunlu.bitmis} kaydın süresi dolmuş</b>}. AI bunları cevaplarında uyarıyla belirtir.
            </span>
            <button className="adm-btn-ghost" style={{ fontSize: 12 }} onClick={() => setTab('mevzuat')}><BookOpen size={12} />İncele</button>
          </div>
        )}

        <div style={{ marginBottom: 14 }}><Tabs value={tab} onChange={setTab} tabs={[{ v: 'sor', l: 'Soru sor' }, { v: 'belge', l: 'Belge yükle', n: belgeler.length || undefined }, { v: 'mevzuat', l: 'Güncel mevzuat', n: kb.length || undefined }]} /></div>

        {tab === 'sor' && (
          <Card pad={0}>
            {belgeBaglam && <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--adm-bdr)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, background: 'var(--adm-s2)' }}><FileText size={13} />Belge bağlamı: <b>{belgeBaglam.ad}</b><button className="adm-btn-ghost" style={{ padding: '2px 8px', fontSize: 11.5, marginLeft: 'auto' }} onClick={() => setBelgeBaglam(null)}><X size={11} />Kaldır</button></div>}
            <div style={{ minHeight: 320, maxHeight: 'calc(100vh - 430px)', overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {msgs.length === 0 && (
                <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 640 }}>
                  <Sparkles size={28} style={{ color: 'var(--adm-ac)' }} />
                  <p style={{ fontSize: 13.5, color: 'var(--adm-tx3)', margin: '10px 0 6px' }}>Birden fazla soruyu tek mesajda sorabilirsin; her biri ayrı ayrı yanıtlanır.</p>
                  <p style={{ fontSize: 12, color: 'var(--adm-tx3)', margin: '0 0 14px' }}>Oran, limit ve ceza gibi değerler yalnızca <b>Güncel mevzuat</b> sekmesindeki kaynaklı kayıtlardan alınır; hesaplar hesap aracıyla yapılır.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>{ORNEKLER.map(o => <button key={o} className="adm-chip" style={{ textAlign: 'left' }} onClick={() => sor(o)}>{o}</button>)}</div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: 'min(760px, 92%)' }}>
                  <div style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.65, whiteSpace: 'pre-wrap', background: m.role === 'user' ? 'var(--adm-ac)' : 'var(--adm-s2)', color: m.role === 'user' ? '#fff' : 'var(--adm-tx)' }}>{m.content}</div>
                  {m.araclar && m.araclar.length > 0 && <div style={{ fontSize: 10.5, color: 'var(--adm-tx3)', marginTop: 4 }}>Kullanılan araçlar: {Array.from(new Set(m.araclar)).join(', ')}</div>}
                </div>
              ))}
              {loading && <div style={{ alignSelf: 'flex-start', fontSize: 12.5, color: 'var(--adm-tx3)' }}>Mevzuat ve verilerle çalışıyor…</div>}
              <div ref={alt} />
            </div>
            <form onSubmit={e => { e.preventDefault(); sor(girdi) }} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--adm-bdr)', alignItems: 'flex-end' }}>
              <textarea className="adm-inp" rows={2} value={girdi} onChange={e => setGirdi(e.target.value)} maxLength={3000} disabled={loading} placeholder="Sorularını yaz (Enter: gönder, Shift+Enter: yeni satır)…"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sor(girdi) } }} style={{ resize: 'vertical' }} />
              <button className="adm-btn" type="submit" disabled={loading || !girdi.trim()}><Send size={14} />Sor</button>
              {msgs.length > 0 && <button type="button" className="adm-btn-ghost" title="Sohbeti temizle" onClick={() => setMsgs([])}><Trash2 size={13} /></button>}
            </form>
          </Card>
        )}

        {tab === 'belge' && (
          <>
            <Card title={<><Upload size={14} />Belge yükle ve veri çıkar</>} pad={16}>
              <Field label="Hangi verileri istiyorsun?" hint="Serbestçe yaz; boş bırakırsan belge türüne uygun standart alanlar çıkarılır">
                <textarea className="adm-inp" rows={3} value={istek} onChange={e => setIstek(e.target.value)} maxLength={800} placeholder="Örn: satıcı unvanı, vergi no, fatura no, tarih, %20 ve %10 KDV matrahları, genel toplam, vade" />
              </Field>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0 14px' }}>{BELGE_ISTEKLERI.map(o => <button key={o.l} type="button" className="adm-chip" onClick={() => setIstek(o.t)}>{o.l}</button>)}</div>
              <button className="adm-btn" disabled={okuyor} onClick={() => dosyaRef.current?.click()}><Upload size={14} />{okuyor ? 'Okunuyor…' : 'Belge seç (fotoğraf veya PDF, en fazla 6)'}</button>
              <input ref={dosyaRef} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={belgeOku} style={{ display: 'none' }} />
              <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'var(--adm-tx3)' }}>Belgeler işlenmek üzere OpenAI'a gönderilir ve sunucuda saklanmaz. Vergi no gibi kimlik bilgileri içerebilir; KVKK aydınlatmanıza uygun kullanın. Fotoğraflar 1800 px'e küçültülür, PDF en fazla 3 MB.</p>
            </Card>

            {belgeler.map((b, i) => (
              <div key={i} style={{ marginTop: 14 }}>
                <Card title={<><FileText size={14} />{b.ad}{b.sonuc && <Badge tone="blue">{b.sonuc.belge_turu}</Badge>}</>}
                  right={<button className="adm-btn-ghost" style={{ padding: '3px 8px' }} onClick={() => setBelgeler(x => x.filter((_, j) => j !== i))}><X size={12} /></button>} pad={16}>
                  {b.durum === 'bekliyor' && <span style={{ fontSize: 13, color: 'var(--adm-tx3)' }}>Sırada…</span>}
                  {b.durum === 'okunuyor' && <span style={{ fontSize: 13, color: 'var(--adm-tx3)' }}>Belge okunuyor…</span>}
                  {b.durum === 'hata' && <span style={{ fontSize: 13, color: 'var(--adm-red)' }}>⚠ {b.hata}</span>}
                  {b.durum === 'tamam' && b.sonuc && <>
                    {b.sonuc.ozet && <p style={{ margin: '0 0 12px', fontSize: 13 }}>{b.sonuc.ozet}</p>}
                    {b.sonuc.uyarilar?.length > 0 && <div style={{ padding: 10, borderRadius: 9, background: 'var(--adm-amber2)', color: 'var(--adm-amber)', fontSize: 12.5, marginBottom: 12 }}>{b.sonuc.uyarilar.map((u: string, j: number) => <div key={j}>⚠ {u}</div>)}</div>}
                    <table className="adm-table" style={{ width: '100%' }}>
                      <thead><tr><th style={{ textAlign: 'left' }}>Alan</th><th style={{ textAlign: 'left' }}>Değer</th><th style={{ textAlign: 'right' }}>Sayısal</th><th>Güven</th></tr></thead>
                      <tbody>{b.sonuc.alanlar.map((a: any, j: number) => <tr key={j}><td style={{ fontWeight: 600 }}>{a.ad}</td><td>{a.deger || <span style={{ color: 'var(--adm-tx3)' }}>okunamadı</span>}{a.not && <div style={{ fontSize: 11, color: 'var(--adm-tx3)' }}>{a.not}</div>}</td><td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono,monospace' }}>{a.sayisal ?? ''}</td><td><Badge tone={OKUMA[a.guven] || 'muted'}>{a.guven}</Badge></td></tr>)}</tbody>
                    </table>
                    {b.sonuc.tablolar?.map((t: any, ti: number) => (
                      <div key={ti} style={{ marginTop: 14, overflowX: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><b style={{ fontSize: 13 }}>{t.baslik || `Tablo ${ti + 1}`}</b><span style={{ fontSize: 11.5, color: 'var(--adm-tx3)' }}>{t.satirlar.length} satır</span><button className="adm-btn-ghost" style={{ padding: '2px 8px', fontSize: 11.5 }} onClick={() => csvTablo(b, t, ti)}><Download size={11} />CSV</button></div>
                        <table className="adm-table" style={{ width: '100%' }}><thead><tr>{t.kolonlar.map((c: string, ci: number) => <th key={ci} style={{ textAlign: 'left' }}>{c}</th>)}</tr></thead><tbody>{t.satirlar.slice(0, 60).map((r: string[], ri: number) => <tr key={ri}>{t.kolonlar.map((_: any, ci: number) => <td key={ci}>{r[ci]}</td>)}</tr>)}</tbody></table>
                      </div>))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                      <button className="adm-btn-ghost" onClick={() => csvAlanlar(b)}><Download size={13} />Alanları CSV indir</button>
                      <button className="adm-btn-ghost" onClick={() => kopyala(b)}><Copy size={13} />Kopyala</button>
                      <button className="adm-btn" onClick={() => sohbeteEkle(b)}><MessageSquare size={13} />Bu belgeyle sohbet et</button>
                    </div>
                  </>}
                </Card>
              </div>
            ))}
          </>
        )}

        {tab === 'mevzuat' && (
          <>
            <div style={{ fontSize: 12.5, color: 'var(--adm-tx3)', marginBottom: 12, lineHeight: 1.6 }}>
              AI'ın oran, limit, had, ceza ve faiz gibi değerleri <b>yalnızca bu kayıtlardan</b> aldığı bilgi tabanıdır (kendi hafızasından değil). Her kaydın kaynağı, geçerlilik aralığı ve doğrulama tarihi vardır. Yeni bir tebliğ/karar çıktığında burayı güncelle; eksik bir konu varsa kayıt ekle. Değerleri resmî kaynaktan (GİB, Resmî Gazete, ÇSGB, SGK) teyit ettikten sonra "Bugün doğruladım" ile işaretle.
            </div>
            <DataGrid rows={kb} cols={kbCols} rowKey={k => k.id} loading={kbYukleniyor} csvName="mevzuat-bilgi-tabani" storageKey="mevzuat"
              searchText={k => `${k.baslik} ${k.deger} ${k.kategori} ${k.anahtar}`} searchPlaceholder="Kayıt ara…"
              actions={<button className="adm-btn" onClick={() => kbAc()}><Plus size={14} />Kayıt Ekle</button>} emptyTitle="Bilgi tabanı boş" />
          </>
        )}
      </Page>

      <Modal open={kbModal} onClose={() => setKbModal(false)} onSubmit={kbKaydet} width={720} title={kbEdit ? 'Mevzuat Kaydını Düzenle' : 'Yeni Mevzuat Kaydı'}
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setKbModal(false)}>İptal</button><button type="submit" className="adm-btn" disabled={busy}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button></>}>
        <FormGrid cols={2}>
          <Field label="Kategori *"><input className="adm-inp" required list="mev-kat" value={kbForm.kategori} onChange={e => setKbForm((f: any) => ({ ...f, kategori: e.target.value }))} /><datalist id="mev-kat">{['kdv', 'gelir_vergisi', 'kurumlar_vergisi', 'ucret', 'usul', 'damga', 'stopaj', 'faiz', 'e_belge', 'sgk'].map(k => <option key={k} value={k} />)}</datalist></Field>
          <Field label="Anahtar *" hint="Benzersiz kısa ad (örn. gecikme_zammi)"><input className="adm-inp" required disabled={!!kbEdit} value={kbForm.anahtar} onChange={e => setKbForm((f: any) => ({ ...f, anahtar: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_') }))} /></Field>
          <Field label="Başlık *" span={2}><input className="adm-inp" required value={kbForm.baslik} onChange={e => setKbForm((f: any) => ({ ...f, baslik: e.target.value }))} /></Field>
          <Field label="Değer *" span={2} hint="AI'ın kullanacağı net bilgi: oran, tutar, dilimler, tarihler"><textarea className="adm-inp" required rows={4} value={kbForm.deger} onChange={e => setKbForm((f: any) => ({ ...f, deger: e.target.value }))} /></Field>
          <Field label="Geçerlilik başlangıcı"><input type="date" className="adm-inp" value={kbForm.gecerlilik_baslangic} onChange={e => setKbForm((f: any) => ({ ...f, gecerlilik_baslangic: e.target.value }))} /></Field>
          <Field label="Geçerlilik bitişi" hint="Süresiz/bilinmiyorsa boş"><input type="date" className="adm-inp" value={kbForm.gecerlilik_bitis} onChange={e => setKbForm((f: any) => ({ ...f, gecerlilik_bitis: e.target.value }))} /></Field>
          <Field label="Kaynak adı"><input className="adm-inp" value={kbForm.kaynak_adi} onChange={e => setKbForm((f: any) => ({ ...f, kaynak_adi: e.target.value }))} placeholder="Örn. GİB, Resmî Gazete 31.12.2025" /></Field>
          <Field label="Kaynak bağlantısı"><input type="url" className="adm-inp" value={kbForm.kaynak_url} onChange={e => setKbForm((f: any) => ({ ...f, kaynak_url: e.target.value }))} placeholder="https://" /></Field>
          <Field label="Güven düzeyi"><select className="adm-inp" value={kbForm.guven} onChange={e => setKbForm((f: any) => ({ ...f, guven: e.target.value }))}><option value="resmi">Resmi kaynaktan</option><option value="coklu_kaynak">Birden çok kaynakta doğrulandı</option><option value="tek_kaynak">Tek kaynak — teyit gerekir</option></select></Field>
          <Field label="Doğrulama tarihi"><input type="date" className="adm-inp" value={kbForm.dogrulama_tarihi} onChange={e => setKbForm((f: any) => ({ ...f, dogrulama_tarihi: e.target.value }))} /></Field>
          <Field label="Not / uyarı" span={2}><textarea className="adm-inp" rows={2} value={kbForm.notlar} onChange={e => setKbForm((f: any) => ({ ...f, notlar: e.target.value }))} placeholder="AI cevabında kullanıcıya aktaracağı uyarı (örn. yürürlük tarihi teyit edilmeli)" /></Field>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={!!kbForm.aktif} onChange={e => setKbForm((f: any) => ({ ...f, aktif: e.target.checked }))} />Aktif (AI kullanır)</label>
        </FormGrid>
      </Modal>
      {toast.node}
    </div>
  )
}
