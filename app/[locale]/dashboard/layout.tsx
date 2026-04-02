import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/navigation'
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient'

export default async function DashboardLayout({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await (params instanceof Promise ? params : Promise.resolve(params));
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect({ href: '/auth/login', locale: locale as any })
    return null
  }

  const { data: profile } = await supabase
    .from('clients')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <DashboardLayoutClient profile={profile} userEmail={user.email}>
      {children}
    </DashboardLayoutClient>
  )
}
