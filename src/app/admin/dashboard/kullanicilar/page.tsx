'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { fmtDate, fmtDateTime } from '@/lib/fmt'
import { Page, PageHead, Kpi, KpiGrid, Badge, Tabs, Drawer, Modal, Field, FormGrid, InfoRow, Divider, useToast } from '@/components/admin/erp/ui'
import { DataGrid, type Col } from '@/components/admin/erp/DataGrid'
import { ShieldCheck, UserPlus, Pencil, Trash2, Power, Send, Mail, Users2, Check, ShieldAlert, Copy } from 'lucide-react'

const MODULLER: { k: string; l: string; grup: string }[] = [
  { k: 'dashboard', l: 'Dashboard, Analitik, Başvurular, Ziyaretçiler', grup: 'Genel' },
  { k: 'muhasebe', l: 'Muhasebe (tam) — fatura, kasa, cari, raporlar', grup: 'Muhasebe' },
  { k: 'muhasebe_cari', l: 'Yalnızca Cari Hesaplar', grup: 'Muhasebe' },
  { k: 'stok', l: 'Stok / Depo / Hammadde / Barkod Terminali', grup: 'Operasyon' },
  { k: 'uretim', l: 'Üretim (makine, kalıp, reçete, emirler, canlı üretim)', grup: 'Operasyon' },
  { k: 'personel', l: 'Personel giriş-çıkış, puantaj, izin', grup: 'Operasyon' },
  { k: 'kalite', l: 'Kalite Kontrol ve Fire Yönetimi', grup: 'Operasyon' },
  { k: 'satis', l: 'Satış Siparişleri', grup: 'Satış / Lojistik' },
  { k: 'satinalma', l: 'Satınalma Siparişleri', grup: 'Satış / Lojistik' },
  { k: 'sevkiyat', l: 'Sevkiyat / İhracat', grup: 'Satış / Lojistik' },
  { k: 'yonetim', l: 'Site Yönetimi — ürünler, kullanıcılar, ayarlar, bildirimler (tam yetki)', grup: 'Yönetim' },
]
const modAd = (k: string) => MODULLER.find(m => m.k === k)?.l.split(' — ')[0].split(' (')[0] || k
const bosRol = { kod: '', ad: '', aciklama: '', moduller: [] as string[] }
const bosDavet = { email: '', full_name: '', role_id: '' }

