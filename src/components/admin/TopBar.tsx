'use client'
export default function AdminTopBar({ title }: { title: string }) {
  return (
    <div className="adm-topbar">
      <h1>{title}</h1>
    </div>
  )
}
