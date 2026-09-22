'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const sb = createClient()

export default function KategorilerPage() {
  const [items, setItems] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ slug:'', name:'', icon:'🌿', sort_order:1 })
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const { data } = await sb.from('categories').select('*').order('sort_order')
    setItems(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  function open(item?: any) {
    setEditing(item || null)
    setForm(item
      ? { slug: item.slug, name: item.name, icon: item.icon || '🌿', sort_order: item.sort_order }
      : { slug: '', name: '', icon: '🌿', sort_order: items.length + 1 }
    )
    setModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (editing) await sb.from('categories').update(form).eq('id', editing.id)
    else await sb.from('categories').insert(form)
    setModal(false)
    setToast('Kaydedildi')
    setTimeout(() => setToast(''), 3000)
    load()
  }

  async function del(id: string) {
    if (!confirm('Silmek istiyor musun?')) return
    await sb.from('categories').delete().eq('id', id)
    setToast('Silindi')
    setTimeout(() => setToast(''), 3000)
    load()
  }

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Kategori Yönetimi" />
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="adm-btn" onClick={() => open()}>
            <Plus size={14} /> Yeni Kategori
          </button>
        </div>

        <div className="adm-card">
          {items.length === 0 && (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--adm-tx3)' }}>Kategori bulunamadı</p>
          )}
          {items.map(item => (
            <div key={item.id} className="adm-row">
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--adm-tx)' }}>{item.name}</p>
                <p style={{ fontSize: 11.5, color: 'var(--adm-tx3)' }}>{item.slug}</p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--adm-tx3)', fontFamily: 'JetBrains Mono,monospace' }}>
                #{item.sort_order}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="adm-btn-ghost" style={{ padding: '5px 10px' }} onClick={() => open(item)}>
                  <Pencil size={12} /> Düzenle
                </button>
                <button className="adm-btn-danger" style={{ padding: '5px 10px' }} onClick={() => del(item.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="adm-modal">
            <div className="adm-modal-h">
              <span style={{ fontSize: 15, fontWeight: 700 }}>{editing ? 'Düzenle' : 'Yeni Kategori'}</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-tx3)' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="adm-label">Slug *</label>
                  <input className="adm-inp" required value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="saksi" />
                </div>
                <div>
                  <label className="adm-label">Ad *</label>
                  <input className="adm-inp" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Saksı" />
                </div>
                <div>
                  <label className="adm-label">İkon (emoji)</label>
                  <input className="adm-inp" value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🌿" />
                </div>
                <div>
                  <label className="adm-label">Sıra</label>
                  <input type="number" className="adm-inp" value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
                </div>
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={() => setModal(false)}>İptal</button>
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