export default function KullanicilarPage() {
  const toast = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [roller, setRoller] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [meId, setMeId] = useState<string | null>(null)
  const [tab, setTab] = useState('personel')
  const [detay, setDetay] = useState<any>(null)
  const [daveteModal, setDaveteModal] = useState(false)
  const [davet, setDavet] = useState(bosDavet)
  const [rolModal, setRolModal] = useState(false)
  const [editingRol, setEditingRol] = useState<any>(null)
  const [rolForm, setRolForm] = useState<any>(bosRol)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/users').then(r => r.json())
    if (r.error) { toast.show(r.error, true); setLoading(false); return }
    setUsers(r.users); setRoller(r.roller); setLoading(false)
    setDetay((d: any) => (d ? r.users.find((x: any) => x.id === d.id) || null : null))
    if (!meId) fetch('/api/admin/whoami').then(x => x.json()).then(w => setMeId(w.id)).catch(() => {})
  }, [meId]) // eslint-disable-line
  useEffect(() => { load() }, []) // eslint-disable-line

  const rolAd = useMemo(() => Object.fromEntries(roller.map(r => [r.id, r.ad])), [roller])
  const rolKullanim = (rid: string) => users.filter(u => u.role_id === rid).length
  const bekleyen = users.filter(u => !u.role_id)
  const pasif = users.filter(u => u.banned)
  const aktifPersonel = users.filter(u => !u.banned)
  const liste = tab === 'personel' ? aktifPersonel : tab === 'bekleyen' ? bekleyen : tab === 'pasif' ? pasif : users

  async function api(body: any) {
    const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(x => x.json())
    if (r.error) { toast.show(r.error, true); throw new Error(r.error) }
    return r
  }

  async function davetGonder(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    if (users.some(u => u.email?.toLowerCase() === davet.email.trim().toLowerCase())) return toast.show('Bu e-posta zaten kayıtlı', true)
    setBusy(true)
    try { await api({ action: 'invite', ...davet, email: davet.email.trim() }); setDaveteModal(false); setDavet(bosDavet); toast.show('Davet gönderildi'); await load() }
    catch {} finally { setBusy(false) }
  }
  async function tekrarGonder(u: any) { try { await api({ action: 'resend', email: u.email }); toast.show(`${u.email} adresine davet tekrar gönderildi`) } catch {} }
  async function rolDegistir(u: any, role_id: string) { try { await api({ action: 'role', id: u.id, role_id }); toast.show('Rol güncellendi'); load() } catch {} }
  async function pasifeAl(u: any) {
    if (!confirm(`${u.full_name || u.email} girişi engellensin mi? Aktif oturumları kesilir, tekrar açana kadar giriş yapamaz.`)) return
    try { await api({ action: 'ban', id: u.id }); toast.show('Kullanıcı pasife alındı'); load() } catch {}
  }
  async function aktifEt(u: any) { try { await api({ action: 'unban', id: u.id }); toast.show('Kullanıcı aktifleştirildi'); load() } catch {} }
  async function sil(u: any) {
    if (!confirm(`${u.full_name || u.email} kalıcı olarak silinsin mi? Bu işlem geri alınamaz.\n\nGeçmiş kayıtlardaki "oluşturan/güncelleyen" bilgisi etkilenmez.`)) return
    try { await api({ action: 'delete', id: u.id }); toast.show('Kullanıcı silindi'); setDetay(null); load() } catch {}
  }

  const openNewRol = () => { setEditingRol(null); setRolForm(bosRol); setRolModal(true) }
  const openEditRol = (r: any) => { setEditingRol(r); setRolForm({ kod: r.kod, ad: r.ad, aciklama: r.aciklama || '', moduller: r.moduller?.includes('*') ? MODULLER.map(m => m.k) : (r.moduller || []) }); setRolModal(true) }
  async function kaydetRol(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    if (roller.some(r => r.kod.toLowerCase() === rolForm.kod.trim().toLowerCase() && r.id !== editingRol?.id)) return toast.show('Bu rol kodu zaten var', true)
    if (!rolForm.moduller.length) return toast.show('En az bir modül seç', true)
    setBusy(true)
    const tamYetki = MODULLER.every(m => rolForm.moduller.includes(m.k))
    const payload = { kod: rolForm.kod.trim(), ad: rolForm.ad.trim(), aciklama: rolForm.aciklama || null, moduller: tamYetki ? ['*'] : rolForm.moduller }
    const r: any = editingRol ? await erp.from('roller').update(payload).eq('id', editingRol.id) : await erp.from('roller').insert(payload)
    setBusy(false)
    if (r?.error) return toast.show(r.error, true)
    setRolModal(false); toast.show(editingRol ? 'Rol güncellendi' : 'Rol oluşturuldu'); load()
  }
  async function kopyalaRol(r: any) { setEditingRol(null); setRolForm({ kod: `${r.kod}-2`, ad: `${r.ad} (kopya)`, aciklama: r.aciklama || '', moduller: r.moduller?.includes('*') ? MODULLER.map(m => m.k) : r.moduller }); setRolModal(true) }
  async function silRol(r: any) {
    if (rolKullanim(r.id)) return toast.show(`Bu role atanmış ${rolKullanim(r.id)} kullanıcı var — önce onları başka role taşı`, true)
    if (!confirm(`${r.ad} rolü silinsin mi?`)) return
    const res: any = await erp.from('roller').delete().eq('id', r.id)
    if (res?.error) return toast.show(res.error, true)
    toast.show('Rol silindi'); load()
  }

  const cols: Col<any>[] = [
    { key: 'kisi', label: 'Kullanıcı', sort: u => u.full_name || u.email, render: u => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: u.banned ? 'var(--adm-red2)' : 'var(--adm-ac2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12.5, color: u.banned ? 'var(--adm-red)' : 'var(--adm-ac)' }}>{(u.full_name || u.email || '?').slice(0, 1).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600 }}>{u.full_name || <span style={{ color: 'var(--adm-tx3)' }}>İsim girilmemiş</span>}{u.id === meId && <Badge tone="blue" style={{ marginLeft: 6, fontSize: 9.5 }}>Sen</Badge>}</div><div style={{ fontSize: 11, color: 'var(--adm-tx3)' }}>{u.email}</div></div>
      </div>) },
    { key: 'rol', label: 'Rol', sort: u => rolAd[u.role_id] || '', render: u => (
      <select className="adm-sel" value={u.role_id || ''} onChange={e => rolDegistir(u, e.target.value)} onClick={e => e.stopPropagation()} style={u.role_id ? undefined : { borderColor: 'var(--adm-amber)', color: 'var(--adm-amber)' }}>
        <option value="">Rol atanmadı</option>{roller.map(r => <option key={r.id} value={r.id}>{r.ad}</option>)}
      </select>) },
    { key: 'giris', label: 'Son Giriş', sort: u => u.last_sign_in_at || '', render: u => u.last_sign_in_at ? fmtDateTime(u.last_sign_in_at) : <span style={{ color: 'var(--adm-tx3)' }}>Hiç giriş yapmadı</span>, hideSm: true },
    { key: 'durum', label: 'Durum', width: 130, sort: u => u.banned ? 1 : !u.email_confirmed_at ? 0 : 2, render: u => u.banned ? <Badge tone="red">Pasif</Badge> : !u.email_confirmed_at ? <Badge tone="amber">Davet bekliyor</Badge> : <Badge tone="green">Aktif</Badge> },
    { key: 'act', label: '', width: 130, align: 'right', render: u => (
      <span style={{ display: 'inline-flex', gap: 4 }} onClick={e => e.stopPropagation()}>
        {!u.email_confirmed_at && <button className="adm-btn-ghost" style={{ padding: '4px 8px' }} title="Daveti tekrar gönder" onClick={() => tekrarGonder(u)}><Send size={12} /></button>}
        {u.id !== meId && (u.banned ? <button className="adm-btn-ghost" style={{ padding: '4px 8px' }} title="Aktifleştir" onClick={() => aktifEt(u)}><Power size={12} style={{ color: 'var(--adm-green)' }} /></button> : <button className="adm-btn-ghost" style={{ padding: '4px 8px' }} title="Pasife al" onClick={() => pasifeAl(u)}><Power size={12} /></button>)}
      </span>) },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Kullanıcılar & Roller" />
      <Page>
        <PageHead title="Kullanıcı & Yetki Yönetimi" sub="Personel hesapları ve rol bazlı modül yetkileri" actions={<button className="adm-btn" onClick={() => setDaveteModal(true)}><UserPlus size={14} />Personel Davet Et</button>} />
        <KpiGrid min={180}>
          <Kpi label="Personel" value={users.length} Icon={Users2} color="var(--adm-ac)" sub={`${roller.length} rol tanımlı`} />
          <Kpi label="Aktif" value={aktifPersonel.filter(u => u.email_confirmed_at).length} Icon={ShieldCheck} color="var(--adm-green)" />
          <Kpi label="Davet Bekleyen" value={users.filter(u => !u.email_confirmed_at).length} Icon={Mail} color="var(--adm-amber)" />
          <Kpi label="Rolsüz" value={bekleyen.length} Icon={ShieldAlert} color={bekleyen.length ? 'var(--adm-red)' : 'var(--adm-green)'} sub={bekleyen.length ? 'hiçbir modülü göremiyor' : 'Tümüne rol atanmış'} onClick={() => setTab('bekleyen')} />
          <Kpi label="Pasif" value={pasif.length} Icon={Power} color={pasif.length ? 'var(--adm-red)' : 'var(--adm-green)'} onClick={() => setTab('pasif')} />
        </KpiGrid>

        <div style={{ marginBottom: 12 }}><Tabs value={tab} onChange={setTab} tabs={[{ v: 'personel', l: 'Personel', n: aktifPersonel.length }, { v: 'bekleyen', l: 'Rolsüz', n: bekleyen.length }, { v: 'pasif', l: 'Pasif', n: pasif.length }, { v: 'hepsi', l: 'Tümü', n: users.length }]} /></div>
        <DataGrid rows={liste} cols={cols} rowKey={u => u.id} loading={loading} storageKey="kullanicilar" onRowClick={setDetay} activeKey={detay?.id}
          searchText={u => `${u.full_name || ''} ${u.email}`} searchPlaceholder="İsim, e-posta..." emptyTitle="Kullanıcı yok" emptySub="Personel Davet Et ile ilk kullanıcıyı ekle" />

        <div style={{ marginTop: 24 }}>
          <PageHead title="Roller" sub="Her rol bir modül grubuna erişim verir — kullanıcılar rollere atanır" actions={<button className="adm-btn" onClick={openNewRol}><ShieldCheck size={14} />Yeni Rol</button>} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {roller.map(r => {
              const tam = r.moduller?.includes('*'); const n = rolKullanim(r.id)
              return (
                <div key={r.id} className="adm-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: tam ? 'var(--adm-red2)' : 'var(--adm-blue2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={16} style={{ color: tam ? 'var(--adm-red)' : 'var(--adm-blue)' }} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{r.ad}</div><div style={{ fontSize: 11, color: 'var(--adm-tx3)', fontFamily: 'JetBrains Mono,monospace' }}>{r.kod}</div></div>
                    <Badge tone={n ? 'blue' : 'muted'}>{n} kişi</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--adm-tx2)', minHeight: 34, marginBottom: 10 }}>{tam ? 'Tüm modüllere tam yetki' : (r.moduller || []).map(modAd).join(', ') || 'Modül seçilmemiş'}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="adm-btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => openEditRol(r)}><Pencil size={12} />Düzenle</button>
                    <button className="adm-btn-ghost" style={{ padding: '6px 9px' }} title="Kopyala" onClick={() => kopyalaRol(r)}><Copy size={12} /></button>
                    <button className="adm-btn-danger" style={{ padding: '6px 9px' }} title="Sil" onClick={() => silRol(r)}><Trash2 size={12} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Page>

      <Drawer open={!!detay} onClose={() => setDetay(null)} width={440} title={detay?.full_name || detay?.email} sub={detay?.email}
        footer={detay && <>
          <button className="adm-btn-danger" onClick={() => sil(detay)}><Trash2 size={13} />Sil</button>
          {detay.id !== meId && (detay.banned ? <button className="adm-btn" onClick={() => aktifEt(detay)}><Power size={14} />Aktifleştir</button> : <button className="adm-btn-ghost" onClick={() => pasifeAl(detay)}><Power size={13} />Pasife Al</button>)}
        </>}>
        {detay && <div style={{ padding: 20 }}>
          <InfoRow k="Durum" v={detay.banned ? <Badge tone="red">Pasif</Badge> : !detay.email_confirmed_at ? <Badge tone="amber">Davet bekliyor</Badge> : <Badge tone="green">Aktif</Badge>} />
          <InfoRow k="Rol" v={rolAd[detay.role_id] || 'Atanmadı'} />
          <InfoRow k="Kayıt tarihi" v={fmtDate(detay.created_at)} />
          <InfoRow k="Son giriş" v={detay.last_sign_in_at ? fmtDateTime(detay.last_sign_in_at) : 'Hiç giriş yapmadı'} />
          {!detay.email_confirmed_at && <div style={{ marginTop: 16 }}><button className="adm-btn-ghost" onClick={() => tekrarGonder(detay)}><Send size={13} />Daveti Tekrar Gönder</button></div>}
        </div>}
      </Drawer>

      <Modal open={daveteModal} onClose={() => setDaveteModal(false)} onSubmit={davetGonder} width={480} title="Personel Davet Et"
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setDaveteModal(false)}>İptal</button><button type="submit" className="adm-btn" disabled={busy}><Send size={13} />{busy ? 'Gönderiliyor...' : 'Davet Gönder'}</button></>}>
        <FormGrid cols={1}>
          <Field label="E-posta *"><input type="email" className="adm-inp" required autoFocus value={davet.email} onChange={e => setDavet(d => ({ ...d, email: e.target.value }))} /></Field>
          <Field label="Ad Soyad"><input className="adm-inp" value={davet.full_name} onChange={e => setDavet(d => ({ ...d, full_name: e.target.value }))} /></Field>
          <Field label="Rol" hint="Boş bırakırsan sonra atarsın; rolsüz kullanıcı hiçbir modülü göremez"><select className="adm-inp" value={davet.role_id} onChange={e => setDavet(d => ({ ...d, role_id: e.target.value }))}><option value="">Sonra ata</option>{roller.map(r => <option key={r.id} value={r.id}>{r.ad}</option>)}</select></Field>
        </FormGrid>
        <p style={{ fontSize: 11.5, color: 'var(--adm-tx3)', margin: '12px 0 0' }}>Kişiye şifre belirleme bağlantısı içeren bir e-posta gönderilir.</p>
      </Modal>

      <Modal open={rolModal} onClose={() => setRolModal(false)} onSubmit={kaydetRol} width={600} title={editingRol ? 'Rolü Düzenle' : 'Yeni Rol'}
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setRolModal(false)}>İptal</button><button type="submit" className="adm-btn" disabled={busy}>Kaydet</button></>}>
        <FormGrid>
          <Field label="Rol Kodu *" hint="Küçük harf, boşluksuz"><input className="adm-inp" required autoFocus value={rolForm.kod} onChange={e => setRolForm((f: any) => ({ ...f, kod: e.target.value.toLocaleLowerCase('tr').replace(/[^a-z0-9_]/g, '_') }))} /></Field>
          <Field label="Rol Adı *"><input className="adm-inp" required value={rolForm.ad} onChange={e => setRolForm((f: any) => ({ ...f, ad: e.target.value }))} placeholder="Depo Sorumlusu" /></Field>
          <Field label="Açıklama" span={2}><input className="adm-inp" value={rolForm.aciklama} onChange={e => setRolForm((f: any) => ({ ...f, aciklama: e.target.value }))} /></Field>
        </FormGrid>
        <Divider label="Modül Yetkileri" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button type="button" className="adm-btn-ghost" style={{ fontSize: 11.5, padding: '3px 10px' }} onClick={() => setRolForm((f: any) => ({ ...f, moduller: f.moduller.length === MODULLER.length ? [] : MODULLER.map(m => m.k) }))}>
            {rolForm.moduller.length === MODULLER.length ? 'Hiçbirini seçme' : 'Tümünü seç (Yönetici)'}
          </button>
        </div>
        {Object.entries(MODULLER.reduce((g: any, m) => { (g[m.grup] ||= []).push(m); return g }, {})).map(([grup, mods]: any) => (
          <div key={grup} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--adm-tx3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{grup}</div>
            {mods.map((m: any) => {
              const on = rolForm.moduller.includes(m.k)
              return (
                <label key={m.k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, background: on ? 'var(--adm-ac2)' : 'var(--adm-s2)', marginBottom: 4, cursor: 'pointer' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${on ? 'var(--adm-ac)' : 'var(--adm-bdr2)'}`, background: on ? 'var(--adm-ac)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{on && <Check size={12} color="#fff" />}</div>
                  <input type="checkbox" checked={on} onChange={() => setRolForm((f: any) => ({ ...f, moduller: on ? f.moduller.filter((x: string) => x !== m.k) : [...f.moduller, m.k] }))} style={{ display: 'none' }} />
                  <span style={{ fontSize: 12.5, color: on ? 'var(--adm-ac)' : 'var(--adm-tx2)', fontWeight: on ? 600 : 400 }}>{m.l}</span>
                </label>
              )
            })}
          </div>
        ))}
        {rolForm.moduller.length === MODULLER.length && <p style={{ fontSize: 11.5, color: 'var(--adm-red)', margin: '4px 0 0' }}>Tüm modüller seçili — bu rol Yönetici ile aynı tam yetkiye sahip olur.</p>}
      </Modal>
      {toast.node}
    </div>
  )
}
