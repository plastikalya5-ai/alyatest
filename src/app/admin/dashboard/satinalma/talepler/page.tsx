'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminTopBar from '@/components/admin/TopBar'
import { web } from '@/lib/web-data'
import { createClient } from '@/lib/supabase/client'
import { fmt, fmtN, fmtDate } from '@/lib/fmt'
import { Page, PageHead, Kpi, KpiGrid, Badge, Tabs, Modal, Field, FormGrid, Card, useToast } from '@/components/admin/erp/ui'
import { DataGrid, type Col } from '@/components/admin/erp/DataGrid'
import { Plus, ClipboardList, Scale, CheckCircle2, Trash2, ShoppingCart, ExternalLink } from 'lucide-react'

const DURUM: Record<string, { l: string; tone: any }> = { beklemede: { l: 'Teklif bekliyor', tone: 'amber' }, siparise_donustu: { l: 'Siparişe döndü', tone: 'green' }, reddedildi: { l: 'Reddedildi', tone: 'red' }, iptal: { l: 'İptal', tone: 'muted' } }
const bugun = () => new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10)
const bosTalep = { hammadde_id: '', miktar: '', gerekce: '', istenen_tarih: '' }
const bosTeklif = { tedarikci_id: '', birim_fiyat: '', teslim_gun: '', vade_gun: '', gecerlilik: '', notlar: '' }

