'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Plus, Trash2, X, Layers } from 'lucide-react'

const sb = createClient()

export default function AdminVaryantlarPage() {
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [selProd, setSelProd] = useState<any>(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name:'', color:'', size:'', stock:0, sort_order:0, barkod:'' })
  const [toast, setToast] = useState('')

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const { data:p } = await sb.from('products').select('id,name,code,image_url').order('sort_order', {ascending:true})
    setProducts(p||[])
  }, [])

  const loadVariants = useCallback(async (productId: string) => {
    const { data:v } = await sb.from('product_variants').select('*').eq('product_id', productId).order('sort_order', {ascending:true})
    setVariants(v||[])
  }, [])

  useEffect(() => { load() }, [load])

  async function addVariant(e: React.FormEvent) {
    e.preventDefault()
    await sb.from('product_variants').insert({ ...form, product_id: selProd.id })
    setModal(false); setForm({ name:'', color:'', size:'', stock:0, sort_order:0, barkod:'' })
    showToast('Varyant eklendi'); loadVariants(selProd.id)
  }

  async function delVariant(id: string) {
    await sb.from('product_variants').delete().eq('id', id)
    showToast('Silindi'); loadVariants(selProd.id)
  }

  const COLORS = ['#e55f28','#0b0e0b','#eae6dd','#4ea8f0','#22d3a0','#f25757','#f0a843','#9090a8','#ffffff']

  return (
    <div style={{ flex:1, overflow:'auto' }}>
      <AdminTopBar title="Ürün Varyantları"/>
      <div style={{ padding:24 }}>
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:16 }}>

          {/* Ürün listesi */}
          <div className="adm-card" style={{ height:'fit-content' }}>
            <div className="adm-card-h">Ürün Seç</div>
            {products.map(p => (
              <div key={p.id} className="adm-row" style={{ cursor:'pointer', background: selProd?.id===p.id ? 'var(--adm-ac3)' : '' }}
                onClick={() => { setSelProd(p); loadVariants(p.id) }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width:36, height:36, objectFit:'contain', borderRadius:6, background:'var(--adm-s3)', padding:4, flexShrink:0 }}/>
                ) : (
                  <div style={{ width:36, height:36, borderRadius:6, background:'var(--adm-s3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Layers size={14} style={{ color:'var(--adm-tx3)' }}/>
                  </div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12.5, fontWeight:600, color:'var(--adm-tx)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize:11, color:'var(--adm-tx3)' }}>{p.code}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Varyantlar */}
          <div>
            {!selProd ? (
              <div className="adm-card" style={{ padding:60, textAlign:'center' }}>
                <Layers size={32} style={{ color:'var(--adm-tx3)', marginBottom:12 }}/>
                <p style={{ color:'var(--adm-tx3)', fontSize:13 }}>Sol taraftan bir ürün seçin</p>
              </div>
            ) : (
              <div className="adm-card">
                <div className="adm-card-h">
                  <span>{selProd.name} — Varyantlar ({variants.length})</span>
                  <button className="adm-btn" style={{ fontSize:12 }} onClick={() => setModal(true)}>
                    <Plus size={13}/>Varyant Ekle
                  </button>
                </div>
                {variants.length===0 ? (
                  <p style={{ padding:40, textAlign:'center', color:'var(--adm-tx3)', fontSize:13 }}>Henüz varyant yok</p>
                ) : variants.map(v => (
                  <div key={v.id} className="adm-row">
                    {v.color && (
                      <div style={{ width:22, height:22, borderRadius:6, background:v.color, border:'1px solid var(--adm-bdr)', flexShrink:0 }}/>
                    )}
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--adm-tx)' }}>{v.name}</p>
                      <p style={{ fontSize:11.5, color:'var(--adm-tx3)' }}>
                        {v.size && `Boyut: ${v.size}`}{v.size && v.stock!==null && ' · '}
                        {v.stock!==null && `Stok: ${v.stock}`}
                      </p>
                    </div>
                    <span style={{ fontSize:11, color:'var(--adm-tx3)', fontFamily:'JetBrains Mono,monospace' }}>#{v.sort_order}</span>
                    <button className="adm-btn-danger" style={{ padding:'5px 10px' }} onClick={() => delVariant(v.id)}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{ if(e.target===e.currentTarget) setModal(false) }}>
          <div className="adm-modal">
            <div className="adm-modal-h">
              Varyant Ekle — {selProd?.name}
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--adm-tx3)' }}><X size={18}/></button>
            </div>
            <form onSubmit={addVariant}>
              <div className="adm-modal-b" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="adm-label">Varyant Adı *</label>
                  <input className="adm-inp" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Turuncu / S Boy"/>
                </div>
                <div>
                  <label className="adm-label">Renk (hex)</label>
                  <input className="adm-inp" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} placeholder="#e55f28"/>
                  <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                    {COLORS.map(c=>(
                      <button key={c} type="button" onClick={()=>setForm(f=>({...f,color:c}))}
                        style={{ width:22, height:22, borderRadius:5, background:c, border:`2px solid ${form.color===c?'var(--adm-ac)':'var(--adm-bdr)'}`, cursor:'pointer' }}/>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="adm-label">Boyut</label>
                  <input className="adm-inp" value={form.size} onChange={e=>setForm(f=>({...f,size:e.target.value}))} placeholder="Küçük / Orta / Büyük"/>
                </div>
                <div>
                  <label className="adm-label">Stok Adedi</label>
                  <input type="number" className="adm-inp" value={form.stock} onChange={e=>setForm(f=>({...f,stock:+e.target.value}))}/>
                </div>
                <div>
                  <label className="adm-label">Sıra</label>
                  <input type="number" className="adm-inp" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:+e.target.value}))}/>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label className="adm-label">Barkod</label>
                  <input className="adm-inp" value={form.barkod} onChange={e=>setForm(f=>({...f,barkod:e.target.value}))} placeholder="8690000000000"/>
                </div>
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button>
                <button type="submit" className="adm-btn">Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
