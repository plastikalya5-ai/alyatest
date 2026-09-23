'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Bell, Mail, Phone, Save, Info } from 'lucide-react'

const sb = createClient()

const EVENTS = [
  { event:'new_contact', label:'Yeni Başvuru', desc:'Birisi iletişim formunu doldurduğunda bildirim al' },
  { event:'new_visit_milestone', label:'Ziyaret Kilometre Taşı', desc:'Site 100, 500, 1000 ziyarete ulaştığında bildirim al' },
]

export default function AdminBildirimlerPage() {
  const [settings, setSettings] = useState<Record<string,any>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    sb.from('notification_settings').select('*').order('event', {ascending:true}).then(({data}:any) => {
      const map: Record<string,any> = {}
      ;(data||[]).forEach((d:any) => { map[d.event] = d })
      setSettings(map)
    })
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

  return (
    <div style={{ flex:1, overflow:'auto' }}>
      <AdminTopBar title="Bildirim Ayarları"/>
      <div style={{ padding:24, maxWidth:700 }}>

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
