'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Save } from 'lucide-react'

const sb = createClient()

export default function AyarlarPage() {
  const [site, setSite] = useState<any>({})
  const [stats, setStats] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    sb.from('settings').select('key,value').then(({ data }) => {
      const s = data?.find(d=>d.key==='site')?.value || {}
      const st = data?.find(d=>d.key==='stats')?.value || {}
      setSite(s); setStats(st)
    })
  }, [])

  async function saveSite(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await sb.from('settings').upsert({ key:'site', value:site })
    await sb.from('settings').upsert({ key:'stats', value:stats })
    setSaving(false); setToast('Ayarlar kaydedildi'); setTimeout(()=>setToast(''),3000)
  }

  const F = ({ label, k, type='text', obj, setObj }: any) => (
    <div>
      <label className="adm-label">{label}</label>
      <input type={type} className="adm-inp" value={obj[k]||''} onChange={e=>setObj((o:any)=>({...o,[k]:type==='number'?+e.target.value:e.target.value}))}/>
    </div>
  )

  return (
    <div style={{ flex:1,overflow:'auto' }}>
      <AdminTopBar title="Site Ayarları"/>
      <div style={{ padding:24,maxWidth:800 }}>
        <form onSubmit={saveSite}>
          <div className="adm-card" style={{ marginBottom:16 }}>
            <div className="adm-card-h"><span className="adm-card-title">İletişim Bilgileri</span></div>
            <div style={{ padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              <F label="Şirket Adı"      k="company"      obj={site} setObj={setSite}/>
              <F label="Kuruluş Yılı"    k="founded"      obj={site} setObj={setSite} type="number"/>
              <F label="Telefon"         k="phone"        obj={site} setObj={setSite}/>
              <F label="WhatsApp"        k="whatsapp"     obj={site} setObj={setSite}/>
              <F label="E-posta"         k="email"        obj={site} setObj={setSite} type="email"/>
              <F label="İhracat E-posta" k="export_email" obj={site} setObj={setSite} type="email"/>
              <div style={{ gridColumn:'1/-1' }}>
                <F label="Adres"         k="address"      obj={site} setObj={setSite}/>
              </div>
              <F label="Çalışma Saatleri" k="working_hours" obj={site} setObj={setSite}/>
            </div>
          </div>

          <div className="adm-card" style={{ marginBottom:20 }}>
            <div className="adm-card-h"><span className="adm-card-title">İstatistik Sayaçları</span></div>
            <div style={{ padding:20,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14 }}>
              <F label="Yıl"           k="years"            obj={stats} setObj={setStats} type="number"/>
              <F label="Model Sayısı"  k="models"           obj={stats} setObj={setStats} type="number"/>
              <F label="Ülke Sayısı"   k="countries"        obj={stats} setObj={setStats} type="number"/>
              <F label="Yerli Üretim %" k="local_production" obj={stats} setObj={setStats} type="number"/>
            </div>
          </div>

          <button type="submit" className="adm-btn" disabled={saving} style={{ width:'100%',justifyContent:'center',padding:'12px 0' }}>
            <Save size={14}/>{saving?'Kaydediliyor...':'Ayarları Kaydet'}
          </button>
        </form>
      </div>
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