export default function TaleplerPage() {
  const toast = useToast()
  const [talepler, setTalepler] = useState<any[]>([])
  const [teklifler, setTeklifler] = useState<any[]>([])
  const [ham, setHam] = useState<any[]>([])
  const [ted, setTed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('beklemede')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>(bosTalep)
  const [secili, setSecili] = useState<string | null>(null)
  const [tf, setTf] = useState<any>(bosTeklif)
  const [busy, setBusy] = useState(false)

  const yukle = useCallback(async () => {
    const [t, k, h, c] = await Promise.all([
      web.from('satinalma_talepleri').select('*').order('created_at', { ascending: false }).limit(1000),
      web.from('satinalma_teklifleri').select('*').limit(5000),
      web.from('hammaddeler').select('id,kod,ad,birim,mevcut_stok,min_stok,max_stok,ortalama_maliyet,tedarikci_id,aktif').order('ad').limit(3000),
      web.from('cari_hesaplar').select('id,ad,tip').eq('tip', 'tedarikci').order('ad').limit(2000),
    ])
    const hata = t.error || k.error || h.error || c.error
    if (hata) toast.show(hata.message, true)
    setTalepler(t.data || []); setTeklifler(k.data || []); setHam(h.data || []); setTed(c.data || []); setLoading(false)
  }, []) // eslint-disable-line
  useEffect(() => { yukle() }, [yukle])

  const hamId = useMemo(() => Object.fromEntries(ham.map(h => [h.id, h])), [ham])
  const tedId = useMemo(() => Object.fromEntries(ted.map(t => [t.id, t])), [ted])
  const teklifSay = useMemo(() => { const o: Record<string, any[]> = {}; teklifler.forEach(k => (o[k.talep_id] ||= []).push(k)); return o }, [teklifler])
  const cnt = (d: string) => talepler.filter(t => t.durum === d).length
  const liste = talepler.filter(t => tab === 'hepsi' ? true : t.durum === tab)
  const aktif = talepler.find(t => t.id === secili) || null

  const sonrakiNo = () => { const p = `TL-${new Date().getFullYear()}-`; return p + String(Math.max(0, ...talepler.filter(t => t.no?.startsWith(p)).map(t => +t.no.slice(p.length) || 0)) + 1).padStart(4, '0') }
  const oneri = (h: any) => Math.max(Math.ceil((+h.max_stok || (+h.min_stok || 0) * 3) - (+h.mevcut_stok || 0)), 1)

  async function talepKaydet(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    const miktar = +form.miktar; if (!form.hammadde_id || !(miktar > 0)) return toast.show('Hammadde ve miktar gerekli', true)
    setBusy(true)
    const { data: { user } } = await createClient().auth.getUser()
    const { data, error } = await web.from('satinalma_talepleri').insert({ no: sonrakiNo(), hammadde_id: form.hammadde_id, miktar, gerekce: form.gerekce || null, istenen_tarih: form.istenen_tarih || null, created_by: user?.id ?? null }).select('id').single()
    setBusy(false)
    if (error) return toast.show(error.message.includes('duplicate') ? 'Talep numarası çakıştı, tekrar deneyin' : error.message, true)
    setModal(false); toast.show('Talep oluşturuldu'); await yukle(); setSecili(data.id)
  }
  async function teklifEkle(e: React.FormEvent) {
    e.preventDefault(); if (busy || !aktif) return
    const fiyat = +tf.birim_fiyat; if (!tf.tedarikci_id || !(fiyat >= 0) || tf.birim_fiyat === '') return toast.show('Tedarikçi ve birim fiyat gerekli', true)
    setBusy(true)
    const { error } = await web.from('satinalma_teklifleri').insert({ talep_id: aktif.id, tedarikci_id: tf.tedarikci_id, birim_fiyat: fiyat, teslim_gun: tf.teslim_gun === '' ? null : +tf.teslim_gun, vade_gun: tf.vade_gun === '' ? null : +tf.vade_gun, gecerlilik: tf.gecerlilik || null, notlar: tf.notlar || null })
    setBusy(false)
    if (error) return toast.show(error.message.includes('duplicate') ? 'Bu tedarikçiden zaten teklif var; önce silin' : error.message, true)
    setTf(bosTeklif); toast.show('Teklif eklendi'); yukle()
  }
  async function teklifSil(k: any) {
    if (!confirm('Teklif silinsin mi?')) return
    const { error } = await web.from('satinalma_teklifleri').delete().eq('id', k.id)
    if (error) return toast.show(error.message, true); yukle()
  }
  async function sec(k: any) {
    if (busy) return
    const t = aktif!, f = k.birim_fiyat * t.miktar
    if (k.gecerlilik && k.gecerlilik < bugun() && !confirm('Bu teklifin geçerlilik süresi dolmuş. Yine de sipariş oluşturulsun mu?')) return
    if (!confirm(`${tedId[k.tedarikci_id]?.ad} teklifi (${fmt(f)}) ile satınalma siparişi oluşturulsun mu?`)) return
    setBusy(true)
    const { data, error } = await web.rpc('rpc_satinalma_teklif_siparise_cevir', { p_teklif_id: k.id })
    setBusy(false)
    if (error) return toast.show(error.message, true)
    toast.show('Sipariş oluşturuldu'); await yukle(); return data
  }
  async function durumDegis(t: any, durum: string) {
    if (!confirm(`${t.no} ${durum === 'reddedildi' ? 'reddedilsin' : 'iptal edilsin'} mi?`)) return
    const { error } = await web.from('satinalma_talepleri').update({ durum, updated_at: new Date().toISOString() }).eq('id', t.id).eq('durum', 'beklemede')
    if (error) return toast.show(error.message, true); yukle()
  }

  const cols: Col<any>[] = [
    { key: 'no', label: 'Talep', width: 120, sort: t => t.no, render: t => <b>{t.no}</b> },
    { key: 'ham', label: 'Hammadde', sort: t => hamId[t.hammadde_id]?.ad || '', render: t => hamId[t.hammadde_id]?.ad || '—' },
    { key: 'mik', label: 'Miktar', width: 110, align: 'right', sort: t => +t.miktar, render: t => `${fmtN(+t.miktar, 0)} ${hamId[t.hammadde_id]?.birim || ''}` },
    { key: 'ist', label: 'İstenen tarih', width: 120, sort: t => t.istenen_tarih || '', render: t => t.istenen_tarih ? <span style={{ color: t.durum === 'beklemede' && t.istenen_tarih < bugun() ? 'var(--adm-red)' : undefined }}>{fmtDate(t.istenen_tarih)}</span> : '—', hideSm: true },
    { key: 'tk', label: 'Teklif', width: 80, align: 'right', sort: t => (teklifSay[t.id] || []).length, render: t => (teklifSay[t.id] || []).length || <span style={{ color: 'var(--adm-tx3)' }}>—</span> },
    { key: 'en', label: 'En iyi fiyat', width: 120, align: 'right', render: t => { const l = teklifSay[t.id] || []; return l.length ? fmt(Math.min(...l.map(k => +k.birim_fiyat))) : '—' }, hideSm: true },
    { key: 'du', label: 'Durum', width: 130, sort: t => t.durum, render: t => <Badge tone={DURUM[t.durum]?.tone}>{DURUM[t.durum]?.l}</Badge> },
  ]

  // Teklif karşılaştırma: en ucuz ve en hızlı vurgulanır
  const aktifTeklif = aktif ? (teklifSay[aktif.id] || []).slice().sort((a, b) => a.birim_fiyat - b.birim_fiyat) : []
  const enUcuz = aktifTeklif[0]?.birim_fiyat
  const teslimler = aktifTeklif.map(k => k.teslim_gun).filter((x: any) => x != null)
  const enHizli = teslimler.length ? Math.min(...teslimler) : null
  const hm = aktif ? hamId[aktif.hammadde_id] : null

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Satınalma Talepleri" />
      <Page>
        <PageHead title="Satınalma Talepleri ve Teklifler" sub="Talep aç → tedarikçilerden teklif topla → karşılaştır → seçileni tek tıkla siparişe çevir"
          actions={<><Link href="/admin/dashboard/satinalma/siparisler" className="adm-btn-ghost" style={{ textDecoration: 'none' }}><ExternalLink size={13} />Siparişler</Link><button className="adm-btn" onClick={() => { setForm(bosTalep); setModal(true) }}><Plus size={14} />Yeni Talep</button></>} />
        <KpiGrid min={170}>
          <Kpi label="Teklif bekleyen" value={cnt('beklemede')} Icon={ClipboardList} color="var(--adm-amber)" sub={`${talepler.filter(t => t.durum === 'beklemede' && !(teklifSay[t.id] || []).length).length} talepte hiç teklif yok`} />
          <Kpi label="Siparişe dönen" value={cnt('siparise_donustu')} Icon={CheckCircle2} color="var(--adm-green)" />
          <Kpi label="Toplam teklif" value={teklifler.length} Icon={Scale} color="var(--adm-blue)" />
        </KpiGrid>
        <div style={{ margin: '12px 0' }}><Tabs value={tab} onChange={setTab} tabs={[{ v: 'beklemede', l: 'Teklif bekleyen', n: cnt('beklemede') }, { v: 'siparise_donustu', l: 'Siparişe dönen', n: cnt('siparise_donustu') }, { v: 'reddedildi', l: 'Reddedilen', n: cnt('reddedildi') }, { v: 'iptal', l: 'İptal', n: cnt('iptal') }, { v: 'hepsi', l: 'Tümü', n: talepler.length }]} /></div>
        <DataGrid rows={liste} cols={cols} rowKey={t => t.id} loading={loading} csvName="satinalma-talepleri" storageKey="satinalma-talepleri" onRowClick={t => { setSecili(t.id); setTf(bosTeklif) }}
          searchText={t => `${t.no} ${hamId[t.hammadde_id]?.ad || ''} ${t.gerekce || ''}`} searchPlaceholder="Talep no, hammadde…" emptyTitle="Talep yok" emptySub="“Yeni Talep” ile başlayın; teklifleri talebin içinde toplarsınız" />
      </Page>

      <Modal open={modal} onClose={() => setModal(false)} onSubmit={talepKaydet} width={560} title="Yeni Satınalma Talebi"
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setModal(false)}>İptal</button><button type="submit" className="adm-btn" disabled={busy}>Talep Aç</button></>}>
        <FormGrid cols={2}>
          <Field label="Hammadde *" span={2}><select className="adm-inp" required value={form.hammadde_id} onChange={e => { const h = hamId[e.target.value]; setForm((f: any) => ({ ...f, hammadde_id: e.target.value, miktar: h ? String(oneri(h)) : f.miktar })) }}><option value="">— Seçin —</option>{ham.filter(h => h.aktif !== false).map(h => <option key={h.id} value={h.id}>{h.ad} ({h.kod}) — stok {fmtN(+h.mevcut_stok || 0, 0)} {h.birim || ''}</option>)}</select></Field>
          <Field label="Miktar *" hint={form.hammadde_id && hamId[form.hammadde_id] ? `Önerilen: ${oneri(hamId[form.hammadde_id])} (min/maks stoğa göre)` : undefined}><input type="number" min="0" step="any" className="adm-inp" required value={form.miktar} onChange={e => setForm((f: any) => ({ ...f, miktar: e.target.value }))} /></Field>
          <Field label="İstenen tarih"><input type="date" className="adm-inp" min={bugun()} value={form.istenen_tarih} onChange={e => setForm((f: any) => ({ ...f, istenen_tarih: e.target.value }))} /></Field>
          <Field label="Gerekçe" span={2}><input className="adm-inp" maxLength={500} value={form.gerekce} onChange={e => setForm((f: any) => ({ ...f, gerekce: e.target.value }))} placeholder="Örn. Kritik stok, X siparişi için" /></Field>
        </FormGrid>
      </Modal>

      <Modal open={!!aktif} onClose={() => setSecili(null)} width={900} title={aktif ? `${aktif.no} — ${hm?.ad || ''}` : ''} footer={aktif && <>
        {aktif.durum === 'beklemede' && <><button className="adm-btn-danger" style={{ marginRight: 'auto' }} onClick={() => durumDegis(aktif, 'iptal')}>Talebi iptal et</button><button className="adm-btn-ghost" onClick={() => durumDegis(aktif, 'reddedildi')}>Reddet</button></>}
        <button className="adm-btn-ghost" onClick={() => setSecili(null)}>Kapat</button></>}>
        {aktif && <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 13, marginBottom: 12, alignItems: 'center' }}>
            <Badge tone={DURUM[aktif.durum]?.tone}>{DURUM[aktif.durum]?.l}</Badge>
            <span><b>{fmtN(+aktif.miktar, 0)} {hm?.birim}</b></span>
            {aktif.istenen_tarih && <span>İstenen: {fmtDate(aktif.istenen_tarih)}</span>}
            {hm && <span style={{ color: 'var(--adm-tx3)' }}>Mevcut stok {fmtN(+hm.mevcut_stok || 0, 0)} · ortalama maliyet {fmt(+hm.ortalama_maliyet || 0)}</span>}
            {aktif.gerekce && <span style={{ color: 'var(--adm-tx3)' }}>“{aktif.gerekce}”</span>}
          </div>
          <Card title={`Teklifler (${aktifTeklif.length})`} pad={0}>
            {aktifTeklif.length === 0 ? <p style={{ margin: 0, padding: '12px 18px', fontSize: 12.5, color: 'var(--adm-tx3)' }}>Henüz teklif yok. Aşağıdan tedarikçi teklifini ekleyin.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>{['Tedarikçi', 'Birim fiyat', 'Toplam', 'Fark*', 'Termin', 'Vade', 'Geçerlilik', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>{aktifTeklif.map(k => {
                  const fark = hm?.ortalama_maliyet > 0 ? ((k.birim_fiyat - hm.ortalama_maliyet) / hm.ortalama_maliyet) * 100 : null
                  const dolmus = k.gecerlilik && k.gecerlilik < bugun()
                  const secildi = aktif.secilen_teklif_id === k.id
                  return (
                    <tr key={k.id} className="adm-row" style={secildi ? { background: 'rgba(31,157,99,.12)' } : undefined}>
                      <td style={td}><b>{tedId[k.tedarikci_id]?.ad || '—'}</b>{secildi && <Badge tone="green" style={{ marginLeft: 6 }}>seçildi</Badge>}{k.notlar && <div style={{ fontSize: 11, color: 'var(--adm-tx3)' }}>{k.notlar}</div>}</td>
                      <td style={td}>{fmt(+k.birim_fiyat)}{k.birim_fiyat === enUcuz && aktifTeklif.length > 1 && <Badge tone="green" style={{ marginLeft: 6 }}>en ucuz</Badge>}</td>
                      <td style={td}>{fmt(k.birim_fiyat * aktif.miktar)}</td>
                      <td style={{ ...td, color: fark == null ? undefined : fark > 0 ? 'var(--adm-red)' : 'var(--adm-green)' }}>{fark == null ? '—' : `${fark > 0 ? '+' : ''}${fmtN(fark, 1)}%`}</td>
                      <td style={td}>{k.teslim_gun != null ? `${k.teslim_gun} gün` : '—'}{k.teslim_gun != null && k.teslim_gun === enHizli && aktifTeklif.length > 1 && <Badge tone="blue" style={{ marginLeft: 6 }}>en hızlı</Badge>}</td>
                      <td style={td}>{k.vade_gun != null ? `${k.vade_gun} gün` : '—'}</td>
                      <td style={{ ...td, color: dolmus ? 'var(--adm-red)' : undefined }}>{k.gecerlilik ? fmtDate(k.gecerlilik) + (dolmus ? ' (doldu)' : '') : '—'}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>{aktif.durum === 'beklemede' && <>
                        <button className="adm-btn" style={{ padding: '4px 10px', fontSize: 12 }} disabled={busy} onClick={() => sec(k)}><ShoppingCart size={12} />Seç ve sipariş ver</button>{' '}
                        <button className="adm-btn-danger" style={{ padding: '4px 7px' }} onClick={() => teklifSil(k)}><Trash2 size={12} /></button></>}</td>
                    </tr>)
                })}</tbody>
              </table>)}
            <p style={{ fontSize: 11, color: 'var(--adm-tx3)', margin: 0, padding: '6px 18px 10px' }}>* Fark: teklifin hammaddenin ortalama maliyetine göre yüzde farkı. Fiyatlar TL ve KDV hariç girilmelidir; en ucuz teklif her zaman en iyisi olmayabilir (termin ve vadeye de bakın).</p>
          </Card>

          {aktif.durum === 'beklemede' && (
            <form onSubmit={teklifEkle} style={{ marginTop: 14 }}>
              <b style={{ fontSize: 13 }}>Teklif ekle</b>
              <FormGrid cols={4}>
                <Field label="Tedarikçi *" span={2}><select className="adm-inp" required value={tf.tedarikci_id} onChange={e => setTf((f: any) => ({ ...f, tedarikci_id: e.target.value }))}><option value="">— Seçin —</option>{ted.filter(t => !(teklifSay[aktif.id] || []).some(k => k.tedarikci_id === t.id)).map(t => <option key={t.id} value={t.id}>{t.ad}</option>)}</select></Field>
                <Field label="Birim fiyat (TL, KDV hariç) *"><input type="number" min="0" step="any" required className="adm-inp" value={tf.birim_fiyat} onChange={e => setTf((f: any) => ({ ...f, birim_fiyat: e.target.value }))} /></Field>
                <Field label="Termin (gün)"><input type="number" min="0" max="365" className="adm-inp" value={tf.teslim_gun} onChange={e => setTf((f: any) => ({ ...f, teslim_gun: e.target.value }))} /></Field>
                <Field label="Vade (gün)"><input type="number" min="0" max="365" className="adm-inp" value={tf.vade_gun} onChange={e => setTf((f: any) => ({ ...f, vade_gun: e.target.value }))} /></Field>
                <Field label="Geçerlilik"><input type="date" className="adm-inp" value={tf.gecerlilik} onChange={e => setTf((f: any) => ({ ...f, gecerlilik: e.target.value }))} /></Field>
                <Field label="Not" span={2}><input className="adm-inp" maxLength={500} value={tf.notlar} onChange={e => setTf((f: any) => ({ ...f, notlar: e.target.value }))} /></Field>
              </FormGrid>
              {ted.length === 0 && <p style={{ fontSize: 12, color: 'var(--adm-amber)' }}>Tedarikçi bulunamadı. Muhasebe → Cari Hesaplar’dan türü “Tedarikçi” olan bir cari ekleyin.</p>}
              <button className="adm-btn" style={{ marginTop: 10 }} disabled={busy}>Teklifi Ekle</button>
            </form>)}
          {aktif.durum === 'siparise_donustu' && <p style={{ fontSize: 12.5, color: 'var(--adm-tx3)' }}>Sipariş oluşturuldu. <Link href="/admin/dashboard/satinalma/siparisler">Siparişler</Link> sayfasından onaylayıp teslim alabilirsiniz.</p>}
        </>}
      </Modal>
      {toast.node}
    </div>
  )
}
const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: 11, color: 'var(--adm-tx3)', borderBottom: '1px solid var(--adm-bdr)', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--adm-bdr)' }
