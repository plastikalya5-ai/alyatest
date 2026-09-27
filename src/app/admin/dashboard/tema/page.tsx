'use client'
import { useEffect, useState } from 'react'
import { web } from '@/lib/web-data'
import { aiIstek } from '@/lib/ai-client'
import AdminTopBar from '@/components/admin/TopBar'
import { Modal, useToast } from '@/components/admin/erp/ui'
import { IMG, TEMA_ALANLARI, resolveImg } from '@/data/images'
import { Wand2, RotateCcw, Undo2, Palette } from 'lucide-react'

const GORSEL_STIL = { studyo: 'Stüdyo', yasam: 'Yaşam alanı' } as const
type GorselStil = keyof typeof GORSEL_STIL

export default function TemaYonetimiPage() {
  const toast = useToast()
  const [override, setOverride] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [ai, setAi] = useState<{ alan: string; stil: GorselStil; b64: string | null; busy: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    web.from('settings').select('value').eq('key', 'tema_gorselleri').maybeSingle().then(({ data }) => {
      setOverride(data?.value || {}); setLoading(false)
    })
  }, [])

  const img = resolveImg(override)

  async function uret(stil: GorselStil) {
    if (!ai) return
    setAi(a => a && { ...a, stil, b64: null, busy: true })
    try {
      const kaynak = img[ai.alan as keyof typeof IMG]
      const r: any = await aiIstek('urun_gorsel_tasarim', { url: kaynak, stil })
      setAi(a => a && { ...a, b64: r.b64, busy: false })
    } catch (e: any) { toast.show(e.message, true); setAi(a => a && { ...a, busy: false }) }
  }
  async function kullan() {
    if (!ai?.b64) return
    setBusy(true)
    try {
      const r: any = await aiIstek('tema_gorsel_yukle', { alan: ai.alan, b64: ai.b64 })
      const yeni = { ...override, [ai.alan]: r.url }
      const { error } = await web.from('settings').upsert({ key: 'tema_gorselleri', value: yeni })
      if (error) throw new Error(error.message)
      setOverride(yeni); setAi(null); toast.show('Tema görseli güncellendi — anasayfada birkaç dakika içinde görünecek')
    } catch (e: any) { toast.show(e.message, true) }
    setBusy(false)
  }
  async function sifirla(alan: string) {
    if (!override[alan]) return
    setBusy(true)
    try {
      const yeni = { ...override }; delete yeni[alan]
      const { error } = await web.from('settings').upsert({ key: 'tema_gorselleri', value: yeni })
      if (error) throw new Error(error.message)
      setOverride(yeni); toast.show('Varsayılan görsele döndürüldü')
    } catch (e: any) { toast.show(e.message, true) }
    setBusy(false)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Tema Yönetimi" />
      <div style={{ padding: 24, maxWidth: 980 }}>
        <div className="adm-card" style={{ marginBottom: 18, padding: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Palette size={16} style={{ color: 'var(--adm-ac)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12.5, color: 'var(--adm-tx3)', lineHeight: 1.6, margin: 0 }}>
            Anasayfada sabit olarak kullanılan vitrin/dekoratif fotoğrafları burada AI ile yeniden tasarlayabilirsin (yalnızca arka plan/stil değişir, ürünün kendisi değişmez).
            Bu, logo, renk paleti veya sayfa düzeni gibi markanın kod tarafını <b>değiştirmez</b> — sadece bu fotoğrafların hangi görsel olduğunu değiştirir. Her alan için ayrı ayrı önizleyip onaylarsın; onaylamazsan hiçbir şey değişmez.
          </p>
        </div>

        {loading ? <p style={{ fontSize: 13, color: 'var(--adm-tx3)' }}>Yükleniyor…</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {TEMA_ALANLARI.map(a => (
              <div key={a.key} className="adm-card" style={{ overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/10', background: 'var(--adm-s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img[a.key]} alt={a.ad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{a.ad}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--adm-tx3)', marginBottom: 10, lineHeight: 1.5 }}>{a.aciklama}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button className="adm-btn-ghost" style={{ fontSize: 12, flex: 1, justifyContent: 'center' }} disabled={busy} onClick={() => setAi({ alan: a.key, stil: 'studyo', b64: null, busy: false })}><Wand2 size={12} />AI ile Yeniden Tasarla</button>
                    {override[a.key] && <button className="adm-btn-ghost" title="Varsayılana döndür" style={{ fontSize: 12, padding: '6px 8px' }} disabled={busy} onClick={() => sifirla(a.key)}><Undo2 size={12} /></button>}
                  </div>
                  {override[a.key] && <div style={{ fontSize: 10.5, color: 'var(--adm-green)', marginTop: 6 }}>Özelleştirildi</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!ai} onClose={() => setAi(null)} width={640} title={`AI ile Yeniden Tasarla — ${TEMA_ALANLARI.find(a => a.key === ai?.alan)?.ad || ''}`}
        footer={<>
          <button type="button" className="adm-btn-ghost" onClick={() => setAi(null)}>{ai?.b64 ? 'Vazgeç' : 'İptal'}</button>
          {ai?.b64 && <button type="button" className="adm-btn-ghost" disabled={ai.busy} onClick={() => uret(ai.stil)}><RotateCcw size={13} />Tekrar Dene</button>}
          {ai?.b64 ? <button type="button" className="adm-btn" disabled={busy} onClick={kullan}>{busy ? 'Kaydediliyor…' : 'Bu Görseli Kullan'}</button>
            : <button type="button" className="adm-btn" disabled={ai?.busy} onClick={() => uret(ai!.stil)}><Wand2 size={13} />{ai?.busy ? 'Oluşturuluyor…' : 'Oluştur'}</button>}
        </>}>
        <p style={{ fontSize: 12, color: 'var(--adm-tx3)', margin: '0 0 12px' }}>Sonucu onaylarsan bu alan için kullanılır; onaylamazsan mevcut görsel değişmeden kalır.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(Object.keys(GORSEL_STIL) as GorselStil[]).map(s => (
            <button key={s} type="button" className={ai?.stil === s ? 'adm-chip on' : 'adm-chip'} disabled={ai?.busy} onClick={() => setAi(f => f && { ...f, stil: s, b64: null })}>{GORSEL_STIL[s]}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--adm-tx3)', marginBottom: 6 }}>Mevcut</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {ai && <img src={img[ai.alan as keyof typeof IMG]} alt="" style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 12, background: 'var(--adm-s2)' }} />}
          </div>
          <div style={{ fontSize: 20, color: 'var(--adm-tx3)' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--adm-tx3)', marginBottom: 6 }}>AI önerisi</div>
            {ai?.busy ? <div style={{ width: 220, height: 140, borderRadius: 12, background: 'var(--adm-s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--adm-tx3)' }}>Oluşturuluyor…</div>
              : ai?.b64 ? <img src={`data:image/png;base64,${ai.b64}`} alt="" style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 12, background: 'var(--adm-s2)' }} />
              : <div style={{ width: 220, height: 140, borderRadius: 12, background: 'var(--adm-s2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wand2 size={22} style={{ color: 'var(--adm-tx3)' }} /></div>}
          </div>
        </div>
      </Modal>
    </div>
  )
}
