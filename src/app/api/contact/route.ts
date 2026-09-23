import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { error } = await sb.from('contact_submissions').insert(payload)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
