'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { MessageSquare, Mail, Phone, X, Archive, CheckCheck, Eye } from 'lucide-react'

const sb = createClient()
const ST: Record<string,{l:string;c:string;bg:string}> = {
  new:      {l:'Yeni',        c:'var(--adm-ac)',    bg:'var(--adm-ac2)'},
  read:     {l:'Okundu',      c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  replied:  {l:'Yanıtlandı',  c:'var(--adm-green)', bg:'var(--adm-green2)'},
  archived: {l:'Arşiv',       c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
}

export default function BasvurularPage() {
  const [items, setItems] = useState<any[]>([])
  const [sel, setSel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    setLoading(true)
    let q = sb.from('contact_submissions').select('*').order('created_at',{ascending:false})
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setItems(data||[])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function setStatus(id: string, status: string) {
    await sb.from('contact_submissions').update({ status, updated_at: new Date().toISOString() }).eq('id',id)
    if (sel?.id === id) setSel((s:any)=>({...s,status}))
    showToast('Durum güncellendi')
    load()
  }

  async function saveNotes() {
    if (!sel) return
    setSaving(true)
    await sb.from('contact_submissions').update({ notes, updated_at: new Date().toISOString() }).eq('id',sel.id)
    setSaving(false); showToast('Not kaydedildi')
  }

  async function markRead(item: any) {
    if (item.status === 'new') await setStatus(item.id, 'read')
    setSel(item); setNotes(item.notes||'')
  }

  const counts: Record<string,number> = {}
  items.forEach(i => { counts[i.status||'new'] = (counts[i.status||'new']||0)+1 })

  return (
    <div style={{ flex:1,overflow:'auto' }}>
      <AdminTopBar title="Başvuru Yönetimi"/>
      <div style={{ padding:24 }}>

        {/* Filtreler */}
        <div style={{ display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' }}>
          {[['all','Tümü'],['new','Yeni'],['read','Okundu'],['replied','Yanıtlandı'],['archived','Arşiv']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} className={filter===v?'btn':'btn-ghost'} style={{ fontSize:12,padding:'5px 14px' }}>
              {l} {v!=='all' && counts[v]?`(${counts[v]})`:v==='all'?`(${items.length})`:''}
            </button>
          ))}
        </div>

        <div style={{ display:'grid',gridTemplateColumns:sel?'1fr 360px':'1fr',gap:16 }}>
          {/* Liste */}
          <div className="adm-card">
            {loading ? (
              <p style={{ padding:40,textAlign:'center',color:'var(--adm-tx3)' }}>Yükleniyor...</p>
            ) : items.length===0 ? (
              <p style={{ padding:40,textAlign:'center',color:'var(--adm-tx3)' }}>Başvuru bulunamadı</p>
            ) : items.map(item => (
              <div key={item.id} className="adm-row" style={{ cursor:'pointer', background:sel?.id===item.id?'var(--ac3)':'' }}
                onClick={()=>markRead(item)}>
                <div style={{ width:36,height:36,borderRadius:9,background:'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <MessageSquare size={15} style={{ color:'var(--adm-ac)' }}/>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:2 }}>
                    <p style={{ fontSize:13.5,fontWeight:item.status==='new'?700:600,color:'var(--adm-tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.name}</p>
                    {item.status==='new' && <div style={{ width:6,height:6,borderRadius:'50%',background:'var(--adm-ac)',flexShrink:0 }}/>}
                  </div>
                  <p style={{ fontSize:11.5,color:'var(--adm-tx3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.subject||'Genel'} · {item.email}</p>
                </div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0 }}>
                  <span className="adm-badge" style={{ background:ST[item.status||'new']?.bg,color:ST[item.status||'new']?.c }}>{ST[item.status||'new']?.l}</span>
                  <span style={{ fontSize:10.5,color:'var(--adm-tx3)' }}>{new Date(item.created_at).toLocaleDateString('tr')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detay */}
          {sel && (
            <div className="adm-card" style={{ height:'fit-content',position:'sticky',top:0 }}>
              <div className="adm-card-h">
                <span className="adm-card-title">Başvuru Detayı</span>
                <button onClick={()=>setSel(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)' }}><X size={16}/></button>
              </div>
              <div style={{ padding:20 }}>
                <h3 style={{ fontSize:16,fontWeight:700,marginBottom:4 }}>{sel.name}</h3>
                {sel.company && <p style={{ fontSize:12,color:'var(--adm-tx3)',marginBottom:12 }}>{sel.company}</p>}
                <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
                  <a href={`mailto:${sel.email}`} style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--adm-blue)' }}>
                    <Mail size={13}/>{sel.email}
                  </a>
                  {sel.phone && (
                    <a href={`tel:${sel.phone}`} style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--adm-green)' }}>
                      <Phone size={13}/>{sel.phone}
                    </a>
                  )}
                </div>
                {sel.subject && <div style={{ marginBottom:12 }}><span className="adm-badge badge-muted">{sel.subject}</span></div>}
                <div style={{ background:'var(--adm-s2)',borderRadius:10,padding:14,marginBottom:16 }}>
                  <p style={{ fontSize:13,lineHeight:1.7,color:'var(--adm-tx)' }}>{sel.message}</p>
                </div>
                <p style={{ fontSize:11,color:'var(--adm-tx3)',marginBottom:16 }}>
                  {new Date(sel.created_at).toLocaleString('tr')}
                </p>

                {/* Durum butonları */}
                <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:16 }}>
                  {Object.entries(ST).map(([k,v])=>(
                    <button key={k} onClick={()=>setStatus(sel.id,k)}
                      className={sel.status===k?'btn':'btn-ghost'}
                      style={{ fontSize:11,padding:'4px 10px',background:sel.status===k?v.c:undefined }}>
                      {v.l}
                    </button>
                  ))}
                </div>

                {/* Notlar */}
                <label className="adm-label">Dahili Notlar</label>
                <textarea className="adm-inp" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Not ekle..."/>
                <button className="adm-btn" style={{ width:'100%',justifyContent:'center',marginTop:10 }} onClick={saveNotes} disabled={saving}>
                  {saving?'Kaydediliyor...':'Notu Kaydet'}
                </button>

                {/* Hızlı yanıt */}
                <a href={`mailto:${sel.email}?subject=Re: ${sel.subject||'Başvurunuz'}`}
                  className="adm-btn-ghost" style={{ display:'flex',justifyContent:'center',marginTop:8,fontSize:12 }}>
                  <Mail size={13}/>E-posta ile Yanıtla
                </a>
                {sel.phone && (
                  <a href={`https://wa.me/${sel.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer nofollow"
                    className="adm-btn-ghost" style={{ display:'flex',justifyContent:'center',marginTop:6,fontSize:12,color:'var(--adm-green)',borderColor:'rgba(34,211,160,.3)' }}>
                    <Phone size={13}/>WhatsApp ile Yaz
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  )
}
