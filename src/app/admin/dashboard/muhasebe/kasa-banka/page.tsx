'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { Plus, Pencil, Trash2, X, Wallet, Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function KasaBankaPage() {
  const [list, setList] = useState<any[]>([])
  const [islemler, setIslemler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [detay, setDetay] = useState<any>(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ tip:'kasa', ad:'', banka_adi:'', iban:'', bakiye:'0', notlar:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:h},{data:i}] = await Promise.all([
      muh.from('kasa_banka_hesaplari').select('*').order('created_at',{ascending:true}),
      muh.from('islemler').select('*').order('tarih',{ascending:false}).order('created_at',{ascending:false}).limit(200),
    ])
    setList(h||[]); setIslemler(i||[]); setLoading(false)
  },[])

  useEffect(()=>{ load() },[load])

  function openNew() { setEditing(null); setForm({tip:'kasa',ad:'',banka_adi:'',iban:'',bakiye:'0',notlar:''}); setModal(true) }
  function openEdit(h:any) { setEditing(h); setForm({tip:h.tip,ad:h.ad,banka_adi:h.banka_adi||'',iban:h.iban||'',bakiye:String(h.bakiye||0),notlar:h.notlar||''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, bakiye:+form.bakiye}
    if (editing) await muh.from('kasa_banka_hesaplari').update({...payload,updated_at:new Date().toISOString()}).eq('id',editing.id)
    else await muh.from('kasa_banka_hesaplari').insert(payload)
    setModal(false); showToast(editing?'Güncellendi':'Hesap eklendi'); load()
  }

  async function del(id:string) {
    if (!confirm('Hesap silinsin mi? Bu hesaba bağlı işlem geçmişi etkilenmez.')) return
    await muh.from('kasa_banka_hesaplari').delete().eq('id',id)
    showToast('Silindi'); load()
  }

  const toplamBakiye = list.reduce((s,h)=>s+(+h.bakiye||0),0)
  const kasaToplam = list.filter(h=>h.tip==='kasa').reduce((s,h)=>s+(+h.bakiye||0),0)
  const bankaToplam = list.filter(h=>h.tip==='banka').reduce((s,h)=>s+(+h.bakiye||0),0)
  const hesapHareketleri = detay ? islemler.filter(i=>i.kasa_hesap_id===detay.id) : []

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Kasa / Banka Hesapları"/>
      <div style={{padding:24}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Toplam Bakiye', value:muh.fmt(toplamBakiye), color:'var(--adm-ac)'},
            {label:'Kasa',          value:muh.fmt(kasaToplam),   color:'var(--adm-green)'},
            {label:'Banka',         value:muh.fmt(bankaToplam),  color:'var(--adm-blue)'},
          ].map(s=>(
            <div key={s.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${s.color}`,padding:'14px 16px'}}>
              <p className="adm-kpi-label">{s.label}</p>
              <p className="adm-kpi-value" style={{fontSize:20,color:s.color}}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Hesap Ekle</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:detay?'1fr 380px':'1fr',gap:16}}>
          <div className="adm-card">
            <div className="adm-card-h">Hesaplar ({list.length})</div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : list.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Henüz hesap yok</p>
            : list.map(h=>{
              const Icon = h.tip==='kasa'?Wallet:Landmark
              const color = h.tip==='kasa'?'var(--adm-green)':'var(--adm-blue)'
              return (
                <div key={h.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===h.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(h)}>
                  <div style={{width:38,height:38,borderRadius:10,background:color+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon size={16} style={{color}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{h.ad}</p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{h.tip==='banka'?(h.banka_adi||'Banka'):'Kasa'}{h.iban?` · ${h.iban}`:''}</p>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                    <span style={{fontSize:15,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:(+h.bakiye)>=0?'var(--adm-tx)':'var(--adm-red)'}}>{muh.fmt(h.bakiye)}</span>
                    <button className="adm-btn-ghost" style={{padding:'5px 9px'}} onClick={(e)=>{e.stopPropagation();openEdit(h)}}><Pencil size={12}/></button>
                    <button className="adm-btn-danger" style={{padding:'5px 9px'}} onClick={(e)=>{e.stopPropagation();del(h.id)}}><Trash2 size={12}/></button>
                  </div>
                </div>
              )
            })}
          </div>

          {detay && (
            <div className="adm-card" style={{height:'fit-content',position:'sticky',top:0,maxHeight:'80vh',overflow:'auto'}}>
              <div className="adm-card-h">
                <span>{detay.ad} · Hareketler</span>
                <button onClick={()=>setDetay(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={16}/></button>
              </div>
              {hesapHareketleri.length===0 ? <p style={{padding:30,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Bu hesapta işlem yok</p>
              : hesapHareketleri.map((i:any)=>(
                <div key={i.id} className="adm-row">
                  <div style={{width:30,height:30,borderRadius:8,background:i.tip==='gelir'?'var(--adm-green2)':'var(--adm-red2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {i.tip==='gelir' ? <ArrowUpRight size={14} style={{color:'var(--adm-green)'}}/> : <ArrowDownRight size={14} style={{color:'var(--adm-red)'}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.aciklama||i.kategori}</p>
                    <p style={{fontSize:11,color:'var(--adm-tx3)'}}>{muh.date(i.tarih)}</p>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:i.tip==='gelir'?'var(--adm-green)':'var(--adm-red)'}}>
                    {i.tip==='gelir'?'+':'-'}{muh.fmt(i.tutar)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">
              {editing?'Hesap Düzenle':'Yeni Kasa/Banka Hesabı'}
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{gridColumn:'1/-1'}}>
                  <label className="adm-label">Tip</label>
                  <div style={{display:'flex',gap:6}}>
                    {[['kasa','Kasa'],['banka','Banka']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>setForm(f=>({...f,tip:v}))}
                        className={form.tip===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Hesap Adı *</label><input className="adm-inp" required value={form.ad} onChange={e=>setForm(f=>({...f,ad:e.target.value}))} placeholder="Ana Kasa / İş Bankası Vadesiz"/></div>
                {form.tip==='banka' && <>
                  <div><label className="adm-label">Banka Adı</label><input className="adm-inp" value={form.banka_adi} onChange={e=>setForm(f=>({...f,banka_adi:e.target.value}))} placeholder="İş Bankası"/></div>
                  <div><label className="adm-label">IBAN</label><input className="adm-inp" value={form.iban} onChange={e=>setForm(f=>({...f,iban:e.target.value}))} placeholder="TR.."/></div>
                </>}
                <div><label className="adm-label">Açılış Bakiyesi (₺)</label><input type="number" step="0.01" className="adm-inp" value={form.bakiye} onChange={e=>setForm(f=>({...f,bakiye:e.target.value}))} disabled={!!editing}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))}/></div>
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
