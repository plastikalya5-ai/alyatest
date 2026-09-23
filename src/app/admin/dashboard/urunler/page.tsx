'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Plus, Pencil, Trash2, X, Star, Sparkles, Search, Package, Copy, Download, CheckSquare, Square } from 'lucide-react'

const sb = createClient()

export default function AdminUrunlerPage() {
  const [products,setProducts] = useState<any[]>([])
  const [categories,setCategories] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [search,setSearch] = useState('')
  const [modal,setModal] = useState(false)
  const [editing,setEditing] = useState<any>(null)
  const [saving,setSaving] = useState(false)
  const [toast,setToast] = useState('')
  const [confirmDel,setConfirmDel] = useState<string|null>(null)
  const [selected,setSelected] = useState<Set<string>>(new Set())
  const [bulkModal,setBulkModal] = useState(false)
  const [bulkCat,setBulkCat] = useState('')
  const [form,setForm] = useState({ code:'',name:'',slug:'',category:'',description:'',image_url:'',is_featured:false,is_new:false,sort_order:0 })

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000)}

  const load = useCallback(async()=>{
    setLoading(true)
    const [{data:p},{data:c}] = await Promise.all([
      sb.from('products').select('*').order('sort_order',{ascending:true}),
      sb.from('categories').select('*').order('sort_order',{ascending:true}),
    ])
    setProducts(p||[]); setCategories(c||[]); setLoading(false)
  },[])

  useEffect(()=>{load()},[load])

  function openNew(){
    setEditing(null)
    setForm({code:'',name:'',slug:'',category:'',description:'',image_url:'',is_featured:false,is_new:false,sort_order:products.length+1})
    setModal(true)
  }
  function openEdit(p:any){
    setEditing(p)
    setForm({code:p.code||'',name:p.name||'',slug:p.slug||'',category:p.category||'',description:p.description||'',image_url:p.image_url||'',is_featured:p.is_featured||false,is_new:p.is_new||false,sort_order:p.sort_order||0})
    setModal(true)
  }
  async function duplicate(p:any){
    await sb.from('products').insert({...p, id:undefined, code:p.code+'-KOPYA', name:p.name+' (Kopya)', slug:p.slug+'-kopya', sort_order:products.length+1, created_at:undefined, updated_at:new Date().toISOString()})
    showToast('Ürün kopyalandı'); load()
  }

  async function save(e:React.FormEvent){
    e.preventDefault(); setSaving(true)
    const data={...form,updated_at:new Date().toISOString()}
    if(editing) await sb.from('products').update(data).eq('id',editing.id)
    else await sb.from('products').insert(data)
    setSaving(false); setModal(false); showToast(editing?'Güncellendi':'Eklendi'); load()
  }
  async function del(id:string){
    await sb.from('products').delete().eq('id',id)
    setConfirmDel(null); showToast('Silindi'); load()
  }
  async function bulkDelete(){
    await Promise.all([...selected].map(id=>sb.from('products').delete().eq('id',id)))
    setSelected(new Set()); showToast(`${selected.size} ürün silindi`); load()
  }
  async function bulkCategory(){
    await Promise.all([...selected].map(id=>sb.from('products').update({category:bulkCat}).eq('id',id)))
    setSelected(new Set()); setBulkModal(false); showToast('Kategori güncellendi'); load()
  }

  function exportCSV(){
    const cols=['code','name','category','description','is_featured','is_new','sort_order']
    const csv=[cols.join(','),...filtered.map(p=>cols.map(c=>`"${p[c]??''}"`).join(','))].join('\n')
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='urunler.csv'; a.click()
  }

  function toggleSel(id:string){ const s=new Set(selected); s.has(id)?s.delete(id):s.add(id); setSelected(s) }
  function toggleAll(){ setSelected(selected.size===filtered.length?new Set():new Set(filtered.map(p=>p.id))) }

  const filtered = products.filter(p=>
    !search||p.name?.toLowerCase().includes(search.toLowerCase())||p.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ flex:1,overflow:'auto' }}>
      <AdminTopBar title="Ürün Yönetimi"/>
      <div style={{ padding:24 }}>
        <div style={{ display:'flex',gap:10,marginBottom:20,flexWrap:'wrap' }}>
          <div style={{ position:'relative',flex:1,minWidth:200,maxWidth:320 }}>
            <Search size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)' }}/>
            <input className="adm-inp" placeholder="Ürün ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32 }}/>
          </div>
          {selected.size>0 && (
            <>
              <button className="adm-btn-ghost" style={{ fontSize:12 }} onClick={()=>setBulkModal(true)}>Kategori Değiştir ({selected.size})</button>
              <button className="adm-btn-danger" style={{ fontSize:12 }} onClick={bulkDelete}>Seçilenleri Sil ({selected.size})</button>
            </>
          )}
          <button className="adm-btn-ghost" style={{ fontSize:12 }} onClick={exportCSV}><Download size={13}/>CSV Export</button>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Yeni Ürün</button>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <span>Ürünler ({filtered.length})</span>
            {filtered.length>0 && (
              <button className="adm-btn-ghost" style={{ fontSize:11, padding:'4px 10px' }} onClick={toggleAll}>
                {selected.size===filtered.length?<CheckSquare size={12}/>:<Square size={12}/>}
                {selected.size===filtered.length?'Seçimi Kaldır':'Tümünü Seç'}
              </button>
            )}
          </div>
          {loading ? <p style={{ padding:40,textAlign:'center',color:'var(--adm-tx3)' }}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{ padding:40,textAlign:'center',color:'var(--adm-tx3)' }}>Ürün bulunamadı</p>
          : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--adm-bdr)' }}>
                    {['','Görsel','Kod','Ürün Adı','Kategori','Etiket','Sıra','İşlem'].map(h=>(
                      <th key={h} style={{ padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--adm-tx3)',textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p=>(
                    <tr key={p.id} style={{ borderBottom:'1px solid var(--adm-bdr)', background:selected.has(p.id)?'var(--adm-ac3)':'' }}
                      onMouseEnter={e=>{ if(!selected.has(p.id)) (e.currentTarget as HTMLTableRowElement).style.background='rgba(255,255,255,.02)' }}
                      onMouseLeave={e=>{ if(!selected.has(p.id)) (e.currentTarget as HTMLTableRowElement).style.background='' }}>
                      <td style={{ padding:'10px 12px' }}>
                        <input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggleSel(p.id)}/>
                      </td>
                      <td style={{ padding:'10px 12px' }}>
                        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:44,height:44,objectFit:'contain',borderRadius:8,background:'var(--adm-s3)',padding:4 }}/>
                        : <div style={{ width:44,height:44,borderRadius:8,background:'var(--adm-s3)',display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={16} style={{ color:'var(--adm-tx3)' }}/></div>}
                      </td>
                      <td style={{ padding:'10px 12px' }}><code style={{ fontSize:12,color:'var(--adm-ac)',fontFamily:'JetBrains Mono,monospace' }}>{p.code}</code></td>
                      <td style={{ padding:'10px 12px' }}>
                        <p style={{ fontSize:13.5,fontWeight:600,color:'var(--adm-tx)' }}>{p.name}</p>
                        {p.description && <p style={{ fontSize:11.5,color:'var(--adm-tx3)',marginTop:2,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.description}</p>}
                      </td>
                      <td style={{ padding:'10px 12px' }}><span className="adm-badge adm-badge-muted">{p.category}</span></td>
                      <td style={{ padding:'10px 12px' }}>
                        <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                          {p.is_featured && <span className="adm-badge adm-badge-ac" style={{ gap:3,fontSize:10 }}><Star size={9}/>Öne Çıkan</span>}
                          {p.is_new && <span className="adm-badge adm-badge-green" style={{ gap:3,fontSize:10 }}><Sparkles size={9}/>Yeni</span>}
                        </div>
                      </td>
                      <td style={{ padding:'10px 12px' }}><span style={{ fontSize:12,color:'var(--adm-tx3)',fontFamily:'JetBrains Mono,monospace' }}>#{p.sort_order}</span></td>
                      <td style={{ padding:'10px 12px' }}>
                        <div style={{ display:'flex',gap:5 }}>
                          <button className="adm-btn-ghost" style={{ padding:'5px 9px',fontSize:12 }} onClick={()=>openEdit(p)} title="Düzenle"><Pencil size={12}/></button>
                          <button className="adm-btn-ghost" style={{ padding:'5px 9px',fontSize:12 }} onClick={()=>duplicate(p)} title="Kopyala"><Copy size={12}/></button>
                          <button className="adm-btn-danger" style={{ padding:'5px 9px',fontSize:12 }} onClick={()=>setConfirmDel(p.id)} title="Sil"><Trash2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ürün modal */}
      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">
              {editing?'Ürün Düzenle':'Yeni Ürün'}
              <button onClick={()=>setModal(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)' }}><X size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                <div><label className="adm-label">Ürün Kodu *</label><input className="adm-inp" required value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="ALY-601"/></div>
                <div><label className="adm-label">Ürün Adı *</label><input className="adm-inp" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}))} placeholder="UFO Saksı"/></div>
                <div><label className="adm-label">Slug *</label><input className="adm-inp" required value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="ufo-saksi"/></div>
                <div><label className="adm-label">Kategori *</label>
                  <select className="adm-inp" required value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    <option value="">Seçin</option>
                    {categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:'1/-1' }}><label className="adm-label">Görsel URL</label><input className="adm-inp" value={form.image_url} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} placeholder="https://res.cloudinary.com/..."/></div>
                {form.image_url && <div style={{ gridColumn:'1/-1',textAlign:'center' }}><img src={form.image_url} alt="" style={{ height:100,objectFit:'contain',borderRadius:8,background:'var(--adm-s3)',padding:8 }}/></div>}
                <div style={{ gridColumn:'1/-1' }}><label className="adm-label">Açıklama</label><textarea className="adm-inp" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Ürün açıklaması..."/></div>
                <div><label className="adm-label">Sıra</label><input type="number" className="adm-inp" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:+e.target.value}))}/></div>
                <div style={{ display:'flex',flexDirection:'column',gap:10,justifyContent:'center' }}>
                  <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'var(--adm-tx)' }}><input type="checkbox" checked={form.is_featured} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))}/>Öne Çıkan</label>
                  <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'var(--adm-tx)' }}><input type="checkbox" checked={form.is_new} onChange={e=>setForm(f=>({...f,is_new:e.target.checked}))}/>Yeni Ürün</label>
                </div>
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button>
                <button type="submit" className="adm-btn" disabled={saving}>{saving?'Kaydediliyor...':'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toplu kategori değiştir */}
      {bulkModal && (
        <div className="adm-modal-bg">
          <div className="adm-modal" style={{ maxWidth:360 }}>
            <div className="adm-modal-h">Kategori Değiştir ({selected.size} ürün)<button onClick={()=>setBulkModal(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)' }}><X size={18}/></button></div>
            <div className="adm-modal-b">
              <label className="adm-label">Yeni Kategori</label>
              <select className="adm-inp" value={bulkCat} onChange={e=>setBulkCat(e.target.value)}>
                <option value="">Seçin</option>
                {categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="adm-modal-f">
              <button className="adm-btn-ghost" onClick={()=>setBulkModal(false)}>İptal</button>
              <button className="adm-btn" onClick={bulkCategory} disabled={!bulkCat}>Uygula</button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onayı */}
      {confirmDel && (
        <div className="adm-modal-bg">
          <div className="adm-modal" style={{ maxWidth:360 }}>
            <div className="adm-modal-b" style={{ textAlign:'center',padding:32 }}>
              <div style={{ fontSize:40,marginBottom:12 }}>🗑️</div>
              <h3 style={{ fontSize:16,fontWeight:700,marginBottom:8,color:'var(--adm-tx)' }}>Ürünü Sil?</h3>
              <p style={{ fontSize:13,color:'var(--adm-tx3)' }}>Bu işlem geri alınamaz.</p>
            </div>
            <div className="adm-modal-f">
              <button className="adm-btn-ghost" onClick={()=>setConfirmDel(null)}>İptal</button>
              <button className="adm-btn-danger" onClick={()=>del(confirmDel)}>Sil</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}

