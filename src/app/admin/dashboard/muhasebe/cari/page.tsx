'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { Plus, Pencil, Trash2, X, User, Building2, Search, Phone, Mail, Download } from 'lucide-react'

export default function CariPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('hepsi')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ tip:'musteri', ad:'', vergi_no:'', telefon:'', email:'', adres:'', notlar:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const { data } = await muh.from('cari_hesaplar').select('*').order('ad',{ascending:true})
    setList(data||[]); setLoading(false)
  },[])

  useEffect(()=>{ load() },[load])

  function openNew() { setEditing(null); setForm({tip:'musteri',ad:'',vergi_no:'',telefon:'',email:'',adres:'',notlar:''}); setModal(true) }
  function openEdit(c:any) { setEditing(c); setForm({tip:c.tip,ad:c.ad,vergi_no:c.vergi_no||'',telefon:c.telefon||'',email:c.email||'',adres:c.adres||'',notlar:c.notlar||''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (editing) await muh.from('cari_hesaplar').update({...form,updated_at:new Date().toISOString()}).eq('id',editing.id)
    else await muh.from('cari_hesaplar').insert(form)
    setModal(false); showToast(editing?'Güncellendi':'Eklendi'); load()
  }

  async function del(id:string) {
    if (!confirm('Silinsin mi?')) return
    await muh.from('cari_hesaplar').delete().eq('id',id)
    showToast('Silindi'); load()
  }

  const filtered = list.filter(c => {
    if (filter!=='hepsi' && c.tip!==filter) return false
    if (search && !c.ad?.toLowerCase().includes(search.toLowerCase()) && !c.email?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const TIP_CONF: Record<string,{l:string;Icon:any;c:string}> = {
    musteri:    {l:'Müşteri',    Icon:User,      c:'var(--adm-blue)'},
    tedarikci:  {l:'Tedarikçi', Icon:Building2, c:'var(--adm-amber)'},
    diger:      {l:'Diğer',     Icon:User,      c:'var(--adm-tx3)'},
  }

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Cari Hesaplar"/>
      <div style={{padding:24}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Müşteri',    value:list.filter(c=>c.tip==='musteri').length,   color:'var(--adm-blue)'},
            {label:'Tedarikçi',  value:list.filter(c=>c.tip==='tedarikci').length, color:'var(--adm-amber)'},
            {label:'Toplam',     value:list.length,                                color:'var(--adm-ac)'},
          ].map(s=>(
            <div key={s.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${s.color}`,padding:'14px 16px'}}>
              <p className="adm-kpi-label">{s.label}</p>
              <p className="adm-kpi-value" style={{fontSize:24,color:s.color}}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          {[['hepsi','Tümü'],['musteri','Müşteri'],['tedarikci','Tedarikçi']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} className={filter===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
          ))}
          <div style={{flex:1}}/>
          <button className="adm-btn-ghost" style={{fontSize:12}} onClick={()=>muh.exportCsv('cari-hesaplar.csv',filtered)}><Download size={13}/>CSV</button>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Cari Ekle</button>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">Cari Listesi ({filtered.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Cari bulunamadı</p>
          : filtered.map(c => {
            const conf = TIP_CONF[c.tip]||TIP_CONF.diger
            return (
              <div key={c.id} className="adm-row">
                <div style={{width:38,height:38,borderRadius:10,background:conf.c+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <conf.Icon size={16} style={{color:conf.c}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                    <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{c.ad}</p>
                    <span className="adm-badge" style={{background:conf.c+'18',color:conf.c,fontSize:10}}>{conf.l}</span>
                  </div>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    {c.telefon && <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11.5,color:'var(--adm-tx3)'}}><Phone size={10}/>{c.telefon}</span>}
                    {c.email && <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11.5,color:'var(--adm-tx3)'}}><Mail size={10}/>{c.email}</span>}
                    {c.vergi_no && <span style={{fontSize:11.5,color:'var(--adm-tx3)'}}>VKN: {c.vergi_no}</span>}
                  </div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button className="adm-btn-ghost" style={{padding:'5px 9px'}} onClick={()=>openEdit(c)}><Pencil size={12}/></button>
                  <button className="adm-btn-danger" style={{padding:'5px 9px'}} onClick={()=>del(c.id)}><Trash2 size={12}/></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">
              {editing?'Cari Düzenle':'Yeni Cari Hesap'}
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{gridColumn:'1/-1'}}>
                  <label className="adm-label">Tip</label>
                  <div style={{display:'flex',gap:6}}>
                    {[['musteri','Müşteri'],['tedarikci','Tedarikçi'],['diger','Diğer']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>setForm(f=>({...f,tip:v}))}
                        className={form.tip===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Ad / Unvan *</label><input className="adm-inp" required value={form.ad} onChange={e=>setForm(f=>({...f,ad:e.target.value}))} placeholder="Şirket veya kişi adı"/></div>
                <div><label className="adm-label">Vergi No / TC</label><input className="adm-inp" value={form.vergi_no} onChange={e=>setForm(f=>({...f,vergi_no:e.target.value}))} placeholder="1234567890"/></div>
                <div><label className="adm-label">Telefon</label><input className="adm-inp" value={form.telefon} onChange={e=>setForm(f=>({...f,telefon:e.target.value}))} placeholder="+90 5xx xxx xx xx"/></div>
                <div><label className="adm-label">E-posta</label><input type="email" className="adm-inp" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="firma@mail.com"/></div>
                <div><label className="adm-label">Adres</label><input className="adm-inp" value={form.adres} onChange={e=>setForm(f=>({...f,adres:e.target.value}))} placeholder="İstanbul..."/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))} placeholder="Ek bilgiler..."/></div>
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button>
                <button type="submit" className="adm-btn">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
