'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { Plus, Pencil, Trash2, X, Cog } from 'lucide-react'

const DURUM_CONF: Record<string,{l:string;c:string;bg:string}> = {
  musait:      {l:'Müsait',    c:'var(--adm-green)', bg:'var(--adm-green2)'},
  uretimde:    {l:'Üretimde',  c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  bakimda:     {l:'Bakımda',   c:'var(--adm-amber)', bg:'var(--adm-amber)18'},
  arizali:     {l:'Arızalı',   c:'var(--adm-red)',   bg:'var(--adm-red2)'},
  durduruldu:  {l:'Durduruldu',c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
}

export default function MakinePage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ kod:'', ad:'', tonaj:'', kapasite:'', durum:'musait', notlar:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const { data } = await erp.from('makineler').select('*').order('ad',{ascending:true})
    setList(data||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() { setEditing(null); setForm({kod:'',ad:'',tonaj:'',kapasite:'',durum:'musait',notlar:''}); setModal(true) }
  function openEdit(m:any) { setEditing(m); setForm({kod:m.kod,ad:m.ad,tonaj:m.tonaj?String(m.tonaj):'',kapasite:m.kapasite||'',durum:m.durum,notlar:m.notlar||''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, tonaj:form.tonaj?+form.tonaj:null}
    if (editing) await erp.from('makineler').update(payload).eq('id',editing.id)
    else await erp.from('makineler').insert(payload)
    setModal(false); showToast(editing?'Güncellendi':'Makine eklendi'); load()
  }
  async function durumGuncelle(id:string, durum:string) {
    await erp.from('makineler').update({durum}).eq('id',id)
    showToast('Durum güncellendi'); load()
  }
  async function del(id:string) {
    if (!confirm('Silinsin mi?')) return
    await erp.from('makineler').delete().eq('id',id)
    showToast('Silindi'); load()
  }

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Makine Yönetimi"/>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20}}>
          {Object.entries(DURUM_CONF).map(([k,v])=>(
            <div key={k} className="adm-kpi" style={{borderLeft:`2.5px solid ${v.c}`,padding:'12px 14px'}}>
              <p className="adm-kpi-label">{v.l}</p>
              <p className="adm-kpi-value" style={{fontSize:20,color:v.c}}>{list.filter(m=>m.durum===k).length}</p>
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Makine Ekle</button>
        </div>
        <div className="adm-card">
          <div className="adm-card-h">Makineler ({list.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : list.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Henüz makine yok</p>
          : list.map(m=>{
            const d = DURUM_CONF[m.durum]||DURUM_CONF.musait
            return (
              <div key={m.id} className="adm-row">
                <div style={{width:36,height:36,borderRadius:9,background:d.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Cog size={15} style={{color:d.c}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{m.ad} <span style={{color:'var(--adm-tx3)',fontWeight:400,fontSize:11.5}}>({m.kod})</span></p>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{m.tonaj?`${m.tonaj} ton`:''} {m.kapasite?`· ${m.kapasite}`:''}</p>
                </div>
                <select className="adm-inp" style={{fontSize:11,padding:'4px 8px',width:'auto'}} value={m.durum} onChange={e=>durumGuncelle(m.id,e.target.value)}>
                  {Object.entries(DURUM_CONF).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
                </select>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button className="adm-btn-ghost" style={{padding:'5px 9px'}} onClick={()=>openEdit(m)}><Pencil size={12}/></button>
                  <button className="adm-btn-danger" style={{padding:'5px 9px'}} onClick={()=>del(m.id)}><Trash2 size={12}/></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">{editing?'Makine Düzenle':'Yeni Makine'}<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Kod *</label><input className="adm-inp" required value={form.kod} onChange={e=>setForm(f=>({...f,kod:e.target.value}))} placeholder="MK-01"/></div>
                <div><label className="adm-label">Ad *</label><input className="adm-inp" required value={form.ad} onChange={e=>setForm(f=>({...f,ad:e.target.value}))} placeholder="Enjeksiyon 1"/></div>
                <div><label className="adm-label">Tonaj</label><input type="number" className="adm-inp" value={form.tonaj} onChange={e=>setForm(f=>({...f,tonaj:e.target.value}))}/></div>
                <div><label className="adm-label">Kapasite</label><input className="adm-inp" value={form.kapasite} onChange={e=>setForm(f=>({...f,kapasite:e.target.value}))}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button><button type="submit" className="adm-btn">Kaydet</button></div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
