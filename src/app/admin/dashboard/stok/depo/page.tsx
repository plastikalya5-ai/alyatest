'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { Plus, Pencil, Trash2, X, Warehouse } from 'lucide-react'

export default function DepoPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ kod:'', ad:'', lokasyon:'', aktif:true })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const { data } = await erp.from('depolar').select('*').order('ad',{ascending:true})
    setList(data||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() { setEditing(null); setForm({kod:'',ad:'',lokasyon:'',aktif:true}); setModal(true) }
  function openEdit(d:any) { setEditing(d); setForm({kod:d.kod,ad:d.ad,lokasyon:d.lokasyon||'',aktif:d.aktif}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (editing) await erp.from('depolar').update(form).eq('id',editing.id)
    else await erp.from('depolar').insert(form)
    setModal(false); showToast(editing?'Güncellendi':'Depo eklendi'); load()
  }
  async function del(id:string) {
    if (!confirm('Silinsin mi?')) return
    await erp.from('depolar').delete().eq('id',id)
    showToast('Silindi'); load()
  }

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Depolar"/>
      <div style={{padding:24}}>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Depo Ekle</button>
        </div>
        <div className="adm-card">
          <div className="adm-card-h">Depolar ({list.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : list.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Henüz depo yok</p>
          : list.map(d=>(
            <div key={d.id} className="adm-row">
              <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-blue2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Warehouse size={15} style={{color:'var(--adm-blue)'}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{d.ad} <span style={{color:'var(--adm-tx3)',fontWeight:400,fontSize:11.5}}>({d.kod})</span></p>
                <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{d.lokasyon||'—'}</p>
              </div>
              <span className="adm-badge" style={{background:d.aktif?'var(--adm-green2)':'var(--adm-s3)',color:d.aktif?'var(--adm-green)':'var(--adm-tx3)'}}>{d.aktif?'Aktif':'Pasif'}</span>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button className="adm-btn-ghost" style={{padding:'5px 9px'}} onClick={()=>openEdit(d)}><Pencil size={12}/></button>
                <button className="adm-btn-danger" style={{padding:'5px 9px'}} onClick={()=>del(d.id)}><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">{editing?'Depo Düzenle':'Yeni Depo'}<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Kod *</label><input className="adm-inp" required value={form.kod} onChange={e=>setForm(f=>({...f,kod:e.target.value}))} placeholder="ana-depo"/></div>
                <div><label className="adm-label">Ad *</label><input className="adm-inp" required value={form.ad} onChange={e=>setForm(f=>({...f,ad:e.target.value}))} placeholder="Ana Depo"/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Lokasyon</label><input className="adm-inp" value={form.lokasyon} onChange={e=>setForm(f=>({...f,lokasyon:e.target.value}))}/></div>
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
