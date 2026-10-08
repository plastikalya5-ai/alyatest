'use client'
import { useCallback, useEffect, useState } from 'react'
import { ThumbsDown, Check, Ban, Trash2, RotateCcw } from 'lucide-react'
import { web } from '@/lib/web-data'
import { fmtDate } from '@/lib/fmt'
import { Badge, Card, Modal, useToast } from '@/components/admin/erp/ui'

/** Yapay zekanın cevabının altındaki "Yanlış" düğmesi: doğrusunu yazınca ONAY BEKLEYEN düzeltme olarak kaydeder (hemen öğrenmez). */
export function YanlisButonu({ soru, cevap }: { soru: string; cevap: string }) {
  const toast = useToast()
  const [acik, setAcik] = useState(false)
  const [dogru, setDogru] = useState('')
  const [busy, setBusy] = useState(false)
  async function kaydet() {
    if (dogru.trim().length < 5) { toast.show('Doğrusunu en az birkaç kelimeyle yazın', true); return }
    setBusy(true)
    const { error } = await web.from('ai_hafiza').insert({ soru: soru.slice(0, 1000), yanlis_cevap: cevap.slice(0, 2000), dogru_cevap: dogru.trim().slice(0, 1500) })
    setBusy(false)
    if (error) { toast.show(error.message, true); return }
    setAcik(false); setDogru(''); toast.show('Kaydedildi. Yönetici onaylayınca yapay zeka bunu kullanacak.')
  }
  return (
    <>
      <button className="adm-btn-ghost" style={{ fontSize: 11, padding: '2px 8px', marginTop: 4 }} onClick={() => setAcik(true)}><ThumbsDown size={11} />Yanlış</button>
      <Modal open={acik} onClose={() => setAcik(false)} title="Bu cevap yanlış mı?" width={560}
        footer={<><button className="adm-btn-ghost" onClick={() => setAcik(false)}>Vazgeç</button><button className="adm-btn" disabled={busy} onClick={kaydet}>Düzeltmeyi gönder</button></>}>
        <div style={{ fontSize: 12.5, color: 'var(--adm-tx3)', marginBottom: 8, lineHeight: 1.6 }}><b>Sorulan:</b> {soru}</div>
        <label style={{ fontSize: 12.5, fontWeight: 600 }}>Doğrusu nedir? (rakam yazmayın, nasıl düşünmesi gerektiğini yazın)</label>
        <textarea className="adm-inp" rows={4} value={dogru} onChange={e => setDogru(e.target.value)} maxLength={1500} style={{ width: '100%', marginTop: 6 }}
          placeholder="Örnek: Takastaki çekler elde sayılmaz; takas sorulursa yalnızca Garanti Bankası'na verilenleri listele." />
        <div style={{ fontSize: 11.5, color: 'var(--adm-tx3)', marginTop: 8 }}>Düzeltme hemen uygulanmaz: yönetici <b>Yapay Zekayı Eğit</b> menüsünden onaylayınca yapay zeka kullanmaya başlar.</div>
      </Modal>
    </>
  )
}

const DURUM: Record<string, { l: string; tone: any }> = { bekliyor: { l: 'Onay bekliyor', tone: 'amber' }, aktif: { l: 'Aktif (kullanılıyor)', tone: 'green' }, kapali: { l: 'Kapalı', tone: 'gray' } }

export function HafizaSekme({ onYuk }: { onYuk?: (bekleyen: number) => void }) {
  const toast = useToast()
  const [l, setL] = useState<any[]>([])
  const [yuk, setYuk] = useState(true)
  const yukle = useCallback(async () => {
    const { data, error } = await web.from('ai_hafiza').select('*').order('created_at', { ascending: false })
    if (error) toast.show(error.message, true)
    setL(data || []); setYuk(false); onYuk?.((data || []).filter((x: any) => x.durum === 'bekliyor').length)
  }, []) // eslint-disable-line
  useEffect(() => { yukle() }, [yukle])
  async function durumDegis(id: string, durum: string) {
    const { data: u } = await web.auth.getUser()
    const { error } = await web.from('ai_hafiza').update({ durum, onaylayan: u?.user?.id || null, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast.show(error.message + ' (yalnızca yönetici değiştirebilir)', true); return }
    yukle()
  }
  async function sil(id: string) {
    if (!confirm('Bu düzeltme kalıcı silinsin mi? (Silmek yerine "Kapat" dersen sonra tekrar açabilirsin.)')) return
    const { error } = await web.from('ai_hafiza').delete().eq('id', id)
    if (error) { toast.show(error.message + ' (yalnızca yönetici silebilir)', true); return }
    yukle()
  }
  return (
    <>
      <div style={{ fontSize: 12.5, color: 'var(--adm-tx3)', marginBottom: 12, lineHeight: 1.7 }}>
        Burası <b>Alya hafızası</b>. Yapay zekanın cevabının altındaki <b>Yanlış</b> düğmesiyle gönderilen düzeltmeler önce <b>onay bekler</b>. Yönetici <b>Onayla</b> deyince yapay zeka benzer sorularda bunu kullanır.
        Yanlış bir şey öğrenilirse <b>Kapat</b> demeniz yeter; kayıt silinmez, istenirse yeniden açılır. Rakam yazmayın: rakamlar her zaman güncel kayıttan alınır.
      </div>
      {yuk ? <Card><div style={{ padding: 16, fontSize: 13 }}>Yükleniyor…</div></Card>
        : l.length === 0 ? <Card><div style={{ padding: 16, fontSize: 13, color: 'var(--adm-tx3)' }}>Henüz düzeltme yok. Yanlış bir cevap görürseniz cevabın altındaki <b>Yanlış</b> düğmesine basın.</div></Card>
        : <div style={{ display: 'grid', gap: 10 }}>{l.map(x => (
          <Card key={x.id}>
            <div style={{ padding: 14, display: 'grid', gap: 6, fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge tone={DURUM[x.durum]?.tone}>{DURUM[x.durum]?.l || x.durum}</Badge>
                <span style={{ fontSize: 11.5, color: 'var(--adm-tx3)' }}>{fmtDate(String(x.created_at).slice(0, 10))}</span>
              </div>
              <div><b>Soru:</b> {x.soru}</div>
              {x.yanlis_cevap && <div style={{ color: 'var(--adm-tx3)' }}><b>Verilen (yanlış) cevap:</b> {String(x.yanlis_cevap).slice(0, 300)}{String(x.yanlis_cevap).length > 300 ? '…' : ''}</div>}
              <div><b>Doğrusu:</b> {x.dogru_cevap}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {x.durum !== 'aktif' && <button className="adm-btn" style={{ fontSize: 12 }} onClick={() => durumDegis(x.id, 'aktif')}>{x.durum === 'kapali' ? <RotateCcw size={12} /> : <Check size={12} />}{x.durum === 'kapali' ? 'Yeniden aç' : 'Onayla'}</button>}
                {x.durum !== 'kapali' && <button className="adm-btn-ghost" style={{ fontSize: 12 }} onClick={() => durumDegis(x.id, 'kapali')}><Ban size={12} />Kapat</button>}
                <button className="adm-btn-ghost" style={{ fontSize: 12 }} onClick={() => sil(x.id)}><Trash2 size={12} />Sil</button>
              </div>
            </div>
          </Card>
        ))}</div>}
    </>
  )
}
