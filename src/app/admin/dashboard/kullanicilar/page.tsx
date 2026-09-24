'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { createClient } from '@/lib/supabase/client'
import { UserCog, ShieldCheck, UserPlus, X } from 'lucide-react'

export default function KullanicilarPage() {
  const [profiller, setProfiller] = useState<any[]>([])
  const [roller, setRoller] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email:'', full_name:'' })
  const [inviting, setInviting] = useState(false)
  const [inviteErr, setInviteErr] = useState('')

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const sb = createClient()
    const [{data:p},{data:r}] = await Promise.all([
      sb.from('admin_profiles').select('*'),
      erp.from('roller').select('*').order('ad',{ascending:true}),
    ])
    setProfiller(p||[]); setRoller(r||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  async function rolAta(profileId:string, roleId:string) {
    const sb = createClient()
    await sb.from('admin_profiles').update({role_id:roleId}).eq('id',profileId)
    showToast('Rol güncellendi'); load()
  }

  async function davetGonder(e:React.FormEvent) {
    e.preventDefault()
    setInviting(true); setInviteErr('')
    const r = await fetch('/api/admin/invite', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(inviteForm)}).then(r=>r.json())
    setInviting(false)
    if (r.error) { setInviteErr(r.error); return }
    setInviteModal(false); setInviteForm({email:'',full_name:''})
    showToast('Davet gönderildi'); load()
  }

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Kullanıcılar & Roller"/>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div className="adm-card">
            <div className="adm-card-h">
              <span>Kullanıcılar ({profiller.length})</span>
              <button className="adm-btn-ghost" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>setInviteModal(true)}><UserPlus size={12}/>Davet Et</button>
            </div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : profiller.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Kullanıcı bulunamadı</p>
            : profiller.map((p:any)=>{
              const rol = roller.find((r:any)=>r.id===p.role_id)
              return (
                <div key={p.id} className="adm-row">
                  <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <UserCog size={15} style={{color:'var(--adm-ac)'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{p.full_name || p.id}</p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{rol?.ad || 'Rol atanmadı'}</p>
                  </div>
                  <select className="adm-inp" style={{fontSize:11,padding:'4px 8px',width:'auto'}} value={p.role_id||''} onChange={e=>rolAta(p.id,e.target.value)}>
                    <option value="">Rol seçin</option>
                    {roller.map((r:any)=><option key={r.id} value={r.id}>{r.ad}</option>)}
                  </select>
                </div>
              )
            })}
          </div>

          <div className="adm-card">
            <div className="adm-card-h">Roller ({roller.length})</div>
            {roller.map((r:any)=>(
              <div key={r.id} className="adm-row">
                <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-blue2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <ShieldCheck size={15} style={{color:'var(--adm-blue)'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{r.ad}</p>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>
                    {r.moduller?.includes('*') ? 'Tüm modüller' : (r.moduller||[]).join(', ')}
                  </p>
                </div>
                <span style={{fontSize:11,color:'var(--adm-tx3)'}}>{profiller.filter((p:any)=>p.role_id===r.id).length} kullanıcı</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toast && <div className="adm-toast">✓ {toast}</div>}

      {inviteModal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setInviteModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">Yeni Personel Davet Et<button onClick={()=>setInviteModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={davetGonder}>
              <div className="adm-modal-b">
                <div style={{marginBottom:14}}>
                  <label className="adm-label">Ad Soyad</label>
                  <input className="adm-inp" value={inviteForm.full_name} onChange={e=>setInviteForm(f=>({...f,full_name:e.target.value}))}/>
                </div>
                <div>
                  <label className="adm-label">E-posta *</label>
                  <input type="email" className="adm-inp" required value={inviteForm.email} onChange={e=>setInviteForm(f=>({...f,email:e.target.value}))}/>
                </div>
                <p style={{fontSize:11.5,color:'var(--adm-tx3)',marginTop:12,lineHeight:1.6}}>Bu e-postaya bir davet bağlantısı gönderilir. Kabul edip şifre belirledikten sonra buradan rol atayabilirsin.</p>
                {inviteErr && <p style={{color:'var(--adm-red)',fontSize:12.5,marginTop:10}}>{inviteErr}</p>}
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setInviteModal(false)}>İptal</button>
                <button type="submit" className="adm-btn" disabled={inviting}>{inviting?'Gönderiliyor...':'Davet Gönder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
