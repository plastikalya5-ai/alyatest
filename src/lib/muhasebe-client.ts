// Muhasebe API client — tüm çağrılar server-side proxy üzerinden

const get = (params: Record<string,string|undefined>) =>
  fetch(`/api/muhasebe?${new URLSearchParams(Object.entries(params).filter(([,v])=>v!=null) as [string,string][])}`)
    .then(r=>r.json())

const post = (body: object) =>
  fetch('/api/muhasebe', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(r=>r.json())

class MuhQuery {
  constructor(private p: Record<string,string|undefined>) {}
  eq(f:string,v:any)    { return new MuhQuery({...this.p,eq:`${f}:${v}`}) }
  gte(f:string,v:any)   { return new MuhQuery({...this.p,gte:`${f}:${v}`}) }
  lte(f:string,v:any)   { return new MuhQuery({...this.p,lte:`${f}:${v}`}) }
  order(f:string,o?:any){ return new MuhQuery({...this.p,order:f,order_asc:String(o?.ascending===true)}) }
  limit(n:number)       { return new MuhQuery({...this.p,limit:String(n)}) }
  exec()                { return get(this.p) }
}

const wrap = (q: MuhQuery): any =>
  new Proxy(q, {
    get(t:any,prop:string) {
      if (prop==='then')  return (fn:any,fe?:any) => t.exec().then(fn,fe)
      if (prop==='catch') return (fe:any) => t.exec().catch(fe)
      if (['eq','gte','lte','order','limit'].includes(prop))
        return (...a:any[]) => wrap(t[prop](...a))
      return t[prop]?.bind?.(t)??t[prop]
    }
  })

function toCsv(rows: any[]): string {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0]).filter(c => typeof rows[0][c] !== 'object')
  const esc = (v:any) => `"${String(v??'').replace(/"/g,'""')}"`
  return [cols.join(','), ...rows.map(r=>cols.map(c=>esc(r[c])).join(','))].join('\n')
}
function downloadCsv(filename: string, rows: any[]) {
  const csv = '\uFEFF' + toCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export const muh = {
  from: (table:string) => ({
    select: (select='*',opts?:any) => wrap(new MuhQuery({table,select,...(opts?.count?{count:'true'}:{})})),
    insert: (data:any)  => post({table,op:'insert',data}),
    update: (data:any)  => ({eq:(_:string,id:any)=>post({table,op:'update',data,id})}),
    delete: ()          => ({eq:(_:string,id:any)=>post({table,op:'delete',id})}),
    upsert: (data:any)  => post({table,op:'upsert',data}),
  }),
  fmt: (n:number) => new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(n||0),
  fmtN: (n:number) => new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2}).format(n||0),
  date: (d:string) => d ? new Date(d).toLocaleDateString('tr-TR') : '-',
  exportCsv: downloadCsv,
}
