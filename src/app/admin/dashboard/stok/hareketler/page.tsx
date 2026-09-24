'use client'
import { useMemo, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { fmt, fmtK, fmtN, fmtInt, fmtDateTime, todayISO } from '@/lib/fmt'
import { useUretim, byId, HAREKET_TIP } from '@/lib/uretim-utils'
import { sum, iso } from '@/lib/muh-utils'
import { Page, PageHead, Kpi, KpiGrid, Card, Badge, Tabs, Money, Drawer, Modal, Field, FormGrid, InfoRow, useToast } from '@/components/admin/erp/ui'
import { DataGrid, type Col } from '@/components/admin/erp/DataGrid'
import { TrendChart } from '@/components/admin/erp/charts'
import { Plus, ArrowDownCircle, ArrowUpCircle, Undo2, Activity, Coins, Boxes, Package, PenLine } from 'lucide-react'

const bos = { tur: 'hammadde', item: '', yon: 'giris', tip: 'manuel_duzeltme', miktar: '', depo: '', aciklama: '' }
const TIP_TONE: Record<string, any> = { uretim_giris: 'green', uretim_cikis: 'blue', satis: 'ac', satinalma: 'green', sevkiyat: 'ac', fire: 'red', sayim: 'amber', manuel_duzeltme: 'muted', iade: 'amber' }

export default function StokHareketleriPage() {
  const toast = useToast()
  const { d, loading, reload } = useUretim(['stokHareketleri', 'hammaddeler', 'variants', 'products', 'depolar', 'hareketler', 'emirler', 'sevkiyatlar', 'satinalma', 'satinalmaKalemleri'])
  const [tur, setTur] = useState('hepsi')
  const [yon, setYon] = useState('')
  const [tip, setTip] = useState('')
  const [depoF, setDepoF] = useState('')
  const [donem, setDonem] = useState('30')
  const [detay, setDetay] = useState<any>(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>(bos)
  const [busy, setBusy] = useState(false)

  const ham = useMemo(() => byId(d.hammaddeler), [d.hammaddeler])
  const varyant = useMemo(() => byId(d.variants), [d.variants])
  const urun = useMemo(() => byId(d.products), [d.products])
  const depo = useMemo(() => byId(d.depolar), [d.depolar])
  const uh = useMemo(() => byId(d.hareketler), [d.hareketler])
  const emir = useMemo(() => byId(d.emirler), [d.emirler])
  const sev = useMemo(() => byId(d.sevkiyatlar), [d.sevkiyatlar])
  const sa = useMemo(() => byId(d.satinalma), [d.satinalma])
  const sak = useMemo(() => byId(d.satinalmaKalemleri), [d.satinalmaKalemleri])

  const kaynak = (m: any) => {
    if (m.kaynak_tablo === 'uretim_hareketleri') return `Üretim emri ${emir[uh[m.kaynak_id]?.uretim_emri_id]?.no || ''}`
    if (m.kaynak_tablo === 'sevkiyatlar') return `Sevkiyat ${sev[m.kaynak_id]?.no || ''}`
    if (m.kaynak_tablo === 'satinalma_siparisi_kalemleri') return `Satınalma ${sa[sak[m.kaynak_id]?.siparis_id]?.no || ''}`
    if (m.kaynak_tablo === 'fire_kayitlari') return 'Fire kaydı'
    if (m.kaynak_tablo === 'barkod') return 'Barkod terminali'
    if (m.kaynak_tablo === 'manuel') return 'Manuel'
    return m.kaynak_tablo || '—'
  }

  const satirlar = useMemo(() => d.stokHareketleri.map((m: any) => {
    const h = m.hammadde_id ? ham[m.hammadde_id] : null, v = m.variant_id ? varyant[m.variant_id] : null
    const ad = h ? h.ad : v ? [urun[v.product_id]?.name, v.name, v.color, v.size].filter(Boolean).filter((a: any, i: number, arr: any[]) => arr.indexOf(a) === i).join(' · ') : 'Silinmiş kalem'
    const bm = +m.birim_maliyet || (h ? +h.ortalama_maliyet || 0 : 0)
    const s = (m.yon === 'giris' ? 1 : -1) * (+m.miktar || 0)
    return { ...m, tur: h ? 'hammadde' : 'mamul', ad, birim: h?.birim || 'adet', signed: s, deger: s * bm, kaynakAd: kaynak(m) }
  }), [d]) // eslint-disable-line

  const gun = donem === 'bugun' ? 0 : donem === '7' ? 7 : donem === '30' ? 30 : null
  const liste = satirlar.filter((m: any) => (tur === 'hepsi' || m.tur === tur) && (!yon || m.yon === yon) && (!tip || m.tip === tip) && (!depoF || m.depo_id === depoF) && (gun == null || (gun === 0 ? (m.tarih || '').slice(0, 10) === todayISO() : Date.now() - +new Date(m.tarih) <= gun * 86400000)))

  const giris = sum(liste.filter((m: any) => m.signed > 0), (m: any) => m.deger), cikis = -sum(liste.filter((m: any) => m.signed < 0), (m: any) => m.deger)
  const manuel = liste.filter((m: any) => ['manuel_duzeltme', 'sayim'].includes(m.tip)).length

  const seri = useMemo(() => {
    const g = Array.from({ length: 30 }, (_, i) => { const t = new Date(); t.setDate(t.getDate() - (29 - i)); return iso(t) })
    return { labels: g.map(x => x.slice(8) + '.' + x.slice(5, 7)), giris: g.map(k => sum(satirlar.filter((m: any) => (m.tarih || '').slice(0, 10) === k && m.signed > 0), (m: any) => m.deger)), cikis: g.map(k => -sum(satirlar.filter((m: any) => (m.tarih || '').slice(0, 10) === k && m.signed < 0), (m: any) => m.deger)) }
  }, [satirlar])

  const kalemler = form.tur === 'hammadde' ? d.hammaddeler.filter((h: any) => h.aktif !== false).map((h: any) => ({ id: h.id, ad: `${h.ad} (${fmtN(h.mevcut_stok, 1)} ${h.birim})` })) : d.variants.map((v: any) => ({ id: v.id, ad: `${[urun[v.product_id]?.name, v.name].filter(Boolean).join(' · ')} (${v.stock})` }))

  async function kaydet(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    const m = +form.miktar
    if (!form.item || !(m > 0)) return toast.show('Kalem ve miktar gerekli', true)
    setBusy(true)
    const r: any = await erp.from('stok_hareketleri').insert({ tip: form.tip, yon: form.yon, ...(form.tur === 'hammadde' ? { hammadde_id: form.item } : { variant_id: form.item }), miktar: m, depo_id: form.depo || null, kaynak_tablo: 'manuel', aciklama: form.aciklama || null })
    setBusy(false)
    if (r?.error) return toast.show(r.error, true)
    setModal(false); toast.show('Hareket kaydedildi'); reload()
  }
  async function tersKayit(m: any) {
    if (!confirm(`${m.ad}: ${m.yon === 'giris' ? '+' : '-'}${fmtN(m.miktar, 2)} hareketi için ters kayıt oluşturulsun mu?\n(Kayıt silinmez; karşı yönde yeni bir hareket eklenir.)`)) return
    const r: any = await erp.from('stok_hareketleri').insert({ tip: m.tip === 'sayim' ? 'sayim' : 'manuel_duzeltme', yon: m.yon === 'giris' ? 'cikis' : 'giris', ...(m.hammadde_id ? { hammadde_id: m.hammadde_id } : { variant_id: m.variant_id }), miktar: m.miktar, depo_id: m.depo_id, kaynak_tablo: 'manuel', aciklama: `Ters kayıt — ${m.aciklama || HAREKET_TIP[m.tip]}` })
    if (r?.error) return toast.show(r.error, true)
    toast.show('Ters kayıt eklendi'); setDetay(null); reload()
  }

  const cols: Col<any>[] = [
    { key: 'tarih', label: 'Tarih', width: 132, sort: m => m.tarih, render: m => <span style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDateTime(m.tarih)}</span> },
    { key: 'ad', label: 'Kalem', sort: m => m.ad, render: m => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{m.tur === 'hammadde' ? <Boxes size={14} style={{ color: 'var(--adm-ac)', flexShrink: 0 }} /> : <Package size={14} style={{ color: 'var(--adm-blue)', flexShrink: 0 }} />}<span style={{ fontWeight: 600 }}>{m.ad}</span></div> },
    { key: 'tip', label: 'Tip', sort: m => m.tip, render: m => <Badge tone={TIP_TONE[m.tip]}>{HAREKET_TIP[m.tip]}</Badge> },
    { key: 'miktar', label: 'Miktar', align: 'right', sort: m => m.signed, render: m => <b style={{ fontFamily: 'JetBrains Mono,monospace', color: m.signed > 0 ? 'var(--adm-green)' : 'var(--adm-red)' }}>{m.signed > 0 ? '+' : ''}{fmtN(m.signed, m.birim === 'adet' ? 0 : 2)} <span style={{ fontSize: 10.5, fontWeight: 400, color: 'var(--adm-tx3)' }}>{m.birim}</span></b>, csv: m => m.signed },
    { key: 'deger', label: 'Değer', align: 'right', sort: m => m.deger, render: m => m.deger ? <Money v={m.deger} tone="auto" bold={false} /> : <span style={{ color: 'var(--adm-tx3)' }}>—</span>, total: rs => <Money v={sum(rs, (m: any) => m.deger)} tone="auto" />, csv: m => m.deger, hideSm: true },
    { key: 'kaynak', label: 'Kaynak', sort: m => m.kaynakAd, render: m => <span style={{ fontSize: 12, color: 'var(--adm-tx2)' }}>{m.kaynakAd}</span>, hideSm: true },
    { key: 'depo', label: 'Depo', sort: m => depo[m.depo_id]?.ad || '', render: m => depo[m.depo_id]?.ad || '—', hidden: true },
    { key: 'aciklama', label: 'Açıklama', sort: m => m.aciklama || '', render: m => <span style={{ color: 'var(--adm-tx3)', fontSize: 12 }}>{m.aciklama || ''}</span>, hideSm: true },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Stok Hareketleri" />
      <Page>
        <PageHead title="Stok Defteri" sub="Hammadde ve mamul stok hareketlerinin tamamı — kaynağıyla birlikte" actions={<button className="adm-btn" onClick={() => { setForm(bos); setModal(true) }}><Plus size={14} />Manuel Hareket</button>} />

        <KpiGrid min={180}>
          <Kpi label="Hareket" value={fmtInt(liste.length)} Icon={Activity} color="var(--adm-ac)" sub={`${fmtInt(satirlar.length)} toplam kayıt`} />
          <Kpi label="Giriş Değeri" value={fmtK(giris)} Icon={ArrowDownCircle} color="var(--adm-green)" sub="maliyet üzerinden" />
          <Kpi label="Çıkış Değeri" value={fmtK(cikis)} Icon={ArrowUpCircle} color="var(--adm-red)" />
          <Kpi label="Net Değer" value={fmtK(giris - cikis)} Icon={Coins} color={giris - cikis >= 0 ? 'var(--adm-blue)' : 'var(--adm-amber)'} />
          <Kpi label="Manuel / Sayım" value={manuel} Icon={PenLine} color="var(--adm-amber)" sub="elle girilen düzeltmeler" />
        </KpiGrid>

        <Card title="Son 30 Gün — Günlük Giriş / Çıkış Değeri" pad={16} style={{ marginBottom: 16 }}>
          <TrendChart type="bar" height={180} labels={seri.labels} series={[{ name: 'Giriş', color: '#14b088', data: seri.giris }, { name: 'Çıkış', color: '#e14b4b', data: seri.cikis }]} />
        </Card>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
          <Tabs value={tur} onChange={setTur} tabs={[{ v: 'hepsi', l: 'Tümü' }, { v: 'hammadde', l: 'Hammadde' }, { v: 'mamul', l: 'Mamul' }]} />
          <Tabs value={yon} onChange={setYon} tabs={[{ v: '', l: 'Giriş + Çıkış' }, { v: 'giris', l: 'Giriş' }, { v: 'cikis', l: 'Çıkış' }]} />
          <Tabs value={donem} onChange={setDonem} tabs={[{ v: 'bugun', l: 'Bugün' }, { v: '7', l: '7 gün' }, { v: '30', l: '30 gün' }, { v: 'tumu', l: 'Tümü' }]} />
        </div>

        <DataGrid rows={liste} cols={cols} rowKey={m => m.id} loading={loading} csvName="stok-hareketleri" storageKey="stokhareket" pageSizes={[50, 100, 250, 500]} onRowClick={setDetay} activeKey={detay?.id}
          searchText={m => `${m.ad} ${m.aciklama || ''} ${m.kaynakAd}`} searchPlaceholder="Kalem, açıklama, kaynak..."
          filters={<><select className="adm-sel" value={tip} onChange={e => setTip(e.target.value)}><option value="">Tüm tipler</option>{Object.entries(HAREKET_TIP).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <select className="adm-sel" value={depoF} onChange={e => setDepoF(e.target.value)}><option value="">Tüm depolar</option>{d.depolar.map((x: any) => <option key={x.id} value={x.id}>{x.ad}</option>)}</select></>}
          emptyTitle="Hareket bulunamadı" footerNote={<span>· Değer = miktar × hareket maliyeti (yoksa hammaddenin ort. maliyeti)</span>} />
      </Page>

      <Drawer open={!!detay} onClose={() => setDetay(null)} width={440} title={detay && <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{detay.ad}<Badge tone={TIP_TONE[detay.tip]}>{HAREKET_TIP[detay.tip]}</Badge></span>} sub={detay && fmtDateTime(detay.tarih)}
        footer={detay && <button className="adm-btn-ghost" onClick={() => tersKayit(detay)}><Undo2 size={13} />Ters kayıt oluştur</button>}>
        {detay && <div style={{ padding: 20 }}>
          <div style={{ textAlign: 'center', padding: '6px 0 16px' }}><b style={{ fontSize: 30, fontFamily: 'JetBrains Mono,monospace', color: detay.signed > 0 ? 'var(--adm-green)' : 'var(--adm-red)' }}>{detay.signed > 0 ? '+' : ''}{fmtN(detay.signed, detay.birim === 'adet' ? 0 : 3)} {detay.birim}</b></div>
          <InfoRow k="Tür" v={detay.tur === 'hammadde' ? 'Hammadde' : 'Mamul (ürün)'} /><InfoRow k="Kaynak" v={detay.kaynakAd} /><InfoRow k="Depo" v={depo[detay.depo_id]?.ad || '—'} />
          <InfoRow k="Birim maliyet" v={+detay.birim_maliyet ? fmt(detay.birim_maliyet) : '—'} /><InfoRow k="Değer" v={detay.deger ? fmt(Math.abs(detay.deger)) : '—'} /><InfoRow k="Açıklama" v={detay.aciklama || '—'} />
          <p style={{ fontSize: 11.5, color: 'var(--adm-tx3)', marginTop: 14 }}>Defter kayıtları silinmez. Hatalı bir hareketi “ters kayıt” ile düzeltirsin; bakiye otomatik doğru hale gelir.</p>
        </div>}
      </Drawer>

      <Modal open={modal} onClose={() => setModal(false)} onSubmit={kaydet} width={520} title="Manuel Stok Hareketi"
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setModal(false)}>İptal</button><button type="submit" className="adm-btn" disabled={busy}>Kaydet</button></>}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>{[['hammadde', 'Hammadde', Boxes], ['mamul', 'Mamul (ürün)', Package]].map(([k, l, I]: any) => <button type="button" key={k} onClick={() => setForm((f: any) => ({ ...f, tur: k, item: '' }))} className={form.tur === k ? 'adm-btn' : 'adm-btn-ghost'} style={{ flex: 1, justifyContent: 'center' }}><I size={14} />{l}</button>)}</div>
        <FormGrid>
          <Field label="Kalem *" span={2}><select className="adm-inp" required value={form.item} onChange={e => setForm((f: any) => ({ ...f, item: e.target.value }))}><option value="">Seçin</option>{kalemler.map((k: any) => <option key={k.id} value={k.id}>{k.ad}</option>)}</select></Field>
          <Field label="Yön"><div style={{ display: 'flex', gap: 6 }}>{[['giris', 'Giriş'], ['cikis', 'Çıkış']].map(([k, l]) => <button type="button" key={k} onClick={() => setForm((f: any) => ({ ...f, yon: k }))} className={form.yon === k ? 'adm-btn' : 'adm-btn-ghost'} style={{ flex: 1, justifyContent: 'center', background: form.yon === k ? (k === 'giris' ? 'var(--adm-green)' : 'var(--adm-red)') : undefined }}>{l}</button>)}</div></Field>
          <Field label="Miktar *"><input type="number" step="0.001" min="0" required className="adm-inp" value={form.miktar} onChange={e => setForm((f: any) => ({ ...f, miktar: e.target.value }))} style={{ fontWeight: 700 }} /></Field>
          <Field label="Tip"><select className="adm-inp" value={form.tip} onChange={e => setForm((f: any) => ({ ...f, tip: e.target.value }))}>{['manuel_duzeltme', 'sayim', 'fire', 'iade'].map(t => <option key={t} value={t}>{HAREKET_TIP[t]}</option>)}</select></Field>
          <Field label="Depo"><select className="adm-inp" value={form.depo} onChange={e => setForm((f: any) => ({ ...f, depo: e.target.value }))}><option value="">—</option>{d.depolar.map((x: any) => <option key={x.id} value={x.id}>{x.ad}</option>)}</select></Field>
          <Field label="Açıklama" span={2}><input className="adm-inp" value={form.aciklama} onChange={e => setForm((f: any) => ({ ...f, aciklama: e.target.value }))} /></Field>
        </FormGrid>
      </Modal>
      {toast.node}
    </div>
  )
}
