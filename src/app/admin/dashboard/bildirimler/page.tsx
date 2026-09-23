'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import AdminTopBar from '@/components/admin/TopBar'
import { Bell, Mail, Phone, Save, Info, AlertTriangle, Boxes, Wrench, FileSignature } from 'lucide-react'

const sb = createClient()

const EVENTS = [
  { event:'new_contact', label:'Yeni Başvuru', desc:'Birisi iletişim formunu doldurduğunda bildirim al' },
  { event:'new_visit_milestone', label:'Ziyaret Kilometre Taşı', desc:'Site 100, 500, 1000 ziyarete ulaştığında bildirim al' },
]

export default function AdminBildirimlerPage() {
  const [settings, setSettings] = useState<Record<string,any>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [uyarilar, setUyarilar] = useState<any[]>([])
  const [uyariYuklendi, setUyariYuklendi] = useState(false)

  useEffect(() => {
    sb.from('notification_settings').select('*').order('event', {ascending:true}).then(({data}:any) => {
      const map: Record<string,any> = {}
      ;(data||[]).forEach((d:any) => { map[d.event] = d })
      setSettings(map)
    })
  }, [])

  useEffect(() => {
    (async () => {
      const [{data:kh},{data:ku},{data:kb},{data:cs}] = await Promise.all([
        erp.from('v_kritik_hammaddeler').select('*'),
        erp.from('v_kritik_urunler').select('*'),
        erp.from('v_kalip_bakim_durumu').select('*'),
        muh.from('cek_senet').select('*').eq('durum','portfoyde'),
      ])
      const list: any[] = []
      ;(kh||[]).forEach((h:any)=>list.push({tip:'stok', icon:'stok', metin:`${h.ad} kritik stokta (${h.mevcut_stok} ${h.birim})`, seviye:'kirmizi'}))
      ;(ku||[]).forEach((u:any)=>list.push({tip:'stok', icon:'stok', metin:`${u.urun_adi} — ${u.name} stokta yok`, seviye:'kirmizi'}))
      ;(kb||[]).filter((k:any)=>['vadesi_gecti','yaklasiyor'].includes(k.bakim_durumu)).forEach((k:any)=>
        list.push({tip:'bakim', icon:'bakim', metin:`${k.ad} kalıbı bakım ${k.bakim_durumu==='vadesi_gecti'?'vadesi geçti':'vadesi yaklaşıyor'} (${k.sonraki_bakim||'-'})`, seviye:k.bakim_durumu==='vadesi_gecti'?'kirmizi':'sari'}))
      const bugun = new Date(); bugun.setHours(0,0,0,0)
      ;(cs||[]).forEach((c:any)=>{
        const v = new Date(c.vade_tarihi)
        if (v <= new Date(bugun.getTime()+7*86400000)) {
          list.push({tip:'cek', icon:'cek', metin:`${c.tip==='cek'?'Çek':'Senet'} ${c.no||''} vadesi ${muh.date(c.vade_tarihi)} (${muh.fmt(c.tutar)})`, seviye:v<bugun?'kirmizi':'sari'})
        }
      })
      setUyarilar(list); setUyariYuklendi(true)
    })()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await Promise.all(EVENTS.map(ev =>
      sb.from('notification_settings').upsert({
        event: ev.event,
        email_enabled: settings[ev.event]?.email_enabled||false,
        email_to: settings[ev.event]?.email_to||'',
        whatsapp_enabled: settings[ev.event]?.whatsapp_enabled||false,
        whatsapp_to: settings[ev.event]?.whatsapp_to||'',
      })
    ))
    setSaving(false); setToast('Bildirim ayarları kaydedildi'); setTimeout(()=>setToast(''),3000)
  }

  const upd = (event:string, field:string, val:any) =>
    setSettings(s => ({...s, [event]: {...(s[event]||{}), [field]:val}}))

  const ICONS: Record<string,any> = { stok: Boxes, bakim: Wrench, cek: FileSignature }

  return (
    <div style={{ flex:1, overflow:'auto' }}>
      <AdminTopBar title="Bildirimler"/>
      <div style={{ padding:24, maxWidth:700 }}>

        <div className="adm-card" style={{marginBottom:20}}>
          <div className="adm-card-h">Aktif Uyarılar {uyariYuklendi && `(${uyarilar.length})`}</div>
          {!uyariYuklendi ? <p style={{padding:30,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Yükleniyor...</p>
          : uyarilar.length===0 ? <p style={{padding:30,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Şu an aktif uyarı yok, her şey yolunda ✓</p>
          : uyarilar.map((u,i)=>{
            const Icon = ICONS[u.icon]||AlertTriangle
            const c = u.seviye==='kirmizi' ? 'var(--adm-red)' : 'var(--adm-amber)'
            const bg = u.seviye==='kirmizi' ? 'var(--adm-red2)' : 'var(--adm-amber2)'
            return (
              <div key={i} className="adm-row">
                <div style={{width:32,height:32,borderRadius:8,background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon size={15} style={{color:c}}/>
                </div>
                <p style={{fontSize:12.5,color:'var(--adm-tx)',flex:1}}>{u.metin}</p>
              </div>
            )
          })}
        </div>

        <div className="adm-card" style={{ marginBottom:20, padding:16, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'var(--adm-blue2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Info size={16} style={{ color:'var(--adm-blue)' }}/>
          </div>
          <p style={{ fontSize:12.5, color:'var(--adm-tx3)', lineHeight:1.6 }}>
            E-posta bildirimleri için SMTP ayarları gereklidir. WhatsApp bildirimleri için n8n webhook entegrasyonu kurulmalıdır.
          </p>
        </div>

        <form onSubmit={save}>
          {EVENTS.map(ev => (
            <div key={ev.event} className="adm-card" style={{ marginBottom:16 }}>
              <div className="adm-card-h">
                <div>
                  <span style={{ fontSize:13.5, fontWeight:700 }}>{ev.label}</span>
                  <p style={{ fontSize:11.5, color:'var(--adm-tx3)', marginTop:2 }}>{ev.desc}</p>
                </div>
              </div>
              <div style={{ padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* E-posta */}
                <div style={{ padding:16, background:'var(--adm-s2)', borderRadius:10, border:'1px solid var(--adm-bdr)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'var(--adm-tx)' }}>
                      <Mail size={13} style={{ color:'var(--adm-blue)' }}/>E-posta
                    </span>
                    <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                      <input type="checkbox"
                        checked={settings[ev.event]?.email_enabled||false}
                        onChange={e => upd(ev.event,'email_enabled',e.target.checked)}/>
                      <span style={{ fontSize:12, color:'var(--adm-tx3)' }}>Aktif</span>
                    </label>
                  </div>
                  <label className="adm-label">Gönderilecek Adres</label>
                  <input className="adm-inp" type="email" placeholder="info@alyaplastik.com"
                    value={settings[ev.event]?.email_to||''}
                    onChange={e => upd(ev.event,'email_to',e.target.value)}
                    disabled={!settings[ev.event]?.email_enabled}/>
                </div>

                {/* WhatsApp */}
                <div style={{ padding:16, background:'var(--adm-s2)', borderRadius:10, border:'1px solid var(--adm-bdr)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'var(--adm-tx)' }}>
                      <Phone size={13} style={{ color:'var(--adm-green)' }}/>WhatsApp
                    </span>
                    <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                      <input type="checkbox"
                        checked={settings[ev.event]?.whatsapp_enabled||false}
                        onChange={e => upd(ev.event,'whatsapp_enabled',e.target.checked)}/>
                      <span style={{ fontSize:12, color:'var(--adm-tx3)' }}>Aktif</span>
                    </label>
                  </div>
                  <label className="adm-label">WhatsApp Numarası</label>
                  <input className="adm-inp" placeholder="+905357616524"
                    value={settings[ev.event]?.whatsapp_to||''}
                    onChange={e => upd(ev.event,'whatsapp_to',e.target.value)}
                    disabled={!settings[ev.event]?.whatsapp_enabled}/>
                </div>
              </div>
            </div>
          ))}

          <button type="submit" className="adm-btn" disabled={saving} style={{ width:'100%', justifyContent:'center', padding:'11px 0' }}>
            <Save size={14}/>{saving?'Kaydediliyor...':'Ayarları Kaydet'}
          </button>
        </form>
      </div>
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
