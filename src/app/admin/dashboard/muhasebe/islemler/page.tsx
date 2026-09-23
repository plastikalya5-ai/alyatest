'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, ArrowUpRight, ArrowDownRight, Search, Download } from 'lucide-react'

export default function IslemlerPage() {
  const [islemler, setIslemler] = useState<any[]>([])
  const [kategoriler, setKategoriler] = useState<any[]>([])
  const [cariList, setCariList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [tip, setTip] = useState<'gelir'|'gider'>('gelir')
  const [filter, setFilter] = useState('hepsi')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [pageSize, setPageSize] = useState(200)
  const [form, setForm] = useState({
    tip:'gelir', kategori:'', tutar:'', aciklama:'', tarih:new Date().toISOString().split('T')[0],
    odeme_yontemi:'nakit', cari_id:''
  })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{ data:i },{ data:k },{ data:c }] = await Promise.all([
      muh.from('islemler').select('*').order('tarih',{ascending:false}).order('created_at',{ascending:false}).limit(pageSize),
      muh.from('muhasebe_kategoriler').select('*').order('tip',{ascending:true}),
      muh.from('cari_hesaplar').select('id,ad,tip').order('ad',{ascending:true}),
    ])
    setIslemler(i||[]); setKategoriler(k||[]); setCariList(c||[])
    setLoading(false)
  },[pageSize])

  useEffect(()=>{ load() },[load])

  async function save(e:React.FormEvent) {
    e.preventDefault()
    await muh.from('islemler').insert({
      ...form, tutar:+form.tutar,
      cari_id: form.cari_id||null,
    })
    setModal(false)
    setForm({tip:'gelir',kategori:'',tutar:'',aciklama:'',tarih:new Date().toISOString().split('T')[0],odeme_yontemi:'nakit',cari_id:''})
    showToast('İşlem eklendi'); load()
  }

  async function del(id:string) {
    if (!confirm('Silinsin mi?')) return
    await muh.from('islemler').delete().eq('id',id)
    showToast('Silindi'); load()
  }

  function exportCSV() {
    const cols = ['tarih','tip','kategori','aciklama','tutar','odeme_yontemi']
    const csv = [cols.join(','), ...filtered.map(i=>cols.map(c=>`"${i[c]||''}"`).join(','))].join('\n')
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv); a.download='islemler.csv'; a.click()
  }

  const filtered = islemler.filter(i => {
    if (filter==='gelir' && i.tip!=='gelir') return false
    if (filter==='gider' && i.tip!=='gider') return false
    if (search && !i.aciklama?.toLowerCase().includes(search.toLowerCase()) && !i.kategori?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const toplamGelir = filtered.filter(i=>i.tip==='gelir').reduce((s,i)=>s+(+i.tutar),0)
  const toplamGider = filtered.filter(i=>i.tip==='gider').reduce((s,i)=>s+(+i.tutar),0)

  const ODEME = ['nakit','havale','kredi_karti','cek','diger']
  const gelirKat = kategoriler.filter(k=>k.tip==='gelir')
  const giderKat = kategoriler.filter(k=>k.tip==='gider')

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Gelir / Gider İşlemleri"/>
      <div style={{padding:24}}>

        {/* Özet */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Toplam Gelir', value:toplamGelir, color:'var(--adm-green)'},
            {label:'Toplam Gider', value:toplamGider, color:'var(--adm-red)'},
            {label:'Net',          value:toplamGelir-toplamGider, color:(toplamGelir-toplamGider)>=0?'var(--adm-green)':'var(--adm-red)'},
          ].map(s=>(
            <div key={s.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${s.color}`,padding:'14px 16px'}}>
              <p className="adm-kpi-label">{s.label}</p>
              <p className="adm-kpi-value" style={{fontSize:20,color:s.color}}>{muh.fmt(s.value)}</p>
            </div>
          ))}
        </div>

        {/* Araçlar */}
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          {['hepsi','gelir','gider'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={filter===f?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px',textTransform:'capitalize'}}>{f==='hepsi'?'Tümü':f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
          <div style={{flex:1}}/>
          <button className="adm-btn-ghost" style={{fontSize:12}} onClick={exportCSV}><Download size={13}/>CSV</button>
          <button className="adm-btn" onClick={()=>{ setForm(f=>({...f,tip:'gelir'})); setModal(true) }}>
            <Plus size={14}/>İşlem Ekle
          </button>
        </div>

        {/* Liste */}
        <div className="adm-card">
          <div className="adm-card-h">İşlemler ({filtered.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>İşlem bulunamadı</p>
          : filtered.map(i=>(
            <div key={i.id} className="adm-row">
              <div style={{width:36,height:36,borderRadius:9,background:i.tip==='gelir'?'var(--adm-green2)':'var(--adm-red2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {i.tip==='gelir' ? <ArrowUpRight size={16} style={{color:'var(--adm-green)'}}/> : <ArrowDownRight size={16} style={{color:'var(--adm-red)'}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:600,color:'var(--adm-tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.aciklama||'—'}</p>
                <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{i.kategori} · {muh.date(i.tarih)} · {i.odeme_yontemi?.replace('_',' ')}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                <span style={{fontSize:15,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:i.tip==='gelir'?'var(--adm-green)':'var(--adm-red)'}}>
                  {i.tip==='gelir'?'+':'-'}{muh.fmt(i.tutar)}
                </span>
                <button onClick={()=>del(i.id)} className="adm-btn-danger" style={{padding:'4px 8px'}}><X size={12}/></button>
              </div>
            </div>
          ))}
          {islemler.length===pageSize && (
            <div style={{padding:14,textAlign:'center'}}>
              <button className="adm-btn-ghost" style={{fontSize:12}} onClick={()=>setPageSize(p=>p+200)}>Daha Fazla Yükle</button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">
              <div style={{display:'flex',gap:4}}>
                {(['gelir','gider'] as const).map(t=>(
                  <button key={t} type="button" onClick={()=>setForm(f=>({...f,tip:t,kategori:''}))}
                    style={{padding:'5px 16px',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',border:'none',
                      background:form.tip===t?(t==='gelir'?'var(--adm-green)':'var(--adm-red)'):'var(--adm-s3)',
                      color:form.tip===t?'#fff':'var(--adm-tx3)'}}>
                    {t==='gelir'?'Gelir':'Gider'}
                  </button>
                ))}
              </div>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label className="adm-label">Tutar (₺) *</label>
                  <input type="number" step="0.01" className="adm-inp" required value={form.tutar}
                    onChange={e=>setForm(f=>({...f,tutar:e.target.value}))} placeholder="0.00"/>
                </div>
                <div>
                  <label className="adm-label">Tarih *</label>
                  <input type="date" className="adm-inp" required value={form.tarih} onChange={e=>setForm(f=>({...f,tarih:e.target.value}))}/>
                </div>
                <div>
                  <label className="adm-label">Kategori *</label>
                  <select className="adm-inp" required value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}>
                    <option value="">Seçin</option>
                    {(form.tip==='gelir'?gelirKat:giderKat).map((k:any)=><option key={k.id} value={k.ad}>{k.ad}</option>)}
                  </select>
                </div>
                <div>
                  <label className="adm-label">Ödeme Yöntemi</label>
                  <select className="adm-inp" value={form.odeme_yontemi} onChange={e=>setForm(f=>({...f,odeme_yontemi:e.target.value}))}>
                    {ODEME.map(o=><option key={o} value={o}>{o.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label className="adm-label">Cari Hesap</label>
                  <select className="adm-inp" value={form.cari_id} onChange={e=>setForm(f=>({...f,cari_id:e.target.value}))}>
                    <option value="">Seçin (opsiyonel)</option>
                    {cariList.map((c:any)=><option key={c.id} value={c.id}>{c.ad} ({c.tip})</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label className="adm-label">Açıklama</label>
                  <input className="adm-inp" value={form.aciklama} onChange={e=>setForm(f=>({...f,aciklama:e.target.value}))} placeholder="İşlem açıklaması..."/>
                </div>
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button>
                <button type="submit" className="adm-btn" style={{background:form.tip==='gelir'?'var(--adm-green)':'var(--adm-red)'}}>Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
