'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { fmt, fmtDate, fmtK, todayISO } from '@/lib/fmt'
import { DONEMLER, donemAralik, inRange, sum, isPnl, NON_PNL, type Donem } from '@/lib/muh-utils'
import { Page, PageHead, Kpi, KpiGrid, Badge, Tabs, Money, Drawer, Modal, Field, FormGrid, InfoRow, Divider, useToast } from '@/components/admin/erp/ui'
import { DataGrid, type Col } from '@/components/admin/erp/DataGrid'
import { Plus, ArrowUpRight, ArrowDownRight, Scale, Hash, Pencil, Trash2, Copy, Landmark, Users2, CreditCard } from 'lucide-react'

const ODEME: Record<string, string> = { nakit: 'Nakit', havale: 'Havale/EFT', kredi_karti: 'Kredi Kartı', cek: 'Çek', diger: 'Diğer' }
const bosForm = () => ({ tip: 'gelir' as 'gelir' | 'gider', kategori: '', tutar: '', aciklama: '', tarih: todayISO(), odeme_yontemi: 'nakit', cari_id: '', kasa_hesap_id: '' })

export default function IslemlerPage() {
  const toast = useToast()
  const [rows, setRows] = useState<any[]>([])
  const [kats, setKats] = useState<any[]>([])
  const [cariler, setCariler] = useState<any[]>([])
  const [kasalar, setKasalar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [tip, setTip] = useState('hepsi')
  const [donem, setDonem] = useState<Donem>('tumu')
  const [kat, setKat] = useState('')
  const [hesap, setHesap] = useState('')
  const [yontem, setYontem] = useState('')
  const [cariF, setCariF] = useState('')
  const [gizleOzel, setGizleOzel] = useState(false)

  const [detay, setDetay] = useState<any>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(bosForm())
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [i, k, c, h] = await Promise.all([
      muh.all('islemler', '*', q => q.order('tarih', { ascending: false }).order('created_at', { ascending: false })),
      muh.from('muhasebe_kategoriler').select('*').order('ad', { ascending: true }),
      muh.all('cari_hesaplar', 'id,ad,tip'),
      muh.all('kasa_banka_hesaplari', 'id,ad,tip,bakiye,aktif'),
    ])
    setRows(i); setKats(k.data || []); setCariler(c); setKasalar(h); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const cariAd = useMemo(() => Object.fromEntries(cariler.map(c => [c.id, c.ad])), [cariler])
  const kasaAd = useMemo(() => Object.fromEntries(kasalar.map(k => [k.id, k.ad])), [kasalar])

  const R = donemAralik(donem)
  const filtered = useMemo(() => rows.filter(i => {
    if (tip !== 'hepsi' && i.tip !== tip) return false
    if (!inRange(i.tarih, R.from, R.to)) return R.from ? false : true
    if (kat && i.kategori !== kat) return false
    if (hesap && (hesap === '_yok' ? i.kasa_hesap_id : i.kasa_hesap_id !== hesap)) return false
    if (yontem && i.odeme_yontemi !== yontem) return false
    if (cariF && i.cari_id !== cariF) return false
    if (gizleOzel && NON_PNL.includes(i.kategori)) return false
    return true
  }), [rows, tip, R.from, R.to, kat, hesap, yontem, cariF, gizleOzel])

  const pnlRows = filtered.filter(isPnl)
  const gelir = sum(pnlRows.filter(i => i.tip === 'gelir'), i => i.tutar)
  const gider = sum(pnlRows.filter(i => i.tip === 'gider'), i => i.tutar)
  const sayGelir = filtered.filter(i => i.tip === 'gelir').length
  const kategoriler = useMemo(() => Array.from(new Set(rows.map(r => r.kategori).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'tr')), [rows])

  function openNew(t: 'gelir' | 'gider' = 'gelir', prefill?: any) {
    setEditing(null); setForm({ ...bosForm(), tip: t, ...prefill }); setModal(true)
  }
  function openEdit(r: any) {
    setEditing(r)
    setForm({ tip: r.tip, kategori: r.kategori || '', tutar: String(r.tutar), aciklama: r.aciklama || '', tarih: r.tarih, odeme_yontemi: r.odeme_yontemi || 'nakit', cari_id: r.cari_id || '', kasa_hesap_id: r.kasa_hesap_id || '' })
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    const tutar = +form.tutar
    if (!(tutar > 0)) { toast.show('Tutar 0’dan büyük olmalı', true); return }
    setBusy(true)
    const payload = { tip: form.tip, kategori: form.kategori.trim(), tutar, aciklama: form.aciklama || null, tarih: form.tarih, odeme_yontemi: form.odeme_yontemi, cari_id: form.cari_id || null, kasa_hesap_id: form.kasa_hesap_id || null }
    try {
      // yeni kategori ise kaydet
      if (payload.kategori && !kats.some(k => k.ad === payload.kategori && k.tip === payload.tip))
        await muh.from('muhasebe_kategoriler').insert({ tip: payload.tip, ad: payload.kategori, renk: '#64748b' })

      if (editing) {
        // Bakiyeyi etkileyen alanlar değiştiyse: eski kaydı sil (tetikleyici bakiyeyi geri alır) ve yenisini ekle
        const finansal = editing.tip !== payload.tip || +editing.tutar !== payload.tutar || (editing.cari_id || null) !== payload.cari_id || (editing.kasa_hesap_id || null) !== payload.kasa_hesap_id
        if (finansal) {
          const ins: any = await muh.from('islemler').insert({ ...payload, fatura_id: editing.fatura_id || null })
          if (ins?.error) throw new Error(ins.error)
          const del: any = await muh.from('islemler').delete().eq('id', editing.id)
          if (del?.error) throw new Error(del.error)
        } else {
          const up: any = await muh.from('islemler').update({ kategori: payload.kategori, aciklama: payload.aciklama, tarih: payload.tarih, odeme_yontemi: payload.odeme_yontemi }).eq('id', editing.id)
          if (up?.error) throw new Error(up.error)
        }
        toast.show('İşlem güncellendi')
      } else {
        const r: any = await muh.from('islemler').insert(payload)
        if (r?.error) throw new Error(r.error)
        toast.show(`${payload.tip === 'gelir' ? 'Gelir' : 'Gider'} kaydedildi`)
      }
      setModal(false); setDetay(null); await load()
    } catch (err: any) { toast.show(err.message || 'Kaydedilemedi', true) }
    setBusy(false)
  }

  async function del(r: any) {
    if (!confirm(`Bu işlem silinsin mi?\n${fmt(r.tutar)} — ${r.kategori}\n\nBağlı cari ve kasa/banka bakiyeleri otomatik geri alınır.`)) return
    const res: any = await muh.from('islemler').delete().eq('id', r.id)
    if (res?.error) { toast.show(res.error, true); return }
    toast.show('İşlem silindi'); setDetay(null); load()
  }
  async function bulkDel(sel: any[], clear: () => void) {
    if (!confirm(`${sel.length} işlem silinsin mi? Bakiyeler otomatik geri alınır.`)) return
    for (const r of sel) await muh.from('islemler').delete().eq('id', r.id)
    toast.show(`${sel.length} işlem silindi`); clear(); load()
  }

  const cols: Col<any>[] = [
    { key: 'tarih', label: 'Tarih', width: 96, sort: r => r.tarih, render: r => <span style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.tarih)}</span> },
    { key: 'tip', label: 'Tür', width: 80, sort: r => r.tip, render: r => <Badge tone={r.tip === 'gelir' ? 'green' : 'red'}>{r.tip === 'gelir' ? 'Gelir' : 'Gider'}</Badge> },
    { key: 'kategori', label: 'Kategori', sort: r => r.kategori, render: r => <span>{r.kategori}{NON_PNL.includes(r.kategori) && <Badge tone="muted" style={{ marginLeft: 6, fontSize: 9.5 }}>K/Z dışı</Badge>}</span> },
    { key: 'aciklama', label: 'Açıklama', sort: r => r.aciklama, render: r => <span style={{ color: 'var(--adm-tx2)' }}>{r.aciklama || '—'}</span>, hideSm: true },
    { key: 'cari', label: 'Cari', sort: r => cariAd[r.cari_id] || '', render: r => cariAd[r.cari_id] || <span style={{ color: 'var(--adm-tx3)' }}>—</span>, hideSm: true },
    { key: 'hesap', label: 'Hesap', sort: r => kasaAd[r.kasa_hesap_id] || '', render: r => kasaAd[r.kasa_hesap_id] || <span style={{ color: 'var(--adm-tx3)' }}>—</span>, hideSm: true },
    { key: 'odeme', label: 'Ödeme', sort: r => r.odeme_yontemi, render: r => ODEME[r.odeme_yontemi] || r.odeme_yontemi, hidden: true },
    {
      key: 'tutar', label: 'Tutar', align: 'right', sort: r => (r.tip === 'gelir' ? 1 : -1) * +r.tutar,
      render: r => <Money v={+r.tutar} tone={r.tip === 'gelir' ? 'green' : 'red'} sign={r.tip === 'gelir'} />,
      total: rs => <Money v={sum(rs.filter(isPnl), r => (r.tip === 'gelir' ? 1 : -1) * r.tutar)} tone="auto" />,
      csv: r => (r.tip === 'gelir' ? 1 : -1) * +r.tutar,
    },
    { key: 'act', label: '', width: 70, align: 'right', render: r => (
      <span style={{ display: 'inline-flex', gap: 4 }} onClick={e => e.stopPropagation()}>
        <button className="adm-btn-ghost" style={{ padding: '4px 7px' }} onClick={() => openEdit(r)}><Pencil size={12} /></button>
        <button className="adm-btn-danger" style={{ padding: '4px 7px' }} onClick={() => del(r)}><Trash2 size={12} /></button>
      </span>) },
  ]

  const katList = kats.filter(k => k.tip === form.tip)
  const etki = form.kasa_hesap_id ? kasalar.find(k => k.id === form.kasa_hesap_id) : null

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Gelir / Gider İşlemleri" />
      <Page>
        <PageHead title="Gelir & Gider Defteri" sub="Tüm nakit hareketleri — filtrele, ara, dışa aktar"
          actions={<>
            <button className="adm-btn" style={{ background: 'var(--adm-green)' }} onClick={() => openNew('gelir')}><Plus size={14} />Gelir Ekle</button>
            <button className="adm-btn" style={{ background: 'var(--adm-red)' }} onClick={() => openNew('gider')}><Plus size={14} />Gider Ekle</button>
          </>} />

        <KpiGrid min={180}>
          <Kpi label="Gelir" value={fmtK(gelir)} Icon={ArrowUpRight} color="var(--adm-green)" sub={`${sayGelir} işlem`} />
          <Kpi label="Gider" value={fmtK(gider)} Icon={ArrowDownRight} color="var(--adm-red)" sub={`${filtered.length - sayGelir} işlem`} />
          <Kpi label="Net" value={fmtK(gelir - gider)} Icon={Scale} color={gelir - gider >= 0 ? 'var(--adm-green)' : 'var(--adm-red)'} sub={gelir ? `Marj %${(((gelir - gider) / gelir) * 100).toFixed(1)}` : undefined} />
          <Kpi label="Kayıt" value={filtered.length} Icon={Hash} color="var(--adm-blue)" sub={filtered.length !== rows.length ? `${rows.length} kayıttan filtrelenen` : 'Tüm kayıtlar'} />
        </KpiGrid>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
          <Tabs value={tip} onChange={setTip} tabs={[{ v: 'hepsi', l: 'Tümü', n: rows.length }, { v: 'gelir', l: 'Gelir', n: rows.filter(r => r.tip === 'gelir').length }, { v: 'gider', l: 'Gider', n: rows.filter(r => r.tip === 'gider').length }]} />
          <Tabs value={donem} onChange={v => setDonem(v as Donem)} tabs={DONEMLER.map(d => ({ v: d.v, l: d.l }))} />
        </div>

        <DataGrid rows={filtered} cols={cols} rowKey={r => r.id} loading={loading} csvName="gelir-gider" storageKey="islemler"
          searchText={r => `${r.aciklama || ''} ${r.kategori || ''} ${cariAd[r.cari_id] || ''} ${kasaAd[r.kasa_hesap_id] || ''} ${r.tutar}`} searchPlaceholder="Açıklama, kategori, cari, tutar..."
          selectable bulkActions={(sel, clear) => <button className="adm-btn-danger" style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => bulkDel(sel, clear)}><Trash2 size={12} />Seçilenleri sil</button>}
          onRowClick={setDetay} activeKey={detay?.id}
          filters={<>
            <select className="adm-sel" value={kat} onChange={e => setKat(e.target.value)}><option value="">Tüm kategoriler</option>{kategoriler.map(k => <option key={k}>{k}</option>)}</select>
            <select className="adm-sel" value={hesap} onChange={e => setHesap(e.target.value)}><option value="">Tüm hesaplar</option><option value="_yok">Hesap bağlı olmayan</option>{kasalar.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}</select>
            <select className="adm-sel" value={yontem} onChange={e => setYontem(e.target.value)}><option value="">Tüm ödeme yöntemleri</option>{Object.entries(ODEME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select className="adm-sel" value={cariF} onChange={e => setCariF(e.target.value)} style={{ maxWidth: 170 }}><option value="">Tüm cariler</option>{cariler.map(c => <option key={c.id} value={c.id}>{c.ad}</option>)}</select>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--adm-tx3)' }}><input type="checkbox" checked={gizleOzel} onChange={e => setGizleOzel(e.target.checked)} />Virman/kapama gizle</label>
          </>}
          footerNote={<span>· Kâr/zarar toplamları virman ve fatura kapama kayıtlarını içermez</span>} />
      </Page>

      {/* Detay paneli */}
      <Drawer open={!!detay} onClose={() => setDetay(null)} width={440}
        title={detay && <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Badge tone={detay.tip === 'gelir' ? 'green' : 'red'}>{detay.tip === 'gelir' ? 'Gelir' : 'Gider'}</Badge>{detay.kategori}</span>}
        sub={detay && fmtDate(detay.tarih)}
        footer={detay && <>
          <button className="adm-btn-ghost" onClick={() => openNew(detay.tip, { kategori: detay.kategori, tutar: String(detay.tutar), aciklama: detay.aciklama || '', odeme_yontemi: detay.odeme_yontemi, cari_id: detay.cari_id || '', kasa_hesap_id: detay.kasa_hesap_id || '' })}><Copy size={13} />Kopyala</button>
          <button className="adm-btn-ghost" onClick={() => openEdit(detay)}><Pencil size={13} />Düzenle</button>
          <button className="adm-btn-danger" onClick={() => del(detay)}><Trash2 size={13} />Sil</button>
        </>}>
        {detay && (
          <div style={{ padding: 20 }}>
            <div style={{ textAlign: 'center', padding: '10px 0 18px' }}><Money v={+detay.tutar} tone={detay.tip === 'gelir' ? 'green' : 'red'} sign={detay.tip === 'gelir'} size={30} /></div>
            <InfoRow k="Açıklama" v={detay.aciklama || '—'} />
            <InfoRow k="Ödeme yöntemi" v={ODEME[detay.odeme_yontemi] || detay.odeme_yontemi} />
            <InfoRow k="Cari" v={cariAd[detay.cari_id] || '—'} />
            <InfoRow k="Kasa / Banka" v={kasaAd[detay.kasa_hesap_id] || '—'} />
            <InfoRow k="Fatura bağlantısı" v={detay.fatura_id ? 'Var' : '—'} />
            <InfoRow k="Kayıt zamanı" v={new Date(detay.created_at).toLocaleString('tr-TR')} />
            <Divider label="Bakiye etkisi" />
            <p style={{ fontSize: 12.5, color: 'var(--adm-tx2)', lineHeight: 1.7, margin: 0 }}>
              {detay.kasa_hesap_id ? <>• <b>{kasaAd[detay.kasa_hesap_id]}</b> bakiyesi {detay.tip === 'gelir' ? 'artırıldı' : 'azaltıldı'}.<br /></> : <>• Kasa/banka hesabına bağlı değil, hiçbir hesap bakiyesi etkilenmedi.<br /></>}
              {detay.cari_id ? <>• <b>{cariAd[detay.cari_id]}</b> cari bakiyesi {detay.tip === 'gelir' ? 'düştü (tahsilat)' : 'arttı (ödeme yapıldı)'}.</> : <>• Cariye bağlı değil.</>}
            </p>
          </div>
        )}
      </Drawer>

      {/* Ekle / Düzenle */}
      <Modal open={modal} onClose={() => setModal(false)} onSubmit={save} width={600}
        title={<span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{editing ? 'İşlemi Düzenle' : 'Yeni İşlem'}
          <span style={{ display: 'flex', gap: 4 }}>
            {(['gelir', 'gider'] as const).map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tip: t, kategori: '' }))} style={{ padding: '4px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 700, border: 'none', fontFamily: 'inherit', background: form.tip === t ? (t === 'gelir' ? 'var(--adm-green)' : 'var(--adm-red)') : 'var(--adm-s3)', color: form.tip === t ? '#fff' : 'var(--adm-tx3)' }}>{t === 'gelir' ? 'Gelir' : 'Gider'}</button>
            ))}
          </span></span>}
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setModal(false)}>İptal</button><button type="submit" className="adm-btn" disabled={busy} style={{ background: form.tip === 'gelir' ? 'var(--adm-green)' : 'var(--adm-red)' }}>{busy ? 'Kaydediliyor...' : 'Kaydet'}</button></>}>
        <FormGrid>
          <Field label="Tutar (₺) *"><input type="number" step="0.01" min="0" className="adm-inp" required autoFocus value={form.tutar} onChange={e => setForm(f => ({ ...f, tutar: e.target.value }))} placeholder="0,00" style={{ fontSize: 16, fontWeight: 700 }} /></Field>
          <Field label="Tarih *"><input type="date" className="adm-inp" required value={form.tarih} onChange={e => setForm(f => ({ ...f, tarih: e.target.value }))} /></Field>
          <Field label="Kategori *" hint="Listede yoksa yaz, otomatik oluşturulur">
            <input className="adm-inp" required list="kat-list" value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} placeholder="Seç veya yaz" />
            <datalist id="kat-list">{katList.map(k => <option key={k.id} value={k.ad} />)}</datalist>
          </Field>
          <Field label="Ödeme Yöntemi"><select className="adm-inp" value={form.odeme_yontemi} onChange={e => setForm(f => ({ ...f, odeme_yontemi: e.target.value }))}>{Object.entries(ODEME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
          <Field label="Kasa / Banka Hesabı" hint={etki ? `Bakiye: ${fmt(etki.bakiye)} → ${fmt(+etki.bakiye + (form.tip === 'gelir' ? 1 : -1) * (+form.tutar || 0))}` : 'Seçmezsen hiçbir hesap bakiyesi değişmez'}>
            <select className="adm-inp" value={form.kasa_hesap_id} onChange={e => setForm(f => ({ ...f, kasa_hesap_id: e.target.value }))}><option value="">— Hesap seçilmedi —</option>{kasalar.filter(k => k.aktif !== false).map(k => <option key={k.id} value={k.id}>{k.ad} ({k.tip})</option>)}</select>
          </Field>
          <Field label="Cari Hesap" hint={form.cari_id ? (form.tip === 'gelir' ? 'Tahsilat: cari bakiyesi düşer' : 'Ödeme: cari bakiyesi artar') : 'Opsiyonel'}>
            <select className="adm-inp" value={form.cari_id} onChange={e => setForm(f => ({ ...f, cari_id: e.target.value }))}><option value="">— Yok —</option>{cariler.map(c => <option key={c.id} value={c.id}>{c.ad}</option>)}</select>
          </Field>
          <Field label="Açıklama" span={2}><input className="adm-inp" value={form.aciklama} onChange={e => setForm(f => ({ ...f, aciklama: e.target.value }))} placeholder="İşlem açıklaması..." /></Field>
        </FormGrid>
        {editing && <p style={{ fontSize: 11.5, color: 'var(--adm-amber)', margin: '12px 0 0' }}>Tutar, tür, cari veya hesap değişirse eski kayıt geri alınıp yenisi eklenir; bakiyeler otomatik düzelir.</p>}
      </Modal>
      {toast.node}
    </div>
  )
}
