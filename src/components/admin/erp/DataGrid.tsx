'use client'
import { useEffect, useMemo, useState, type ReactNode, type CSSProperties } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Columns3, Rows3, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { SearchBox, Skeleton, Empty } from './ui'
import { csvDownload } from '@/lib/fmt'

export type Col<T> = {
  key: string
  label: string
  width?: number | string
  align?: 'left' | 'right' | 'center'
  sort?: (r: T) => any            // verilirse sütun sıralanabilir
  render?: (r: T) => ReactNode
  total?: (rows: T[]) => ReactNode // alt toplam satırı
  csv?: (r: T) => any              // CSV çıktısı (yoksa sort/render yok → boş)
  hidden?: boolean                 // varsayılan gizli
  hideSm?: boolean                 // mobilde gizle
}

export function DataGrid<T>({
  rows, cols, rowKey, loading, searchText, searchPlaceholder, filters, actions, pageSizes = [25, 50, 100, 250],
  onRowClick, activeKey, selectable, bulkActions, csvName, emptyTitle = 'Kayıt bulunamadı', emptySub, defaultSort, storageKey, rowStyle, title, footerNote,
}: {
  rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string; loading?: boolean
  searchText?: (r: T) => string; searchPlaceholder?: string
  filters?: ReactNode; actions?: ReactNode
  pageSizes?: number[]; onRowClick?: (r: T) => void; activeKey?: string | null
  selectable?: boolean; bulkActions?: (sel: T[], clear: () => void) => ReactNode
  csvName?: string; emptyTitle?: string; emptySub?: string
  defaultSort?: { key: string; dir: 'asc' | 'desc' }; storageKey?: string
  rowStyle?: (r: T) => CSSProperties | undefined; title?: ReactNode; footerNote?: ReactNode
}) {
  const [q, setQ] = useState('')
  const [dq, setDq] = useState('')
  const [sort, setSort] = useState(defaultSort || null)
  const [page, setPage] = useState(0)
  const [ps, setPs] = useState(pageSizes[0])
  const [compact, setCompact] = useState(false)
  const [hiddenCols, setHiddenCols] = useState<string[]>(cols.filter(c => c.hidden).map(c => c.key))
  const [colMenu, setColMenu] = useState(false)
  const [sel, setSel] = useState<Set<string>>(new Set())

  useEffect(() => { const t = setTimeout(() => setDq(q), 180); return () => clearTimeout(t) }, [q])
  useEffect(() => {
    if (!storageKey) return
    try {
      const s = JSON.parse(localStorage.getItem('grid:' + storageKey) || 'null')
      if (s) { if (s.ps) setPs(s.ps); if (typeof s.compact === 'boolean') setCompact(s.compact); if (s.hiddenCols) setHiddenCols(s.hiddenCols) }
    } catch {}
  }, [storageKey])
  useEffect(() => {
    if (!storageKey) return
    try { localStorage.setItem('grid:' + storageKey, JSON.stringify({ ps, compact, hiddenCols })) } catch {}
  }, [storageKey, ps, compact, hiddenCols])
  useEffect(() => { setPage(0) }, [dq, rows.length, ps])

  const visCols = cols.filter(c => !hiddenCols.includes(c.key))

  const filtered = useMemo(() => {
    let r = rows
    if (dq && searchText) { const t = dq.toLocaleLowerCase('tr'); r = r.filter(x => searchText(x).toLocaleLowerCase('tr').includes(t)) }
    if (sort) {
      const c = cols.find(c => c.key === sort.key)
      if (c?.sort) {
        const f = c.sort, d = sort.dir === 'asc' ? 1 : -1
        r = [...r].sort((a, b) => {
          const x = f(a), y = f(b)
          if (x == null && y == null) return 0
          if (x == null) return 1
          if (y == null) return -1
          return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'tr')) * d
        })
      }
    }
    return r
  }, [rows, dq, sort, cols, searchText])

  const pages = Math.max(1, Math.ceil(filtered.length / ps))
  const cur = Math.min(page, pages - 1)
  const pageRows = filtered.slice(cur * ps, cur * ps + ps)
  const selRows = filtered.filter(r => sel.has(rowKey(r)))
  const allOnPage = pageRows.length > 0 && pageRows.every(r => sel.has(rowKey(r)))
  const hasTotals = visCols.some(c => c.total)

  const toggleSort = (c: Col<T>) => {
    if (!c.sort) return
    setSort(s => !s || s.key !== c.key ? { key: c.key, dir: 'asc' } : s.dir === 'asc' ? { key: c.key, dir: 'desc' } : null)
  }

  function exportCsv() {
    const out = filtered.map(r => Object.fromEntries(visCols.filter(c => c.csv || c.sort).map(c => [c.label, c.csv ? c.csv(r) : c.sort!(r)])))
    csvDownload((csvName || 'liste') + '.csv', out)
  }

  const toolbar = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--adm-bdr)' }}>
      {title && <b style={{ fontSize: 13.5, marginRight: 4 }}>{title}</b>}
      {searchText && <SearchBox value={q} onChange={setQ} placeholder={searchPlaceholder || 'Ara...'} width={230} />}
      {filters}
      <div style={{ flex: 1 }} />
      {actions}
      <div style={{ position: 'relative' }}>
        <button className="adm-btn-ghost" style={{ padding: '6px 9px' }} title="Sütunlar" onClick={() => setColMenu(v => !v)}><Columns3 size={14} /></button>
        {colMenu && (
          <>
            <div onClick={() => setColMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{ position: 'absolute', right: 0, top: 36, zIndex: 41, background: 'var(--adm-s1)', border: '1px solid var(--adm-bdr2)', borderRadius: 10, padding: 8, minWidth: 180, boxShadow: '0 10px 30px rgba(0,0,0,.18)' }}>
              {cols.map(c => (
                <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 12.5, borderRadius: 6 }}>
                  <input type="checkbox" checked={!hiddenCols.includes(c.key)} onChange={e => setHiddenCols(h => e.target.checked ? h.filter(k => k !== c.key) : [...h, c.key])} />{c.label || c.key}
                </label>
              ))}
            </div>
          </>
        )}
      </div>
      <button className="adm-btn-ghost" style={{ padding: '6px 9px' }} title="Satır yoğunluğu" onClick={() => setCompact(v => !v)}><Rows3 size={14} /></button>
      {csvName && <button className="adm-btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={exportCsv} disabled={!filtered.length}><Download size={13} />CSV</button>}
    </div>
  )

  return (
    <div className="adm-card" style={{ overflow: 'visible' }}>
      {toolbar}
      {selectable && selRows.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'var(--adm-ac2)', fontSize: 12.5, borderBottom: '1px solid var(--adm-bdr)' }}>
          <b style={{ color: 'var(--adm-ac)' }}>{selRows.length} kayıt seçili</b>
          {bulkActions?.(selRows, () => setSel(new Set()))}
          <button className="adm-btn-ghost" style={{ padding: '3px 9px', fontSize: 11.5, marginLeft: 'auto' }} onClick={() => setSel(new Set())}>Seçimi temizle</button>
        </div>
      )}
      <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 290px)', minHeight: 120 }}>
        <table className={`adm-tbl ${compact ? 'compact' : ''}`}>
          <thead>
            <tr>
              {selectable && <th style={{ width: 36 }}><input type="checkbox" checked={allOnPage} onChange={e => setSel(s => { const n = new Set(s); pageRows.forEach(r => e.target.checked ? n.add(rowKey(r)) : n.delete(rowKey(r))); return n })} /></th>}
              {visCols.map(c => (
                <th key={c.key} className={`${c.sort ? 'sortable' : ''} ${c.hideSm ? 'adm-hide-sm' : ''}`} style={{ width: c.width, textAlign: c.align || 'left' }} onClick={() => toggleSort(c)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {c.label}
                    {c.sort && (sort?.key === c.key ? (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronsUpDown size={11} style={{ opacity: .35 }} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <tr key={i}>{selectable && <td />}{visCols.map(c => <td key={c.key}><Skeleton h={12} w={`${50 + ((i * 13 + c.key.length * 7) % 40)}%`} /></td>)}</tr>)
              : pageRows.map(r => {
                const k = rowKey(r)
                return (
                  <tr key={k} className={`${onRowClick ? 'clickable' : ''} ${activeKey === k ? 'active' : ''}`} style={rowStyle?.(r)} onClick={() => onRowClick?.(r)}>
                    {selectable && <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={sel.has(k)} onChange={e => setSel(s => { const n = new Set(s); e.target.checked ? n.add(k) : n.delete(k); return n })} /></td>}
                    {visCols.map(c => <td key={c.key} className={c.hideSm ? 'adm-hide-sm' : ''} style={{ textAlign: c.align || 'left' }}>{c.render ? c.render(r) : String(c.sort?.(r) ?? '')}</td>)}
                  </tr>
                )
              })}
          </tbody>
          {hasTotals && !loading && filtered.length > 0 && (
            <tfoot>
              <tr>
                {selectable && <td />}
                {visCols.map((c, i) => <td key={c.key} className={c.hideSm ? 'adm-hide-sm' : ''} style={{ textAlign: c.align || 'left' }}>{c.total ? c.total(filtered) : i === 0 ? `Toplam (${filtered.length})` : ''}</td>)}
              </tr>
            </tfoot>
          )}
        </table>
        {!loading && filtered.length === 0 && <Empty icon={<Inbox size={30} />} title={emptyTitle} sub={emptySub ?? (dq ? 'Aramayı değiştirmeyi dene' : undefined)} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: '1px solid var(--adm-bdr)', fontSize: 12, color: 'var(--adm-tx3)', flexWrap: 'wrap' }}>
        <span>{filtered.length === rows.length ? `${rows.length} kayıt` : `${filtered.length} / ${rows.length} kayıt`}</span>
        {footerNote}
        <div style={{ flex: 1 }} />
        <select className="adm-sel" value={ps} onChange={e => setPs(+e.target.value)}>{pageSizes.map(n => <option key={n} value={n}>{n} / sayfa</option>)}</select>
        <button className="adm-btn-ghost" style={{ padding: '3px 7px' }} disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronLeft size={14} /></button>
        <span style={{ minWidth: 56, textAlign: 'center' }}>{cur + 1} / {pages}</span>
        <button className="adm-btn-ghost" style={{ padding: '3px 7px' }} disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}><ChevronRight size={14} /></button>
      </div>
    </div>
  )
}
