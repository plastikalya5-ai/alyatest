'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { Plus, Pencil, Trash2, X, Search, AlertTriangle, FileSignature } from 'lucide-react'

const DURUM_CONF: Record<string,{l:string;c:string;bg:string}> = {
  portfoyde:     {l:'Portföyde',      c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  tahsil_edildi: {l:'Tahsil Edildi',  c:'var(--adm-green)', bg:'var(--adm-green2)'},
  odendi:        {l:'Ödendi',         c:'var(--adm-green)', bg:'var(--adm-green2)'},
  karsiliksiz:   {l:'Karşılıksız',    c:'var(--adm-red)',   bg:'var(--adm-red2)'},
  ciro_edildi:   {l:'Ciro Edildi',    c:'var(--adm-amber)', bg:'var(--adm-amber)18'},
  iptal:         {l:'İptal',          c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
}

export default function CekSenetPage() {
  const [list, setList] = useState<any[]>([])
  const [cariList, setCariList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [filter, setFilter] = useState('hepsi')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ tip:'cek', yon:'alinan', cari_id:'', no:'', banka:'', tutar:'', vade_tarihi:new Date().toISOString().split('T')[0], aciklama:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:c},{data:cr}] = await Promise.all([
      muh.from('cek_senet').select('*').order('vade_tarihi',{ascending:true}),
      muh.from('cari_hesaplar').select('id,ad').order('ad',{ascending:true}),
    ])
    setList(c||[]); setCariList(cr||[]); setLoading(false)
  },[])

  useEffect(()=>{ load() },[load])

  function openNew() { setEditing(null); setForm({tip:'cek',yon:'alinan',cari_id:'',no:'',banka:'',tutar:'',vade_tarihi:new Date().toISOString().split('T')[0],aciklama:''}); setModal(true) }
  function openEdit(c:any) { setEditing(c); setForm({tip:c.tip,yon:c.yon,cari_id:c.cari_id||'',no:c.no||'',banka:c.banka||'',tutar:String(c.tutar),vade_tarihi:c.vade_tarihi,aciklama:c.aciklama||''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, tutar:+form.tutar, cari_id:form.cari_id||null}
    if (editing) await muh.from('cek_senet').update({...payload,updated_at:new Date().toISOString()}).eq('id',editing.id)
    else await muh.from('cek_senet').insert(payload)
    setModal(false); showToast(editing?'Güncellendi':'Kayıt eklendi'); load()
  }

  async function durumGuncelle(id:string, durum:string) {
    await muh.from('cek_senet').update({durum,updated_at:new Date().toISOString()}).eq('id',id)
    showToast('Durum güncellendi'); load()
  }

  async function del(id:string) {
    if (!confirm('Silinsin mi?')) return
    await muh.from('cek_senet').delete().eq('id',id)
    showToast('Silindi'); load()
  }

  const bugun = new Date(); bugun.setHours(0,0,0,0)
  const yakinTarih = new Date(bugun); yakinTarih.setDate(yakinTarih.getDate()+7)

  const filtered = list.filter(c => {
    if (filter==='yaklasan') {
      const v = new Date(c.vade_tarihi)
      if (!(c.durum==='portfoyde' && v>=bugun && v<=yakinTarih)) return false
    } else if (filter!=='hepsi' && c.durum!==filter) return false
    if (search && !c.no?.toLowerCase().includes(search.toLowerCase()) && !c.banka?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const yaklasanlar = list.filter(c=>{ const v=new Date(c.vade_tarihi); return c.durum==='portfoyde' && v>=bugun && v<=yakinTarih })
  const portfoyToplam = list.filter(c=>c.durum==='portfoyde').reduce((s,c)=>s+(+c.tutar),0)
  const alinanToplam = list.filter(c=>c.durum==='portfoyde'&&c.yon==='alinan').reduce((s,c)=>s+(+c.tutar),0)
  const verilenToplam = list.filter(c=>c.durum==='portfoyde'&&c.yon==='verilen').reduce((s,c)=>s+(+c.tutar),0)

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Çek / Senet Takibi"/>
      <div style={{padding:24}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
          {[
            {label:'Portföyde Toplam', value:muh.fmt(portfoyToplam), color:'var(--adm-ac)'},
            {label:'Alınan (Tahsil Edilecek)', value:muh.fmt(alinanToplam), color:'var(--adm-green)'},
            {label:'Verilen (Ödenecek)', value:muh.fmt(verilenToplam), color:'var(--adm-red)'},
            {label:'Vadesi Yaklaşan (7g)', value:yaklasanlar.length, color:'var(--adm-amber)'},
          ].map(s=>(
            <div key={s.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${s.color}`,padding:'14px 16px'}}>
              <p className="adm-kpi-label">{s.label}</p>
              <p className="adm-kpi-value" style={{fontSize:18,color:s.color}}>{s.value}</p>
            </div>
          ))}
        </div>

        {yaklasanlar.length>0 && (
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--adm-amber)18',border:'1px solid var(--adm-amber)',borderRadius:10,marginBottom:16,fontSize:12.5,color:'var(--adm-tx)'}}>
            <AlertTriangle size={15} style={{color:'var(--adm-amber)',flexShrink:0}}/>
            <span><b>{yaklasanlar.length}</b> çek/senedin vadesi önümüzdeki 7 gün içinde doluyor.</span>
          </div>
        )}

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:160,maxWidth:260}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="No / banka ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          {[['hepsi','Tümü'],['portfoyde','Portföyde'],['yaklasan','Vadesi Yaklaşan'],['tahsil_edildi','Tahsil Edildi'],['karsiliksiz','Karşılıksız']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} className={filter===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:11,padding:'5px 12px'}}>{l}</button>
          ))}
          <div style={{flex:1}}/>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Çek/Senet Ekle</button>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">Kayıtlar ({filtered.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Kayıt bulunamadı</p>
          : filtered.map(c=>{
            const d = DURUM_CONF[c.durum]||DURUM_CONF.portfoyde
            const cari = cariList.find((x:any)=>x.id===c.cari_id)
            const v = new Date(c.vade_tarihi)
            const yakin = c.durum==='portfoyde' && v>=bugun && v<=yakinTarih
            return (
              <div key={c.id} className="adm-row">
                <div style={{width:36,height:36,borderRadius:9,background:c.yon==='alinan'?'var(--adm-green2)':'var(--adm-red2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <FileSignature size={15} style={{color:c.yon==='alinan'?'var(--adm-green)':'var(--adm-red)'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)'}}>{c.tip==='cek'?'Çek':'Senet'} {c.no?`#${c.no}`:''}</p>
                    <span className="adm-badge" style={{background:c.yon==='alinan'?'var(--adm-green2)':'var(--adm-red2)',color:c.yon==='alinan'?'var(--adm-green)':'var(--adm-red)',fontSize:10}}>{c.yon==='alinan'?'Alınan':'Verilen'}</span>
                    {yakin && <span className="adm-badge" style={{background:'var(--adm-amber)18',color:'var(--adm-amber)',fontSize:10}}>Vade Yakın</span>}
                  </div>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{cari?.ad||'—'} · {c.banka||'—'} · Vade: {muh.date(c.vade_tarihi)}</p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  <span style={{fontSize:14,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-tx)'}}>{muh.fmt(c.tutar)}</span>
                  <select className="adm-inp" style={{fontSize:11,padding:'4px 8px',width:'auto'}} value={c.durum} onChange={e=>durumGuncelle(c.id,e.target.value)}>
                    {Object.entries(DURUM_CONF).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
                  </select>
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
              {editing?'Çek/Senet Düzenle':'Yeni Çek/Senet'}
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label className="adm-label">Tip</label>
                  <div style={{display:'flex',gap:6}}>
                    {[['cek','Çek'],['senet','Senet']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>setForm(f=>({...f,tip:v}))} className={form.tip===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="adm-label">Yön</label>
                  <div style={{display:'flex',gap:6}}>
                    {[['alinan','Alınan'],['verilen','Verilen']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>setForm(f=>({...f,yon:v}))} className={form.yon===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label className="adm-label">Cari Hesap</label>
                  <select className="adm-inp" value={form.cari_id} onChange={e=>setForm(f=>({...f,cari_id:e.target.value}))}>
                    <option value="">Seçin (opsiyonel)</option>
                    {cariList.map((c:any)=><option key={c.id} value={c.id}>{c.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Çek/Senet No</label><input className="adm-inp" value={form.no} onChange={e=>setForm(f=>({...f,no:e.target.value}))}/></div>
                <div><label className="adm-label">Banka</label><input className="adm-inp" value={form.banka} onChange={e=>setForm(f=>({...f,banka:e.target.value}))}/></div>
                <div><label className="adm-label">Tutar (₺) *</label><input type="number" step="0.01" className="adm-inp" required value={form.tutar} onChange={e=>setForm(f=>({...f,tutar:e.target.value}))}/></div>
                <div><label className="adm-label">Vade Tarihi *</label><input type="date" className="adm-inp" required value={form.vade_tarihi} onChange={e=>setForm(f=>({...f,vade_tarihi:e.target.value}))}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Açıklama</label><textarea className="adm-inp" rows={2} value={form.aciklama} onChange={e=>setForm(f=>({...f,aciklama:e.target.value}))}/></div>
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
