// ERP API client — tüm çağrılar /api/erp güvenli server-side proxy üzerinden (oturum kontrollü)

const get = (params: Record<string,string|undefined>) =>
  fetch(`/api/erp?${new URLSearchParams(Object.entries(params).filter(([,v])=>v!=null) as [string,string][])}`)
    .then(r=>r.json())

const post = (body: object) =>
  fetch('/api/erp', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(r=>r.json())

class ErpQuery {
  constructor(private p: Record<string,string|undefined>) {}
  eq(f:string,v:any)    { return new ErpQuery({...this.p,eq:`${f}:${v}`}) }
  gte(f:string,v:any)   { return new ErpQuery({...this.p,gte:`${f}:${v}`}) }
  lte(f:string,v:any)   { return new ErpQuery({...this.p,lte:`${f}:${v}`}) }
  order(f:string,o?:any){ return new ErpQuery({...this.p,order:f,order_asc:String(o?.ascending===true)}) }
  limit(n:number)       { return new ErpQuery({...this.p,limit:String(n)}) }
  exec()                { return get(this.p) }
}

const wrap = (q: ErpQuery): any =>
  new Proxy(q, {
    get(t:any,prop:string) {
      if (prop==='then')  return (fn:any,fe?:any) => t.exec().then(fn,fe)
      if (prop==='catch') return (fe:any) => t.exec().catch(fe)
      if (['eq','gte','lte','order','limit'].includes(prop))
        return (...a:any[]) => wrap(t[prop](...a))
      return t[prop]?.bind?.(t)??t[prop]
    }
  })

export const erp = {
  from: (table:string) => ({
    select: (select='*',opts?:any) => wrap(new ErpQuery({table,select,...(opts?.count?{count:'true'}:{})})),
    insert: (data:any)  => post({table,op:'insert',data}),
    update: (data:any)  => ({eq:(_:string,id:any)=>post({table,op:'update',data,id})}),
    delete: ()          => ({eq:(_:string,id:any)=>post({table,op:'delete',id})}),
    upsert: (data:any)  => post({table,op:'upsert',data}),
  }),
  fmt: (n:number) => new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(n||0),
  fmtN: (n:number) => new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2}).format(n||0),
  date: (d:string) => d ? new Date(d).toLocaleDateString('tr-TR') : '-',
  dateTime: (d:string) => d ? new Date(d).toLocaleString('tr-TR') : '-',
}
