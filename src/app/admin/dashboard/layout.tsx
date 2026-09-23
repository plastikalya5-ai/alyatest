import AdminSidebar from '@/components/admin/Sidebar'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex',height:'100vh',overflow:'hidden' }}>
      <AdminSidebar/>
      <main style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden' }}>
        {children}
      </main>
    </div>
  )
}
