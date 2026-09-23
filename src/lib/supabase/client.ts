// Tüm Supabase çağrıları /api/db üzerinden — key browser'a gitmez

const dbGet = (params: Record<string,string|undefined>) =>
  fetch(`/api/db?${new URLSearchParams(Object.entries(params).filter(([,v])=>v!=null) as [string,string][])}`)
    .then(r=>r.json())

const dbPost = (body: object) =>
  fetch('/api/db', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(r=>r.json())

class Query {
  constructor(private p: Record<string,string|undefined>) {}
  eq(f:string,v:any)   { return new Query({...this.p, eq:`${f}:${v}`}) }
  gte(f:string,v:any)  { return new Query({...this.p, gte:`${f}:${v}`}) }
  lte(f:string,v:any)  { return new Query({...this.p, lte:`${f}:${v}`}) }
  order(f:string,o?:any){ return new Query({...this.p, order:f, order_asc:String(o?.ascending!==false)}) }
  limit(n:number)      { return new Query({...this.p, limit:String(n)}) }
  // Promise benzeri
  exec() { return dbGet(this.p) }
}

// Query'yi Promise'e dönüştür — await için
const toPromise = (q: Query) => q.exec()

const makeSelect = (table: string, select: string, opts?: any) => {
  const base = { table, select, ...(opts?.count ? {count:'true'} : {}) }
  const q = new Query(base)

  return new Proxy(q, {
    get(target: any, prop: string) {
      if (prop in target) return target[prop].bind(target)
      // Promise interface
      if (prop === 'then') return (fn:any,fe?:any) => toPromise(target).then(fn,fe)
      if (prop === 'catch') return (fe:any) => toPromise(target).catch(fe)
      if (prop === Symbol.toStringTag as any) return 'Promise'
    }
  })
}

const wrapQuery = (q: Query): any =>
  new Proxy(q, {
    get(target: any, prop: string) {
      if (prop === 'then') return (fn:any,fe?:any) => target.exec().then(fn,fe)
      if (prop === 'catch') return (fe:any) => target.exec().catch(fe)
      if (['eq','gte','lte','order','limit'].includes(prop))
        return (...args:any[]) => wrapQuery((target[prop] as any)(...args))
      return target[prop]?.bind?.(target) ?? target[prop]
    }
  })

export const createClient = () => ({
  auth: {
    getUser:    async () => ({ data:{ user:{ email:'admin@alyaplastik.com' } }, error:null }),
    getSession: async () => ({ data:{ session:{} }, error:null }),
    signInWithPassword: async ({ email, password }: any) => {
      const r = await fetch('/api/auth', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
      const d = await r.json()
      return d.ok ? {error:null} : {error:{message:'Hatalı giriş'}}
    },
    signOut:    async () => ({ error:null }),
  },
  from: (table: string) => ({
    select: (select='*', opts?:any) => wrapQuery(new Query({ table, select, ...(opts?.count?{count:'true'}:{}) })),
    insert: (data:any)  => dbPost({table, op:'insert', data}),
    update: (data:any)  => ({ eq: (_:string, id:any) => dbPost({table, op:'update', data, id}) }),
    delete: ()          => ({ eq: (_:string, id:any) => dbPost({table, op:'delete', id}) }),
    upsert: (data:any)  => dbPost({table, op:'upsert', data}),
  }),
})
